-- Enable Row Level Security and restrict app tables to authenticated users.
-- Run this after creating the base tables and migrations.

ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE members ENABLE ROW LEVEL SECURITY;
ALTER TABLE pairings ENABLE ROW LEVEL SECURITY;
ALTER TABLE tagged_fights ENABLE ROW LEVEL SECURITY;
ALTER TABLE released_fights ENABLE ROW LEVEL SECURITY;
ALTER TABLE raffle_winners ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

GRANT SELECT, INSERT, UPDATE, DELETE ON events TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON members TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON pairings TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON tagged_fights TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON released_fights TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON raffle_winners TO authenticated;
GRANT SELECT, INSERT ON audit_logs TO authenticated;

DROP POLICY IF EXISTS "Authenticated users can manage events" ON events;
CREATE POLICY "Authenticated users can manage events"
ON events
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

DROP POLICY IF EXISTS "Authenticated users can manage members" ON members;
CREATE POLICY "Authenticated users can manage members"
ON members
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

DROP POLICY IF EXISTS "Authenticated users can manage pairings" ON pairings;
CREATE POLICY "Authenticated users can manage pairings"
ON pairings
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

DROP POLICY IF EXISTS "Authenticated users can manage tagged fights" ON tagged_fights;
CREATE POLICY "Authenticated users can manage tagged fights"
ON tagged_fights
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

DROP POLICY IF EXISTS "Authenticated users can manage released fights" ON released_fights;
CREATE POLICY "Authenticated users can manage released fights"
ON released_fights
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

DROP POLICY IF EXISTS "Authenticated users can manage raffle winners" ON raffle_winners;
CREATE POLICY "Authenticated users can manage raffle winners"
ON raffle_winners
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

DROP POLICY IF EXISTS "Authenticated users can read audit logs" ON audit_logs;
CREATE POLICY "Authenticated users can read audit logs"
ON audit_logs
FOR SELECT
TO authenticated
USING (true);

DROP POLICY IF EXISTS "Authenticated users can create audit logs" ON audit_logs;
CREATE POLICY "Authenticated users can create audit logs"
ON audit_logs
FOR INSERT
TO authenticated
WITH CHECK (true);
