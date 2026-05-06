-- Align members table with the current registration flow.
-- The app records entry names and event membership; handler and cock type are not collected.

ALTER TABLE members DROP COLUMN IF EXISTS handler_name;
ALTER TABLE members DROP COLUMN IF EXISTS cock_type;
