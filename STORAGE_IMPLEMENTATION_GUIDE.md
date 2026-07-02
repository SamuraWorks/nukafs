# Production Storage Architecture - Implementation Guide

## Overview

This guide provides step-by-step instructions to implement the production-grade storage and data architecture for the NUKaFs Registry Platform. The architecture is designed to scale from hundreds to 1,000,000+ users while maintaining security, performance, and data integrity.

---

## Part 1: Database Setup

### Step 1: Run Database Migration

1. **Open Supabase Dashboard**
   - Navigate to your Supabase project
   - Go to SQL Editor

2. **Execute Migration Script**
   - Copy the entire contents of `scripts/001_create_database_schema.sql`
   - Paste into the SQL Editor
   - Click "Run"
   - **Important**: Run the entire script at once, not individual statements

3. **Verify Creation**
   - Check "Explorer" panel to see all new tables
   - Verify indexes are created (look for index names in each table)
   - Verify RLS policies are enabled (should see policies in each table's settings)

### What Gets Created

✅ **Core Tables:**
- `users` - Member profiles (with soft delete, audit fields)
- `membership_identities` - Permanent QR codes (one per user)
- `registrations` - Pending applications queue
- `districts` & `chiefdoms` - Official geographic data

✅ **Publishing Tables:**
- `stakeholder_profiles` - Extended stakeholder info
- `opportunities` - Job/scholarship postings
- `announcements` - Official communications

✅ **Infrastructure Tables:**
- `audit_logs` - Complete action trail (immutable)
- `system_config` - Dynamic settings & counters
- `file_metadata` - Storage file tracking

✅ **Indexes:**
- Single-column indexes for fast filtering
- Composite indexes for common multi-condition queries
- Full-text search indexes for name/content search
- Soft delete aware indexes (WHERE deleted_at IS NULL)

✅ **Security:**
- Row Level Security (RLS) enabled on all tables
- Role-based access policies (student, executive, stakeholder, super_admin)
- Public read for published opportunities/announcements
- Private read for personal data

✅ **Initial Data:**
- Official districts: Koinadugu (11 chiefdoms), Falaba (13 chiefdoms)
- System configuration counters for membership ID generation
- Feature flags for email, QR codes, maintenance mode

---

## Part 2: Storage Bucket Setup

### Step 2: Configure Storage Buckets

The app already has storage bucket configuration in `lib/supabase/storage-config.ts`. You need to ensure buckets are created:

1. **Run Bucket Initialization**
   - This happens automatically on app startup via `initializeStorageBuckets()`
   - Check server logs to confirm buckets are created

2. **Or Manually Create Buckets in Supabase Dashboard**

   Go to **Storage** → **New Bucket** for each:

   | Bucket Name | Public | Purpose |
   |-----------|--------|---------|
   | `profile-photos` | No | User profile pictures |
   | `membership-documents` | No | Certificates, diplomas |
   | `opportunity-media` | No | Opportunity images, flyers, PDFs |
   | `announcement-media` | No | Announcement images, PDFs |
   | `qr-codes` | No | Generated QR code images |
   | `exports-reports` | No | CSV/PDF exports |
   | `backups` | No | Database backups |

3. **Set Bucket Policies (RLS for Storage)**

   For each **private bucket**, add read/write policies:

   ```sql
   -- Policy: Users can read their own files
   CREATE POLICY "users_read_own_files" ON storage.objects
   FOR SELECT TO authenticated
   USING (
     bucket_id = 'profile-photos' AND
     (storage.foldername(name))[1] = auth.uid()::text
   );

   -- Policy: Users can upload their own files
   CREATE POLICY "users_upload_own_files" ON storage.objects
   FOR INSERT TO authenticated
   WITH CHECK (
     bucket_id = 'profile-photos' AND
     (storage.foldername(name))[1] = auth.uid()::text
   );

   -- Policy: Admins can read all files
   CREATE POLICY "admins_read_all_files" ON storage.objects
   FOR SELECT TO authenticated
   USING (
     bucket_id IN ('profile-photos', 'membership-documents', 'opportunity-media', 'announcement-media', 'qr-codes') AND
     (SELECT role FROM public.users WHERE id = auth.uid()) = 'super_admin'
   );
   ```

### Bucket Path Structure

```
profile-photos/
  ├── {user_id}/
  │   ├── 1704067200000-profile.jpg
  │   └── 1704153600000-updated.png

membership-documents/
  ├── {user_id}/
  │   ├── certificates/
  │   │   ├── 1704067200000-bachelor-degree.pdf
  │   │   └── 1704153600000-masters-certificate.pdf
  │   └── credentials/
  │       └── 1704240000000-transcript.pdf

opportunity-media/
  ├── {opportunity_id}/
  │   ├── covers/
  │   │   └── 1704067200000-banner.jpg
  │   ├── flyers/
  │   │   └── 1704067200000-flyer.pdf
  │   ├── logos/
  │   │   └── 1704067200000-org-logo.png
  │   └── documents/
  │       └── 1704067200000-requirements.pdf

announcement-media/
  ├── {announcement_id}/
  │   ├── featured/
  │   │   └── 1704067200000-banner.jpg
  │   ├── flyers/
  │   │   └── 1704067200000-flyer.pdf
  │   └── attachments/
  │       └── 1704067200000-details.pdf

qr-codes/
  ├── {user_id}/
  │   ├── NUKaFs-000001.png
  │   └── NUKaFs-000002.png

exports-reports/
  ├── reports/
  │   ├── 2024-01-15/
  │   │   ├── members-export-admin1.csv
  │   │   └── opportunities-report-admin1.xlsx
  │   └── 2024-01-16/
  │       └── analytics-report-admin1.pdf

backups/
  ├── daily/
  │   ├── 2024-01-15-full.sql.gz
  │   └── 2024-01-16-full.sql.gz
  ├── monthly/
  │   └── 2024-01-full.sql.gz
  └── yearly/
      └── 2024-full.sql.gz
```

---

## Part 3: Security Implementation

### Step 3: Implement Audit Logging

Create a helper function to log all user actions:

**File: `lib/services/audit-service.ts`**

```typescript
import { createClient } from "@supabase/supabase-js"

export interface AuditLogEntry {
  actor_id: string
  actor_name: string
  actor_role: string
  action: string
  module: string
  type: "create" | "read" | "update" | "delete" | "approve" | "reject" | "archive" | "login" | "logout" | "export" | "other"
  status: "success" | "failure" | "pending"
  target_entity: string
  target_id: string
  changes?: Record<string, any>
  error_message?: string
  ip_address?: string
  user_agent?: string
  request_url?: string
}

export async function logAuditAction(
  supabase: ReturnType<typeof createClient>,
  entry: AuditLogEntry
): Promise<void> {
  try {
    const { error } = await supabase
      .from("audit_logs")
      .insert({
        actor_id: entry.actor_id,
        actor_name: entry.actor_name,
        actor_role: entry.actor_role,
        action: entry.action,
        module: entry.module,
        type: entry.type,
        status: entry.status,
        target_entity: entry.target_entity,
        target_id: entry.target_id,
        changes: entry.changes ? JSON.stringify(entry.changes) : null,
        error_message: entry.error_message,
        ip_address: entry.ip_address,
        user_agent: entry.user_agent,
        request_url: entry.request_url,
      })

    if (error) {
      console.error("Failed to log audit action:", error)
    }
  } catch (err) {
    console.error("Error in audit logging:", err)
  }
}
```

**Usage in API Routes:**

```typescript
// In /app/api/profile/route.ts
export async function PUT(request: NextRequest) {
  try {
    const { userId, profile } = await request.json()
    const user = await getCurrentUser(userId)

    // Get old values for comparison
    const { data: oldUser } = await supabase
      .from("users")
      .select("*")
      .eq("id", userId)
      .single()

    // Update user
    const { error } = await supabase
      .from("users")
      .update(profile)
      .eq("id", userId)

    // Log the change
    await logAuditAction(supabase, {
      actor_id: user.id,
      actor_name: user.full_name,
      actor_role: user.role,
      action: "updated profile",
      module: "Profile",
      type: "update",
      status: error ? "failure" : "success",
      target_entity: "User",
      target_id: userId,
      changes: {
        before: oldUser,
        after: profile,
      },
      error_message: error?.message,
      ip_address: request.headers.get("x-forwarded-for") || undefined,
      user_agent: request.headers.get("user-agent") || undefined,
      request_url: request.url,
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
```

### Step 4: Implement Soft Delete Handler

**File: `lib/services/soft-delete-service.ts`**

```typescript
export async function softDeleteUser(
  supabase: ReturnType<typeof createClient>,
  userId: string,
  adminId: string
): Promise<void> {
  // Soft delete the user
  const { error } = await supabase
    .from("users")
    .update({
      deleted_at: new Date().toISOString(),
      status: "deleted",
      updated_at: new Date().toISOString(),
      updated_by: adminId,
    })
    .eq("id", userId)

  if (error) throw error

  // Log the deletion
  await logAuditAction(supabase, {
    actor_id: adminId,
    action: "deleted user",
    module: "User",
    type: "delete",
    status: "success",
    target_entity: "User",
    target_id: userId,
  })
}

// Permanent delete after retention period (e.g., 30 days)
export async function permanentlyDeleteUser(
  supabase: ReturnType<typeof createClient>,
  userId: string
): Promise<void> {
  const retentionDays = 30
  const cutoffDate = new Date()
  cutoffDate.setDate(cutoffDate.getDate() - retentionDays)

  const { error } = await supabase
    .from("users")
    .delete()
    .eq("id", userId)
    .lt("deleted_at", cutoffDate.toISOString())

  if (error) throw error
}

// Restore soft-deleted user
export async function restoreUser(
  supabase: ReturnType<typeof createClient>,
  userId: string,
  adminId: string
): Promise<void> {
  const { error } = await supabase
    .from("users")
    .update({
      deleted_at: null,
      status: "active_complete",
      updated_at: new Date().toISOString(),
      updated_by: adminId,
    })
    .eq("id", userId)

  if (error) throw error
}
```

---

## Part 4: Implementing File Uploads with Metadata

### Step 5: Create File Upload Helper

**File: `lib/services/file-upload-service.ts`**

```typescript
import { SupabaseClient } from "@supabase/supabase-js"
import { STORAGE_BUCKETS } from "@/lib/supabase/storage-config"

export interface UploadResult {
  path: string
  url: string
  signed_url?: string
  metadata_id: string
}

export async function uploadFile(
  supabase: SupabaseClient,
  file: File,
  bucketName: string,
  userId: string,
  options?: {
    entityType?: string
    entityId?: string
    isPublic?: boolean
  }
): Promise<UploadResult> {
  const bucket = STORAGE_BUCKETS[bucketName as keyof typeof STORAGE_BUCKETS]
  if (!bucket) throw new Error(`Unknown bucket: ${bucketName}`)

  // Validate file
  if (file.size > bucket.maxSizeMB * 1024 * 1024) {
    throw new Error(`File exceeds ${bucket.maxSizeMB}MB limit`)
  }
  if (!bucket.allowedMimeTypes.includes(file.type)) {
    throw new Error(`File type not allowed`)
  }

  // Generate storage path
  const timestamp = Date.now()
  const path = `${userId}/${timestamp}-${file.name}`

  // Upload to storage
  const { data, error } = await supabase.storage
    .from(bucketName)
    .upload(path, file, { upsert: false })

  if (error) throw error

  // Generate signed URL (if private bucket)
  let signedUrl: string | undefined
  if (!bucket.public) {
    const { data: signedData, error: signedError } = await supabase.storage
      .from(bucketName)
      .createSignedUrl(path, 7 * 24 * 60 * 60) // 7 days

    if (!signedError) signedUrl = signedData?.signedUrl
  }

  // Record metadata in database
  const { data: metadata, error: metadataError } = await supabase
    .from("file_metadata")
    .insert({
      original_filename: file.name,
      storage_path: path,
      bucket_name: bucketName,
      file_size: file.size,
      file_type: file.type.split("/")[1],
      mime_type: file.type,
      uploaded_by: userId,
      associated_entity: options?.entityType,
      associated_entity_id: options?.entityId,
      is_public: options?.isPublic ?? false,
      signed_url_expiry: signedUrl ? new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) : null,
    })
    .select()
    .single()

  if (metadataError) throw metadataError

  return {
    path,
    url: data.path,
    signed_url: signedUrl,
    metadata_id: metadata.id,
  }
}

export async function deleteFile(
  supabase: SupabaseClient,
  bucketName: string,
  filePath: string,
  metadataId: string
): Promise<void> {
  // Delete from storage
  const { error: storageError } = await supabase.storage
    .from(bucketName)
    .remove([filePath])

  if (storageError) throw storageError

  // Soft delete metadata record
  const { error: metadataError } = await supabase
    .from("file_metadata")
    .update({ deleted_at: new Date().toISOString() })
    .eq("id", metadataId)

  if (metadataError) throw metadataError
}

export async function getSignedUrl(
  supabase: SupabaseClient,
  bucketName: string,
  filePath: string,
  expirySeconds: number = 3600
): Promise<string> {
  const { data, error } = await supabase.storage
    .from(bucketName)
    .createSignedUrl(filePath, expirySeconds)

  if (error) throw error
  return data.signedUrl
}
```

---

## Part 5: Analytics Queries

### Step 6: Create Useful Analytics Queries

**Dashboard Query: Active Members by District**

```sql
SELECT 
  d.name as district,
  COUNT(u.id) as total_members,
  COUNT(u.id) FILTER (WHERE u.role = 'student') as students,
  COUNT(u.id) FILTER (WHERE u.role = 'stakeholder') as stakeholders,
  COUNT(u.id) FILTER (WHERE u.role = 'executive') as executives,
  COUNT(DISTINCT u.chiefdom) as chiefdoms_represented,
  MAX(u.created_at) as last_member_joined
FROM public.users u
JOIN public.districts d ON d.name = u.district
WHERE u.deleted_at IS NULL AND u.status IN ('active_complete', 'active_partial')
GROUP BY d.name
ORDER BY total_members DESC;
```

**Registration Approval Rate (Last 30 Days)**

```sql
SELECT 
  COUNT(*) FILTER (WHERE status = 'approved') as approved,
  COUNT(*) FILTER (WHERE status = 'rejected') as rejected,
  COUNT(*) FILTER (WHERE status = 'submitted') as pending,
  ROUND(
    COUNT(*) FILTER (WHERE status = 'approved')::numeric / 
    NULLIF(COUNT(*), 0) * 100, 2
  ) as approval_rate_percent
FROM public.registrations
WHERE submitted_at >= (CURRENT_TIMESTAMP - INTERVAL '30 days')
  AND deleted_at IS NULL;
```

**Opportunity Performance**

```sql
SELECT 
  id,
  title,
  organization_name,
  category,
  view_count,
  applicant_count,
  ROUND(applicant_count::numeric / NULLIF(view_count, 0) * 100, 2) as conversion_rate,
  CASE 
    WHEN deadline < CURRENT_DATE THEN 'Expired'
    WHEN deadline < (CURRENT_DATE + INTERVAL '7 days') THEN 'Closing Soon'
    ELSE 'Active'
  END as status_label
FROM public.opportunities
WHERE status = 'published' AND deleted_at IS NULL
ORDER BY view_count DESC
LIMIT 20;
```

**Audit Log: User Activity Summary**

```sql
SELECT 
  a.actor_id,
  a.actor_name,
  a.actor_role,
  COUNT(*) as total_actions,
  COUNT(*) FILTER (WHERE a.type = 'login') as logins,
  COUNT(*) FILTER (WHERE a.type = 'create') as items_created,
  COUNT(*) FILTER (WHERE a.type = 'update') as items_updated,
  MAX(a.created_at) as last_activity
FROM public.audit_logs a
WHERE a.created_at >= (CURRENT_TIMESTAMP - INTERVAL '30 days')
GROUP BY a.actor_id, a.actor_name, a.actor_role
ORDER BY total_actions DESC;
```

---

## Part 6: Scaling to 1M+ Users

### Optimization Checklist

- [ ] **Partition audit_logs by month** to keep queries fast
- [ ] **Set up read replicas** for analytics queries
- [ ] **Implement caching** (Redis/Upstash) for frequently accessed data
- [ ] **Archive old audit logs** (> 1 year) to cold storage
- [ ] **Configure storage lifecycle** (delete exports after 30 days)
- [ ] **Monitor slow queries** and add indexes incrementally
- [ ] **Use connection pooling** (PgBouncer) for thousands of concurrent users
- [ ] **Implement batch operations** for bulk imports
- [ ] **Set up CDN** for static files (profile photos, QR codes)
- [ ] **Compress old data** before archival

### Database Maintenance

**Weekly:**
- Check for unused indexes
- Monitor slow query log
- Review error logs for failed operations

**Monthly:**
- Run VACUUM ANALYZE on all tables
- Check index fragmentation
- Review backup status

**Quarterly:**
- Archive old audit logs (> 90 days)
- Review table sizes and growth
- Test disaster recovery procedure

---

## Verification Checklist

### After Running Migration

- [ ] All 10 tables created (users, memberships, registrations, districts, chiefdoms, stakeholder_profiles, opportunities, announcements, audit_logs, system_config, file_metadata)
- [ ] All indexes created
- [ ] RLS policies enabled on all tables
- [ ] Initial data inserted (districts, chiefdoms, system_config)
- [ ] Buckets created in Storage

### After Deploying Code

- [ ] Audit logging working (check audit_logs table after user action)
- [ ] File uploads saving metadata (check file_metadata table)
- [ ] Soft deletes working (verify deleted_at field populated)
- [ ] RLS policies working (users can only see their own data)
- [ ] Analytics views returning data

### Before Going Live

- [ ] Test with 10K+ mock users
- [ ] Run load testing (concurrent user simulation)
- [ ] Verify backup/restore procedure
- [ ] Test disaster recovery
- [ ] Review security policies
- [ ] Test with real file uploads

---

## Troubleshooting

**Issue: "Permission denied" when querying tables**

→ Check RLS policies. Make sure authenticated user is inserted in `users` table with correct role.

**Issue: Signed URLs expiring too quickly**

→ Adjust expiry time in `getSignedUrl()`. Default is 1 hour; increase if needed.

**Issue: Files not uploading**

→ Check bucket policies and file size/type restrictions in `STORAGE_BUCKETS`.

**Issue: Audit logs not being recorded**

→ Make sure `logAuditAction()` is being called in all API routes. Check for permission errors.

**Issue: Slow queries when searching users**

→ Rebuild full-text search index: `REINDEX INDEX idx_users_full_text;`

---

## Next Steps

1. ✅ Run database migration
2. ✅ Create storage buckets
3. ✅ Implement audit logging in all API routes
4. ✅ Implement file upload helpers
5. ✅ Update API endpoints to track changes
6. ✅ Set up admin analytics dashboard
7. ✅ Test with staging data (1K+ users)
8. ✅ Deploy to production
9. ✅ Monitor performance
10. ✅ Plan for scaling (read replicas, partitioning)
