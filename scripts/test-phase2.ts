import { createTestMockDb } from '../src/mocks/test-fixtures';
import {
  MockEventRepository,
  MockCardRepository,
  MockGuestRepository,
  MockInvitationRepository,
  MockUserRepository,
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
  console.log('\n=== RUNNING PHASE 2 & ADMIN/CARD/GUEST SAFETY INVARIANT TESTS ===\n');

  // Setup fresh mock db
  let db: MockDb = createTestMockDb();
  const getDb = () => db;
  const setDb = (fn: (prev: MockDb) => MockDb) => {
    db = fn(db);
  };

  const eventsRepo = new MockEventRepository(getDb, setDb);
  const cardsRepo = new MockCardRepository(getDb, setDb);
  const guestsRepo = new MockGuestRepository(getDb, setDb);
  const invitationsRepo = new MockInvitationRepository(getDb, setDb);
  const usersRepo = new MockUserRepository(getDb, setDb);

  // 1. Admin safety rules: Cannot delete self
  console.log('--- Test 1: Admin safety rule - Cannot delete self ---');
  const selfCheck = usersRepo.canDelete('user-admin-1', 'user-admin-1');
  assert(!selfCheck.allowed, 'Admin cannot delete themselves');
  assert(selfCheck.reason?.includes('chính tài khoản') ?? false, 'Self-delete error message is clear');

  const selfDeleteResult = usersRepo.delete('user-admin-1', 'user-admin-1');
  assert(!selfDeleteResult.success, 'usersRepo.delete rejects deleting self');

  // 2. Admin safety rule: Cannot delete last admin
  console.log('--- Test 2: Admin safety rule - Cannot delete last admin ---');
  // First, check how many admins exist
  const currentAdmins = usersRepo.getAll().filter((u) => u.role === 'ADMIN');
  assert(currentAdmins.length === 1, 'Initial fixture has exactly 1 admin');
  
  const lastAdminCheck = usersRepo.canDelete('user-admin-1', 'user-other');
  assert(!lastAdminCheck.allowed, 'Cannot delete the only admin in system');
  assert(lastAdminCheck.reason?.includes('Quản trị viên') ?? false, 'Last admin error message is clear');

  // 3. User safety rule: Cannot delete user with owned events
  console.log('--- Test 3: User safety rule - Cannot delete user with owned events ---');
  const host1Check = usersRepo.canDelete('user-host-1', 'user-admin-1');
  assert(!host1Check.allowed, 'Cannot delete user-host-1 who owns events');
  assert(host1Check.reason?.includes('sở hữu') ?? false, 'Owned events error message mentions events');

  // 4. Safe user creation, update, and deletion of user with no events
  console.log('--- Test 4: User CRUD for unattached user ---');
  const newUser = usersRepo.create({
    fullName: 'Nguyễn Văn Test',
    email: 'test.user@smartinvite.internal',
    role: 'HOST',
    status: 'ACTIVE',
  });
  assert(newUser.id.startsWith('user-'), 'New user created with ID');
  assert(newUser.fullName === 'Nguyễn Văn Test', 'New user has correct display name');

  // Update user
  const updatedUser = usersRepo.update(newUser.id, {
    status: 'SUSPENDED',
  });
  assert(updatedUser.status === 'SUSPENDED', 'User successfully suspended');

  // Can delete unattached user
  const canDeleteNew = usersRepo.canDelete(newUser.id, 'user-admin-1');
  assert(canDeleteNew.allowed, 'Unattached user can be safely deleted');
  const deleted = usersRepo.delete(newUser.id, 'user-admin-1');
  assert(deleted.success, 'Unattached user deleted successfully');
  assert(usersRepo.getById(newUser.id) === undefined, 'Deleted user is no longer in store');

  // 5. Card draft vs published independence (BR-08)
  console.log('--- Test 5: Card draftConfig vs publishedConfig independence (BR-08) ---');
  const cardA = cardsRepo.getById('card-e1-a', 'event-e1');
  assert(cardA !== undefined, 'Card A exists');
  const originalPublishedTitle = cardA?.publishedConfig?.headline;
  assert(originalPublishedTitle !== undefined, 'Card A has publishedConfig headline');

  // Update draftConfig without publishing
  cardsRepo.update(
    'card-e1-a',
    {
      draftConfig: {
        ...cardA!.draftConfig,
        headline: 'Lễ Tốt Nghiệp Xuất Sắc 2026 (Chưa Công Bố)',
      },
    },
    'event-e1'
  );

  const cardAAfterDraftEdit = cardsRepo.getById('card-e1-a', 'event-e1')!;
  assert(
    cardAAfterDraftEdit.draftConfig.headline === 'Lễ Tốt Nghiệp Xuất Sắc 2026 (Chưa Công Bố)',
    'Draft config was updated'
  );
  assert(
    cardAAfterDraftEdit.publishedConfig?.headline === originalPublishedTitle,
    'Published config remains completely unchanged when saving draft (BR-08)'
  );

  // Now publish changes
  cardsRepo.publish('card-e1-a', 'event-e1');
  const cardAAfterPublish = cardsRepo.getById('card-e1-a', 'event-e1')!;
  assert(cardAAfterPublish.status === 'PUBLISHED', 'Card is in PUBLISHED status');
  assert(
    cardAAfterPublish.publishedConfig?.headline === 'Lễ Tốt Nghiệp Xuất Sắc 2026 (Chưa Công Bố)',
    'Published config is updated only after explicit publish'
  );

  // 6. Bulk reassign before card archive (BR-21)
  console.log('--- Test 6: Bulk reassign before card archive (BR-21) ---');
  // Card B in event-e1 currently has guests assigned
  const guestsAssignedToB = db.guests.filter((g) => g.eventId === 'event-e1' && g.assignedCardDesignId === 'card-e1-b');
  assert(guestsAssignedToB.length > 0, 'Card B has active assigned guests');

  // Reassign all guests from Card B to Card A using bulkAssignCard
  const guestIdsToReassign = guestsAssignedToB.map((g) => g.id);
  guestsRepo.bulkAssignCard(guestIdsToReassign, 'card-e1-a', 'event-e1');
  const guestsOnBNow = db.guests.filter((g) => g.eventId === 'event-e1' && g.assignedCardDesignId === 'card-e1-b');
  assert(guestsOnBNow.length === 0, 'Card B now has 0 guests after bulk reassign');

  // Now canArchive should return allowed: true
  const canArchiveBNow = cardsRepo.canArchive('card-e1-b', 'event-e1', 0);
  assert(canArchiveBNow.allowed, 'Card B can now be archived safely');

  const archivedB = cardsRepo.archive('card-e1-b', 'event-e1');
  assert(archivedB.status === 'ARCHIVED', 'Card B archived successfully');

  // 7. Event-scoped guest card assignment invariant (BR-10, BR-11)
  console.log('--- Test 7: Guest card assignment event-scoped rejection ---');
  let invalidCrossAssignThrown = false;
  try {
    // Attempt to assign Card D (belonging to event-e2) to Guest 1 (belonging to event-e1)
    guestsRepo.assignCard('guest-1', 'card-e2-d', 'event-e1');
  } catch {
    invalidCrossAssignThrown = true;
  }
  assert(invalidCrossAssignThrown, 'Assigning cross-event card is rejected with error');

  // 8. Notifications fixture validation
  console.log('--- Test 8: Notifications fixture and unread count ---');
  const notifs = db.notifications;
  assert(notifs.length >= 3, 'Initial db has mock notifications');
  const unreadNotifs = notifs.filter((n) => !n.read);
  assert(unreadNotifs.length > 0, 'There are unread notifications for badge display');

  console.log(`\n=== PHASE 2 TEST SUMMARY: ${passed} PASSED, ${failed} FAILED ===\n`);

  if (failed > 0) {
    process.exit(1);
  }
}

runTests();
