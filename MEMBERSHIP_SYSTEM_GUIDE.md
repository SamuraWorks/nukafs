/**
 * Implementation Guide: Production Membership ID & QR Code System
 * 
 * This document outlines the complete production-ready system for managing
 * permanent membership identities across NUKaFs Registry.
 */

# Membership ID & QR Code System - Implementation Guide

## Overview

This system implements a permanent digital identity system for NUKaFs members:
- **Students & Graduates**: Sequential IDs (NUKaFs-000001, NUKaFs-000002, etc.)
- **Stakeholders**: Separate sequential IDs (STK-000001, STK-000002, etc.)
- **Permanent Identities**: Never regenerated, never reassigned, never duplicated
- **Secure QR Codes**: Encode verification tokens, not membership IDs

---

## Core Components

### 1. **Membership ID Generation** (`lib/membership-id-system.ts`)

Production-ready functions for:
- `generateMembershipId(sequence)` → "NUKaFs-000001"
- `generateStakeholderId(sequence)` → "STK-000001"
- `generateVerificationToken()` → 64-character hex token
- `generateQrCodeData(token)` → Verification URL
- `createMembershipIdentity()` → Complete identity object

### 2. **API Endpoints**

#### `/api/membership-id` (POST)
- Allocates next sequential ID when user is approved
- Creates permanent identity record
- Stores verification token & QR code
- Called ONCE per user, never again
- Returns membership ID, verification token, QR code data

#### `/api/profile-photo-upload` (POST/GET)
- Uploads profile photos to Supabase Storage
- Returns signed URLs (valid 7 days)
- Syncs to database
- Supports: JPEG, PNG, WebP (max 5MB)

#### `/api/super-admin/profile` (PUT)
- Super Admin direct profile editing (no approval needed)
- Updates all profile fields except permanent ones
- Immediately syncs across system
- Creates audit log entry

#### `/api/member-details` (GET)
- Retrieves public verified member information
- Used by verification page
- Returns profile info with signed photo URL

### 3. **Storage Configuration** (`lib/supabase/storage-config.ts`)

Manages cloud storage buckets with RLS:
- `profile-photos` - User profile pictures
- `student-documents` - Academic certificates, etc.
- `stakeholder-documents` - Org documents
- `certificates` - Digital certificates
- `resumes-cv` - CV/Resume files

All files:
- Stored with user-specific paths
- Accessed via signed URLs (7-day expiry)
- Protected by RLS (users only access own files)

### 4. **Database Tables**

#### `membership_identities`
```sql
CREATE TABLE membership_identities (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  membership_id TEXT UNIQUE,           -- "NUKaFs-000001"
  membership_type TEXT,                 -- "student" or "stakeholder"
  verification_token TEXT UNIQUE,       -- 64-char hex
  verification_url TEXT,                -- https://.../ verify/{token}
  qr_code_data TEXT,                    -- QR code content (URL)
  qr_code_status TEXT,                  -- "active", "suspended", "revoked"
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
);
```

#### `system_config`
```sql
CREATE TABLE system_config (
  id UUID PRIMARY KEY,
  key TEXT UNIQUE,                      -- "student_membership_counter"
  value JSONB,                          -- {"next": 1}
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
);
```

#### Users table updates
```sql
ALTER TABLE users ADD COLUMN
  profile_photo TEXT,                   -- Path to file in storage
  membership_sequence INTEGER,          -- Used to generate ID
  permanent_qr_code TEXT;               -- Never regenerated
```

---

## Workflow

### User Registration → Approval → Membership ID Assignment

```
1. User registers (no ID yet)
   ↓
2. Executive/Admin approves application
   ↓
3. System calls POST /api/membership-id
   ├─ Gets next available sequence from system_config
   ├─ Increments counter atomically
   ├─ Generates membership ID (NUKaFs-000001, etc.)
   ├─ Generates cryptographic verification token
   ├─ Creates QR code data (verification URL)
   ├─ Stores all in membership_identities table
   └─ Updates users table with membership_id
   ↓
4. User receives Digital ID Card with QR code
   ├─ Displays Membership ID: NUKaFs-000001
   ├─ Shows QR code
   └─ Links to verification page
   ↓
5. Identity is PERMANENT and IMMUTABLE
   ├─ Never regenerated on profile updates
   ├─ Never regenerated on promotions
   ├─ Never regenerated on role changes
   └─ Never reassigned or duplicated
```

### Super Admin Profile Updates (Direct Editing)

```
Samuel Samura (Super Admin) clicks "Edit Profile"
   ↓
Use SuperAdminProfileEditor component
   ├─ Upload new profile photo
   ├─ Edit all non-permanent fields
   └─ Click Save
   ↓
PUT /api/super-admin/profile
   ├─ Upload photo to storage
   ├─ Update user record
   ├─ Create audit log
   └─ Return success
   ↓
System automatically syncs across all pages
   ├─ Profile pages
   ├─ Dashboard
   ├─ User menu
   ├─ Digital ID card
   ├─ Member directory
   ├─ Reports
   └─ Verification page
```

### QR Code Verification

```
1. User/Admin scans QR code on Digital ID Card
   ↓
2. Browser opens: https://registry.nukafs-sl.org/verify/{token}
   ↓
3. Page calls GET /api/membership-id?action=verify-token&token={token}
   ├─ Looks up membership_identities by verification_token
   ├─ Returns membership_id and user info
   └─ Returns success if found
   ↓
4. Page calls GET /api/member-details?membershipId=NUKaFs-000001
   ├─ Retrieves public member info
   ├─ Gets signed photo URL
   └─ Displays verified profile
   ↓
5. Verification page shows:
   ├─ Profile photo
   ├─ Full name
   ├─ Membership ID
   ├─ Academic/professional info
   ├─ Skills
   ├─ Verification badge
   └─ "Verified" timestamp
```

---

## Samuel Samura: First Member (NUKaFs-000001)

### Setup Process

1. **Create Super Admin Account**
   - Email: samuel540wisesamura@gmail.com
   - Role: super_admin
   - Membership Type: student (permanent)

2. **Bootstrap Script**
   ```bash
   node scripts/bootstrap-membership-system.mjs
   ```
   - Finds Samuel's account
   - Assigns NUKaFs-000001
   - Sets student_membership_counter to 2
   - Creates audit log
   - Outputs verification details

3. **Upload Profile Photo**
   - Visit Super Admin profile editor
   - Upload the provided profile photo
   - Changes take effect immediately

4. **Test QR Code**
   - Generate QR code from verification URL
   - Scan and verify membership page displays correctly

### Permanent System Identity

```
Membership ID:        NUKaFs-000001  (PERMANENT)
Membership Type:      Student        (PERMANENT)
System Role:          Super Admin    (CAN CHANGE)
Verification Token:   [64-char hex]  (PERMANENT)
QR Code:              /verify/...    (PERMANENT)
Created:              2026-06-28     (PERMANENT)

Profile Fields (EDITABLE):
- Profile Photo
- Full Name: Samuel Samura
- Email: samuel540wisesamura@gmail.com
- Phone: +23279630777
- University: Fourah Bay College
- Faculty: Engineering
- Department: Electrical and Electronics Engineering
- Course: Electrical and Electronics Engineering
- Level: Year 4
- Skills: Software Development
```

---

## Promotion Workflow

### When Samuel is promoted to Executive/Admin/Super Admin

```
Student with NUKaFs-000001 (Super Admin wants to add "Executive" role)
   ↓
UPDATE users SET role = 'super_admin' WHERE id = samuel.id
   ↓
Identity UNCHANGED:
   ✓ Membership ID: NUKaFs-000001 (unchanged)
   ✓ QR Code: /verify/... (unchanged)
   ✓ Digital ID Card: /verify/... (unchanged)
   ✓ Profile: /verify/... (unchanged)
   ✓ Membership History: (unchanged)
   ✓ Audit History: (unchanged)
   ✓ Account: (unchanged)
   
ONLY CHANGED:
   ✓ System Role: Now appears as "Super Admin" everywhere
   ✓ Permissions: Elevated access
   ✓ Portal Access: Can access /admin, /executive
   ✓ Role label on ID Card: "Super Admin" (now displayed)
```

---

## Future Members

### Next Student (NUKaFs-000002)

When second student is approved:

```
System retrieves counter: student_membership_counter.next = 2
   ↓
Generate ID: NUKaFs-000002
Generate token & QR code
Create identity record
Increment counter to 3
```

Result: NUKaFs-000002, NUKaFs-000003, etc. (continuous sequence)

### Stakeholder (STK-000001)

When first stakeholder is approved:

```
System retrieves counter: stakeholder_membership_counter.next = 1
   ↓
Generate ID: STK-000001
Generate token & QR code
Create identity record
Increment counter to 2
```

Result: STK-000001, STK-000002, etc. (independent sequence)

---

## Key Guarantees

✅ **Permanent**: Membership IDs never change
✅ **Unique**: No ID ever duplicated or reused
✅ **Immutable**: Cannot be regenerated or reassigned
✅ **Scalable**: Supports 15,000+ users with simple incrementing
✅ **Secure**: QR codes encode tokens, not IDs
✅ **Portable**: Survives promotions and role changes
✅ **Verifiable**: Public verification page works offline
✅ **Auditable**: Every assignment logged with timestamp

---

## Testing Checklist

- [ ] Bootstrap script successfully assigns NUKaFs-000001 to Samuel
- [ ] Profile photo uploads correctly
- [ ] Profile editor syncs across all pages immediately
- [ ] QR code generation produces valid verification URL
- [ ] QR code scanning displays verification page correctly
- [ ] Member details show all profile information
- [ ] Photo signed URLs don't expose internal paths
- [ ] Second user receives NUKaFs-000002
- [ ] Stakeholder receives STK-000001 (independent sequence)
- [ ] Counter never decrements or resets
- [ ] Promotion workflow preserves membership ID
- [ ] Audit logs record all changes
- [ ] RLS prevents unauthorized file access
- [ ] Production database initialized with correct counters

---

## Next Steps

1. Run `scripts/bootstrap-membership-system.mjs` to initialize Samuel
2. Test profile photo upload and synchronization
3. Verify QR code and verification page work
4. Test subsequent user membership ID allocation
5. Deploy to production with real Supabase instance
6. Monitor audit logs for proper operation
7. Update documentation as needed
