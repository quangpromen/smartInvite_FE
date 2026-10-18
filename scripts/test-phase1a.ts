import { createInitialMockDb } from '../src/mocks/fixtures';
import {
  MockEventRepository,
  MockCardRepository,
  MockGuestRepository,
  MockInvitationRepository,
} from '../src/services/mock-repositories';
import { selectEventStats, selectCardBreakdown } from '../src/features/stats/selectors';
import type { MockDb } from '../src/services/repositories';

let failed = 0;
let passed = 0;

function assert(condition: boolean, testName: string, detail?: string) {
  if (condition) {
    console.log(`  ✓ PASS: ${testName}`);
    passed++;
  } else {
    console.error(`  ✗ FAIL: ${testName} ${detail ? `(${detail})` : ''}`);
    failed++;
  }
}

function runTests() {
  console.log('\n=== RUNNING PHASE 1A DOMAIN INVARIANT & ACCEPTANCE TESTS ===\n');

  // Setup fresh mock db
  let db: MockDb = createInitialMockDb();
  const getDb = () => db;
  const setDb = (fn: (prev: MockDb) => MockDb) => {
    db = fn(db);
  };

  const eventsRepo = new MockEventRepository(getDb, setDb);
  const cardsRepo = new MockCardRepository(getDb, setDb);
  const guestsRepo = new MockGuestRepository(getDb, setDb);
  const invitationsRepo = new MockInvitationRepository(getDb, setDb);

  // 1. M01 / FE04: E1 contains cards A, B, C; E2 contains Card D only. No cross-event contamination
  console.log('--- Test 1: Event-scoped Cards isolation (M01 / FE04) ---');
  const e1Cards = cardsRepo.getByEventId('event-e1');
  const e2Cards = cardsRepo.getByEventId('event-e2');
  assert(e1Cards.length === 3, 'Event E1 has exactly 3 cards (A/B/C)');
  assert(e2Cards.length === 1, 'Event E2 has exactly 1 card (D)');
  assert(e2Cards[0].id === 'card-e2-d', 'Card in E2 is card-e2-d');
  assert(!e2Cards.some((c) => c.eventId === 'event-e1'), 'E2 does NOT contain any cards from E1');
  assert(!e1Cards.some((c) => c.eventId === 'event-e2'), 'E1 does NOT contain any cards from E2');

  // 2. M02 / FE03: Cannot create card without valid eventId
  console.log('--- Test 2: Mandatory Event binding on Card creation (M02 / FE03) ---');
  let orphanErrorThrown = false;
  try {
    cardsRepo.create({
      eventId: 'non-existent-event',
      title: 'Thiệp Mồ Côi',
      templateKey: 'classic',
    });
  } catch (err: unknown) {
    orphanErrorThrown = true;
  }
  assert(orphanErrorThrown, 'Cannot create card for non-existent event (throws error)');

  // 3. FE01: Create event without cards; overview & stats work cleanly
  console.log('--- Test 3: Create Event independently without cards (FE01) ---');
  const newEv = eventsRepo.create(
    {
      title: 'Sự kiện Độc lập Không Card',
      eventType: 'OTHER',
      startsAt: '2026-12-30T10:00:00Z',
      timezone: 'Asia/Ho_Chi_Minh',
      locationName: 'Văn phòng SmartInvite',
    },
    'user-host-1'
  );
  assert(newEv.id.startsWith('event-'), 'New event created with unique ID');
  const newEvCards = cardsRepo.getByEventId(newEv.id);
  assert(newEvCards.length === 0, 'New event has 0 cards initially');
  const newEvStats = selectEventStats(newEv.id, db.guests, db.invitations, db.rsvpResponses, db.checkIns);
  assert(newEvStats.guestCount === 0 && newEvStats.responseRate === 0, 'Stats for empty event are zero without error');

  // 4. FE02: Create card in event; eventId is immutable
  console.log('--- Test 4: Create card inside event with immutable eventId (FE02) ---');
  const createdCard = cardsRepo.create({
    eventId: newEv.id,
    title: 'Thiệp Test Cho NewEv',
    templateKey: 'classic',
  });
  assert(createdCard.eventId === newEv.id, 'Created card has correct eventId');
  assert(createdCard.isDefault === true, 'First card created in event is automatically marked as default');
  assert(createdCard.status === 'DRAFT', 'New card starts in DRAFT status');
  assert(createdCard.publishedConfig === null, 'Draft card publishedConfig is null');

  // 5. Cross-event lookup guard
  console.log('--- Test 5: Cross-event Card lookup rejection ---');
  const crossLookup = cardsRepo.getById('card-e1-a', 'event-e2');
  assert(crossLookup === undefined, 'card-e1-a with eventId=event-e2 returns undefined (Not Found)');
  const validLookup = cardsRepo.getById('card-e1-a', 'event-e1');
  assert(validLookup !== undefined && validLookup.id === 'card-e1-a', 'card-e1-a with eventId=event-e1 returns card');

  // 6. Set Default card within event (Only one default per event)
  console.log('--- Test 6: Single Default Card per Event guard ---');
  cardsRepo.setDefault('card-e1-b', 'event-e1');
  const cardA = cardsRepo.getById('card-e1-a', 'event-e1');
  const cardB = cardsRepo.getById('card-e1-b', 'event-e1');
  const cardD = cardsRepo.getById('card-e2-d', 'event-e2');
  assert(cardB?.isDefault === true, 'Card B is now default for event-e1');
  assert(cardA?.isDefault === false, 'Card A is no longer default for event-e1');
  assert(cardD?.isDefault === true, 'Card D in event-e2 remains default and is unaffected');

  // 7. Archive card guard: Block if guests assigned
  console.log('--- Test 7: Archive Guard blocks if guests are assigned (FE13 / BR-07) ---');
  const assignedGuestsToB = db.guests.filter((g) => g.eventId === 'event-e1' && g.assignedCardDesignId === 'card-e1-b');
  const canArchiveB = cardsRepo.canArchive('card-e1-b', 'event-e1', assignedGuestsToB.length);
  assert(!canArchiveB.allowed, 'canArchive returns false for Card B because it has assigned guests');
  assert(canArchiveB.reason?.includes(String(assignedGuestsToB.length)) ?? false, 'canArchive specifies exact guest count in reason');

  let archiveBlocked = false;
  try {
    cardsRepo.archive('card-e1-b', 'event-e1');
  } catch {
    archiveBlocked = true;
  }
  assert(archiveBlocked, 'cardsRepo.archive throws error when card has assigned guests');

  // Card C has 0 guests assigned -> can archive
  const assignedGuestsToC = db.guests.filter((g) => g.eventId === 'event-e1' && g.assignedCardDesignId === 'card-e1-c');
  assert(assignedGuestsToC.length === 0, 'Card C has 0 assigned guests');
  const archivedC = cardsRepo.archive('card-e1-c', 'event-e1');
  assert(archivedC.status === 'ARCHIVED', 'Card C successfully archived');

  // 8. Duplicate card to another event creates new card with target eventId
  console.log('--- Test 8: Duplicate card across events (BR-01 / AC-E) ---');
  const dupCard = cardsRepo.duplicate('card-e1-a', 'event-e1', 'event-e2', 'Thiệp Duplicated A');
  assert(dupCard.eventId === 'event-e2', 'Duplicated card has target eventId (event-e2)');
  assert(dupCard.id !== 'card-e1-a', 'Duplicated card has a new unique ID');
  const originalA = cardsRepo.getById('card-e1-a', 'event-e1');
  assert(originalA?.eventId === 'event-e1', 'Original Card A in event-e1 remains completely unchanged');

  // 9. Canonical event location update updates canonical source
  console.log('--- Test 9: Event canonical metadata update (BR-03 / FE09) ---');
  eventsRepo.update('event-e1', { locationName: 'Trung tâm Hội nghị Quốc gia Mới 2026' });
  const updatedE1 = eventsRepo.getById('event-e1');
  assert(updatedE1?.locationName === 'Trung tâm Hội nghị Quốc gia Mới 2026', 'Canonical event location updated');

  // 10. Reassign guest card keeps invitation, RSVP, and check-in intact (BR-07 / H5 / FE11)
  console.log('--- Test 10: Guest card reassignment preserves RSVP and Check-in (BR-07 / H5) ---');
  const guest1Before = db.guests.find((g) => g.id === 'guest-1')!;
  const invBefore = db.invitations.find((i) => i.guestId === 'guest-1')!;
  const rsvpBefore = db.rsvpResponses.find((r) => r.invitationId === invBefore.id)!;
  const checkInBefore = db.checkIns.find((c) => c.invitationId === invBefore.id)!;
  const statsBefore = selectEventStats('event-e1', db.guests, db.invitations, db.rsvpResponses, db.checkIns);

  // Reassign guest-1 from card-e1-b to card-e1-a
  guestsRepo.assignCard('guest-1', 'card-e1-a', 'event-e1');

  const guest1After = db.guests.find((g) => g.id === 'guest-1')!;
  const invAfter = db.invitations.find((i) => i.guestId === 'guest-1')!;
  const rsvpAfter = db.rsvpResponses.find((r) => r.invitationId === invBefore.id)!;
  const checkInAfter = db.checkIns.find((c) => c.invitationId === invBefore.id)!;
  const statsAfter = selectEventStats('event-e1', db.guests, db.invitations, db.rsvpResponses, db.checkIns);

  assert(guest1After.assignedCardDesignId === 'card-e1-a', 'Guest assigned card changed to card-e1-a');
  assert(invAfter.id === invBefore.id, 'Invitation ID preserved unchanged');
  assert(rsvpAfter.status === rsvpBefore.status && rsvpAfter.plusOnes === rsvpBefore.plusOnes, 'RSVP YES and plusOnes preserved unchanged');
  assert(checkInAfter.arrivedCount === checkInBefore.arrivedCount, 'Check-in record preserved unchanged');
  assert(statsAfter.guestCount === statsBefore.guestCount, 'Event total guestCount unchanged');
  assert(statsAfter.yesCount === statsBefore.yesCount, 'Event total yesCount unchanged');
  assert(statsAfter.expectedPeople === statsBefore.expectedPeople, 'Event total expectedPeople unchanged');
  assert(statsAfter.checkedInInvitations === statsBefore.checkedInInvitations, 'Event total check-in count unchanged');

  // 11. Card breakdown reflects reassignment correctly
  console.log('--- Test 11: Per-card breakdown reflects guest reassignment ---');
  const breakdown = selectCardBreakdown('event-e1', db.cardDesigns, db.guests, db.invitations, db.rsvpResponses, db.checkIns);
  const cardAItem = breakdown.find((b) => b.cardId === 'card-e1-a')!;
  assert(cardAItem.guestCount >= 4, 'Card A guest count increased after reassignment');
  assert(cardAItem.yesCount >= 3, 'Card A yes count increased after reassignment');

  // 12. PENDING is derived strictly from absence of RSVP row
  console.log('--- Test 12: Derived PENDING status without redundant RSVP row ---');
  const guest7 = db.guests.find((g) => g.id === 'guest-7')!;
  const inv7 = db.invitations.find((i) => i.guestId === guest7.id)!;
  const rsvp7 = db.rsvpResponses.find((r) => r.invitationId === inv7.id);
  assert(rsvp7 === undefined, 'Guest 7 has NO RSVP row');
  const e1Stats = selectEventStats('event-e1', db.guests, db.invitations, db.rsvpResponses, db.checkIns);
  assert(e1Stats.pendingCount === 2, 'Pending count correctly calculated as (guestCount - yes - no)');

  console.log(`\n=== TEST SUMMARY: ${passed} PASSED, ${failed} FAILED ===\n`);

  if (failed > 0) {
    process.exit(1);
  }
}

runTests();
