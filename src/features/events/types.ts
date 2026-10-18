export type EventStatus = 'DRAFT' | 'PUBLISHED' | 'FINISHED' | 'CANCELLED';

export type EventType =
  | 'GRADUATION'
  | 'BIRTHDAY'
  | 'WEDDING'
  | 'WORKSHOP'
  | 'ANNIVERSARY'
  | 'OTHER';

export interface Event {
  id: string;
  ownerId: string;
  title: string;
  eventType: EventType;
  description?: string;
  startsAt: string; // ISO 8601 string, e.g. 2026-11-20T08:00:00+07:00
  endsAt?: string | null;
  timezone: string; // e.g. 'Asia/Ho_Chi_Minh'
  locationName: string;
  locationAddress?: string;
  mapUrl?: string;
  rsvpDeadline?: string | null;
  status: EventStatus;
  attendanceOptionsEnabled?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateEventInput {
  title: string;
  eventType: EventType;
  description?: string;
  startsAt: string;
  endsAt?: string | null;
  timezone: string;
  locationName: string;
  locationAddress?: string;
  mapUrl?: string;
  rsvpDeadline?: string | null;
  attendanceOptionsEnabled?: boolean;
}

export interface UpdateEventInput extends Partial<CreateEventInput> {
  status?: EventStatus;
}
