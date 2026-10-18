-- MVP-ready data model only. Authentication and endpoints are NOT implemented.
-- Run as role smartinvite. Store invitation tokens as SHA-256 hashes, not plaintext.
CREATE TABLE users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL UNIQUE,
  password_hash text NOT NULL,
  display_name text NOT NULL,
  role text NOT NULL DEFAULT 'HOST' CHECK (role IN ('ADMIN','HOST')),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id uuid NOT NULL REFERENCES users(id),
  title text NOT NULL,
  description text,
  location_name text,
  location_address text,
  starts_at timestamptz NOT NULL,
  ends_at timestamptz,
  status text NOT NULL DEFAULT 'DRAFT' CHECK (status IN ('DRAFT','PUBLISHED','FINISHED','CANCELLED')),
  created_at timestamptz NOT NULL DEFAULT now(),
  CHECK (ends_at IS NULL OR ends_at >= starts_at)
);
CREATE INDEX events_owner_idx ON events(owner_id);

CREATE TABLE card_designs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id uuid NOT NULL UNIQUE REFERENCES events(id) ON DELETE CASCADE,
  template_key text NOT NULL DEFAULT 'graduation',
  config jsonb NOT NULL DEFAULT '{}'::jsonb,
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE guests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id uuid NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  full_name text NOT NULL,
  email text,
  phone text,
  plus_ones_allowed integer NOT NULL DEFAULT 0 CHECK (plus_ones_allowed BETWEEN 0 AND 20),
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (id, event_id)
);
CREATE INDEX guests_event_idx ON guests(event_id);

CREATE TABLE invitations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id uuid NOT NULL,
  guest_id uuid NOT NULL UNIQUE,
  token_hash char(64) NOT NULL UNIQUE,
  revoked_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  FOREIGN KEY (guest_id, event_id) REFERENCES guests(id, event_id) ON DELETE CASCADE
);
CREATE INDEX invitations_event_idx ON invitations(event_id);

CREATE TABLE rsvp_responses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  invitation_id uuid NOT NULL UNIQUE REFERENCES invitations(id) ON DELETE CASCADE,
  status text NOT NULL CHECK (status IN ('YES','NO')),
  plus_ones integer NOT NULL DEFAULT 0 CHECK (plus_ones BETWEEN 0 AND 20),
  note text,
  responded_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE event_staff (
  event_id uuid NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  PRIMARY KEY (event_id,user_id)
);

CREATE TABLE check_ins (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  invitation_id uuid NOT NULL UNIQUE REFERENCES invitations(id) ON DELETE CASCADE,
  checked_in_by uuid NOT NULL REFERENCES users(id),
  arrived_count integer NOT NULL DEFAULT 1 CHECK (arrived_count BETWEEN 1 AND 21),
  checked_in_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE audit_logs (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  actor_id uuid REFERENCES users(id),
  event_id uuid REFERENCES events(id) ON DELETE SET NULL,
  action text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
