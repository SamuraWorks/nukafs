# Production-Grade Storage & Data Architecture

## Overview

The NUKaFs Registry Platform uses a normalized relational database (Supabase PostgreSQL) as the single source of truth, with object storage (Supabase Storage) for large files. The architecture supports growth from hundreds to over 1,000,000 members through:

- **Normalized Schema**: Eliminating data duplication
- **Separation of Concerns**: Member data, files, audit logs in distinct tables
- **Comprehensive Indexing**: Fast queries on frequently filtered fields
- **Row Level Security (RLS)**: Enforced at database layer
- **Audit Logging**: Every action tracked with user, timestamp, and changes
- **Soft Deletes**: Preserve data integrity while supporting user deletions
- **Automatic Timestamps**: created_at, updated_at on every record
- **Foreign Keys**: Maintain referential integrity
- **Constraints & Validation**: Prevent invalid states at database level

---

## Entity Relationship Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                         CORE ENTITIES                            │
└─────────────────────────────────────────────────────────────────┘

┌──────────────┐        ┌──────────────────┐        ┌────────────┐
│   District   │◄───────┤    Chiefdom      │◄───────┤    User    │
│   (11 total) │        │  (Falaba: 13)    │        │  Profiles  │
└──────────────┘        │  (Koinadugu: 11) │        └────────────┘
                        └──────────────────┘              │
                                                          │
                        ┌─────────────────────────────────┘
                        │
        ┌───────────────┴────────────────────┐
        │                                     │
   ┌────▼─────────────┐              ┌──────▼──────────────┐
   │ Registrations    │              │ Membership          │
   │ (Pending)        │              │ Identities          │
   └──────────────────┘              │ (Permanent QR)      │
                                     └──────────────────────┘

┌──────────────────────────────────────────────────────────────────┐
│                    PUBLISHING ENTITIES                            │
└──────────────────────────────────────────────────────────────────┘

        ┌─────────────────────┐
        │    Stakeholder      │
        │    Profiles         │
        └──────────┬──────────┘
                   │
        ┌──────────┴────────────┬──────────────┐
        │                       │              │
   ┌────▼──────────┐   ┌───────▼────────┐  ┌──▼─────────────┐
   │ Opportunities │   │ Announcements  │  │ Opportunity    │
   │ (Scholarships,│   │ (Official News)│  │ Attachments    │
   │  Jobs, etc)  │   └────────────────┘  └────────────────┘
   └──────────────┘

┌──────────────────────────────────────────────────────────────────┐
│                    INFRASTRUCTURE ENTITIES                        │
└──────────────────────────────────────────────────────────────────┘

   ┌──────────────┐   ┌──────────────┐   ┌──────────────┐
   │ Audit Logs   │   │ System Config│   │ File Metadata│
   │ (All Actions)│   │ (Counters)   │   │ (Storage)    │
   └──────────────┘   └──────────────┘   └──────────────┘
```

---

## Core Entities

### 1. **Users** (Auth + Profile Storage)

Primary entity representing registered individuals on the platform.

**Table: `public.users`**

```sql
CREATE TABLE public.users (
  -- Identity & Authorization
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  phone VARCHAR(20) UNIQUE,
  password_hash VARCHAR(255), -- Managed by Supabase Auth
  
  -- Personal Information
  full_name VARCHAR(255) NOT NULL,
  gender VARCHAR(20),
  date_of_birth DATE,
  nationality VARCHAR(100),
  
  -- Geographic Location (Validated Against Chiefdoms)
  district VARCHAR(100) NOT NULL,
  chiefdom VARCHAR(100) NOT NULL,
  town VARCHAR(100),
  home_address TEXT,
  current_address TEXT,
  
  -- Profile Completion & Status
  profile_completion_percentage INTEGER DEFAULT 0 CHECK (profile_completion_percentage >= 0 AND profile_completion_percentage <= 100),
  status VARCHAR(50) DEFAULT 'pending' 
    CHECK (status IN ('pending', 'active_complete', 'active_partial', 'archived', 'deleted')),
  verification_status VARCHAR(50) DEFAULT 'unverified'
    CHECK (verification_status IN ('unverified', 'verified', 'rejected')),
  
  -- Role & Permissions
  role VARCHAR(50) DEFAULT 'student'
    CHECK (role IN ('student', 'executive', 'stakeholder', 'super_admin')),
  
  -- Academic Information (For Students)
  university VARCHAR(255),
  campus VARCHAR(255),
  faculty VARCHAR(255),
  department VARCHAR(255),
  course_name VARCHAR(255),
  academic_level VARCHAR(50), -- 100L, 200L, 300L, 400L, 500L, etc
  student_id VARCHAR(100),
  admission_year INTEGER,
  graduation_year INTEGER,
  expected_graduation_year INTEGER,
  college VARCHAR(255),
  
  -- Professional Information (For Stakeholders & Graduates)
  organization VARCHAR(255),
  occupation VARCHAR(255),
  employment_status VARCHAR(50), -- employed, self-employed, unemployed, student, other
  skills TEXT[], -- Array of skill names
  biography TEXT,
  
  -- Profile Media
  profile_photo_url TEXT, -- Signed URL to profile-photos bucket
  avatar_color VARCHAR(7) DEFAULT '#3B82F6', -- Fallback if no photo
  
  -- Emergency Contact
  emergency_contact JSONB,
  
  -- Administrative Fields
  approval_notes TEXT,
  approved_by UUID REFERENCES public.users(id),
  date_approved TIMESTAMP,
  rejection_reason TEXT,
  
  -- Audit Fields
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
  created_by UUID REFERENCES public.users(id),
  updated_by UUID REFERENCES public.users(id),
  deleted_at TIMESTAMP, -- Soft delete timestamp
  
  -- Metadata
  is_migrated_from_legacy BOOLEAN DEFAULT FALSE,
  legacy_membership_number VARCHAR(100),
  legacy_data_json JSONB -- For storing legacy data if needed
);

-- Indexes for Performance
CREATE INDEX idx_users_email ON public.users(email);
CREATE INDEX idx_users_status ON public.users(status);
CREATE INDEX idx_users_role ON public.users(role);
CREATE INDEX idx_users_district_chiefdom ON public.users(district, chiefdom);
CREATE INDEX idx_users_university_course ON public.users(university, course_name);
CREATE INDEX idx_users_deleted_at ON public.users(deleted_at);
CREATE INDEX idx_users_created_at ON public.users(created_at DESC);
CREATE INDEX idx_users_updated_at ON public.users(updated_at DESC);
CREATE INDEX idx_users_is_migrated ON public.users(is_migrated_from_legacy);

-- GIN index for full-text search on name and other text fields
CREATE INDEX idx_users_full_text ON public.users USING GIN(
  to_tsvector('english', COALESCE(full_name, '') || ' ' || COALESCE(email, ''))
);

-- Unique constraint to prevent duplicate member profiles
CREATE UNIQUE INDEX idx_users_email_not_deleted ON public.users(email) 
WHERE deleted_at IS NULL;
```

**Key Design Decisions:**

1. **No Password Storage**: Managed by Supabase Auth service
2. **No QR Code**: Stored in `membership_identities` table
3. **Profile Completion Percentage**: Calculated from required fields
4. **Status Tracking**: pending → active_complete (full approval)
5. **Soft Deletes**: deleted_at field allows recovery
6. **Audit Trail**: created_by, updated_by, created_at, updated_at
7. **District/Chiefdom**: Stored as VARCHAR for fast filtering (validated at application layer)
8. **Skills as Array**: JSONB array for flexibility
9. **Emergency Contact as JSONB**: Allows nested structure (name, phone, relationship, etc)

---

### 2. **Membership Identities** (Permanent QR Codes)

One-time allocation of membership IDs and QR codes. Created ONLY on first approval, never regenerated.

**Table: `public.membership_identities`**

```sql
CREATE TABLE public.membership_identities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  
  -- Sequential Membership ID (NUKaFs-000001, STK-000001, etc)
  membership_id VARCHAR(50) UNIQUE NOT NULL,
  membership_type VARCHAR(50) DEFAULT 'student'
    CHECK (membership_type IN ('student', 'stakeholder', 'executive')),
  
  -- Permanent Verification Token (Never Regenerated)
  verification_token VARCHAR(100) UNIQUE NOT NULL,
  verification_url TEXT NOT NULL, -- Full URL to verification page
  
  -- QR Code Data
  qr_code_data TEXT NOT NULL, -- Data encoded in QR (verification token)
  qr_code_image_url TEXT, -- Signed URL to QR code PNG file
  
  -- Timestamps
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
  issued_by UUID REFERENCES public.users(id), -- Admin who approved
  
  -- Metadata
  is_active BOOLEAN DEFAULT TRUE, -- Can be deactivated if needed
  deactivated_at TIMESTAMP,
  deactivation_reason TEXT
);

-- Indexes for Performance
CREATE INDEX idx_membership_user_id ON public.membership_identities(user_id);
CREATE INDEX idx_membership_id ON public.membership_identities(membership_id);
CREATE INDEX idx_membership_token ON public.membership_identities(verification_token);
CREATE INDEX idx_membership_created_at ON public.membership_identities(created_at DESC);
CREATE INDEX idx_membership_is_active ON public.membership_identities(is_active);

-- Unique constraint ensures each user gets exactly one membership
CREATE UNIQUE INDEX idx_membership_one_per_user ON public.membership_identities(user_id)
WHERE is_active = TRUE;
```

**Key Design Decisions:**

1. **One Per User**: UNIQUE constraint on user_id
2. **Never Regenerated**: QR codes are permanent and immutable
3. **Verification Token**: Unique, permanent identifier for QR verification
4. **Separation from Users Table**: Keeps core user data clean
5. **Soft Deactivation**: Can deactivate without deleting history
6. **Audit Trail**: issued_by, created_at for approval tracking

---

### 3. **Registrations** (Pending Member Queue)

Tracks new registration applications awaiting approval.

**Table: `public.registrations`**

```sql
CREATE TABLE public.registrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  
  -- Registration Details
  full_name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(20),
  district VARCHAR(100) NOT NULL,
  chiefdom VARCHAR(100) NOT NULL,
  
  -- Status Tracking
  status VARCHAR(50) DEFAULT 'submitted'
    CHECK (status IN ('submitted', 'under_review', 'approved', 'rejected', 'pending_payment')),
  
  -- Approval Workflow
  reviewed_by UUID REFERENCES public.users(id),
  reviewed_at TIMESTAMP,
  reviewed_notes TEXT,
  
  -- Rejection
  rejection_reason TEXT,
  rejected_at TIMESTAMP,
  
  -- Approval
  approved_by UUID REFERENCES public.users(id),
  approved_at TIMESTAMP,
  approval_notes TEXT,
  
  -- Audit Fields
  submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
  deleted_at TIMESTAMP -- Soft delete
);

-- Indexes for Performance
CREATE INDEX idx_registrations_status ON public.registrations(status);
CREATE INDEX idx_registrations_email ON public.registrations(email);
CREATE INDEX idx_registrations_submitted_at ON public.registrations(submitted_at DESC);
CREATE INDEX idx_registrations_approved_at ON public.registrations(approved_at DESC);
CREATE INDEX idx_registrations_deleted_at ON public.registrations(deleted_at);
```

**Key Design Decisions:**

1. **Separate Queue**: Keeps pending registrations isolated from active users
2. **Status Workflow**: submitted → under_review → approved/rejected
3. **Audit Trail**: tracked through reviewed_by/approved_by/rejected_at
4. **Soft Deletes**: Can remove registrations without data loss
5. **De-normalized Fields**: Stores submission info even if user profile changes

---

### 4. **Districts & Chiefdoms**

Official administrative divisions (post-2017 structure).

**Table: `public.districts`**

```sql
CREATE TABLE public.districts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) UNIQUE NOT NULL,
  code VARCHAR(10) UNIQUE NOT NULL,
  population_estimate INTEGER,
  status VARCHAR(50) DEFAULT 'active'
    CHECK (status IN ('active', 'inactive', 'archived')),
  description TEXT,
  
  -- Audit Fields
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- Indexes
CREATE INDEX idx_districts_name ON public.districts(name);
CREATE INDEX idx_districts_code ON public.districts(code);
CREATE INDEX idx_districts_status ON public.districts(status);

-- Insert official districts
INSERT INTO public.districts (name, code) VALUES 
  ('Koinadugu', 'KDU'),
  ('Falaba', 'FLB')
ON CONFLICT (name) DO NOTHING;
```

**Table: `public.chiefdoms`**

```sql
CREATE TABLE public.chiefdoms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  district_id UUID NOT NULL REFERENCES public.districts(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  code VARCHAR(10),
  population_estimate INTEGER,
  status VARCHAR(50) DEFAULT 'active'
    CHECK (status IN ('active', 'inactive', 'archived')),
  
  -- Audit Fields
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
  
  -- Unique constraint on name per district
  UNIQUE(district_id, name)
);

-- Indexes
CREATE INDEX idx_chiefdoms_district_id ON public.chiefdoms(district_id);
CREATE INDEX idx_chiefdoms_name ON public.chiefdoms(name);
CREATE INDEX idx_chiefdoms_status ON public.chiefdoms(status);

-- Insert official chiefdoms
INSERT INTO public.chiefdoms (district_id, name, code) 
SELECT d.id, c.name, c.code 
FROM (
  VALUES 
    ('Koinadugu', 'Diang', 'DNG'),
    ('Koinadugu', 'Gbonkobon Kayaka', 'GBK'),
    ('Koinadugu', 'Kalian', 'KLN'),
    -- ... (all 11 Koinadugu chiefdoms)
    ('Falaba', 'Dembelia Sikunia', 'DMS'),
    ('Falaba', 'Dembelia-Musaia', 'DEM'),
    -- ... (all 13 Falaba chiefdoms)
) AS c(district_name, name, code)
JOIN public.districts d ON d.name = c.district_name
ON CONFLICT DO NOTHING;
```

**Key Design Decisions:**

1. **Referential Integrity**: Chiefdoms linked to districts via FK
2. **Official Data**: Insert at schema setup time
3. **Unique Constraint**: Name unique per district
4. **Status Field**: Mark as inactive without deleting
5. **Code Field**: Short codes for APIs/exports

---

## Publishing Entities

### 5. **Stakeholder Profiles** (Publishers)

Extended profile for stakeholders who can publish opportunities and announcements.

**Table: `public.stakeholder_profiles`**

```sql
CREATE TABLE public.stakeholder_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  
  -- Organization Information
  organization_name VARCHAR(255) NOT NULL,
  organization_website TEXT,
  organization_description TEXT,
  registration_number VARCHAR(100),
  
  -- Contact Details
  primary_contact_name VARCHAR(255),
  primary_contact_email VARCHAR(255),
  primary_contact_phone VARCHAR(20),
  
  -- Verification & Approval
  is_verified BOOLEAN DEFAULT FALSE,
  is_approved_for_publishing BOOLEAN DEFAULT FALSE,
  verification_date TIMESTAMP,
  approval_date TIMESTAMP,
  approved_by UUID REFERENCES public.users(id),
  
  -- Logo & Media
  organization_logo_url TEXT,
  organization_banner_url TEXT,
  
  -- Metrics
  total_opportunities_published INTEGER DEFAULT 0,
  total_announcements_published INTEGER DEFAULT 0,
  
  -- Audit Fields
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
  deleted_at TIMESTAMP
);

-- Indexes
CREATE INDEX idx_stakeholder_user_id ON public.stakeholder_profiles(user_id);
CREATE INDEX idx_stakeholder_is_verified ON public.stakeholder_profiles(is_verified);
CREATE INDEX idx_stakeholder_is_approved ON public.stakeholder_profiles(is_approved_for_publishing);
CREATE INDEX idx_stakeholder_created_at ON public.stakeholder_profiles(created_at DESC);
```

---

### 6. **Opportunities** (Scholarships, Jobs, etc)

Job postings, scholarship opportunities, internships, etc.

**Table: `public.opportunities`**

```sql
CREATE TABLE public.opportunities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Basic Information
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  category VARCHAR(100) NOT NULL,
    -- Categories: Scholarships, Internships, Jobs, Training & Workshops, Conferences,
    -- Fellowships, Research, Grants, Competitions, Entrepreneurship, Mentorship, Volunteer, Other
  
  -- Organization
  organization_name VARCHAR(255) NOT NULL,
  published_by UUID NOT NULL REFERENCES public.users(id),
  
  -- Application Details
  application_link TEXT,
  contact_information JSONB, -- {email, phone, name, website}
  eligibility_criteria TEXT NOT NULL,
  deadline DATE NOT NULL,
  
  -- Target Audience
  target_university VARCHAR(255),
  target_courses TEXT[], -- Array of course names
  target_academic_level VARCHAR(50), -- 100L, 200L, etc
  target_locations TEXT[], -- Array of locations
  
  -- Content
  location VARCHAR(255),
  website TEXT,
  
  -- Media URLs (Signed URLs from storage)
  cover_image_url TEXT,
  flyer_url TEXT,
  logo_url TEXT,
  supporting_document_url TEXT,
  
  -- Status & Publishing
  status VARCHAR(50) DEFAULT 'draft'
    CHECK (status IN ('draft', 'published', 'archived', 'expired')),
  published_at TIMESTAMP,
  archived_at TIMESTAMP,
  
  -- Metrics
  view_count INTEGER DEFAULT 0,
  applicant_count INTEGER DEFAULT 0,
  
  -- Audit Fields
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
  deleted_at TIMESTAMP
);

-- Indexes
CREATE INDEX idx_opportunities_status ON public.opportunities(status);
CREATE INDEX idx_opportunities_category ON public.opportunities(category);
CREATE INDEX idx_opportunities_published_by ON public.opportunities(published_by);
CREATE INDEX idx_opportunities_deadline ON public.opportunities(deadline);
CREATE INDEX idx_opportunities_published_at ON public.opportunities(published_at DESC);
CREATE INDEX idx_opportunities_university ON public.opportunities(target_university);
CREATE INDEX idx_opportunities_view_count ON public.opportunities(view_count DESC);
CREATE INDEX idx_opportunities_created_at ON public.opportunities(created_at DESC);
CREATE INDEX idx_opportunities_deleted_at ON public.opportunities(deleted_at);

-- Full-text search index
CREATE INDEX idx_opportunities_full_text ON public.opportunities USING GIN(
  to_tsvector('english', COALESCE(title, '') || ' ' || COALESCE(description, '') || ' ' || COALESCE(organization_name, ''))
);
```

---

### 7. **Announcements** (Official Communications)

Official news, updates, and announcements from administrators.

**Table: `public.announcements`**

```sql
CREATE TABLE public.announcements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Content
  title VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  excerpt VARCHAR(500), -- Summary/preview
  
  -- Publishing
  published_by UUID NOT NULL REFERENCES public.users(id),
  status VARCHAR(50) DEFAULT 'draft'
    CHECK (status IN ('draft', 'published', 'archived')),
  published_at TIMESTAMP,
  archived_at TIMESTAMP,
  
  -- Featured
  is_pinned BOOLEAN DEFAULT FALSE,
  pinned_at TIMESTAMP,
  pin_priority INTEGER,
  
  -- Media
  featured_image_url TEXT,
  flyer_url TEXT,
  pdf_attachment_url TEXT,
  
  -- Metadata
  event_date DATE,
  external_link TEXT,
  
  -- Metrics
  view_count INTEGER DEFAULT 0,
  
  -- Audit Fields
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
  deleted_at TIMESTAMP
);

-- Indexes
CREATE INDEX idx_announcements_status ON public.announcements(status);
CREATE INDEX idx_announcements_published_by ON public.announcements(published_by);
CREATE INDEX idx_announcements_published_at ON public.announcements(published_at DESC);
CREATE INDEX idx_announcements_is_pinned ON public.announcements(is_pinned, pin_priority);
CREATE INDEX idx_announcements_event_date ON public.announcements(event_date);
CREATE INDEX idx_announcements_created_at ON public.announcements(created_at DESC);
CREATE INDEX idx_announcements_view_count ON public.announcements(view_count DESC);
CREATE INDEX idx_announcements_deleted_at ON public.announcements(deleted_at);

-- Full-text search index
CREATE INDEX idx_announcements_full_text ON public.announcements USING GIN(
  to_tsvector('english', COALESCE(title, '') || ' ' || COALESCE(content, ''))
);
```

---

## Infrastructure Entities

### 8. **Audit Logs** (Compliance & Debugging)

Complete audit trail of all user actions for compliance, debugging, and analytics.

**Table: `public.audit_logs`**

```sql
CREATE TABLE public.audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Actor (Who)
  actor_id UUID REFERENCES public.users(id),
  actor_name VARCHAR(255),
  actor_role VARCHAR(50),
  
  -- Action (What)
  action VARCHAR(100) NOT NULL,
  module VARCHAR(100), -- Profile, Registration, Opportunity, Announcement, etc
  type VARCHAR(50)
    CHECK (type IN ('create', 'read', 'update', 'delete', 'approve', 'reject', 'archive', 'login', 'logout', 'export', 'other')),
  
  -- Status
  status VARCHAR(50) DEFAULT 'success'
    CHECK (status IN ('success', 'failure', 'pending')),
  error_message TEXT, -- If status = failure
  
  -- Details
  target_entity VARCHAR(255), -- Entity affected (User, Opportunity, etc)
  target_id VARCHAR(255), -- ID of affected entity
  changes JSONB, -- Before/after changes: {before: {...}, after: {...}}
  
  -- Request Context
  ip_address INET,
  user_agent TEXT,
  request_url TEXT,
  
  -- Timestamp
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- Indexes for Performance
CREATE INDEX idx_audit_actor_id ON public.audit_logs(actor_id);
CREATE INDEX idx_audit_created_at ON public.audit_logs(created_at DESC);
CREATE INDEX idx_audit_module ON public.audit_logs(module);
CREATE INDEX idx_audit_type ON public.audit_logs(type);
CREATE INDEX idx_audit_target_id ON public.audit_logs(target_id);
CREATE INDEX idx_audit_created_at_module ON public.audit_logs(created_at DESC, module);
```

**Key Design Decisions:**

1. **Immutable**: Audit logs never deleted
2. **Changes Tracking**: JSONB diff of before/after states
3. **Context Capture**: IP, user agent, URL for debugging
4. **Performance**: Composite indexes on frequently queried columns
5. **Compliance**: Permanent record for regulatory requirements

---

### 9. **System Configuration** (Dynamic Settings)

Dynamic configuration values (counters, settings, feature flags).

**Table: `public.system_config`**

```sql
CREATE TABLE public.system_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Configuration
  key VARCHAR(255) UNIQUE NOT NULL,
  value JSONB NOT NULL,
  
  -- Metadata
  description TEXT,
  type VARCHAR(50), -- integer, string, boolean, array, object
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
  updated_by UUID REFERENCES public.users(id)
);

-- Indexes
CREATE INDEX idx_system_config_key ON public.system_config(key);

-- Initial configuration values
INSERT INTO public.system_config (key, value, description, type) VALUES
  ('student_membership_counter', '{"next": 1, "sequence": "NUKaFs-000001"}'::jsonb, 'Next student membership ID', 'object'),
  ('stakeholder_membership_counter', '{"next": 1, "sequence": "STK-000001"}'::jsonb, 'Next stakeholder ID', 'object'),
  ('platform_version', '"1.0.0"'::jsonb, 'Current platform version', 'string'),
  ('registration_enabled', 'true'::jsonb, 'Allow new registrations', 'boolean'),
  ('max_profile_photo_size_mb', '5'::jsonb, 'Maximum profile photo size', 'integer')
ON CONFLICT DO NOTHING;
```

---

### 10. **File Metadata** (Storage Tracking)

Metadata for all files stored in cloud storage.

**Table: `public.file_metadata`**

```sql
CREATE TABLE public.file_metadata (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- File Details
  original_filename VARCHAR(255) NOT NULL,
  storage_path VARCHAR(500) NOT NULL UNIQUE,
  bucket_name VARCHAR(100) NOT NULL,
  
  -- File Information
  file_size INTEGER NOT NULL, -- bytes
  file_type VARCHAR(100),
  mime_type VARCHAR(100),
  
  -- Storage Reference
  uploaded_by UUID NOT NULL REFERENCES public.users(id),
  associated_entity VARCHAR(100), -- User, Opportunity, Announcement, etc
  associated_entity_id VARCHAR(255),
  
  -- Virus Scanning (if implemented)
  is_scanned BOOLEAN DEFAULT FALSE,
  scan_result VARCHAR(50), -- clean, infected, unknown
  
  -- Access Control
  is_public BOOLEAN DEFAULT FALSE,
  signed_url_expiry TIMESTAMP,
  
  -- Timestamps
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
  deleted_at TIMESTAMP
);

-- Indexes
CREATE INDEX idx_file_metadata_storage_path ON public.file_metadata(storage_path);
CREATE INDEX idx_file_metadata_uploaded_by ON public.file_metadata(uploaded_by);
CREATE INDEX idx_file_metadata_created_at ON public.file_metadata(created_at DESC);
CREATE INDEX idx_file_metadata_associated_entity ON public.file_metadata(associated_entity, associated_entity_id);
```

---

## Storage Architecture

### Bucket Structure (Supabase Storage)

**Bucket: `profile-photos`** (Private)
- Purpose: User profile pictures
- Permissions: Only user can read/write own; admins can moderate
- Lifecycle: Deleted when user deleted
- Max Size: 5MB per file
- Formats: JPEG, PNG, WebP
- Path Structure: `/{user_id}/{timestamp}-{filename}`

**Bucket: `membership-documents`** (Private)
- Purpose: Certificates, diplomas, credentials
- Permissions: Only user can upload; admins can view
- Lifecycle: Retained for 7 years after deletion
- Max Size: 20MB per file
- Formats: PDF, JPEG, PNG, DOC, DOCX
- Path Structure: `/{user_id}/{document_type}/{timestamp}-{filename}`

**Bucket: `opportunity-media`** (Private with Signed URLs)
- Purpose: Cover images, logos, flyers, PDFs for opportunities
- Permissions: Publisher writes; public read via signed URLs
- Lifecycle: Deleted when opportunity deleted
- Max Size: 5MB per file
- Formats: JPEG, PNG, PDF
- Path Structure: `/opportunities/{opportunity_id}/{media_type}/{timestamp}-{filename}`

**Bucket: `announcement-media`** (Private with Signed URLs)
- Purpose: Featured images, flyers, PDF attachments for announcements
- Permissions: Admins write; public read via signed URLs
- Lifecycle: Retained indefinitely
- Max Size: 5MB per file
- Formats: JPEG, PNG, PDF
- Path Structure: `/announcements/{announcement_id}/{media_type}/{timestamp}-{filename}`

**Bucket: `qr-codes`** (Private)
- Purpose: Generated QR code images (PNG format)
- Permissions: Only relevant user + admins can view
- Lifecycle: Same as membership_identities
- Format: PNG
- Path Structure: `/{user_id}/{membership_id}.png`

**Bucket: `exports-reports`** (Private)
- Purpose: Exported CSV, Excel, PDF reports
- Permissions: Only admin who requested can view
- Lifecycle: Delete after 30 days
- Format: CSV, XLSX, PDF
- Path Structure: `/reports/{report_type}/{request_date}/{filename}`

**Bucket: `backups`** (Private)
- Purpose: Database and system backups
- Permissions: Super admins only
- Lifecycle: Retain last 30 daily, 12 monthly, 5 yearly
- Format: Compressed archives
- Path Structure: `/{backup_type}/{date}/{filename}`

---

## Security & Access Control

### Row Level Security (RLS) Policies

**Users Table - Read Policy**
```sql
-- Users can read their own profiles
CREATE POLICY "users_select_own" ON public.users
FOR SELECT TO authenticated
USING (auth.uid() = id);

-- Admins can read all users
CREATE POLICY "admins_select_all" ON public.users
FOR SELECT TO authenticated
USING (
  (SELECT role FROM public.users WHERE id = auth.uid()) = 'super_admin'
);

-- Executives/stakeholders can read in their regions (optional)
CREATE POLICY "users_select_by_role" ON public.users
FOR SELECT TO authenticated
USING (
  -- Users can see others in same district/chiefdom (if role allows)
  CASE
    WHEN (SELECT role FROM public.users WHERE id = auth.uid()) IN ('executive', 'stakeholder') THEN
      district = (SELECT district FROM public.users WHERE id = auth.uid())
    ELSE false
  END
);
```

**Opportunities Table - Read Policy**
```sql
-- Anyone can read published opportunities
CREATE POLICY "opportunities_select_published" ON public.opportunities
FOR SELECT TO anon
USING (status = 'published');

-- Authenticated users can read their own drafts
CREATE POLICY "opportunities_select_own_draft" ON public.opportunities
FOR SELECT TO authenticated
USING (
  published_by = auth.uid() OR 
  status = 'published' OR
  (SELECT role FROM public.users WHERE id = auth.uid()) = 'super_admin'
);
```

**Audit Logs - Read Policy**
```sql
-- Only admins can read audit logs
CREATE POLICY "audit_logs_admin_only" ON public.audit_logs
FOR SELECT TO authenticated
USING (
  (SELECT role FROM public.users WHERE id = auth.uid()) = 'super_admin'
);
```

---

## Indexing Strategy

### Search Optimization

**Full-Text Search Indexes**
```sql
-- Users: Search by name or email
CREATE INDEX idx_users_full_text ON public.users USING GIN(
  to_tsvector('english', COALESCE(full_name, '') || ' ' || COALESCE(email, ''))
);

-- Opportunities: Search by title, description, organization
CREATE INDEX idx_opportunities_full_text ON public.opportunities USING GIN(
  to_tsvector('english', 
    COALESCE(title, '') || ' ' || 
    COALESCE(description, '') || ' ' || 
    COALESCE(organization_name, ''))
);

-- Announcements: Search by title and content
CREATE INDEX idx_announcements_full_text ON public.announcements USING GIN(
  to_tsvector('english', COALESCE(title, '') || ' ' || COALESCE(content, ''))
);
```

### Filtering Optimization

**Column Indexes (B-tree for equality/range)**
```sql
-- Users
CREATE INDEX idx_users_status ON public.users(status);
CREATE INDEX idx_users_role ON public.users(role);
CREATE INDEX idx_users_district_chiefdom ON public.users(district, chiefdom);
CREATE INDEX idx_users_university_course ON public.users(university, course_name);
CREATE INDEX idx_users_deleted_at ON public.users(deleted_at);

-- Opportunities
CREATE INDEX idx_opportunities_status ON public.opportunities(status);
CREATE INDEX idx_opportunities_category ON public.opportunities(category);
CREATE INDEX idx_opportunities_deadline ON public.opportunities(deadline);
CREATE INDEX idx_opportunities_published_by ON public.opportunities(published_by);

-- Announcements
CREATE INDEX idx_announcements_status ON public.announcements(status);
CREATE INDEX idx_announcements_is_pinned ON public.announcements(is_pinned, pin_priority);
```

### Sorting Optimization

**Timestamp Indexes (Descending for recent-first queries)**
```sql
CREATE INDEX idx_users_created_at ON public.users(created_at DESC);
CREATE INDEX idx_opportunities_published_at ON public.opportunities(published_at DESC);
CREATE INDEX idx_announcements_published_at ON public.announcements(published_at DESC);
CREATE INDEX idx_audit_created_at ON public.audit_logs(created_at DESC);
```

### Composite Indexes (Multiple conditions)

```sql
-- Common query: Active users in specific district
CREATE INDEX idx_users_status_district ON public.users(status, district) WHERE deleted_at IS NULL;

-- Common query: Published opportunities by category
CREATE INDEX idx_opportunities_status_category ON public.opportunities(status, category) WHERE status = 'published';

-- Common query: Recent audit logs by module
CREATE INDEX idx_audit_created_at_module ON public.audit_logs(created_at DESC, module);
```

---

## Soft Delete Strategy

Every table with soft deletes uses a `deleted_at` timestamp:

**Implementation Pattern:**

```sql
-- Soft delete query
UPDATE public.users 
SET deleted_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP 
WHERE id = user_id;

-- Get only active records (standard query)
SELECT * FROM public.users WHERE deleted_at IS NULL;

-- Include deleted records (admin only)
SELECT * FROM public.users WHERE deleted_at IS NOT NULL;

-- Permanently delete (after retention period, e.g., 30 days)
DELETE FROM public.users WHERE deleted_at < (CURRENT_TIMESTAMP - INTERVAL '30 days');
```

---

## Audit Logging Implementation

### Automatic Audit Trail

Every user action creates an entry in `audit_logs`:

```sql
-- Example: When user updates profile
INSERT INTO public.audit_logs (
  actor_id, actor_name, actor_role, 
  action, module, type, status,
  target_entity, target_id, changes,
  ip_address, user_agent, request_url
) VALUES (
  $1, $2, $3, -- actor info
  'updated profile', 'Profile', 'update', 'success',
  'User', $4, -- target
  jsonb_build_object('before', $5, 'after', $6), -- changes
  $7, $8, $9 -- request context
);
```

### What to Audit

| Action | Module | Type | Tracked |
|--------|--------|------|---------|
| User registration | Registration | create | Full payload |
| User approval | Registration | approve | Approver, changes |
| Profile update | Profile | update | Changed fields |
| Opportunity publish | Opportunity | create | Full content |
| Opportunity edit | Opportunity | update | Changed fields |
| Admin login | Auth | login | IP, user agent |
| Report generation | Analytics | export | Report type, filters |
| User deletion | User | delete | User ID, timestamp |
| Role assignment | Auth | update | Old role → new role |

---

## Scaling Considerations

### From Hundreds to 1,000,000+ Users

**Database Optimization:**

1. **Partitioning**: Partition `audit_logs` by month, `users` by status
2. **Read Replicas**: Set up read-only replicas for analytics
3. **Connection Pooling**: Use PgBouncer/Pgpool for connection management
4. **Query Optimization**: Monitor slow query log, add indexes incrementally
5. **Archive Old Data**: Move audit logs > 1 year to cold storage

**Storage Optimization:**

1. **Bucket Lifecycle**: Automatically delete old exports/backups
2. **CDN Integration**: Use edge caching for QR codes, profile photos
3. **Image Optimization**: Resize/compress images on upload
4. **Deduplication**: Don't store duplicate files

**API Optimization:**

1. **Pagination**: Always paginate listing endpoints
2. **Caching**: Cache districts/chiefdoms (rarely changes)
3. **Lazy Loading**: Don't load all user relationships
4. **Batch Operations**: Support bulk imports for admin tasks

---

## Summary Table

| Component | Purpose | Key Features |
|-----------|---------|--------------|
| **users** | Core member profiles | Full-text search, soft delete, audit |
| **membership_identities** | Permanent QR codes | One-time creation, immutable |
| **registrations** | Pending applications | Status workflow, approval tracking |
| **districts / chiefdoms** | Geographic validation | Official data, immutable |
| **stakeholder_profiles** | Publisher profiles | Verification, metrics |
| **opportunities** | Jobs, scholarships, etc | Category filter, deadline tracking |
| **announcements** | Official news | Pinning, status management |
| **audit_logs** | Compliance record | Immutable, changes tracking |
| **system_config** | Dynamic settings | Counters, feature flags |
| **file_metadata** | Storage tracking | Lifecycle management |

---

## Implementation Checklist

- [ ] Create all tables with proper constraints
- [ ] Set up all indexes (composite, full-text, soft delete)
- [ ] Enable RLS on all tables
- [ ] Implement RLS policies for each role
- [ ] Create audit logging triggers
- [ ] Set up backup policies
- [ ] Configure storage buckets
- [ ] Implement signed URL generation
- [ ] Create analytics views
- [ ] Set up retention policies
- [ ] Document all API endpoints
- [ ] Create database migration scripts
- [ ] Test with scaling data (1M+ records)
- [ ] Set up monitoring/alerting
- [ ] Document disaster recovery procedures
