-- Prevent duplicate operational records during concurrent use.
-- Apply after the existing migrations listed in README.md.
-- This migration intentionally does not delete existing data. If duplicates already
-- exist, the transaction fails so they can be reviewed before retrying.

BEGIN;

CREATE UNIQUE INDEX IF NOT EXISTS uq_tagged_fights_pairing_id
  ON tagged_fights(pairing_id);

CREATE UNIQUE INDEX IF NOT EXISTS uq_released_fights_pairing_id
  ON released_fights(pairing_id);

CREATE UNIQUE INDEX IF NOT EXISTS uq_pairings_event_fight_number
  ON pairings(event_id, fight_number);

COMMIT;
