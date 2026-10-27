export type CardStatus = 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';

export type CardThemeKey = 'classic' | 'rose' | 'night' | 'minimal' | 'modern' | 'campus';

export interface CardConfig {
  theme: CardThemeKey;
  primaryColor?: string;
  accentColor?: string;
  headline: string;
  subHeadline?: string;
  invitationCopy: string;
  signature: string;
  showCapArt?: boolean;
  showFlowerArt?: boolean;
  envelopeStyle?: 'ivory' | 'navy' | 'burgundy';
  /** Campus theme only — every string below is editable in Card Editor. */
  brandLabel?: string; // e.g. "ĐẠI HỌC FPT"
  kicker?: string; // e.g. "TRÂN TRỌNG KÍNH MỜI"
  headlineAccent?: string; // highlighted part of headline, e.g. "2026"
  heroImageUrl?: string; // campus asset path
  heroImageAlt?: string;
  mapLabel?: string; // e.g. "Xem chỉ đường"
  rsvpHeading?: string; // e.g. "BẠN SẼ THAM DỰ CHỨ?"
  rsvpYesLabel?: string;
  rsvpNoLabel?: string;
  closingLine?: string; // e.g. "Hẹn gặp bạn tại ngày đặc biệt này."
}

export interface CardDesign {
  id: string;
  eventId: string; // Association is immutable!
  title: string;
  audienceLabel?: string; // e.g. "Gia đình", "Bạn thân", "Thầy cô"
  status: CardStatus;
  isDefault: boolean;
  templateKey: string;
  publishedConfig: CardConfig | null;
  draftConfig: CardConfig;
  revision: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCardInput {
  eventId: string; // Mandatory!
  title: string;
  audienceLabel?: string;
  templateKey: string;
  initialConfig?: Partial<CardConfig>;
  isDefault?: boolean;
}

export interface UpdateCardInput {
  title?: string;
  audienceLabel?: string;
  draftConfig?: CardConfig;
  status?: CardStatus;
  isDefault?: boolean;
}
