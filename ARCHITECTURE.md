# Production Membership ID & QR Code System - Architecture Diagram

## System Architecture Overview

```
┌──────────────────────────────────────────────────────────────────────────┐
│                         NUKAFS Registry Frontend                          │
│                      (Next.js 16 + React 19 + TypeScript)                 │
└──────────────────────────────────────────────────────────────────────────┘
                                      │
                    ┌─────────────────┼─────────────────┐
                    │                 │                 │
                    ▼                 ▼                 ▼
         ┌──────────────────┐ ┌──────────────────┐ ┌──────────────────┐
         │ User Pages       │ │ Super Admin      │ │ Public Pages     │
         ├──────────────────┤ ├──────────────────┤ ├──────────────────┤
         │ • Registration   │ │ • Profile Editor │ │ • Verification   │
         │ • Profile View   │ │ • Direct Edit    │ │ • Member Details │
         │ • Verification   │ │ • Photo Upload   │ │ • QR Scan        │
         │ • Digital ID     │ │ • Sync Preview   │ │ • Public Info    │
         └──────────────────┘ └──────────────────┘ └──────────────────┘
                    │                 │                 │
                    └─────────────────┼─────────────────┘
                                      │
                        ┌─────────────▼─────────────┐
                        │  API Layer (Next.js)      │
                        ├───────────────────────────┤
                        │ /api/membership-id        │
                        │ /api/profile-photo-upload │
                        │ /api/super-admin/profile  │
                        │ /api/member-details       │
                        └─────────────▲─────────────┘
                                      │
                ┌─────────────────────┼─────────────────────┐
                │                     │                     │
                ▼                     ▼                     ▼
        ┌───────────────────┐ ┌────────────────┐ ┌──────────────────┐
        │  Core Modules     │ │  Supabase      │ │  Storage         │
        ├───────────────────┤ ├────────────────┤ ├──────────────────┤
        │ • ID Generation   │ │ • Auth         │ │ • Cloud Storage  │
        │ • Token Creation  │ │ • Database     │ │ • Signed URLs    │
        │ • QR Code Data    │ │ • Real-time    │ │ • File Buckets   │
        │ • Validation      │ │ • Vectors      │ │ • RLS Policies   │
        └───────────────────┘ └────────────────┘ └──────────────────┘
                                      │
                        ┌─────────────▼─────────────┐
                        │   Supabase Backend        │
                        ├───────────────────────────┤
                        │ PostgreSQL Database:      │
                        │ • users                   │
                        │ • membership_identities   │
                        │ • system_config           │
                        │ • audit_logs              │
                        │ • profile_updates         │
                        │                           │
                        │ Cloud Storage:            │
                        │ • profile-photos          │
                        │ • student-documents       │
                        │ • stakeholder-documents   │
                        │ • certificates            │
                        │ • resumes-cv              │
                        └───────────────────────────┘
```

---

## Data Flow: Membership ID Assignment

```
┌──────────────────────┐
│  User Registration   │
└──────────┬───────────┘
           │
           ▼
┌──────────────────────┐
│ Executive Reviews    │
│ & Approves Account   │
└──────────┬───────────┘
           │
           ▼
┌──────────────────────────────────────┐
│ POST /api/membership-id              │
├──────────────────────────────────────┤
│ 1. Get next counter from system_config│
│    student_membership_counter.next=1 │
│                                       │
│ 2. Increment counter (atomic)        │
│    student_membership_counter.next=2 │
│                                       │
│ 3. Generate membership ID            │
│    NUKAFS-000001                     │
│                                       │
│ 4. Generate verification token       │
│    abc123def456... (64-char hex)     │
│                                       │
│ 5. Create QR code data               │
│    https://.../verify/abc123def456...│
│                                       │
│ 6. Store in membership_identities    │
│    (permanent, never changes)        │
│                                       │
│ 7. Update users.membership_number    │
│    to NUKAFS-000001                  │
│                                       │
│ 8. Return identity to frontend       │
└──────────┬───────────────────────────┘
           │
           ▼
┌──────────────────────┐
│ Digital ID Card      │
│ Generated & Printed  │
│ Shows NUKAFS-000001  │
│ Shows QR Code        │
└──────────┬───────────┘
           │
           ▼
┌──────────────────────┐
│ PERMANENT IDENTITY   │
│ Never regenerated    │
│ Never reassigned     │
│ Never duplicated     │
└──────────────────────┘
```

---

## Data Flow: Profile Photo Upload

```
┌──────────────────────┐
│ Super Admin Opens    │
│ Profile Editor       │
└──────────┬───────────┘
           │
           ▼
┌──────────────────────┐
│ User Selects Photo   │
│ (JPEG/PNG/WebP)      │
│ Max 5MB              │
└──────────┬───────────┘
           │
           ▼
┌──────────────────────────────────────┐
│ POST /api/profile-photo-upload       │
├──────────────────────────────────────┤
│ 1. Validate MIME type                │
│    ✓ image/jpeg, image/png, image/webp
│                                       │
│ 2. Validate file size                │
│    ✓ Max 5MB                         │
│                                       │
│ 3. Upload to Supabase Storage        │
│    Bucket: profile-photos            │
│    Path: {userId}/{timestamp}-...    │
│                                       │
│ 4. Generate signed URL (7-day expiry)│
│    https://storage.../...?token=...  │
│                                       │
│ 5. Update users.profile_photo field  │
│    Stores storage path               │
│                                       │
│ 6. Return signed URL to frontend     │
└──────────┬───────────────────────────┘
           │
           ▼
┌──────────────────────┐
│ Photo Preview        │
│ Shown on Profile     │
└──────────┬───────────┘
           │
           ▼
┌──────────────────────────────────────┐
│ Auto-Sync Across System              │
├──────────────────────────────────────┤
│ • Profile pages (all portals)        │
│ • User menu / avatar                 │
│ • Digital ID card                    │
│ • Verification page (public)         │
│ • Member directory                   │
│ • Reports & dashboards               │
│ • Audit logs (where applicable)      │
└──────────────────────────────────────┘
```

---

## Data Flow: QR Code Verification

```
┌──────────────────────┐
│ User Scans QR Code   │
│ On Digital ID Card   │
└──────────┬───────────┘
           │
           ▼
┌──────────────────────────────────────┐
│ Browser Opens:                       │
│ /verify/{verification_token}         │
│ (64-character hex token)             │
└──────────┬───────────────────────────┘
           │
           ▼
┌──────────────────────────────────────┐
│ GET /api/membership-id               │
│ ?action=verify-token                 │
│ &token={token}                       │
├──────────────────────────────────────┤
│ 1. Validate token format (64-hex)    │
│                                       │
│ 2. Look up in membership_identities  │
│    WHERE verification_token = token  │
│                                       │
│ 3. Return membership_id              │
│    (NUKAFS-000001)                   │
│                                       │
│ 4. Return success + metadata         │
└──────────┬───────────────────────────┘
           │
           ▼
┌──────────────────────────────────────┐
│ GET /api/member-details              │
│ ?membershipId=NUKAFS-000001          │
├──────────────────────────────────────┤
│ 1. Look up user by membership_id     │
│    SELECT * FROM users               │
│    WHERE membership_number = ...     │
│                                       │
│ 2. Get profile photo path            │
│    users.profile_photo               │
│                                       │
│ 3. Generate signed URL (7-day)       │
│    via Supabase Storage              │
│                                       │
│ 4. Return public member data:        │
│    • Name                            │
│    • Membership ID                   │
│    • Profile photo (signed URL)      │
│    • University/Department           │
│    • Skills                          │
│    • Verification status             │
│    • Created date                    │
└──────────┬───────────────────────────┘
           │
           ▼
┌──────────────────────────────────────┐
│ Verification Page Displays:          │
├──────────────────────────────────────┤
│ ┌──────────────────────────────────┐ │
│ │ MEMBERSHIP VERIFIED              │ │
│ │ ✓ Verified                       │ │
│ │                                  │ │
│ │ [Profile Photo]  Name            │ │
│ │                  NUKAFS-000001   │ │
│ │                                  │ │
│ │ University: Fourah Bay College   │ │
│ │ Department: Electrical Eng.      │ │
│ │ Level: Year 4                    │ │
│ │ Skills: Software Development     │ │
│ │                                  │ │
│ │ Verified: 28 JUN 2026           │ │
│ └──────────────────────────────────┘ │
└──────────────────────────────────────┘
```

---

## Data Flow: Super Admin Profile Edit

```
┌──────────────────────┐
│ Super Admin (Samuel) │
│ Visits Profile Page  │
└──────────┬───────────┘
           │
           ▼
┌──────────────────────┐
│ Click Edit Profile   │
│ Loads Editor         │
└──────────┬───────────┘
           │
           ▼
┌──────────────────────────────────────┐
│ Super Admin Profile Editor UI        │
├──────────────────────────────────────┤
│ [Upload Photo]                       │
│ - Full Name: ____________________    │
│ - Email: ____________________        │
│ - Phone: ____________________        │
│ - University: ____________________   │
│ - Department: ____________________   │
│ - Course: ____________________       │
│ - Skills: ____________________       │
│ - ... [all editable fields]          │
│                                       │
│ [PERMANENT FIELDS - READ ONLY]       │
│ Membership ID: NUKAFS-000001         │
│ QR Code: Active                      │
│ Registration: 28 JUN 2026            │
│ Approval: 28 JUN 2026                │
│                                       │
│                  [SAVE]  [CANCEL]    │
└──────────┬───────────────────────────┘
           │
           ▼
    [Click SAVE]
           │
           ├─────────────────────────────────┐
           │                                 │
           ▼                                 ▼
┌────────────────────────┐  ┌──────────────────────┐
│ Upload Photo (if new)  │  │ PUT /api/super-admin │
│                        │  │ /profile             │
│ POST /api/profile-     │  │                      │
│ photo-upload           │  │ Body:                │
│                        │  │ {                    │
│ To Supabase Storage:   │  │   userId,            │
│ profile-photos bucket  │  │   profile: {         │
│ Path: {userId}/...     │  │     fullName,        │
│                        │  │     email,           │
│ Returns:               │  │     phone,           │
│ • URL (signed)         │  │     university,      │
│ • Path (storage)       │  │     ... all fields   │
│                        │  │   }                  │
│ Updates DB:            │  │ }                    │
│ users.profile_photo    │  │                      │
│                        │  │ Actions:             │
│                        │  │ 1. Validate role    │
│                        │  │    (super_admin)    │
│                        │  │                      │
│                        │  │ 2. Update user      │
│                        │  │    record           │
│                        │  │                      │
│                        │  │ 3. Create audit log │
│                        │  │                      │
│                        │  │ 4. Return success   │
└────────┬───────────────┘  └──────────┬───────────┘
         │                             │
         └────────────┬────────────────┘
                      │
                      ▼
         ┌──────────────────────────────┐
         │  Auto-Sync Across System     │
         ├──────────────────────────────┤
         │ Updated profile syncs to:    │
         │ • Admin Profile Pages        │
         │ • Executive Profile Pages    │
         │ • Stakeholder Profile Pages  │
         │ • Top Navigation / Avatar    │
         │ • Digital ID Card            │
         │ • Verification Page (public) │
         │ • Member Directory           │
         │ • Dashboard Cards            │
         │ • Reports                    │
         │ • Search Results             │
         │                              │
         │ (All show updated photo      │
         │  & profile information)      │
         └──────────────────────────────┘
```

---

## Database Schema Relationships

```
┌────────────────────────────────────┐
│           auth.users               │
│   (Supabase Auth - Built-in)       │
├────────────────────────────────────┤
│ • id (PK)                          │
│ • email (UNIQUE)                   │
│ • metadata { role, ... }           │
└────────────────┬────────────────────┘
                 │ 1:1
                 │ (one user = one identity)
                 │
                 ▼
┌────────────────────────────────────┐
│          users (custom)            │
│    (Extended profile information)   │
├────────────────────────────────────┤
│ • id (FK → auth.users)             │
│ • full_name                        │
│ • email                            │
│ • phone                            │
│ • membership_number (UNIQUE)       │──┐
│   (e.g., "NUKAFS-000001")          │  │
│ • profile_photo (storage path)     │  │
│ • university                       │  │
│ • department                       │  │
│ • course                           │  │
│ • level                            │  │
│ • skills (array)                   │  │
│ • qr_code                          │  │
│ • role ("super_admin", "student",) │  │
│ • status ("active", "pending", ...) │ │
│ • created_at, updated_at           │  │
└────────────────────────────────────┘  │
                 │                      │
                 │ 1:1                  │
                 │ (one identity        │
                 │  per user)           │
                 │                      │
                 ▼                      │
┌────────────────────────────────────┐ │
│     membership_identities          │ │
│   (Permanent digital identity)     │ │
├────────────────────────────────────┤ │
│ • id (PK)                          │ │
│ • user_id (FK → auth.users)        │ │
│ • membership_id (UNIQUE) ◄─────────┤─┘
│   (e.g., "NUKAFS-000001")          │   (linked to users table)
│ • membership_type                  │
│   ("student" | "stakeholder")      │
│ • verification_token (UNIQUE)      │
│   (64-char hex - never changes)    │
│ • verification_url                 │
│   (https://.../verify/{token})     │
│ • qr_code_data (same as URL)       │
│ • qr_code_status                   │
│   ("active"|"suspended"|"revoked") │
│ • created_at (IMMUTABLE)           │
│ • updated_at                       │
│                                    │
│ INDEXES:                           │
│ • user_id                          │
│ • membership_id                    │
│ • verification_token               │
└────────────────────────────────────┘

         ┌──────────────────────────────┐
         │      system_config           │
         │  (Sequential ID Counters)    │
         ├──────────────────────────────┤
         │ • id (PK)                    │
         │ • key (UNIQUE)               │
         │   "student_membership_..."   │
         │   "stakeholder_membership..."│
         │ • value (JSONB)              │
         │   {"next": 2}                │
         │ • created_at, updated_at     │
         │                              │
         │ USAGE:                       │
         │ • Stores next available ID   │
         │ • Atomic increment on use    │
         │ • Never decrements or resets │
         └──────────────────────────────┘

         ┌──────────────────────────────┐
         │      audit_logs              │
         │  (Change tracking)           │
         ├──────────────────────────────┤
         │ • id (PK)                    │
         │ • actor_id (FK → users)      │
         │ • actor_name                 │
         │ • action                     │
         │   "bootstrapped membership.."│
         │   "approved registration"    │
         │ • target (membership_id, etc)│
         │ • type ("system", "update")  │
         │ • module ("Membership")      │
         │ • timestamp                  │
         └──────────────────────────────┘
```

---

## Cloud Storage Structure

```
Supabase Storage Buckets
├── profile-photos/
│   ├── {user-id-1}/
│   │   ├── 1719604800000-profile.jpg
│   │   └── 1719604900000-profile.jpg  (old version)
│   ├── {user-id-2}/
│   │   └── 1719604900000-profile.png
│   └── ...
│
├── student-documents/
│   ├── {user-id-1}/
│   │   ├── certificate.pdf
│   │   └── transcript.pdf
│   └── ...
│
├── stakeholder-documents/
│   ├── {org-rep-1}/
│   │   └── registration.pdf
│   └── ...
│
├── certificates/
│   ├── {user-id-1}/
│   │   ├── nukafs-cert-2024.pdf
│   │   └── excellence-award.pdf
│   └── ...
│
└── resumes-cv/
    ├── {user-id-1}/
    │   ├── CV-2024.pdf
    │   └── CV-2025.pdf
    └── ...

File Paths:
{bucket}/{user-id}/{timestamp}-{filename}

Example:
profile-photos/uuid-001/1719604800000-profile.jpg

Signed URLs (7-day expiry):
https://storage.googleapis.com/...?token=xyz&expires=123

RLS (Row Level Security):
- Users can only read/write their own files
- Signed URLs provide temporary public access
- No internal DB IDs exposed in URLs
```

---

## API Endpoint Summary

```
┌─────────────────────────────────────────────────────────────────────┐
│                         API Endpoints                               │
├──────────────────────┬──────────────────────────────────────────────┤
│ Endpoint             │ Purpose                                      │
├──────────────────────┼──────────────────────────────────────────────┤
│                      │                                              │
│ POST /api/           │ Allocate new membership ID when user         │
│ membership-id        │ is approved for membership. Called once.     │
│ (POST)               │ Returns: membership_id, token, qr_code      │
│                      │ Requires: userId, membershipType            │
│                      │ Authentication: Service Role                │
│                      │                                              │
│ GET /api/            │ Verify membership token exists in database   │
│ membership-id        │ Returns: valid, membershipId, createdAt     │
│ ?action=verify-token │ Used by: Verification page                 │
│ &token={token}       │ Authentication: Public (read-only)         │
│                      │                                              │
│ GET /api/            │ Get next available sequence number without   │
│ membership-id        │ incrementing counter. For UI preview.       │
│ ?action=get-next     │ Returns: nextSequence, nextId               │
│ &type=student        │ Authentication: Authenticated users         │
│                      │                                              │
│ POST /api/profile-   │ Upload profile photo to Supabase Storage    │
│ photo-upload         │ Returns: signed_url, path                   │
│ (POST)               │ Content: FormData { file }                  │
│                      │ Authentication: User must be authenticated  │
│                      │ Validates: Type, size                       │
│                      │                                              │
│ GET /api/profile-    │ Get signed URL for existing profile photo   │
│ photo-upload         │ Returns: url, path                          │
│ ?userId={id}         │ Authentication: Public (signed URL only)   │
│                      │                                              │
│ GET /api/member-     │ Get public member info by membership ID     │
│ details              │ Returns: name, university, photo, skills    │
│ ?membershipId=...    │ Used by: Verification page                 │
│                      │ Authentication: Public (read-only)         │
│                      │                                              │
│ PUT /api/super-admin │ Super Admin directly updates their profile  │
│ /profile             │ No approval workflow needed                 │
│ (PUT)                │ Updates: All editable fields, photo         │
│                      │ Body: { userId, profile: {...} }           │
│                      │ Authentication: Super admin role only       │
│                      │ Actions: Updates DB, creates audit log      │
│                      │                                              │
└──────────────────────┴──────────────────────────────────────────────┘
```

---

## Deployment Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Production Environment                   │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │         Next.js Frontend (Vercel)                   │   │
│  │ ┌──────────────────────────────────────────────┐    │   │
│  │ │ • /app pages (registration, profiles, etc.)  │    │   │
│  │ │ • /api routes (membership, profile, etc.)   │    │   │
│  │ │ • Components (editor, verification, etc.)   │    │   │
│  │ │ • Client-side state management              │    │   │
│  │ └──────────────────────────────────────────────┘    │   │
│  └──────────────┬────────────────────────────────────────┘   │
│                 │ HTTPS                                      │
│                 ▼                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │           Supabase Backend                          │   │
│  │ ┌──────────────────────────────────────────────┐    │   │
│  │ │ PostgreSQL Database                          │    │   │
│  │ │ • users                                      │    │   │
│  │ │ • membership_identities                      │    │   │
│  │ │ • system_config                              │    │   │
│  │ │ • audit_logs                                 │    │   │
│  │ │ • ... other tables                           │    │   │
│  │ │                                               │    │   │
│  │ │ Real-time Subscriptions (WebSocket)          │    │   │
│  │ │ • Profile updates                            │    │   │
│  │ │ • Status changes                             │    │   │
│  │ │ • Notifications                              │    │   │
│  │ └──────────────────────────────────────────────┘    │   │
│  │ ┌──────────────────────────────────────────────┐    │   │
│  │ │ Cloud Storage (S3-compatible)                │    │   │
│  │ │ • profile-photos/                            │    │   │
│  │ │ • student-documents/                         │    │   │
│  │ │ • stakeholder-documents/                     │    │   │
│  │ │ • certificates/                              │    │   │
│  │ │ • resumes-cv/                                │    │   │
│  │ │                                               │    │   │
│  │ │ Signed URLs (temporary access)               │    │   │
│  │ └──────────────────────────────────────────────┘    │   │
│  │ ┌──────────────────────────────────────────────┐    │   │
│  │ │ Auth (JWT-based)                             │    │   │
│  │ │ • User sessions                              │    │   │
│  │ │ • Role verification                          │    │   │
│  │ │ • RLS policies                               │    │   │
│  │ └──────────────────────────────────────────────┘    │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## System State Transitions

```
User State Progression
═════════════════════

┌─────────────┐
│  No Account │
└──────┬──────┘
       │ Register
       ▼
┌─────────────────┐
│  Registration   │
│  Pending        │
└──────┬──────────┘
       │ Executive Approves
       ▼
┌──────────────────────────┐
│  Account Approved        │
│  Membership ID NOT YET   │
│  (waiting for allocation)│
└──────┬───────────────────┘
       │ System Auto-allocates
       │ POST /api/membership-id
       ▼
┌──────────────────────────┐
│  MEMBERSHIP ACTIVE       │
│  ✓ NUKAFS-000001        │
│  ✓ Verification Token    │
│  ✓ QR Code Active        │
│  ✓ Digital ID Card       │
└──────┬───────────────────┘
       │ Profile can be
       │ scanned, verified,
       │ shared forever
       │
       ├─ Promotion
       │  (Role changes)
       │
       ├─ Profile Updates
       │  (Field changes)
       │
       └─ ... other actions
          (ALL preserve identity)
```

---

*Architecture diagram v1.0 - Complete system layout*
