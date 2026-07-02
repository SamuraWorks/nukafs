-- ============================================================
-- NUKaFs Geographic Registry Migration
-- Run this in your Supabase SQL Editor (Dashboard → SQL Editor)
-- ============================================================

-- 1. Create Districts table
CREATE TABLE IF NOT EXISTS public.districts (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        TEXT NOT NULL UNIQUE,
  status      TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. Create Chiefdoms table (references districts)
CREATE TABLE IF NOT EXISTS public.chiefdoms (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        TEXT NOT NULL,
  district_id UUID NOT NULL REFERENCES public.districts(id) ON DELETE CASCADE,
  status      TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (name, district_id)
);

-- 3. Row Level Security
ALTER TABLE public.districts  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chiefdoms  ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to read geography data
CREATE POLICY "Allow authenticated read on districts"
  ON public.districts FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Allow authenticated read on chiefdoms"
  ON public.chiefdoms FOR SELECT
  TO authenticated
  USING (true);

-- Allow service_role to do everything (used by API routes)
CREATE POLICY "Allow service_role full access on districts"
  ON public.districts FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow service_role full access on chiefdoms"
  ON public.chiefdoms FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- ============================================================
-- 4. Seed: Koinadugu District + Chiefdoms
-- ============================================================
WITH d AS (
  INSERT INTO public.districts (name) VALUES ('Koinadugu')
  ON CONFLICT (name) DO UPDATE SET name = EXCLUDED.name
  RETURNING id
)
INSERT INTO public.chiefdoms (name, district_id)
SELECT c.name, d.id FROM d,
  (VALUES
    ('Diang'),
    ('Gbonkobon Kayaka'),
    ('Kalian'),
    ('Kamukeh'),
    ('Kasunko'),
    ('Kellian'),
    ('Nieni'),
    ('Sengbe'),
    ('Tamiso'),
    ('Wara-Wara Bafodea'),
    ('Wara-Wara Yagala')
  ) AS c(name)
ON CONFLICT (name, district_id) DO NOTHING;

-- ============================================================
-- 5. Seed: Falaba District + Chiefdoms
-- ============================================================
WITH d AS (
  INSERT INTO public.districts (name) VALUES ('Falaba')
  ON CONFLICT (name) DO UPDATE SET name = EXCLUDED.name
  RETURNING id
)
INSERT INTO public.chiefdoms (name, district_id)
SELECT c.name, d.id FROM d,
  (VALUES
    ('Dembelia Sikunia'),
    ('Dembelia-Musaia'),
    ('Delemandugu'),
    ('Folasaba'),
    ('Kamadu Yiraia'),
    ('Kebelia'),
    ('Kulor Saradu'),
    ('Mongo'),
    ('Morfindugu'),
    ('Neya'),
    ('Nyedu'),
    ('Sulima'),
    ('Wollay Barawa')
  ) AS c(name)
ON CONFLICT (name, district_id) DO NOTHING;

-- ============================================================
-- Done! Verify with:
-- SELECT d.name AS district, c.name AS chiefdom
-- FROM chiefdoms c JOIN districts d ON c.district_id = d.id
-- ORDER BY d.name, c.name;
-- ============================================================
