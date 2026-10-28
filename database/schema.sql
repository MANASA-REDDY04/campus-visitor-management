-- ============================================================
--  Campus Visitor Management System — Supabase Schema
--  Run this in your Supabase SQL Editor (Project > SQL Editor)
-- ============================================================

-- ── Enable UUID extension (already enabled in Supabase by default) ──────────
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";


-- ── Enum: visitor_type ──────────────────────────────────────────────────────
CREATE TYPE visitor_type AS ENUM (
    'PARENT',
    'GUEST',
    'VENDOR',
    'ALUMNI',
    'OTHER'
);


-- ── Enum: visit_status ──────────────────────────────────────────────────────
CREATE TYPE visit_status AS ENUM (
    'PENDING',
    'APPROVED',
    'REJECTED',
    'CHECKED_IN',
    'COMPLETED',
    'CANCELLED'
);


-- ── Table: visitors ─────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS visitors (
    id           UUID         PRIMARY KEY DEFAULT uuid_generate_v4(),
    full_name    TEXT         NOT NULL,
    phone        TEXT         NOT NULL,
    email        TEXT,
    visitor_type visitor_type NOT NULL DEFAULT 'GUEST',
    created_at   TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE visitors IS 'Stores visitor personal information';


-- ── Table: visits ───────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS visits (
    id               UUID         PRIMARY KEY DEFAULT uuid_generate_v4(),
    visitor_id       UUID         NOT NULL REFERENCES visitors(id) ON DELETE CASCADE,
    person_to_visit  TEXT         NOT NULL,
    department       TEXT         NOT NULL,
    purpose          TEXT         NOT NULL,
    visit_date       DATE         NOT NULL,
    arrival_time     TEXT         NOT NULL,          -- stored as "HH:MM"
    departure_time   TEXT,                           -- optional "HH:MM"
    status           visit_status NOT NULL DEFAULT 'PENDING',
    pass_id          TEXT         NOT NULL UNIQUE,
    check_in_time    TIMESTAMPTZ,
    check_out_time   TIMESTAMPTZ,
    created_at       TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    updated_at       TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE visits IS 'Stores visit requests and their lifecycle status';
COMMENT ON COLUMN visits.pass_id IS 'Human-readable unique pass identifier e.g. VISIT-2026-123456';
COMMENT ON COLUMN visits.arrival_time IS 'Expected arrival time in HH:MM format';


-- ── Index: faster lookups ───────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_visits_visitor_id   ON visits(visitor_id);
CREATE INDEX IF NOT EXISTS idx_visits_status        ON visits(status);
CREATE INDEX IF NOT EXISTS idx_visits_visit_date    ON visits(visit_date);
CREATE INDEX IF NOT EXISTS idx_visits_pass_id       ON visits(pass_id);
CREATE INDEX IF NOT EXISTS idx_visits_department    ON visits(department);


-- ── Auto-update updated_at trigger ─────────────────────────────────────────
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER visits_updated_at
    BEFORE UPDATE ON visits
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();


-- ── Table: users ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS users (
    id         UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
    username   TEXT        NOT NULL UNIQUE,
    password   TEXT        NOT NULL,
    name       TEXT        NOT NULL,
    role       TEXT        NOT NULL,          -- 'ADMIN', 'MANAGER', 'SECURITY'
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE users IS 'System users for Admin, Manager, and Security roles';


-- ── Row Level Security (RLS) ────────────────────────────────────────────────
-- Option A: Disable RLS for simple backend access
ALTER TABLE visitors DISABLE ROW LEVEL SECURITY;
ALTER TABLE visits   DISABLE ROW LEVEL SECURITY;
ALTER TABLE users    DISABLE ROW LEVEL SECURITY;

-- Option B: In case RLS is forced by Supabase project settings, grant full access to anon & authenticated
ALTER TABLE visitors ENABLE ROW LEVEL SECURITY;
ALTER TABLE visits   ENABLE ROW LEVEL SECURITY;
ALTER TABLE users    ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow all for visitors" ON visitors;
CREATE POLICY "Allow all for visitors" ON visitors FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow all for visits" ON visits;
CREATE POLICY "Allow all for visits" ON visits FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow all for users" ON users;
CREATE POLICY "Allow all for users" ON users FOR ALL USING (true) WITH CHECK (true);
