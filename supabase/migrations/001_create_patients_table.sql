-- Create patients table if it doesn't exist
CREATE TABLE IF NOT EXISTS patients (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('Safe', 'Wandering', 'Fall Detected', 'Offline')),
    active_alerts INTEGER DEFAULT 0,
    device_status TEXT NOT NULL CHECK (device_status IN ('Online', 'Offline', 'Low Battery')),
    last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    location JSONB
);

-- Enable Row Level Security
ALTER TABLE patients ENABLE ROW LEVEL SECURITY;

-- Create policy to allow public read access (for anon key)
CREATE POLICY "Public Read Access" 
ON patients FOR SELECT 
USING (true);

-- Create policy to allow public update access (for demo purposes)
-- In production, this should be restricted to authenticated users or service role
CREATE POLICY "Public Update Access" 
ON patients FOR UPDATE 
USING (true)
WITH CHECK (true);

-- Seed initial data
INSERT INTO patients (id, name, status, active_alerts, device_status, last_updated, location)
VALUES
  ('P001', 'Chandreshwor Lal Malla', 'Safe', 0, 'Online', NOW(), '{"lat": 27.7172, "lng": 85.3240, "address": "Baluwatar, Kathmandu"}')
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  status = EXCLUDED.status,
  active_alerts = EXCLUDED.active_alerts,
  device_status = EXCLUDED.device_status,
  last_updated = EXCLUDED.last_updated,
  location = EXCLUDED.location;
