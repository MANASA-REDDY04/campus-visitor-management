-- ============================================================
--  Campus Visitor Management System — Demo / Seed Data
--  Run AFTER schema.sql in your Supabase SQL Editor
--  This creates sample data for the project demonstration
-- ============================================================

-- Clear existing demo data (safe to re-run)
DELETE FROM visits   WHERE pass_id LIKE 'VISIT-2026-DEMO%';
DELETE FROM visitors WHERE phone   LIKE '98%DEMO';
DELETE FROM users    WHERE username IN ('admin', 'manager', 'security');


-- ── Insert 3 System Accounts (Admin, Manager, Security) ─────────────────────
INSERT INTO users (id, username, password, name, role) VALUES
    (
        'u0000000-0000-0000-0000-000000000001',
        'admin',
        'admin123',
        'CBIT Administrator',
        'ADMIN'
    ),
    (
        'u0000000-0000-0000-0000-000000000002',
        'manager',
        'manager123',
        'Campus Visit Manager',
        'MANAGER'
    ),
    (
        'u0000000-0000-0000-0000-000000000003',
        'security',
        'security123',
        'Main Gate Security',
        'SECURITY'
    );


-- ── Insert 5 Demo Visitors ───────────────────────────────────────────────────
INSERT INTO visitors (id, full_name, phone, email, visitor_type, created_at) VALUES
    (
        'a1000000-0000-0000-0000-000000000001',
        'Rahul Kumar',
        '9876543210',
        'rahul.kumar@gmail.com',
        'PARENT',
        NOW() - INTERVAL '5 days'
    ),
    (
        'a1000000-0000-0000-0000-000000000002',
        'Priya Sharma',
        '9845612300',
        'priya.sharma@email.com',
        'GUEST',
        NOW() - INTERVAL '4 days'
    ),
    (
        'a1000000-0000-0000-0000-000000000003',
        'Suresh Nair',
        '9900112233',
        'suresh.nair@vendor.com',
        'VENDOR',
        NOW() - INTERVAL '3 days'
    ),
    (
        'a1000000-0000-0000-0000-000000000004',
        'Anita Desai',
        '9112233445',
        'anita.desai@alumni.edu',
        'ALUMNI',
        NOW() - INTERVAL '2 days'
    ),
    (
        'a1000000-0000-0000-0000-000000000005',
        'Mohammed Farhan',
        '9988776655',
        'farhan@example.com',
        'GUEST',
        NOW() - INTERVAL '1 day'
    );


-- ── Insert 7 Demo Visits ─────────────────────────────────────────────────────

-- 1. PENDING — submitted today
INSERT INTO visits (
    id, visitor_id, person_to_visit, department, purpose,
    visit_date, arrival_time, departure_time, status, pass_id, created_at, updated_at
) VALUES (
    'b2000000-0000-0000-0000-000000000001',
    'a1000000-0000-0000-0000-000000000001',
    'Dr. Priya Mehta',
    'Computer Science',
    'Discussion regarding ward''s academic progress and semester exams',
    CURRENT_DATE,
    '10:00',
    '11:30',
    'PENDING',
    'VISIT-2026-DEMO01',
    NOW() - INTERVAL '2 hours',
    NOW() - INTERVAL '2 hours'
);

-- 2. PENDING — submitted today
INSERT INTO visits (
    id, visitor_id, person_to_visit, department, purpose,
    visit_date, arrival_time, departure_time, status, pass_id, created_at, updated_at
) VALUES (
    'b2000000-0000-0000-0000-000000000002',
    'a1000000-0000-0000-0000-000000000002',
    'Prof. Rajesh Kumar',
    'Information Technology',
    'Interview for research collaboration on AI-based attendance system',
    CURRENT_DATE,
    '14:00',
    '15:00',
    'PENDING',
    'VISIT-2026-DEMO02',
    NOW() - INTERVAL '1 hour',
    NOW() - INTERVAL '1 hour'
);

-- 3. APPROVED — for today
INSERT INTO visits (
    id, visitor_id, person_to_visit, department, purpose,
    visit_date, arrival_time, departure_time, status, pass_id, created_at, updated_at
) VALUES (
    'b2000000-0000-0000-0000-000000000003',
    'a1000000-0000-0000-0000-000000000003',
    'Mr. Arun Patel',
    'Administration',
    'Annual maintenance contract renewal and equipment inspection',
    CURRENT_DATE,
    '09:30',
    '12:00',
    'APPROVED',
    'VISIT-2026-DEMO03',
    NOW() - INTERVAL '3 hours',
    NOW() - INTERVAL '1 hour'
);

-- 4. APPROVED — for today
INSERT INTO visits (
    id, visitor_id, person_to_visit, department, purpose,
    visit_date, arrival_time, departure_time, status, pass_id, created_at, updated_at
) VALUES (
    'b2000000-0000-0000-0000-000000000004',
    'a1000000-0000-0000-0000-000000000004',
    'Dr. Lakshmi Iyer',
    'Computer Science',
    'Alumni networking session and placement assistance program',
    CURRENT_DATE,
    '11:00',
    '13:00',
    'APPROVED',
    'VISIT-2026-DEMO04',
    NOW() - INTERVAL '4 hours',
    NOW() - INTERVAL '2 hours'
);

-- 5. CHECKED_IN — currently inside
INSERT INTO visits (
    id, visitor_id, person_to_visit, department, purpose,
    visit_date, arrival_time, departure_time, status, pass_id,
    check_in_time, created_at, updated_at
) VALUES (
    'b2000000-0000-0000-0000-000000000005',
    'a1000000-0000-0000-0000-000000000005',
    'Ms. Sneha Joshi',
    'Placement Cell',
    'Campus recruitment drive discussion for software engineering roles',
    CURRENT_DATE,
    '09:00',
    '12:00',
    'CHECKED_IN',
    'VISIT-2026-DEMO05',
    NOW() - INTERVAL '30 minutes',
    NOW() - INTERVAL '5 hours',
    NOW() - INTERVAL '30 minutes'
);

-- 6. COMPLETED — yesterday
INSERT INTO visits (
    id, visitor_id, person_to_visit, department, purpose,
    visit_date, arrival_time, departure_time, status, pass_id,
    check_in_time, check_out_time, created_at, updated_at
) VALUES (
    'b2000000-0000-0000-0000-000000000006',
    'a1000000-0000-0000-0000-000000000001',
    'Prof. Kavitha Reddy',
    'Examination Cell',
    'Fee payment and exam form submission for final semester',
    CURRENT_DATE - INTERVAL '1 day',
    '10:00',
    '11:00',
    'COMPLETED',
    'VISIT-2026-DEMO06',
    (NOW() - INTERVAL '1 day')::DATE + TIME '10:05',
    (NOW() - INTERVAL '1 day')::DATE + TIME '11:00',
    NOW() - INTERVAL '2 days',
    NOW() - INTERVAL '1 day'
);

-- 7. COMPLETED — 2 days ago
INSERT INTO visits (
    id, visitor_id, person_to_visit, department, purpose,
    visit_date, arrival_time, departure_time, status, pass_id,
    check_in_time, check_out_time, created_at, updated_at
) VALUES (
    'b2000000-0000-0000-0000-000000000007',
    'a1000000-0000-0000-0000-000000000004',
    'Dr. Sanjay Gupta',
    'Finance & Accounts',
    'Scholarship disbursement verification and alumni donation processing',
    CURRENT_DATE - INTERVAL '2 days',
    '14:00',
    '15:30',
    'COMPLETED',
    'VISIT-2026-DEMO07',
    (NOW() - INTERVAL '2 days')::DATE + TIME '14:10',
    (NOW() - INTERVAL '2 days')::DATE + TIME '15:25',
    NOW() - INTERVAL '3 days',
    NOW() - INTERVAL '2 days'
);


-- ── Verification query (run to confirm seed data) ────────────────────────────
-- SELECT v.full_name, vi.status, vi.pass_id, vi.visit_date
-- FROM visits vi
-- JOIN visitors v ON v.id = vi.visitor_id
-- ORDER BY vi.created_at DESC;
