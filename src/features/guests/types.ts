export interface GuestPersonalization {
  schemaVersion: 1;
  salutation?: string; // e.g. "Anh", "Chị", "Bạn", "Thầy", "Cô"
  greeting?: string; // e.g. "Thân gửi", "Kính gửi"
  personalMessage?: string;
  accentColor?: string;
  heroAssetId?: string;
}

export interface EventGuest {
  id: string;
  eventId: string; // Belongs to exactly 1 event!
  fullName: string;
  groupName?: string; // e.g. "Bạn đại học", "Gia đình", "Bạn thân", "Thầy cô"
  assignedCardDesignId: string | null; // Belongs to same event!
  personalization: GuestPersonalization;
  plusOnesAllowed: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateGuestInput {
  eventId: string;
  fullName: string;
  groupName?: string;
  assignedCardDesignId?: string | null;
  personalization?: Partial<GuestPersonalization>;
  plusOnesAllowed?: number;
}

export interface UpdateGuestInput {
  fullName?: string;
  groupName?: string;
  assignedCardDesignId?: string | null;
  personalization?: GuestPersonalization;
  plusOnesAllowed?: number;
}
