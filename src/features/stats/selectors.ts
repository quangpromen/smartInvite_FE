import type { EventGuest } from '@/features/guests/types';
import type { Invitation, RsvpResponse, CheckIn, RsvpStatus } from '@/features/invitations/types';
import type { CardDesign } from '@/features/cards/types';

export interface EventStats {
  guestCount: number;
  linkedCount: number;
  yesCount: number;
  noCount: number;
  pendingCount: number;
  expectedPeople: number;
  checkedInInvitations: number;
  arrivedPeople: number;
  responseRate: number; // Percentage 0 - 100
}

export interface CardBreakdownItem {
  cardId: string;
  title: string;
  audienceLabel?: string;
  isDefault: boolean;
  status: string;
  guestCount: number;
  yesCount: number;
  noCount: number;
  pendingCount: number;
  expectedPeople: number;
  checkedInCount: number;
  card: CardDesign;
}

export interface GroupBreakdownItem {
  groupName: string;
  guestCount: number;
  yesCount: number;
  noCount: number;
  pendingCount: number;
}

export interface GuestJoinedDetails {
  guest: EventGuest;
  assignedCard?: CardDesign;
  invitation?: Invitation;
  rsvp?: RsvpResponse;
  checkIn?: CheckIn;
  rsvpStatus: RsvpStatus;
}

/**
 * Pure selector to compute aggregate stats for an event with optional cardId or groupName filters
 */
export function selectEventStats(
  eventId: string,
  guests: EventGuest[],
  invitations: Invitation[],
  rsvpResponses: RsvpResponse[],
  checkIns: CheckIn[],
  filters?: { cardId?: string | null; groupName?: string | null }
): EventStats {
  // 1. Filter guests by eventId
  let scopedGuests = guests.filter((g) => g.eventId === eventId);

  // Apply card filter if specified
  if (filters?.cardId) {
    scopedGuests = scopedGuests.filter((g) => g.assignedCardDesignId === filters.cardId);
  }

  // Apply group filter if specified
  if (filters?.groupName) {
    scopedGuests = scopedGuests.filter((g) => g.groupName === filters.groupName);
  }

  const guestCount = scopedGuests.length;
  if (guestCount === 0) {
    return {
      guestCount: 0,
      linkedCount: 0,
      yesCount: 0,
      noCount: 0,
      pendingCount: 0,
      expectedPeople: 0,
      checkedInInvitations: 0,
      arrivedPeople: 0,
      responseRate: 0,
    };
  }

  // Maps for fast join
  const guestIds = new Set(scopedGuests.map((g) => g.id));
  const scopedInvitations = invitations.filter((inv) => inv.eventId === eventId && guestIds.has(inv.guestId));
  const activeInvitations = scopedInvitations.filter((inv) => inv.status === 'ACTIVE');
  const linkedCount = activeInvitations.length;

  const invIdToGuestId = new Map(scopedInvitations.map((inv) => [inv.id, inv.guestId]));
  const invIds = new Set(scopedInvitations.map((inv) => inv.id));

  const scopedRsvps = rsvpResponses.filter((r) => invIds.has(r.invitationId));
  const scopedCheckIns = checkIns.filter((c) => invIds.has(c.invitationId));

  let yesCount = 0;
  let noCount = 0;
  let expectedPeople = 0;

  for (const rsvp of scopedRsvps) {
    if (rsvp.status === 'YES') {
      yesCount += 1;
      expectedPeople += 1 + (rsvp.plusOnes || 0);
    } else if (rsvp.status === 'NO') {
      noCount += 1;
    }
  }

  // PENDING = guestCount - yesCount - noCount
  const pendingCount = Math.max(0, guestCount - yesCount - noCount);
  const checkedInInvitations = scopedCheckIns.length;
  const arrivedPeople = scopedCheckIns.reduce((sum, c) => sum + (c.arrivedCount || 1), 0);
  const responseRate = guestCount > 0 ? Math.round(((yesCount + noCount) / guestCount) * 100) : 0;

  return {
    guestCount,
    linkedCount,
    yesCount,
    noCount,
    pendingCount,
    expectedPeople,
    checkedInInvitations,
    arrivedPeople,
    responseRate,
  };
}

/**
 * Pure selector to compute per-card breakdown within an event
 */
export function selectCardBreakdown(
  eventId: string,
  cards: CardDesign[],
  guests: EventGuest[],
  invitations: Invitation[],
  rsvpResponses: RsvpResponse[],
  checkIns: CheckIn[]
): CardBreakdownItem[] {
  const eventCards = cards.filter((c) => c.eventId === eventId);
  const eventGuests = guests.filter((g) => g.eventId === eventId);
  const eventInvitations = invitations.filter((i) => i.eventId === eventId);

  const invByGuestId = new Map(eventInvitations.map((inv) => [inv.guestId, inv.id]));
  const rsvpByInvId = new Map(rsvpResponses.map((r) => [r.invitationId, r]));
  const checkInByInvId = new Map(checkIns.map((c) => [c.invitationId, c]));

  return eventCards.map((card) => {
    const cardGuests = eventGuests.filter((g) => g.assignedCardDesignId === card.id);
    let yesCount = 0;
    let noCount = 0;
    let expectedPeople = 0;
    let checkedInCount = 0;

    for (const guest of cardGuests) {
      const invId = invByGuestId.get(guest.id);
      if (invId) {
        const rsvp = rsvpByInvId.get(invId);
        if (rsvp?.status === 'YES') {
          yesCount += 1;
          expectedPeople += 1 + (rsvp.plusOnes || 0);
        } else if (rsvp?.status === 'NO') {
          noCount += 1;
        }
        if (checkInByInvId.has(invId)) {
          checkedInCount += 1;
        }
      }
    }

    const pendingCount = Math.max(0, cardGuests.length - yesCount - noCount);

    return {
      cardId: card.id,
      title: card.title,
      audienceLabel: card.audienceLabel,
      isDefault: card.isDefault,
      status: card.status,
      guestCount: cardGuests.length,
      yesCount,
      noCount,
      pendingCount,
      expectedPeople,
      checkedInCount,
      card,
    };
  });
}


/**
 * Pure selector to compute per-group breakdown within an event
 */
export function selectGroupBreakdown(
  eventId: string,
  guests: EventGuest[],
  invitations: Invitation[],
  rsvpResponses: RsvpResponse[]
): GroupBreakdownItem[] {
  const eventGuests = guests.filter((g) => g.eventId === eventId);
  const eventInvitations = invitations.filter((i) => i.eventId === eventId);

  const invByGuestId = new Map(eventInvitations.map((inv) => [inv.guestId, inv.id]));
  const rsvpByInvId = new Map(rsvpResponses.map((r) => [r.invitationId, r]));

  const groups = new Map<string, { guestCount: number; yesCount: number; noCount: number }>();

  for (const guest of eventGuests) {
    const groupName = guest.groupName || 'Chưa phân nhóm';
    const current = groups.get(groupName) || { guestCount: 0, yesCount: 0, noCount: 0 };
    current.guestCount += 1;

    const invId = invByGuestId.get(guest.id);
    if (invId) {
      const rsvp = rsvpByInvId.get(invId);
      if (rsvp?.status === 'YES') {
        current.yesCount += 1;
      } else if (rsvp?.status === 'NO') {
        current.noCount += 1;
      }
    }
    groups.set(groupName, current);
  }

  return Array.from(groups.entries()).map(([groupName, data]) => ({
    groupName,
    guestCount: data.guestCount,
    yesCount: data.yesCount,
    noCount: data.noCount,
    pendingCount: Math.max(0, data.guestCount - data.yesCount - data.noCount),
  }));
}

/**
 * Pure helper to join guest with their assigned card, invitation, and RSVP status
 */
export function joinGuestDetails(
  guest: EventGuest,
  cards: CardDesign[],
  invitations: Invitation[],
  rsvpResponses: RsvpResponse[],
  checkIns: CheckIn[]
): GuestJoinedDetails {
  const assignedCard = cards.find((c) => c.id === guest.assignedCardDesignId && c.eventId === guest.eventId);
  const invitation = invitations.find((i) => i.guestId === guest.id && i.eventId === guest.eventId);
  const rsvp = invitation ? rsvpResponses.find((r) => r.invitationId === invitation.id) : undefined;
  const checkIn = invitation ? checkIns.find((c) => c.invitationId === invitation.id) : undefined;

  let rsvpStatus: RsvpStatus = 'PENDING';
  if (rsvp?.status === 'YES') rsvpStatus = 'YES';
  else if (rsvp?.status === 'NO') rsvpStatus = 'NO';

  return {
    guest,
    assignedCard,
    invitation,
    rsvp,
    checkIn,
    rsvpStatus,
  };
}
