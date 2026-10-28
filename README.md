# 🏫 Campus Visitor Management System

An MCA Mini Project — A full-stack web application to manage campus visitors from registration to departure.

---

## 📌 Project Overview

This system allows visitors to register campus visits digitally, receive a QR-based visitor pass, and enables admins and security staff to manage the complete visitor lifecycle.

**Demo Flow:**
```
Visitor Registers → Admin Approves → Digital Pass Generated → Security Checks In → Visitor Checks Out → History
```

---

## ✨ Role-Based System & Demo Accounts

| Role | Username | Password | Key Responsibilities | Access Protected Route |
|------|----------|----------|----------------------|------------------------|
| **Admin** | `admin` | `admin123` | Approves or rejects visits, views statistics & complete history | `/admin/dashboard`, `/admin/history` |
| **Manager** | `manager` | `manager123` | Registers visitor passes, issues visit requests | `/visitor/register` |
| **Security** | `security` | `security123` | Scans QR passes, verifies IDs, logs check-in & check-out | `/security/dashboard` |

> 💡 **Tip:** The Login page at `/login` includes **1-Click Quick Demo Login** buttons for instant testing and project evaluation.

---

## 🏗 Architecture

```
Next.js Frontend (Port 3000)
        ↓  (REST API calls via axios)
FastAPI Backend (Port 8000)
        ↓  (Supabase Python client)
Supabase PostgreSQL (Cloud)
```

> **Important:** The frontend never directly accesses Supabase. All data operations go through the FastAPI backend.

---

## 🛠 Tech Stack

| Layer    | Technology |
|----------|------------|
| Frontend | Next.js 15, TypeScript, Tailwind CSS, App Router |
| Backend  | Python, FastAPI, Pydantic v2 |
| Database | Supabase (PostgreSQL) |
| QR Code  | `qrcode.react` library |
| Icons    | `lucide-react` |

---

## 📁 Folder Structure

```
visitor-management/
│
├── backend/
│   ├── app/
│   │   ├── main.py              ← FastAPI entry point
│   │   ├── config.py            ← Environment variable loading
│   │   ├── database.py          ← Supabase client singleton
│   │   ├── models/
│   │   │   └── enums.py         ← VisitorType, VisitStatus enums
│   │   ├── schemas/
│   │   │   └── visitor.py       ← Pydantic request/response schemas
│   │   ├── routers/
│   │   │   ├── visitors.py      ← /api/visitors/...
│   │   │   ├── admin.py         ← /api/admin/...
│   │   │   └── security.py      ← /api/security/...
│   │   ├── services/
│   │   │   └── visitor_service.py  ← All business logic
│   │   └── utils/
│   │       └── helpers.py       ← UUID, pass ID generation
│   ├── requirements.txt
│   └── .env.example
│
├── frontend/
│   ├── app/
│   │   ├── page.tsx             ← Landing page (role selector)
│   │   ├── visitor/
│   │   │   ├── register/page.tsx    ← Visitor registration form
│   │   │   └── pass/[passId]/page.tsx  ← Digital pass view
│   │   ├── admin/
│   │   │   ├── dashboard/page.tsx   ← Admin dashboard
│   │   │   └── history/page.tsx     ← Visit history
│   │   └── security/
│   │       └── dashboard/page.tsx   ← Security console
│   ├── components/
│   │   ├── StatusBadge.tsx      ← Color-coded status badges
│   │   ├── VisitorTable.tsx     ← Reusable visitor list table
│   │   ├── VisitorPass.tsx      ← Digital pass with QR code
│   │   └── QRScanner.tsx        ← Pass verification input
│   ├── lib/
│   │   └── api.ts               ← All API calls (axios)
│   ├── types/
│   │   └── visitor.ts           ← TypeScript interfaces
│   └── .env.example
│
└── database/
    ├── schema.sql               ← Run first: creates tables + enums
    └── seed.sql                 ← Run second: inserts demo data
```

---

## 🗄 Database Schema

### `visitors` table
| Column       | Type        | Description |
|--------------|-------------|-------------|
| id           | UUID (PK)   | Auto-generated |
| full_name    | TEXT        | Visitor's full name |
| phone        | TEXT        | Mobile number |
| email        | TEXT        | Optional email |
| visitor_type | ENUM        | PARENT, GUEST, VENDOR, ALUMNI, OTHER |
| created_at   | TIMESTAMPTZ | Record creation time |

### `visits` table
| Column          | Type        | Description |
|-----------------|-------------|-------------|
| id              | UUID (PK)   | Auto-generated |
| visitor_id      | UUID (FK)   | References visitors.id |
| person_to_visit | TEXT        | Name of person being visited |
| department      | TEXT        | Campus department |
| purpose         | TEXT        | Reason for visit |
| visit_date      | DATE        | Scheduled date |
| arrival_time    | TEXT        | "HH:MM" format |
| departure_time  | TEXT        | Optional "HH:MM" format |
| status          | ENUM        | PENDING → APPROVED → CHECKED_IN → COMPLETED |
| pass_id         | TEXT (UQ)   | e.g. VISIT-2026-123456 |
| check_in_time   | TIMESTAMPTZ | Actual check-in timestamp |
| check_out_time  | TIMESTAMPTZ | Actual check-out timestamp |
| created_at      | TIMESTAMPTZ | Auto-set |
| updated_at      | TIMESTAMPTZ | Auto-updated via trigger |

---

## 🔌 API Endpoints

### Visitor APIs
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/visitors/register` | Register visitor + create visit |
| GET  | `/api/visitors/visits/{visit_id}` | Get visit by ID |
| GET  | `/api/visitors/visits/pass/{pass_id}` | Get pass by pass ID |

### Admin APIs
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET   | `/api/admin/stats` | Dashboard statistics |
| GET   | `/api/admin/visits` | List all visits (filterable) |
| PATCH | `/api/admin/visits/{id}/approve` | Approve a visit |
| PATCH | `/api/admin/visits/{id}/reject` | Reject a visit |
| GET   | `/api/admin/history` | Visit history (filterable) |

### Security APIs
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET   | `/api/security/today` | Today's visitors |
| GET   | `/api/security/verify/{pass_id}` | Verify a visitor pass |
| PATCH | `/api/security/{visit_id}/check-in` | Check visitor in |
| PATCH | `/api/security/{visit_id}/check-out` | Check visitor out |

---

## ⚙ Environment Variables

### Backend (`backend/.env`)
```env
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_KEY=your-supabase-anon-or-service-role-key
```

### Frontend (`frontend/.env.local`)
```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

---

## 🚀 Setup & Run

### Step 1: Supabase Database Setup
1. Go to [supabase.com](https://supabase.com) and create a new project
2. Open **SQL Editor** in your Supabase dashboard
3. Run `database/schema.sql` to create the tables
4. Run `database/seed.sql` to insert demo data
5. Copy your **Project URL** and **API Key** from Project Settings → API

### Step 2: Backend Setup
```bash
cd backend

# Create virtual environment
python -m venv venv

# Activate (Windows)
venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Create .env file
copy .env.example .env
# Then fill in your SUPABASE_URL and SUPABASE_KEY

# Run the server
uvicorn app.main:app --reload
```

The API will be available at: http://localhost:8000  
Interactive docs: http://localhost:8000/docs

### Step 3: Frontend Setup
```bash
cd frontend

# Install dependencies
npm install

# Run the dev server
npm run dev
```

The frontend will be available at: http://localhost:3000

---

## 🎬 Demo Workflow

Follow these steps for your project presentation:

1. **Open** `http://localhost:3000` — see the landing page with 3 role options
2. **Click Visitor** → Fill the registration form and submit
3. **Note** the Pass ID shown after submission
4. **Open Admin** dashboard → See the new `PENDING` request
5. **Click Approve** → Status changes to `APPROVED`
6. **Click "View My Pass"** → See the digital pass with QR code
7. **Open Security** console → Enter the Pass ID → Click "CHECK IN"
8. **See** visitor appears in "Today's Visitors" as `CHECKED_IN`
9. **Click Check Out** → Status becomes `COMPLETED`
10. **Open Admin History** → See the completed visit record

---

## 📊 Demo Data Pass IDs

After running `seed.sql`, use these pass IDs in the Security Console:

| Pass ID | Status | Visitor |
|---------|--------|---------|
| VISIT-2026-DEMO01 | PENDING | Rahul Kumar |
| VISIT-2026-DEMO02 | PENDING | Priya Sharma |
| VISIT-2026-DEMO03 | APPROVED ✓ | Suresh Nair |
| VISIT-2026-DEMO04 | APPROVED ✓ | Anita Desai |
| VISIT-2026-DEMO05 | CHECKED_IN | Mohammed Farhan |
| VISIT-2026-DEMO06 | COMPLETED | Rahul Kumar |
| VISIT-2026-DEMO07 | COMPLETED | Anita Desai |

Use `VISIT-2026-DEMO03` or `VISIT-2026-DEMO04` to demonstrate the check-in flow.

---

## 👥 Project Details

- **Type:** MCA Mini Project
- **Category:** Web Application Development
- **Domain:** Campus Management / Administrative Systems
