import type {
  MockDb,
  IEventRepository,
  ICardRepository,
  IGuestRepository,
  IInvitationRepository,
  IUserRepository,
} from './repositories';
import type { Event, CreateEventInput, UpdateEventInput } from '@/features/events/types';
import type { CardDesign, CreateCardInput, UpdateCardInput } from '@/features/cards/types';
import type { EventGuest, CreateGuestInput, UpdateGuestInput } from '@/features/guests/types';
import type { Invitation, RsvpResponse, CheckIn, User } from '@/features/invitations/types';
import type { CreateUserInput, UpdateUserInput } from '@/features/users/types';

/**
 * Pure mutation helpers operating on MockDb state
 */
export class MockEventRepository implements IEventRepository {
  constructor(
    private getDb: () => MockDb,
    private setDb: (fn: (prev: MockDb) => MockDb) => void
  ) {}

  getAll(): Event[] {
    return this.getDb().events;
  }

  getById(id: string): Event | undefined {
    return this.getDb().events.find((e) => e.id === id);
  }

  create(input: CreateEventInput, ownerId: string): Event {
    const now = new Date().toISOString();
    const newEvent: Event = {
      id: `event-${Date.now()}`,
      ownerId,
      title: input.title.trim(),
      eventType: input.eventType,
      description: input.description?.trim(),
      startsAt: input.startsAt,
      endsAt: input.endsAt,
      timezone: input.timezone || 'Asia/Ho_Chi_Minh',
      locationName: input.locationName.trim(),
      locationAddress: input.locationAddress?.trim(),
      mapUrl: input.mapUrl?.trim(),
      rsvpDeadline: input.rsvpDeadline,
      status: 'DRAFT',
      attendanceOptionsEnabled: input.attendanceOptionsEnabled ?? true,
      createdAt: now,
      updatedAt: now,
    };

    this.setDb((prev) => ({
      ...prev,
      events: [newEvent, ...prev.events],
    }));

    return newEvent;
  }

  update(id: string, input: UpdateEventInput): Event {
    const existing = this.getById(id);
    if (!existing) {
      throw new Error(`Event ${id} not found`);
    }

    const now = new Date().toISOString();
    const updated: Event = {
      ...existing,
      ...input,
      updatedAt: now,
    };

    this.setDb((prev) => ({
      ...prev,
      events: prev.events.map((e) => (e.id === id ? updated : e)),
    }));

    return updated;
  }

  delete(id: string): boolean {
    const existing = this.getById(id);
    if (!existing) return false;

    this.setDb((prev) => ({
      ...prev,
      events: prev.events.filter((e) => e.id !== id),
      // Clean up orphaned references in mock demo
      cardDesigns: prev.cardDesigns.filter((c) => c.eventId !== id),
      guests: prev.guests.filter((g) => g.eventId !== id),
      invitations: prev.invitations.filter((i) => i.eventId !== id),
    }));

    return true;
  }
}

export class MockCardRepository implements ICardRepository {
  constructor(
    private getDb: () => MockDb,
    private setDb: (fn: (prev: MockDb) => MockDb) => void
  ) {}

  getByEventId(eventId: string): CardDesign[] {
    return this.getDb().cardDesigns.filter((c) => c.eventId === eventId);
  }

  getById(id: string, eventId?: string): CardDesign | undefined {
    return this.getDb().cardDesigns.find((c) => {
      if (c.id !== id) return false;
      if (eventId && c.eventId !== eventId) return false;
      return true;
    });
  }

  create(input: CreateCardInput): CardDesign {
    const event = this.getDb().events.find((e) => e.id === input.eventId);
    if (!event) {
      throw new Error(`Cannot create card: Event ${input.eventId} does not exist`);
    }

    const existingCards = this.getByEventId(input.eventId);
    const isFirstCard = existingCards.length === 0;
    const isDefault = input.isDefault ?? isFirstCard;

    const now = new Date().toISOString();
    const initialConfig = {
      theme: 'classic' as const,
      headline: 'THƯ MỜI THAM DỰ',
      invitationCopy: 'Trân trọng kính mời quý vị và các bạn đến chung vui cùng chúng tôi.',
      signature: 'Ban Tổ Chức',
      ...input.initialConfig,
    };

    const newCard: CardDesign = {
      id: `card-${Date.now()}`,
      eventId: input.eventId, // Immutable!
      title: input.title.trim(),
      audienceLabel: input.audienceLabel?.trim(),
      status: 'DRAFT',
      isDefault,
      templateKey: input.templateKey || 'classic',
      publishedConfig: null,
      draftConfig: initialConfig,
      revision: 1,
      createdAt: now,
      updatedAt: now,
    };

    this.setDb((prev) => {
      let cards = [...prev.cardDesigns];
      // If new card is default, unmark other cards of the same event
      if (isDefault) {
        cards = cards.map((c) => (c.eventId === input.eventId ? { ...c, isDefault: false } : c));
      }
      return {
        ...prev,
        cardDesigns: [...cards, newCard],
      };
    });

    return newCard;
  }

  update(id: string, input: UpdateCardInput, eventId?: string): CardDesign {
    const card = this.getById(id, eventId);
    if (!card) {
      throw new Error(`Card ${id} not found in event ${eventId || 'any'}`);
    }

    const now = new Date().toISOString();
    const updated: CardDesign = {
      ...card,
      title: input.title !== undefined ? input.title.trim() : card.title,
      audienceLabel: input.audienceLabel !== undefined ? input.audienceLabel?.trim() : card.audienceLabel,
      draftConfig: input.draftConfig || card.draftConfig,
      status: input.status || card.status,
      isDefault: input.isDefault !== undefined ? input.isDefault : card.isDefault,
      updatedAt: now,
    };

    this.setDb((prev) => ({
      ...prev,
      cardDesigns: prev.cardDesigns.map((c) => (c.id === id ? updated : c)),
    }));

    return updated;
  }

  setDefault(id: string, eventId: string): void {
    const card = this.getById(id, eventId);
    if (!card) {
      throw new Error(`Card ${id} not found in event ${eventId}`);
    }

    this.setDb((prev) => ({
      ...prev,
      cardDesigns: prev.cardDesigns.map((c) => {
        if (c.eventId !== eventId) return c;
        return {
          ...c,
          isDefault: c.id === id,
          updatedAt: c.id === id ? new Date().toISOString() : c.updatedAt,
        };
      }),
    }));
  }

  publish(id: string, eventId: string): CardDesign {
    const card = this.getById(id, eventId);
    if (!card) {
      throw new Error(`Card ${id} not found in event ${eventId}`);
    }

    const now = new Date().toISOString();
    const updated: CardDesign = {
      ...card,
      status: 'PUBLISHED',
      publishedConfig: { ...card.draftConfig }, // Sync draft to published
      revision: card.revision + 1,
      updatedAt: now,
    };

    this.setDb((prev) => ({
      ...prev,
      cardDesigns: prev.cardDesigns.map((c) => (c.id === id ? updated : c)),
    }));

    return updated;
  }

  duplicate(id: string, sourceEventId: string, targetEventId: string, newTitle?: string): CardDesign {
    const sourceCard = this.getById(id, sourceEventId);
    if (!sourceCard) {
      throw new Error(`Source card ${id} not found in event ${sourceEventId}`);
    }

    const targetEvent = this.getDb().events.find((e) => e.id === targetEventId);
    if (!targetEvent) {
      throw new Error(`Target event ${targetEventId} not found`);
    }

    const now = new Date().toISOString();
    const targetCards = this.getByEventId(targetEventId);
    const isFirstInTarget = targetCards.length === 0;

    const duplicatedCard: CardDesign = {
      id: `card-${Date.now()}`,
      eventId: targetEventId, // Assigned to target event
      title: newTitle || `${sourceCard.title} (Bản sao)`,
      audienceLabel: sourceCard.audienceLabel,
      status: 'DRAFT', // Duplicates start as DRAFT
      isDefault: isFirstInTarget,
      templateKey: sourceCard.templateKey,
      publishedConfig: null,
      draftConfig: { ...(sourceCard.publishedConfig || sourceCard.draftConfig) },
      revision: 1,
      createdAt: now,
      updatedAt: now,
    };

    this.setDb((prev) => ({
      ...prev,
      cardDesigns: [...prev.cardDesigns, duplicatedCard],
    }));

    return duplicatedCard;
  }

  canArchive(id: string, eventId: string, activeGuestsCount: number): { allowed: boolean; reason?: string } {
    if (activeGuestsCount > 0) {
      return {
        allowed: false,
        reason: `Mẫu thiệp này đang được gán cho ${activeGuestsCount} khách mời. Vui lòng chuyển các khách mời sang mẫu thiệp khác trước khi lưu trữ.`,
      };
    }
    return { allowed: true };
  }

  archive(id: string, eventId: string): CardDesign {
    const card = this.getById(id, eventId);
    if (!card) {
      throw new Error(`Card ${id} not found in event ${eventId}`);
    }

    // Verify no guests assigned
    const assignedGuests = this.getDb().guests.filter(
      (g) => g.eventId === eventId && g.assignedCardDesignId === id
    );
    if (assignedGuests.length > 0) {
      throw new Error(
        `Không thể lưu trữ mẫu thiệp đang có ${assignedGuests.length} khách mời được gán.`
      );
    }

    const now = new Date().toISOString();
    const updated: CardDesign = {
      ...card,
      status: 'ARCHIVED',
      isDefault: false, // Archived card cannot be default
      updatedAt: now,
    };

    this.setDb((prev) => ({
      ...prev,
      cardDesigns: prev.cardDesigns.map((c) => (c.id === id ? updated : c)),
    }));

    return updated;
  }
}

export class MockGuestRepository implements IGuestRepository {
  constructor(
    private getDb: () => MockDb,
    private setDb: (fn: (prev: MockDb) => MockDb) => void
  ) {}

  getByEventId(eventId: string): EventGuest[] {
    return this.getDb().guests.filter((g) => g.eventId === eventId);
  }

  getById(id: string, eventId?: string): EventGuest | undefined {
    return this.getDb().guests.find((g) => {
      if (g.id !== id) return false;
      if (eventId && g.eventId !== eventId) return false;
      return true;
    });
  }

  create(input: CreateGuestInput): EventGuest {
    const now = new Date().toISOString();
    const newGuest: EventGuest = {
      id: `guest-${Date.now()}`,
      eventId: input.eventId,
      fullName: input.fullName.trim(),
      groupName: input.groupName?.trim(),
      assignedCardDesignId: input.assignedCardDesignId || null,
      personalization: {
        schemaVersion: 1,
        ...input.personalization,
      },
      plusOnesAllowed: input.plusOnesAllowed ?? 0,
      createdAt: now,
      updatedAt: now,
    };

    this.setDb((prev) => ({
      ...prev,
      guests: [...prev.guests, newGuest],
    }));

    return newGuest;
  }

  update(id: string, input: UpdateGuestInput, eventId?: string): EventGuest {
    const guest = this.getById(id, eventId);
    if (!guest) {
      throw new Error(`Guest ${id} not found in event ${eventId || 'any'}`);
    }

    const now = new Date().toISOString();
    const updated: EventGuest = {
      ...guest,
      fullName: input.fullName !== undefined ? input.fullName.trim() : guest.fullName,
      groupName: input.groupName !== undefined ? input.groupName?.trim() : guest.groupName,
      assignedCardDesignId:
        input.assignedCardDesignId !== undefined ? input.assignedCardDesignId : guest.assignedCardDesignId,
      personalization: input.personalization || guest.personalization,
      plusOnesAllowed: input.plusOnesAllowed !== undefined ? input.plusOnesAllowed : guest.plusOnesAllowed,
      updatedAt: now,
    };

    this.setDb((prev) => ({
      ...prev,
      guests: prev.guests.map((g) => (g.id === id ? updated : g)),
    }));

    return updated;
  }

  assignCard(guestId: string, cardId: string | null, eventId: string): EventGuest {
    const guest = this.getById(guestId, eventId);
    if (!guest) {
      throw new Error(`Guest ${guestId} not found in event ${eventId}`);
    }

    if (cardId !== null) {
      const card = this.getDb().cardDesigns.find((c) => c.id === cardId && c.eventId === eventId);
      if (!card) {
        throw new Error(`Card ${cardId} does not belong to event ${eventId}`);
      }
    }

    const now = new Date().toISOString();
    const updated: EventGuest = {
      ...guest,
      assignedCardDesignId: cardId,
      updatedAt: now,
    };

    // Note: Reassigning card NEVER alters invitation, RSVP, or check-in!
    this.setDb((prev) => ({
      ...prev,
      guests: prev.guests.map((g) => (g.id === guestId ? updated : g)),
    }));

    return updated;
  }

  bulkAssignCard(guestIds: string[], cardId: string | null, eventId: string): EventGuest[] {
    if (cardId !== null) {
      const card = this.getDb().cardDesigns.find((c) => c.id === cardId && c.eventId === eventId);
      if (!card) {
        throw new Error(`Card ${cardId} does not belong to event ${eventId}`);
      }
    }

    const idSet = new Set(guestIds);
    const now = new Date().toISOString();

    this.setDb((prev) => ({
      ...prev,
      guests: prev.guests.map((g) => {
        if (g.eventId === eventId && idSet.has(g.id)) {
          return {
            ...g,
            assignedCardDesignId: cardId,
            updatedAt: now,
          };
        }
        return g;
      }),
    }));

    return this.getByEventId(eventId).filter((g) => idSet.has(g.id));
  }

  delete(id: string, eventId: string): boolean {
    const guest = this.getById(id, eventId);
    if (!guest) return false;

    this.setDb((prev) => {
      const inv = prev.invitations.find((i) => i.guestId === id);
      const invId = inv?.id;
      return {
        ...prev,
        guests: prev.guests.filter((g) => g.id !== id),
        invitations: prev.invitations.filter((i) => i.guestId !== id),
        rsvpResponses: invId ? prev.rsvpResponses.filter((r) => r.invitationId !== invId) : prev.rsvpResponses,
        checkIns: invId ? prev.checkIns.filter((c) => c.invitationId !== invId) : prev.checkIns,
      };
    });

    return true;
  }
}

import { resolveInvitationByToken } from '@/features/invitations/resolver';
import type { InvitationResolution, RsvpInput } from '@/features/invitations/types';

export class MockInvitationRepository implements IInvitationRepository {
  constructor(
    private getDb: () => MockDb,
    private setDb: (fn: (prev: MockDb) => MockDb) => void
  ) {}

  getByToken(token: string): Invitation | undefined {
    const trimmed = (token || '').trim();
    return this.getDb().invitations.find((i) => i.token === trimmed);
  }

  resolveByToken(token: string): InvitationResolution {
    return resolveInvitationByToken(token, this.getDb());
  }

  upsertRsvp(token: string, input: RsvpInput): { rsvp: RsvpResponse; resolution: InvitationResolution } {
    const resolution = this.resolveByToken(token);
    if (!resolution.success || !resolution.invitation || !resolution.guest || !resolution.event) {
      throw new Error(resolution.message || 'Không thể ghi nhận phản hồi cho lời mời này.');
    }

    // 1. Rule: If guest already checked in, block changing to NO!
    if (resolution.checkIn && input.status === 'NO') {
      throw new Error('Khách mời đã làm thủ tục check-in tại sự kiện, không thể đổi trạng thái sang "Không tham gia".');
    }

    // 2. Rule: Event CANCELLED or FINISHED cannot receive new response
    if (resolution.event.status === 'CANCELLED' || resolution.event.status === 'FINISHED') {
      throw new Error(`Sự kiện hiện ở trạng thái ${resolution.event.status}, không tiếp nhận thêm phản hồi RSVP.`);
    }

    // 3. Rule: Deadline passed
    if (resolution.isDeadlinePassed) {
      throw new Error('Hạn chót xác nhận tham dự sự kiện này đã qua. Bạn không thể gửi phản hồi mới.');
    }

    // 4. Rule: plusOnes within limits
    const maxAllowed = resolution.guest.plusOnesAllowed ?? 0;
    const sanitizedPlusOnes = Math.min(Math.max(0, input.plusOnes || 0), maxAllowed);

    // 5. Upsert response (only 1 response per invitation, updates existing)
    const invitationId = resolution.invitation.id;
    const now = new Date().toISOString();
    const newOrUpdated: RsvpResponse = {
      invitationId,
      status: input.status,
      plusOnes: input.status === 'YES' ? sanitizedPlusOnes : 0,
      attendanceMode: input.attendanceMode || 'BOTH',
      updatedAt: now,
    };

    this.setDb((prev) => {
      const exists = prev.rsvpResponses.some((r) => r.invitationId === invitationId);
      return {
        ...prev,
        rsvpResponses: exists
          ? prev.rsvpResponses.map((r) => (r.invitationId === invitationId ? newOrUpdated : r))
          : [...prev.rsvpResponses, newOrUpdated],
      };
    });

    const updatedResolution = this.resolveByToken(token);
    return { rsvp: newOrUpdated, resolution: updatedResolution };
  }

  getByGuestId(guestId: string): Invitation | undefined {
    return this.getDb().invitations.find((i) => i.guestId === guestId);
  }

  getByEventId(eventId: string): Invitation[] {
    return this.getDb().invitations.filter((i) => i.eventId === eventId);
  }

  getRsvpByInvitationId(invitationId: string): RsvpResponse | undefined {
    return this.getDb().rsvpResponses.find((r) => r.invitationId === invitationId);
  }

  getCheckInByInvitationId(invitationId: string): CheckIn | undefined {
    return this.getDb().checkIns.find((c) => c.invitationId === invitationId);
  }

  recordRsvp(
    invitationId: string,
    status: 'YES' | 'NO',
    plusOnes: number,
    attendanceMode?: 'CEREMONY' | 'PHOTOS' | 'BOTH'
  ): RsvpResponse {
    const now = new Date().toISOString();
    const newOrUpdated: RsvpResponse = {
      invitationId,
      status,
      plusOnes,
      attendanceMode: attendanceMode || 'BOTH',
      updatedAt: now,
    };

    this.setDb((prev) => {
      const exists = prev.rsvpResponses.some((r) => r.invitationId === invitationId);
      return {
        ...prev,
        rsvpResponses: exists
          ? prev.rsvpResponses.map((r) => (r.invitationId === invitationId ? newOrUpdated : r))
          : [...prev.rsvpResponses, newOrUpdated],
      };
    });

    return newOrUpdated;
  }

  recordCheckIn(invitationId: string, arrivedCount: number): CheckIn {
    const existing = this.getCheckInByInvitationId(invitationId);
    if (existing) {
      return existing; // Idempotent check-in
    }

    const now = new Date().toISOString();
    const newCheckIn: CheckIn = {
      invitationId,
      arrivedCount,
      checkedInAt: now,
    };

    this.setDb((prev) => ({
      ...prev,
      checkIns: [...prev.checkIns, newCheckIn],
    }));

    return newCheckIn;
  }
}

export class MockUserRepository implements IUserRepository {
  constructor(
    private getDb: () => MockDb,
    private setDb: (fn: (prev: MockDb) => MockDb) => void
  ) {}

  getAll(): User[] {
    return this.getDb().users;
  }

  getById(id: string): User | undefined {
    return this.getDb().users.find((u) => u.id === id);
  }

  create(input: CreateUserInput): User {
    const now = new Date().toISOString();
    const newUser: User = {
      id: `user-${Date.now()}`,
      fullName: input.fullName.trim(),
      email: input.email.trim(),
      role: input.role,
      status: input.status || 'ACTIVE',
      joinedAt: now,
      lastActiveAt: now,
      bio: input.bio?.trim(),
    };

    this.setDb((prev) => ({
      ...prev,
      users: [...prev.users, newUser],
      notifications: [
        {
          id: `notif-${Date.now()}`,
          title: 'Người dùng mới',
          message: `Đã tạo người dùng mới: ${newUser.fullName} (${newUser.role}) trong dữ liệu demo.`,
          type: 'info',
          timestamp: now,
          read: false,
          link: `/admin/users/${newUser.id}`,
        },
        ...prev.notifications,
      ],
    }));

    return newUser;
  }

  update(id: string, input: UpdateUserInput): User {
    const existing = this.getById(id);
    if (!existing) {
      throw new Error(`User ${id} not found`);
    }

    const updated: User = {
      ...existing,
      fullName: input.fullName !== undefined ? input.fullName.trim() : existing.fullName,
      email: input.email !== undefined ? input.email.trim() : existing.email,
      role: input.role !== undefined ? input.role : existing.role,
      status: input.status !== undefined ? input.status : existing.status,
      bio: input.bio !== undefined ? input.bio.trim() : existing.bio,
      lastActiveAt: new Date().toISOString(),
    };

    this.setDb((prev) => ({
      ...prev,
      users: prev.users.map((u) => (u.id === id ? updated : u)),
    }));

    return updated;
  }

  canDelete(id: string, currentUserId: string): { allowed: boolean; reason?: string } {
    if (id === currentUserId) {
      return {
        allowed: false,
        reason: 'Không thể xóa hoặc tạm ngưng chính tài khoản Admin bạn đang sử dụng trong phiên làm việc.',
      };
    }

    const user = this.getById(id);
    if (!user) {
      return { allowed: false, reason: 'Người dùng không tồn tại.' };
    }

    // Check if user is the last active admin
    if (user.role === 'ADMIN') {
      const activeAdmins = this.getDb().users.filter((u) => u.role === 'ADMIN' && u.status === 'ACTIVE');
      if (activeAdmins.length <= 1) {
        return {
          allowed: false,
          reason: 'Không thể xóa hoặc khóa Quản trị viên (Admin) duy nhất còn lại của hệ thống.',
        };
      }
    }

    // Check if user owns any events
    const ownedEvents = this.getDb().events.filter((e) => e.ownerId === id);
    if (ownedEvents.length > 0) {
      return {
        allowed: false,
        reason: `Người dùng này đang sở hữu ${ownedEvents.length} sự kiện (bao gồm "${ownedEvents[0].title}"). Không thể xóa người dùng đang có dữ liệu sự kiện liên quan. Vui lòng chuyển quyền hoặc lưu trữ sự kiện trước.`,
      };
    }

    return { allowed: true };
  }

  delete(id: string, currentUserId: string): { success: boolean; reason?: string } {
    const check = this.canDelete(id, currentUserId);
    if (!check.allowed) {
      return { success: false, reason: check.reason };
    }

    this.setDb((prev) => ({
      ...prev,
      users: prev.users.filter((u) => u.id !== id),
    }));

    return { success: true };
  }
}


