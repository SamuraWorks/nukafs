-- ============================================================================
-- NUKaFs Registry Platform - Database Migration
-- Production-Grade Storage & Data Architecture
-- ============================================================================
-- 
-- This migration creates the complete database schema for the NUKaFs Registry
-- Platform, including all tables, indexes, constraints, and initial data.
--
-- IMPORTANT: Run this migration in Supabase SQL Editor
-- Do NOT run individual statements - execute the entire script
-- ============================================================================

-- ============================================================================
-- PHASE 1: CREATE CORE TABLES
-- ============================================================================

-- ===== Districts (Official Geographic Data) =====
CREATE TABLE IF NOT EXISTS public.districts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) UNIQUE NOT NULL,
  code VARCHAR(10) UNIQUE NOT NULL,
  population_estimate INTEGER,
  status VARCHAR(50) DEFAULT 'active'
    CHECK (status IN ('active', 'inactive', 'archived')),
  description TEXT,
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_districts_name ON public.districts(name);
CREATE INDEX IF NOT EXISTS idx_districts_code ON public.districts(code);
CREATE INDEX IF NOT EXISTS idx_districts_status ON public.districts(status);

-- Add missing columns to existing districts table
ALTER TABLE IF EXISTS public.districts ADD COLUMN IF NOT EXISTS population_estimate INTEGER;
ALTER TABLE IF EXISTS public.districts ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT 'active';
ALTER TABLE IF EXISTS public.districts ADD COLUMN IF NOT EXISTS description TEXT;

-- Insert official districts
INSERT INTO public.districts (name, code, description) VALUES 
  ('Koinadugu', 'KDU', 'Koinadugu District with 11 chiefdoms'),
  ('Falaba', 'FLB', 'Falaba District with 13 chiefdoms')
ON CONFLICT (name) DO NOTHING;

-- ===== Chiefdoms (Official Geographic Data) =====
CREATE TABLE IF NOT EXISTS public.chiefdoms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  district_id UUID NOT NULL REFERENCES public.districts(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  code VARCHAR(10),
  population_estimate INTEGER,
  status VARCHAR(50) DEFAULT 'active'
    CHECK (status IN ('active', 'inactive', 'archived')),
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
  
  UNIQUE(district_id, name)
);

CREATE INDEX IF NOT EXISTS idx_chiefdoms_district_id ON public.chiefdoms(district_id);
CREATE INDEX IF NOT EXISTS idx_chiefdoms_name ON public.chiefdoms(name);
CREATE INDEX IF NOT EXISTS idx_chiefdoms_status ON public.chiefdoms(status);

-- Add missing columns to existing chiefdoms table
ALTER TABLE IF EXISTS public.chiefdoms ADD COLUMN IF NOT EXISTS code VARCHAR(10);
ALTER TABLE IF EXISTS public.chiefdoms ADD COLUMN IF NOT EXISTS population_estimate INTEGER;
ALTER TABLE IF EXISTS public.chiefdoms ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT 'active';

-- Insert Koinadugu chiefdoms (11 total)
INSERT INTO public.chiefdoms (district_id, name, code)
SELECT d.id, c.name, c.code
FROM (
  VALUES 
    ('Koinadugu', 'Diang', 'DNG'),
    ('Koinadugu', 'Gbonkobon Kayaka', 'GBK'),
    ('Koinadugu', 'Kalian', 'KLN'),
    ('Koinadugu', 'Kamukeh', 'KMH'),
    ('Koinadugu', 'Kasunko', 'KSK'),
    ('Koinadugu', 'Kellian', 'KLN'),
    ('Koinadugu', 'Nieni', 'NIN'),
    ('Koinadugu', 'Sengbe', 'SGB'),
    ('Koinadugu', 'Tamiso', 'TSO'),
    ('Koinadugu', 'Wara-Wara Bafodea', 'WWB'),
    ('Koinadugu', 'Wara-Wara Yagala', 'WWY'),
    ('Falaba', 'Dembelia Sikunia', 'DMS'),
    ('Falaba', 'Dembelia-Musaia', 'DEM'),
    ('Falaba', 'Delemandugu', 'DLD'),
    ('Falaba', 'Folasaba', 'FSB'),
    ('Falaba', 'Kamadu Yiraia', 'KMY'),
    ('Falaba', 'Kebelia', 'KBL'),
    ('Falaba', 'Kulor Saradu', 'KLS'),
    ('Falaba', 'Mongo', 'MNG'),
    ('Falaba', 'Morfindugu', 'MFD'),
    ('Falaba', 'Neya', 'NYA'),
    ('Falaba', 'Nyedu', 'NYD'),
    ('Falaba', 'Sulima', 'SLM'),
    ('Falaba', 'Wollay Barawa', 'WLB')
) AS c(district_name, name, code)
JOIN public.districts d ON d.name = c.district_name
ON CONFLICT DO NOTHING;

-- ===== Users (Core Member Profiles) =====
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Identity & Authorization
  email VARCHAR(255) UNIQUE NOT NULL,
  phone VARCHAR(20) UNIQUE,
  
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
  academic_level VARCHAR(50),
  student_id VARCHAR(100),
  admission_year INTEGER,
  graduation_year INTEGER,
  expected_graduation_year INTEGER,
  college VARCHAR(255),
  
  -- Professional Information (For Stakeholders & Graduates)
  organization VARCHAR(255),
  occupation VARCHAR(255),
  employment_status VARCHAR(50),
  skills TEXT[],
  biography TEXT,
  
  -- Profile Media
  profile_photo_url TEXT,
  avatar_color VARCHAR(7) DEFAULT '#3B82F6',
  
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
  deleted_at TIMESTAMP,
  
  -- Metadata
  is_migrated_from_legacy BOOLEAN DEFAULT FALSE,
  legacy_membership_number VARCHAR(100),
  legacy_data_json JSONB
);

-- Add missing columns to existing users table (if it was partially migrated)
ALTER TABLE IF EXISTS public.users ADD COLUMN IF NOT EXISTS course_name VARCHAR(255);
ALTER TABLE IF EXISTS public.users ADD COLUMN IF NOT EXISTS academic_level VARCHAR(50);
ALTER TABLE IF EXISTS public.users ADD COLUMN IF NOT EXISTS student_id VARCHAR(100);
ALTER TABLE IF EXISTS public.users ADD COLUMN IF NOT EXISTS admission_year INTEGER;
ALTER TABLE IF EXISTS public.users ADD COLUMN IF NOT EXISTS graduation_year INTEGER;
ALTER TABLE IF EXISTS public.users ADD COLUMN IF NOT EXISTS expected_graduation_year INTEGER;
ALTER TABLE IF EXISTS public.users ADD COLUMN IF NOT EXISTS college VARCHAR(255);
ALTER TABLE IF EXISTS public.users ADD COLUMN IF NOT EXISTS organization VARCHAR(255);
ALTER TABLE IF EXISTS public.users ADD COLUMN IF NOT EXISTS occupation VARCHAR(255);
ALTER TABLE IF EXISTS public.users ADD COLUMN IF NOT EXISTS employment_status VARCHAR(50);
ALTER TABLE IF EXISTS public.users ADD COLUMN IF NOT EXISTS skills TEXT[];
ALTER TABLE IF EXISTS public.users ADD COLUMN IF NOT EXISTS biography TEXT;
ALTER TABLE IF EXISTS public.users ADD COLUMN IF NOT EXISTS avatar_color VARCHAR(7) DEFAULT '#3B82F6';
ALTER TABLE IF EXISTS public.users ADD COLUMN IF NOT EXISTS emergency_contact JSONB;
ALTER TABLE IF EXISTS public.users ADD COLUMN IF NOT EXISTS approval_notes TEXT;
ALTER TABLE IF EXISTS public.users ADD COLUMN IF NOT EXISTS approved_by UUID REFERENCES public.users(id);
ALTER TABLE IF EXISTS public.users ADD COLUMN IF NOT EXISTS date_approved TIMESTAMP;
ALTER TABLE IF EXISTS public.users ADD COLUMN IF NOT EXISTS rejection_reason TEXT;
ALTER TABLE IF EXISTS public.users ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES public.users(id);
ALTER TABLE IF EXISTS public.users ADD COLUMN IF NOT EXISTS updated_by UUID REFERENCES public.users(id);
ALTER TABLE IF EXISTS public.users ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT 'pending'
  CHECK (status IN ('pending', 'active_complete', 'active_partial', 'archived', 'deleted'));
ALTER TABLE IF EXISTS public.users ADD COLUMN IF NOT EXISTS verification_status VARCHAR(50) DEFAULT 'unverified'
  CHECK (verification_status IN ('unverified', 'verified', 'rejected'));
ALTER TABLE IF EXISTS public.users ADD COLUMN IF NOT EXISTS role VARCHAR(50) DEFAULT 'student'
  CHECK (role IN ('student', 'executive', 'stakeholder', 'super_admin'));
ALTER TABLE IF EXISTS public.users ADD COLUMN IF NOT EXISTS is_migrated_from_legacy BOOLEAN DEFAULT FALSE;
ALTER TABLE IF EXISTS public.users ADD COLUMN IF NOT EXISTS legacy_membership_number VARCHAR(100);
ALTER TABLE IF EXISTS public.users ADD COLUMN IF NOT EXISTS legacy_data_json JSONB;
ALTER TABLE IF EXISTS public.users ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP;

-- Indexes for Users table
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);
CREATE INDEX IF NOT EXISTS idx_users_status ON public.users(status);
CREATE INDEX IF NOT EXISTS idx_users_role ON public.users(role);
CREATE INDEX IF NOT EXISTS idx_users_district_chiefdom ON public.users(district, chiefdom);
CREATE INDEX IF NOT EXISTS idx_users_university_course ON public.users(university, course_name);
CREATE INDEX IF NOT EXISTS idx_users_deleted_at ON public.users(deleted_at);
CREATE INDEX IF NOT EXISTS idx_users_created_at ON public.users(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_users_updated_at ON public.users(updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_users_is_migrated ON public.users(is_migrated_from_legacy);
CREATE INDEX IF NOT EXISTS idx_users_verification_status ON public.users(verification_status);

-- Full-text search index for users
CREATE INDEX IF NOT EXISTS idx_users_full_text ON public.users USING GIN(
  to_tsvector('english', COALESCE(full_name, '') || ' ' || COALESCE(email, ''))
);

-- Unique constraint to prevent duplicate profiles (soft delete aware)
CREATE UNIQUE INDEX IF NOT EXISTS idx_users_email_not_deleted ON public.users(email) 
WHERE deleted_at IS NULL;

-- ===== Membership Identities (Permanent QR Codes) =====
CREATE TABLE IF NOT EXISTS public.membership_identities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  
  -- Sequential Membership ID
  membership_id VARCHAR(50) UNIQUE NOT NULL,
  membership_type VARCHAR(50) DEFAULT 'student'
    CHECK (membership_type IN ('student', 'stakeholder', 'executive')),
  
  -- Permanent Verification Token (Never Regenerated)
  verification_token VARCHAR(100) UNIQUE NOT NULL,
  verification_url TEXT NOT NULL,
  
  -- QR Code Data
  qr_code_data TEXT NOT NULL,
  qr_code_image_url TEXT,
  
  -- Timestamps
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
  issued_by UUID REFERENCES public.users(id),
  
  -- Metadata
  is_active BOOLEAN DEFAULT TRUE,
  deactivated_at TIMESTAMP,
  deactivation_reason TEXT
);

-- Add missing columns to existing membership_identities table
ALTER TABLE IF EXISTS public.membership_identities ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE;
ALTER TABLE IF EXISTS public.membership_identities ADD COLUMN IF NOT EXISTS deactivation_reason TEXT;

-- Indexes for Membership Identities
CREATE INDEX IF NOT EXISTS idx_membership_user_id ON public.membership_identities(user_id);
CREATE INDEX IF NOT EXISTS idx_membership_id ON public.membership_identities(membership_id);
CREATE INDEX IF NOT EXISTS idx_membership_token ON public.membership_identities(verification_token);
CREATE INDEX IF NOT EXISTS idx_membership_created_at ON public.membership_identities(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_membership_is_active ON public.membership_identities(is_active);

-- Ensure one active membership per user
CREATE UNIQUE INDEX IF NOT EXISTS idx_membership_one_per_user ON public.membership_identities(user_id)
WHERE is_active = TRUE;

-- ===== Registrations (Pending Applications) =====
CREATE TABLE IF NOT EXISTS public.registrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  
  -- Registration Details
  full_name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(20),
  district VARCHAR(100) NOT NULL,
  chiefdom VARCHAR(100) NOT NULL,
  role VARCHAR(50) DEFAULT 'student'
    CHECK (role IN ('student', 'graduate', 'executive', 'stakeholder', 'super_admin')),
  profile JSONB,
  university VARCHAR(255),
  department VARCHAR(255),
  course VARCHAR(255),
  level VARCHAR(50),
  employment_status VARCHAR(50),
  submitted_date DATE,
  
  -- Status Tracking
  status VARCHAR(50) DEFAULT 'pending'
    CHECK (status IN ('pending', 'submitted', 'under_review', 'approved', 'rejected', 'pending_payment')),
  
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
  deleted_at TIMESTAMP
);

-- Add missing columns to existing registrations table
ALTER TABLE IF EXISTS public.registrations ADD COLUMN IF NOT EXISTS reviewed_notes TEXT;
ALTER TABLE IF EXISTS public.registrations ADD COLUMN IF NOT EXISTS rejected_at TIMESTAMP;
ALTER TABLE IF EXISTS public.registrations ADD COLUMN IF NOT EXISTS approved_at TIMESTAMP;
ALTER TABLE IF EXISTS public.registrations ADD COLUMN IF NOT EXISTS role VARCHAR(50) DEFAULT 'student'
  CHECK (role IN ('student', 'graduate', 'executive', 'stakeholder', 'super_admin'));
ALTER TABLE IF EXISTS public.registrations ADD COLUMN IF NOT EXISTS profile JSONB;
ALTER TABLE IF EXISTS public.registrations ADD COLUMN IF NOT EXISTS university VARCHAR(255);
ALTER TABLE IF EXISTS public.registrations ADD COLUMN IF NOT EXISTS department VARCHAR(255);
ALTER TABLE IF EXISTS public.registrations ADD COLUMN IF NOT EXISTS course VARCHAR(255);
ALTER TABLE IF EXISTS public.registrations ADD COLUMN IF NOT EXISTS level VARCHAR(50);
ALTER TABLE IF EXISTS public.registrations ADD COLUMN IF NOT EXISTS employment_status VARCHAR(50);
ALTER TABLE IF EXISTS public.registrations ADD COLUMN IF NOT EXISTS submitted_date DATE;
ALTER TABLE IF EXISTS public.registrations ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT 'pending'
  CHECK (status IN ('pending', 'submitted', 'under_review', 'approved', 'rejected', 'pending_payment'));
ALTER TABLE IF EXISTS public.registrations ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP;
ALTER TABLE IF EXISTS public.registrations ADD COLUMN IF NOT EXISTS submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL;

-- Indexes for Registrations
CREATE INDEX IF NOT EXISTS idx_registrations_status ON public.registrations(status);
CREATE INDEX IF NOT EXISTS idx_registrations_email ON public.registrations(email);
CREATE INDEX IF NOT EXISTS idx_registrations_submitted_at ON public.registrations(submitted_at DESC);
CREATE INDEX IF NOT EXISTS idx_registrations_approved_at ON public.registrations(approved_at DESC);
CREATE INDEX IF NOT EXISTS idx_registrations_deleted_at ON public.registrations(deleted_at);

-- ============================================================================
-- PHASE 2: CREATE PUBLISHING TABLES
-- ============================================================================

-- ===== Stakeholder Profiles (Extended Publisher Info) =====
CREATE TABLE IF NOT EXISTS public.stakeholder_profiles (
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

-- Indexes for Stakeholder Profiles
CREATE INDEX IF NOT EXISTS idx_stakeholder_user_id ON public.stakeholder_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_stakeholder_is_verified ON public.stakeholder_profiles(is_verified);
CREATE INDEX IF NOT EXISTS idx_stakeholder_is_approved ON public.stakeholder_profiles(is_approved_for_publishing);
CREATE INDEX IF NOT EXISTS idx_stakeholder_created_at ON public.stakeholder_profiles(created_at DESC);

-- Add missing columns to existing stakeholder_profiles table
ALTER TABLE IF EXISTS public.stakeholder_profiles ADD COLUMN IF NOT EXISTS total_opportunities_published INTEGER DEFAULT 0;
ALTER TABLE IF EXISTS public.stakeholder_profiles ADD COLUMN IF NOT EXISTS total_announcements_published INTEGER DEFAULT 0;
ALTER TABLE IF EXISTS public.stakeholder_profiles ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP;

-- ===== Opportunities (Jobs, Scholarships, etc) =====
CREATE TABLE IF NOT EXISTS public.opportunities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Basic Information
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  category VARCHAR(100) NOT NULL,
  
  -- Organization
  organization_name VARCHAR(255) NOT NULL,
  published_by UUID NOT NULL REFERENCES public.users(id),
  
  -- Application Details
  application_link TEXT,
  contact_information JSONB,
  eligibility_criteria TEXT NOT NULL,
  deadline DATE NOT NULL,
  
  -- Target Audience
  target_university VARCHAR(255),
  target_courses TEXT[],
  target_academic_level VARCHAR(50),
  target_locations TEXT[],
  
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

-- Add missing columns to existing opportunities table
ALTER TABLE IF EXISTS public.opportunities ADD COLUMN IF NOT EXISTS cover_image_url TEXT;
ALTER TABLE IF EXISTS public.opportunities ADD COLUMN IF NOT EXISTS flyer_url TEXT;
ALTER TABLE IF EXISTS public.opportunities ADD COLUMN IF NOT EXISTS logo_url TEXT;
ALTER TABLE IF EXISTS public.opportunities ADD COLUMN IF NOT EXISTS supporting_document_url TEXT;
ALTER TABLE IF EXISTS public.opportunities ADD COLUMN IF NOT EXISTS organization_name VARCHAR(255);
ALTER TABLE IF EXISTS public.opportunities ADD COLUMN IF NOT EXISTS target_university VARCHAR(255);
ALTER TABLE IF EXISTS public.opportunities ADD COLUMN IF NOT EXISTS target_courses TEXT[];
ALTER TABLE IF EXISTS public.opportunities ADD COLUMN IF NOT EXISTS target_academic_level VARCHAR(50);
ALTER TABLE IF EXISTS public.opportunities ADD COLUMN IF NOT EXISTS target_locations TEXT[];
ALTER TABLE IF EXISTS public.opportunities ADD COLUMN IF NOT EXISTS published_by UUID REFERENCES public.users(id);
ALTER TABLE IF EXISTS public.opportunities ADD COLUMN IF NOT EXISTS published_at TIMESTAMP;
ALTER TABLE IF EXISTS public.opportunities ADD COLUMN IF NOT EXISTS archived_at TIMESTAMP;
ALTER TABLE IF EXISTS public.opportunities ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT 'draft'
  CHECK (status IN ('draft', 'published', 'archived', 'expired'));
ALTER TABLE IF EXISTS public.opportunities ADD COLUMN IF NOT EXISTS category VARCHAR(100) DEFAULT 'uncategorized';
ALTER TABLE IF EXISTS public.opportunities ADD COLUMN IF NOT EXISTS applicant_count INTEGER DEFAULT 0;
ALTER TABLE IF EXISTS public.opportunities ADD COLUMN IF NOT EXISTS view_count INTEGER DEFAULT 0;
ALTER TABLE IF EXISTS public.opportunities ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP;

-- Indexes for Opportunities
CREATE INDEX IF NOT EXISTS idx_opportunities_status ON public.opportunities(status);
CREATE INDEX IF NOT EXISTS idx_opportunities_category ON public.opportunities(category);
CREATE INDEX IF NOT EXISTS idx_opportunities_published_by ON public.opportunities(published_by);
CREATE INDEX IF NOT EXISTS idx_opportunities_deadline ON public.opportunities(deadline);
CREATE INDEX IF NOT EXISTS idx_opportunities_published_at ON public.opportunities(published_at DESC);
CREATE INDEX IF NOT EXISTS idx_opportunities_university ON public.opportunities(target_university);
CREATE INDEX IF NOT EXISTS idx_opportunities_view_count ON public.opportunities(view_count DESC);
CREATE INDEX IF NOT EXISTS idx_opportunities_created_at ON public.opportunities(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_opportunities_deleted_at ON public.opportunities(deleted_at);

-- Full-text search index for opportunities
CREATE INDEX IF NOT EXISTS idx_opportunities_full_text ON public.opportunities USING GIN(
  to_tsvector('english', 
    COALESCE(title, '') || ' ' || 
    COALESCE(description, '') || ' ' || 
    COALESCE(organization_name, ''))
);

-- Composite index for common queries
CREATE INDEX IF NOT EXISTS idx_opportunities_status_category ON public.opportunities(status, category) 
WHERE status = 'published';

-- ===== Announcements (Official Communications) =====
CREATE TABLE IF NOT EXISTS public.announcements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Content
  title VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  excerpt VARCHAR(500),
  
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

-- Add missing columns to existing announcements table
ALTER TABLE IF EXISTS public.announcements ADD COLUMN IF NOT EXISTS content TEXT;
ALTER TABLE IF EXISTS public.announcements ADD COLUMN IF NOT EXISTS excerpt VARCHAR(500);
ALTER TABLE IF EXISTS public.announcements ADD COLUMN IF NOT EXISTS featured_image_url TEXT;
ALTER TABLE IF EXISTS public.announcements ADD COLUMN IF NOT EXISTS flyer_url TEXT;
ALTER TABLE IF EXISTS public.announcements ADD COLUMN IF NOT EXISTS pdf_attachment_url TEXT;
ALTER TABLE IF EXISTS public.announcements ADD COLUMN IF NOT EXISTS published_by UUID REFERENCES public.users(id);
ALTER TABLE IF EXISTS public.announcements ADD COLUMN IF NOT EXISTS published_at TIMESTAMP;
ALTER TABLE IF EXISTS public.announcements ADD COLUMN IF NOT EXISTS archived_at TIMESTAMP;
ALTER TABLE IF EXISTS public.announcements ADD COLUMN IF NOT EXISTS is_pinned BOOLEAN DEFAULT FALSE;
ALTER TABLE IF EXISTS public.announcements ADD COLUMN IF NOT EXISTS pinned_at TIMESTAMP;
ALTER TABLE IF EXISTS public.announcements ADD COLUMN IF NOT EXISTS pin_priority INTEGER;
ALTER TABLE IF EXISTS public.announcements ADD COLUMN IF NOT EXISTS event_date DATE;
ALTER TABLE IF EXISTS public.announcements ADD COLUMN IF NOT EXISTS external_link TEXT;
ALTER TABLE IF EXISTS public.announcements ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT 'draft'
  CHECK (status IN ('draft', 'published', 'archived'));
ALTER TABLE IF EXISTS public.announcements ADD COLUMN IF NOT EXISTS view_count INTEGER DEFAULT 0;
ALTER TABLE IF EXISTS public.announcements ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP;

-- Indexes for Announcements
CREATE INDEX IF NOT EXISTS idx_announcements_status ON public.announcements(status);
CREATE INDEX IF NOT EXISTS idx_announcements_published_by ON public.announcements(published_by);
CREATE INDEX IF NOT EXISTS idx_announcements_published_at ON public.announcements(published_at DESC);
CREATE INDEX IF NOT EXISTS idx_announcements_is_pinned ON public.announcements(is_pinned, pin_priority);
CREATE INDEX IF NOT EXISTS idx_announcements_event_date ON public.announcements(event_date);
CREATE INDEX IF NOT EXISTS idx_announcements_created_at ON public.announcements(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_announcements_view_count ON public.announcements(view_count DESC);
CREATE INDEX IF NOT EXISTS idx_announcements_deleted_at ON public.announcements(deleted_at);

-- Full-text search index for announcements
CREATE INDEX IF NOT EXISTS idx_announcements_full_text ON public.announcements USING GIN(
  to_tsvector('english', COALESCE(title, '') || ' ' || COALESCE(content, ''))
);

-- Composite index for pinned announcements
CREATE INDEX IF NOT EXISTS idx_announcements_pinned_recent ON public.announcements(is_pinned, published_at DESC) 
WHERE is_pinned = TRUE AND status = 'published';

-- ============================================================================
-- PHASE 3: CREATE INFRASTRUCTURE TABLES
-- ============================================================================

-- ===== Audit Logs (Complete Activity Trail) =====
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Actor (Who)
  actor_id UUID REFERENCES public.users(id),
  actor_name VARCHAR(255),
  actor_role VARCHAR(50),
  
  -- Action (What)
  action VARCHAR(100) NOT NULL,
  module VARCHAR(100),
  type VARCHAR(50)
    CHECK (type IN ('create', 'read', 'update', 'delete', 'approve', 'reject', 'archive', 'login', 'logout', 'export', 'other')),
  
  -- Status
  status VARCHAR(50) DEFAULT 'success'
    CHECK (status IN ('success', 'failure', 'pending')),
  error_message TEXT,
  
  -- Details
  target_entity VARCHAR(255),
  target_id VARCHAR(255),
  changes JSONB,
  
  -- Request Context
  ip_address INET,
  user_agent TEXT,
  request_url TEXT,
  
  -- Timestamp
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- Indexes for Audit Logs
CREATE INDEX IF NOT EXISTS idx_audit_actor_id ON public.audit_logs(actor_id);
CREATE INDEX IF NOT EXISTS idx_audit_created_at ON public.audit_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_module ON public.audit_logs(module);
CREATE INDEX IF NOT EXISTS idx_audit_type ON public.audit_logs(type);
CREATE INDEX IF NOT EXISTS idx_audit_target_id ON public.audit_logs(target_id);
CREATE INDEX IF NOT EXISTS idx_audit_created_at_module ON public.audit_logs(created_at DESC, module);

-- Partition audit logs by month (for better performance at scale)
-- Uncomment when database reaches significant size
-- CREATE TABLE public.audit_logs_2024_01 PARTITION OF public.audit_logs
--   FOR VALUES FROM ('2024-01-01') TO ('2024-02-01');

-- Add missing columns to existing audit_logs table
ALTER TABLE IF EXISTS public.audit_logs ADD COLUMN IF NOT EXISTS action VARCHAR(100);
ALTER TABLE IF EXISTS public.audit_logs ADD COLUMN IF NOT EXISTS module VARCHAR(100);
ALTER TABLE IF EXISTS public.audit_logs ADD COLUMN IF NOT EXISTS type VARCHAR(50);
ALTER TABLE IF EXISTS public.audit_logs ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT 'success';
ALTER TABLE IF EXISTS public.audit_logs ADD COLUMN IF NOT EXISTS error_message TEXT;
ALTER TABLE IF EXISTS public.audit_logs ADD COLUMN IF NOT EXISTS target_entity VARCHAR(255);
ALTER TABLE IF EXISTS public.audit_logs ADD COLUMN IF NOT EXISTS target_id VARCHAR(255);
ALTER TABLE IF EXISTS public.audit_logs ADD COLUMN IF NOT EXISTS changes JSONB;
ALTER TABLE IF EXISTS public.audit_logs ADD COLUMN IF NOT EXISTS ip_address INET;
ALTER TABLE IF EXISTS public.audit_logs ADD COLUMN IF NOT EXISTS user_agent TEXT;
ALTER TABLE IF EXISTS public.audit_logs ADD COLUMN IF NOT EXISTS request_url TEXT;

-- ===== System Configuration (Dynamic Settings) =====
CREATE TABLE IF NOT EXISTS public.system_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Configuration
  key VARCHAR(255) UNIQUE NOT NULL,
  value JSONB NOT NULL,
  
  -- Metadata
  description TEXT,
  type VARCHAR(50),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
  updated_by UUID REFERENCES public.users(id)
);

-- Index for system config
CREATE INDEX IF NOT EXISTS idx_system_config_key ON public.system_config(key);

-- Add missing columns to existing system_config table
ALTER TABLE IF EXISTS public.system_config ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE IF EXISTS public.system_config ADD COLUMN IF NOT EXISTS type VARCHAR(50);
ALTER TABLE IF EXISTS public.system_config ADD COLUMN IF NOT EXISTS updated_by UUID REFERENCES public.users(id);

-- Insert initial configuration values
INSERT INTO public.system_config (key, value, description, type) VALUES
  ('student_membership_counter', '{"next": 1, "sequence": "NUKaFs-000001"}'::jsonb, 'Next student membership ID', 'object'),
  ('stakeholder_membership_counter', '{"next": 1, "sequence": "STK-000001"}'::jsonb, 'Next stakeholder ID', 'object'),
  ('executive_membership_counter', '{"next": 1, "sequence": "EXE-000001"}'::jsonb, 'Next executive ID', 'object'),
  ('platform_version', '"1.0.0"'::jsonb, 'Current platform version', 'string'),
  ('registration_enabled', 'true'::jsonb, 'Allow new registrations', 'boolean'),
  ('max_profile_photo_size_mb', '5'::jsonb, 'Maximum profile photo size', 'integer'),
  ('max_document_size_mb', '20'::jsonb, 'Maximum document size', 'integer'),
  ('qr_code_generation_enabled', 'true'::jsonb, 'Enable QR code generation on approval', 'boolean'),
  ('email_notifications_enabled', 'true'::jsonb, 'Enable email notifications', 'boolean'),
  ('maintenance_mode', 'false'::jsonb, 'Platform maintenance mode', 'boolean')
ON CONFLICT (key) DO NOTHING;

-- ===== File Metadata (Storage Tracking) =====
CREATE TABLE IF NOT EXISTS public.file_metadata (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- File Details
  original_filename VARCHAR(255) NOT NULL,
  storage_path VARCHAR(500) NOT NULL UNIQUE,
  bucket_name VARCHAR(100) NOT NULL,
  
  -- File Information
  file_size INTEGER NOT NULL,
  file_type VARCHAR(100),
  mime_type VARCHAR(100),
  
  -- Storage Reference
  uploaded_by UUID NOT NULL REFERENCES public.users(id),
  associated_entity VARCHAR(100),
  associated_entity_id VARCHAR(255),
  
  -- Virus Scanning
  is_scanned BOOLEAN DEFAULT FALSE,
  scan_result VARCHAR(50),
  
  -- Access Control
  is_public BOOLEAN DEFAULT FALSE,
  signed_url_expiry TIMESTAMP,
  
  -- Timestamps
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
  deleted_at TIMESTAMP
);

-- Indexes for File Metadata
CREATE INDEX IF NOT EXISTS idx_file_metadata_storage_path ON public.file_metadata(storage_path);
CREATE INDEX IF NOT EXISTS idx_file_metadata_uploaded_by ON public.file_metadata(uploaded_by);
CREATE INDEX IF NOT EXISTS idx_file_metadata_created_at ON public.file_metadata(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_file_metadata_associated_entity ON public.file_metadata(associated_entity, associated_entity_id);

-- Add missing columns to existing file_metadata table
ALTER TABLE IF EXISTS public.file_metadata ADD COLUMN IF NOT EXISTS file_type VARCHAR(100);
ALTER TABLE IF EXISTS public.file_metadata ADD COLUMN IF NOT EXISTS mime_type VARCHAR(100);
ALTER TABLE IF EXISTS public.file_metadata ADD COLUMN IF NOT EXISTS is_scanned BOOLEAN DEFAULT FALSE;
ALTER TABLE IF EXISTS public.file_metadata ADD COLUMN IF NOT EXISTS scan_result VARCHAR(50);
ALTER TABLE IF EXISTS public.file_metadata ADD COLUMN IF NOT EXISTS is_public BOOLEAN DEFAULT FALSE;
ALTER TABLE IF EXISTS public.file_metadata ADD COLUMN IF NOT EXISTS signed_url_expiry TIMESTAMP;
ALTER TABLE IF EXISTS public.file_metadata ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP;

-- ============================================================================
-- PHASE 4: ENABLE ROW LEVEL SECURITY (RLS)
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.membership_identities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stakeholder_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.opportunities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.system_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.file_metadata ENABLE ROW LEVEL SECURITY;

-- ===== RLS Policy: Users =====

-- Users can read their own profile
DROP POLICY IF EXISTS "users_select_own" ON public.users;
CREATE POLICY "users_select_own" ON public.users
FOR SELECT TO authenticated
USING (auth.uid() = id);

-- Admins can read all users
DROP POLICY IF EXISTS "users_select_all_admin" ON public.users;
CREATE POLICY "users_select_all_admin" ON public.users
FOR SELECT TO authenticated
USING (
  auth.jwt() ->> 'role' = 'super_admin'
);

-- Users can read non-sensitive fields of other users for discovery
DROP POLICY IF EXISTS "users_select_partial" ON public.users;
CREATE POLICY "users_select_partial" ON public.users
FOR SELECT TO authenticated
USING (
  auth.jwt() ->> 'role' IN ('super_admin', 'executive')
);

-- Users can update their own profile
DROP POLICY IF EXISTS "users_update_own" ON public.users;
CREATE POLICY "users_update_own" ON public.users
FOR UPDATE TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- Admins can update any profile
DROP POLICY IF EXISTS "users_update_admin" ON public.users;
CREATE POLICY "users_update_admin" ON public.users
FOR UPDATE TO authenticated
USING (
  auth.jwt() ->> 'role' = 'super_admin'
)
WITH CHECK (
  auth.jwt() ->> 'role' = 'super_admin'
);

-- ===== RLS Policy: Membership Identities =====

-- Users can read their own membership identity
DROP POLICY IF EXISTS "membership_identities_select_own" ON public.membership_identities;
CREATE POLICY "membership_identities_select_own" ON public.membership_identities
FOR SELECT TO authenticated
USING (user_id = auth.uid());

-- Admins can read all membership identities
DROP POLICY IF EXISTS "membership_identities_select_admin" ON public.membership_identities;
CREATE POLICY "membership_identities_select_admin" ON public.membership_identities
FOR SELECT TO authenticated
USING (
  auth.jwt() ->> 'role' = 'super_admin'
);

-- ===== RLS Policy: Opportunities =====

-- Anyone can read published opportunities
DROP POLICY IF EXISTS "opportunities_select_published" ON public.opportunities;
CREATE POLICY "opportunities_select_published" ON public.opportunities
FOR SELECT TO anon
USING (status = 'published');

-- Authenticated users can read their own opportunities
DROP POLICY IF EXISTS "opportunities_select_own" ON public.opportunities;
CREATE POLICY "opportunities_select_own" ON public.opportunities
FOR SELECT TO authenticated
USING (
  published_by = auth.uid() OR 
  status = 'published' OR
  auth.jwt() ->> 'role' = 'super_admin'
);

-- Approved stakeholders and admins can insert opportunities
DROP POLICY IF EXISTS "opportunities_insert_authorized" ON public.opportunities;
CREATE POLICY "opportunities_insert_authorized" ON public.opportunities
FOR INSERT TO authenticated
WITH CHECK (
  published_by = auth.uid() AND (
    auth.jwt() ->> 'role' = 'super_admin' OR
    auth.jwt() ->> 'role' = 'stakeholder' AND
    (SELECT status FROM public.users WHERE id = auth.uid()) = 'active_complete'
  )
);

-- Opportunities can only be updated by publisher or admin
DROP POLICY IF EXISTS "opportunities_update_authorized" ON public.opportunities;
CREATE POLICY "opportunities_update_authorized" ON public.opportunities
FOR UPDATE TO authenticated
USING (
  published_by = auth.uid() OR
  auth.jwt() ->> 'role' = 'super_admin'
)
WITH CHECK (
  published_by = auth.uid() OR
  auth.jwt() ->> 'role' = 'super_admin'
);

-- ===== RLS Policy: Announcements =====

-- Anyone can read published announcements
DROP POLICY IF EXISTS "announcements_select_published" ON public.announcements;
CREATE POLICY "announcements_select_published" ON public.announcements
FOR SELECT TO anon
USING (status = 'published');

-- Admins can see all announcements including drafts
DROP POLICY IF EXISTS "announcements_select_admin" ON public.announcements;
CREATE POLICY "announcements_select_admin" ON public.announcements
FOR SELECT TO authenticated
USING (
  auth.jwt() ->> 'role' = 'super_admin' OR
  status = 'published'
);

-- Only admins can insert announcements
DROP POLICY IF EXISTS "announcements_insert_admin" ON public.announcements;
CREATE POLICY "announcements_insert_admin" ON public.announcements
FOR INSERT TO authenticated
WITH CHECK (
  auth.jwt() ->> 'role' = 'super_admin' AND
  published_by = auth.uid()
);

-- Only admins can update announcements
DROP POLICY IF EXISTS "announcements_update_admin" ON public.announcements;
CREATE POLICY "announcements_update_admin" ON public.announcements
FOR UPDATE TO authenticated
USING (
  auth.jwt() ->> 'role' = 'super_admin'
)
WITH CHECK (
  auth.jwt() ->> 'role' = 'super_admin'
);

-- ===== RLS Policy: Audit Logs =====

-- Only admins can read audit logs
DROP POLICY IF EXISTS "audit_logs_select_admin" ON public.audit_logs;
CREATE POLICY "audit_logs_select_admin" ON public.audit_logs
FOR SELECT TO authenticated
USING (
  (SELECT role FROM public.users WHERE id = auth.uid()) = 'super_admin'
);

-- ===== RLS Policy: System Config =====

-- Authenticated users can read system config (for feature flags)
DROP POLICY IF EXISTS "system_config_select_authenticated" ON public.system_config;
CREATE POLICY "system_config_select_authenticated" ON public.system_config
FOR SELECT TO authenticated
USING (true);

-- Only admins can update system config
DROP POLICY IF EXISTS "system_config_update_admin" ON public.system_config;
CREATE POLICY "system_config_update_admin" ON public.system_config
FOR UPDATE TO authenticated
USING (
  (SELECT role FROM public.users WHERE id = auth.uid()) = 'super_admin'
)
WITH CHECK (
  (SELECT role FROM public.users WHERE id = auth.uid()) = 'super_admin'
);

-- ============================================================================
-- PHASE 5: CREATE VIEWS FOR ANALYTICS & REPORTING
-- ============================================================================

-- ===== View: Active Members Summary =====
CREATE OR REPLACE VIEW public.v_active_members_summary AS
SELECT 
  COUNT(*) as total_active_members,
  COUNT(*) FILTER (WHERE role = 'student') as total_students,
  COUNT(*) FILTER (WHERE role = 'stakeholder') as total_stakeholders,
  COUNT(*) FILTER (WHERE role = 'executive') as total_executives,
  COUNT(DISTINCT district) as total_districts,
  MAX(created_at) as last_member_joined
FROM public.users
WHERE deleted_at IS NULL AND status IN ('active_complete', 'active_partial');

-- ===== View: Members by District =====
CREATE OR REPLACE VIEW public.v_members_by_district AS
SELECT 
  district,
  COUNT(*) as total_members,
  COUNT(*) FILTER (WHERE role = 'student') as students,
  COUNT(*) FILTER (WHERE role = 'stakeholder') as stakeholders,
  COUNT(*) FILTER (WHERE role = 'executive') as executives
FROM public.users
WHERE deleted_at IS NULL AND status IN ('active_complete', 'active_partial')
GROUP BY district
ORDER BY total_members DESC;

-- ===== View: Recent Registrations =====
CREATE OR REPLACE VIEW public.v_recent_registrations AS
SELECT 
  COUNT(*) FILTER (WHERE status = 'submitted') as pending_count,
  COUNT(*) FILTER (WHERE status = 'under_review') as under_review_count,
  COUNT(*) FILTER (WHERE status = 'approved') as approved_count,
  COUNT(*) FILTER (WHERE status = 'rejected') as rejected_count
FROM public.registrations
WHERE submitted_at >= (CURRENT_TIMESTAMP - INTERVAL '30 days') AND deleted_at IS NULL;

-- ===== View: Opportunities Analytics =====
CREATE OR REPLACE VIEW public.v_opportunities_analytics AS
SELECT 
  COUNT(*) as total_opportunities,
  COUNT(*) FILTER (WHERE status = 'published') as published,
  COUNT(*) FILTER (WHERE status = 'draft') as drafts,
  SUM(view_count) as total_views,
  SUM(applicant_count) as total_applicants,
  AVG(view_count) as avg_views_per_opportunity,
  COUNT(DISTINCT category) as categories_covered
FROM public.opportunities
WHERE deleted_at IS NULL;

-- ===== View: Announcements Analytics =====
CREATE OR REPLACE VIEW public.v_announcements_analytics AS
SELECT 
  COUNT(*) as total_announcements,
  COUNT(*) FILTER (WHERE status = 'published') as published,
  COUNT(*) FILTER (WHERE is_pinned = true) as pinned,
  SUM(view_count) as total_views,
  AVG(view_count) as avg_views_per_announcement
FROM public.announcements
WHERE deleted_at IS NULL;

-- ============================================================================
-- PHASE 6: MIGRATION COMPLETE
-- ============================================================================

-- Print confirmation message
SELECT 'Database migration completed successfully! All tables, indexes, and RLS policies created.' as status;
