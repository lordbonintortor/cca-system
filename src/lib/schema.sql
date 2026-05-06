-- Create events table
CREATE TABLE events (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  derby_info TEXT NOT NULL,
  date TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create members table
CREATE TABLE members (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  event_id BIGINT REFERENCES events(id),
  entry_name TEXT NOT NULL,
  event_name TEXT NOT NULL,
  number_of_entries INTEGER NOT NULL,
  registration_date DATE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create pairings table
CREATE TABLE pairings (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  event_id BIGINT REFERENCES events(id),
  fight_number INTEGER NOT NULL,
  sultada_number TEXT NOT NULL,
  mayron_entry_id BIGINT REFERENCES members(id),
  mayron_handler TEXT NOT NULL,
  mayron_weight TEXT NOT NULL,
  mayron_betting TEXT NOT NULL,
  wala_entry_id BIGINT REFERENCES members(id),
  wala_handler TEXT NOT NULL,
  wala_weight TEXT NOT NULL,
  wala_betting TEXT NOT NULL,
  diferencia TEXT NOT NULL,
  parada_amount DECIMAL(10, 2),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create tagged_fights table
CREATE TABLE tagged_fights (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  pairing_id BIGINT NOT NULL REFERENCES pairings(id),
  fight_number INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  outcome TEXT,
  outcome_winner TEXT,
  tagged_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create released_fights table
CREATE TABLE released_fights (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  pairing_id BIGINT NOT NULL REFERENCES pairings(id),
  release_status TEXT NOT NULL DEFAULT 'unreleased',
  released_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create raffle_winners table
CREATE TABLE raffle_winners (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  ticket_number TEXT NOT NULL,
  participant_name TEXT NOT NULL,
  entry_name TEXT NOT NULL,
  event_id BIGINT REFERENCES events(id),
  event_name TEXT NOT NULL,
  drawn_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create audit logs table
CREATE TABLE audit_logs (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id TEXT,
  actor TEXT NOT NULL DEFAULT 'system',
  details JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX idx_members_event_name ON members(event_name);
CREATE INDEX idx_members_event_id ON members(event_id);
CREATE INDEX idx_pairings_event_id ON pairings(event_id);
CREATE INDEX idx_pairings_fight_number ON pairings(fight_number);
CREATE INDEX idx_tagged_fights_pairing_id ON tagged_fights(pairing_id);
CREATE INDEX idx_released_fights_pairing_id ON released_fights(pairing_id);
CREATE INDEX idx_raffle_winners_event_name ON raffle_winners(event_name);
CREATE INDEX idx_raffle_winners_event_id ON raffle_winners(event_id);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at);
CREATE INDEX idx_audit_logs_entity ON audit_logs(entity_type, entity_id);
