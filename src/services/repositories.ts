import type { Event, CreateEventInput, UpdateEventInput } from '@/features/events/types';
import type { CardDesign, CreateCardInput, UpdateCardInput } from '@/features/cards/types';
import type { EventGuest, CreateGuestInput, UpdateGuestInput } from '@/features/guests/types';
import type {
  Invitation,
  RsvpResponse,
  CheckIn,
  User,
  InvitationResolution,
  RsvpInput,
} from '@/features/invitations/types';
import type { CreateUserInput, UpdateUserInput, MockNotification } from '@/features/users/types';

export interface MockDb {
  users: User[];
  events: Event[];
  cardDesigns: CardDesign[];
  guests: EventGuest[];
  invitations: Invitation[];
  rsvpResponses: RsvpResponse[];
  checkIns: CheckIn[];
  notifications: MockNotification[];
}

export interface IUserRepository {
  getAll(): User[];
  getById(id: string): User | undefined;
  create(input: CreateUserInput): User;
  update(id: string, input: UpdateUserInput): User;
  canDelete(id: string, currentUserId: string): { allowed: boolean; reason?: string };
  delete(id: string, currentUserId: string): { success: boolean; reason?: string };
}

export interface IEventRepository {
  getAll(): Event[];
  getById(id: string): Event | undefined;
  create(input: CreateEventInput, ownerId: string): Event;
  update(id: string, input: UpdateEventInput): Event;
  delete(id: string): boolean;
}

export interface ICardRepository {
  getByEventId(eventId: string): CardDesign[];
  getById(id: string, eventId?: string): CardDesign | undefined;
  create(input: CreateCardInput): CardDesign;
  update(id: string, input: UpdateCardInput, eventId?: string): CardDesign;
  setDefault(id: string, eventId: string): void;
  publish(id: string, eventId: string): CardDesign;
  duplicate(id: string, sourceEventId: string, targetEventId: string, newTitle?: string): CardDesign;
  canArchive(id: string, eventId: string, activeGuestsCount: number): { allowed: boolean; reason?: string };
  archive(id: string, eventId: string): CardDesign;
}

export interface IGuestRepository {
  getByEventId(eventId: string): EventGuest[];
  getById(id: string, eventId?: string): EventGuest | undefined;
  create(input: CreateGuestInput): EventGuest;
  update(id: string, input: UpdateGuestInput, eventId?: string): EventGuest;
  assignCard(guestId: string, cardId: string | null, eventId: string): EventGuest;
  bulkAssignCard(guestIds: string[], cardId: string | null, eventId: string): EventGuest[];
  delete(id: string, eventId: string): boolean;
}

export interface IInvitationRepository {
  getByToken(token: string): Invitation | undefined;
  resolveByToken(token: string): InvitationResolution;
  upsertRsvp(token: string, input: RsvpInput): { rsvp: RsvpResponse; resolution: InvitationResolution };
  getByGuestId(guestId: string): Invitation | undefined;
  getByEventId(eventId: string): Invitation[];
  getRsvpByInvitationId(invitationId: string): RsvpResponse | undefined;
  getCheckInByInvitationId(invitationId: string): CheckIn | undefined;
  recordRsvp(invitationId: string, status: 'YES' | 'NO', plusOnes: number, attendanceMode?: 'CEREMONY' | 'PHOTOS' | 'BOTH'): RsvpResponse;
  recordCheckIn(invitationId: string, arrivedCount: number): CheckIn;
}

