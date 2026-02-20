-- Enable Realtime for balls and innings tables
-- This allows subscriptions to receive real-time updates when data changes

-- Enable realtime for balls table
ALTER PUBLICATION supabase_realtime ADD TABLE balls;

-- Enable realtime for innings table
ALTER PUBLICATION supabase_realtime ADD TABLE innings;

-- Enable realtime for matches table (for match state changes)
ALTER PUBLICATION supabase_realtime ADD TABLE matches;
