export type InvitationStatus = 'NOT_CREATED' | 'ACTIVE' | 'REVOKED';

export type RsvpStatus = 'PENDING' | 'YES' | 'NO';

export type AttendanceMode = 'CEREMONY' | 'PHOTOS' | 'BOTH';

export interface Invitation {
  id: string;
  eventId: string;
  guestId: string; // UNIQUE per guest in MVP
  token: string; // Deterministic public bearer token for /invite/[token]
  status: InvitationStatus;
  tokenHash?: string; // SHA-256 hash placeholder for server phase
  checkinVersion: number;
  createdAt: string;
  updatedAt: string;
}

export interface RsvpResponse {
  invitationId: string;
  status: 'YES' | 'NO'; // PENDING is derived when row does NOT exist
  plusOnes: number;
  attendanceMode?: AttendanceMode;
  updatedAt: string;
}

export interface CheckIn {
  invitationId: string;
  arrivedCount: number;
  checkedInAt: string;
}

// Re-export User definitions from users feature
export type { UserRole, UserStatus, User } from '@/features/users/types';


export type InvitationResolutionReason =
  | 'VALID'
  | 'TOKEN_NOT_FOUND'
  | 'INVITATION_REVOKED'
  | 'GUEST_NOT_FOUND'
  | 'GUEST_UNASSIGNED'
  | 'CARD_NOT_FOUND'
  | 'CARD_CROSS_EVENT'
  | 'CARD_DRAFT'
  | 'CARD_ARCHIVED'
  | 'EVENT_DRAFT'
  | 'EVENT_CANCELLED'
  | 'EVENT_FINISHED';

export interface InvitationResolution {
  success: boolean;
  reason: InvitationResolutionReason;
  message: string;
  invitation?: Invitation;
  guest?: import('@/features/guests/types').EventGuest;
  event?: import('@/features/events/types').Event;
  card?: import('@/features/cards/types').CardDesign;
  rsvp?: RsvpResponse;
  checkIn?: CheckIn;
  isDeadlinePassed?: boolean;
}

export interface RsvpInput {
  status: 'YES' | 'NO';
  plusOnes: number;
  attendanceMode?: AttendanceMode;
}
