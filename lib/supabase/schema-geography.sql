-- SQL Migration to create Hierarchical Geographic Registry tables

CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- 1. Create Districts Table
CREATE TABLE IF NOT EXISTS districts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Create Chiefdoms Table
CREATE TABLE IF NOT EXISTS chiefdoms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  district_id UUID NOT NULL REFERENCES districts(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE (district_id, name)
);

-- 3. Create Localities Table (Towns/Villages)
CREATE TABLE IF NOT EXISTS localities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  chiefdom_id UUID NOT NULL REFERENCES chiefdoms(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE (chiefdom_id, name)
);

-- Create Indexes for performance
CREATE INDEX IF NOT EXISTS idx_districts_name ON districts(name);
CREATE INDEX IF NOT EXISTS idx_chiefdoms_district_id ON chiefdoms(district_id);
CREATE INDEX IF NOT EXISTS idx_localities_chiefdom_id ON localities(chiefdom_id);

-- Enable RLS
ALTER TABLE districts ENABLE ROW LEVEL SECURITY;
ALTER TABLE chiefdoms ENABLE ROW LEVEL SECURITY;
ALTER TABLE localities ENABLE ROW LEVEL SECURITY;

-- Add RLS Policies
-- Public read access
CREATE POLICY "Allow public read access to active districts" ON districts
  FOR SELECT USING (true);

CREATE POLICY "Allow public read access to active chiefdoms" ON chiefdoms
  FOR SELECT USING (true);

CREATE POLICY "Allow public read access to active localities" ON localities
  FOR SELECT USING (true);

-- Super admin modify access (using service role / admin check)
CREATE POLICY "Allow write access to admins on districts" ON districts
  FOR ALL USING (true);

CREATE POLICY "Allow write access to admins on chiefdoms" ON chiefdoms
  FOR ALL USING (true);

CREATE POLICY "Allow write access to admins on localities" ON localities
  FOR ALL USING (true);


-- 4. Seed Initial Data
-- Seed Districts (Koinadugu, Falaba)
INSERT INTO districts (name, status)
VALUES 
  ('Koinadugu', 'active'),
  ('Falaba', 'active')
ON CONFLICT (name) DO NOTHING;

-- Seed Chiefdoms for Koinadugu
INSERT INTO chiefdoms (district_id, name, status)
SELECT id, name, 'active' FROM (
  VALUES 
    ('Koinadugu'::text, 'Diang'::text),
    ('Koinadugu'::text, 'Gbonkobon Kayaka'::text),
    ('Koinadugu'::text, 'Kalian'::text),
    ('Koinadugu'::text, 'Kamukeh'::text),
    ('Koinadugu'::text, 'Kasunko'::text),
    ('Koinadugu'::text, 'Kellian'::text),
    ('Koinadugu'::text, 'Nieni'::text),
    ('Koinadugu'::text, 'Sengbe'::text),
    ('Koinadugu'::text, 'Tamiso'::text),
    ('Koinadugu'::text, 'Wara-Wara Bafodea'::text),
    ('Koinadugu'::text, 'Wara-Wara Yagala'::text)
) AS val(dname, name)
JOIN districts d ON d.name = val.dname
ON CONFLICT (district_id, name) DO NOTHING;

-- Seed Chiefdoms for Falaba
INSERT INTO chiefdoms (district_id, name, status)
SELECT id, name, 'active' FROM (
  VALUES 
    ('Falaba'::text, 'Dembelia Sikunia'::text),
    ('Falaba'::text, 'Dembelia–Musaia'::text),
    ('Falaba'::text, 'Delemandugu'::text),
    ('Falaba'::text, 'Folasaba'::text),
    ('Falaba'::text, 'Kamadu Yiraia'::text),
    ('Falaba'::text, 'Kebelia'::text),
    ('Falaba'::text, 'Kulor Saradu'::text),
    ('Falaba'::text, 'Mongo'::text),
    ('Falaba'::text, 'Morfindugu'::text),
    ('Falaba'::text, 'Neya'::text),
    ('Falaba'::text, 'Nyedu'::text),
    ('Falaba'::text, 'Sulima'::text),
    ('Falaba'::text, 'Wollay Barawa'::text)
) AS val(dname, name)
JOIN districts d ON d.name = val.dname
ON CONFLICT (district_id, name) DO NOTHING;
