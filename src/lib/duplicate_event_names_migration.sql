ALTER TABLE members DROP CONSTRAINT IF EXISTS members_event_name_fkey;

ALTER TABLE raffle_winners DROP CONSTRAINT IF EXISTS raffle_winners_event_name_fkey;

ALTER TABLE events DROP CONSTRAINT IF EXISTS events_name_key;

ALTER TABLE members ADD COLUMN IF NOT EXISTS event_id BIGINT REFERENCES events(id);

UPDATE members
SET event_id = events.id
FROM events
WHERE members.event_id IS NULL
  AND members.event_name = events.name;

CREATE INDEX IF NOT EXISTS idx_members_event_id ON members(event_id);

ALTER TABLE raffle_winners ADD COLUMN IF NOT EXISTS event_id BIGINT REFERENCES events(id);

UPDATE raffle_winners
SET event_id = events.id
FROM events
WHERE raffle_winners.event_id IS NULL
  AND raffle_winners.event_name = events.name;

CREATE INDEX IF NOT EXISTS idx_raffle_winners_event_id ON raffle_winners(event_id);
