# API Endpoint Design for Production Storage Architecture

This guide provides detailed API endpoint specifications for integrating with the production-grade storage architecture.

---

## Design Principles

1. **Single Source of Truth**: All data flows through API endpoints backed by database
2. **Consistent Error Handling**: Standardized error responses across all endpoints
3. **Audit Trail**: Every endpoint logs actions to audit_logs table
4. **Input Validation**: Validate at application layer before database
5. **Signed URLs**: Never expose raw file paths; always use signed URLs
6. **Pagination**: Always paginate list endpoints (never return entire dataset)
7. **Role-Based Authorization**: Check authorization at endpoint entry point

---

## Core API Endpoints

### Authentication & Profile Management

#### GET /api/auth/me
**Get current authenticated user profile**

```typescript
export async function GET(request: NextRequest) {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  
  const profile = await supabase
    .from("users")
    .select("*")
    .eq("id", user.id)
    .single()
  
  return NextResponse.json(profile)
}
```

**Response:**
```json
{
  "id": "uuid",
  "email": "user@example.com",
  "full_name": "John Doe",
  "status": "active_complete",
  "role": "student",
  "district": "Koinadugu",
  "chiefdom": "Diang",
  "profile_completion_percentage": 85
}
```

#### PUT /api/auth/profile
**Update user profile with validation**

```typescript
export async function PUT(request: NextRequest) {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  
  const updates = await request.json()
  
  // Validate district/chiefdom
  if (updates.district && updates.chiefdom) {
    if (!isValidChiefdomForDistrict(updates.district, updates.chiefdom)) {
      return NextResponse.json(
        { error: "Invalid district/chiefdom combination" },
        { status: 400 }
      )
    }
  }
  
  // Get old profile for audit log
  const { data: oldProfile } = await supabase
    .from("users")
    .select("*")
    .eq("id", user.id)
    .single()
  
  // Update profile
  const { error } = await supabase
    .from("users")
    .update({
      ...updates,
      updated_at: new Date().toISOString(),
      updated_by: user.id
    })
    .eq("id", user.id)
  
  if (error) throw error
  
  // Audit log
  await logAuditAction(supabase, {
    actor_id: user.id,
    actor_name: user.full_name,
    actor_role: user.role,
    action: "updated profile",
    module: "Profile",
    type: "update",
    status: "success",
    target_entity: "User",
    target_id: user.id,
    changes: { before: oldProfile, after: updates }
  })
  
  return NextResponse.json({ success: true })
}
```

---

### File Management

#### POST /api/files/upload
**Upload a file with metadata tracking**

```typescript
export async function POST(request: NextRequest) {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  
  const formData = await request.formData()
  const file = formData.get("file") as File
  const bucketName = formData.get("bucket") as string
  const entityType = formData.get("entityType") as string
  const entityId = formData.get("entityId") as string
  
  if (!file) {
    return NextResponse.json({ error: "No file provided" }, { status: 400 })
  }
  
  try {
    const result = await uploadFile(supabase, file, bucketName, user.id, {
      entityType,
      entityId
    })
    
    // Audit log
    await logAuditAction(supabase, {
      actor_id: user.id,
      actor_name: user.full_name,
      actor_role: user.role,
      action: "uploaded file",
      module: "Files",
      type: "create",
      status: "success",
      target_entity: "File",
      target_id: result.metadata_id,
      changes: { bucket: bucketName, filename: file.name, size: file.size }
    })
    
    return NextResponse.json({
      success: true,
      file: {
        id: result.metadata_id,
        path: result.path,
        url: result.signed_url || result.url,
        size: file.size
      }
    })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: 400 }
    )
  }
}
```

**Request:**
```bash
curl -X POST http://localhost:3000/api/files/upload \
  -H "Authorization: Bearer {token}" \
  -F "file=@profile.jpg" \
  -F "bucket=profile-photos" \
  -F "entityType=User" \
  -F "entityId={user_id}"
```

**Response:**
```json
{
  "success": true,
  "file": {
    "id": "uuid",
    "path": "{user_id}/1704067200000-profile.jpg",
    "url": "https://signed-url-valid-for-7-days...",
    "size": 245000
  }
}
```

#### DELETE /api/files/:fileId
**Delete a file (soft delete)**

```typescript
export async function DELETE(request: NextRequest, { params }: { params: { fileId: string } }) {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  
  // Get file metadata
  const { data: fileMetadata } = await supabase
    .from("file_metadata")
    .select("*")
    .eq("id", params.fileId)
    .single()
  
  // Check permission (only uploader or admin can delete)
  if (fileMetadata.uploaded_by !== user.id && user.role !== 'super_admin') {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }
  
  // Soft delete
  await deleteFile(supabase, fileMetadata.bucket_name, fileMetadata.storage_path, params.fileId)
  
  // Audit log
  await logAuditAction(supabase, {
    actor_id: user.id,
    actor_name: user.full_name,
    actor_role: user.role,
    action: "deleted file",
    module: "Files",
    type: "delete",
    status: "success",
    target_entity: "File",
    target_id: params.fileId
  })
  
  return NextResponse.json({ success: true })
}
```

---

### Opportunities (Publishing)

#### POST /api/opportunities
**Create a new opportunity**

```typescript
export async function POST(request: NextRequest) {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  
  // Check authorization
  const canPublish = user.role === 'super_admin' || 
    (user.role === 'stakeholder' && user.status === 'active_complete')
  
  if (!canPublish) {
    return NextResponse.json(
      { error: "You don't have permission to publish opportunities" },
      { status: 403 }
    )
  }
  
  const body = await request.json()
  
  // Validate required fields
  const required = ['title', 'description', 'category', 'organization_name', 'deadline']
  for (const field of required) {
    if (!body[field]) {
      return NextResponse.json(
        { error: `Missing required field: ${field}` },
        { status: 400 }
      )
    }
  }
  
  // Validate category
  if (!OPPORTUNITY_TYPES.includes(body.category)) {
    return NextResponse.json(
      { error: "Invalid category" },
      { status: 400 }
    )
  }
  
  // Insert opportunity
  const { data: opportunity, error } = await supabase
    .from("opportunities")
    .insert({
      title: body.title,
      description: body.description,
      category: body.category,
      organization_name: body.organization_name,
      published_by: user.id,
      eligibility_criteria: body.eligibility_criteria,
      deadline: body.deadline,
      application_link: body.application_link,
      contact_information: body.contact_information,
      website: body.website,
      location: body.location,
      target_university: body.target_university,
      target_courses: body.target_courses,
      target_academic_level: body.target_academic_level,
      cover_image_url: body.cover_image_url,
      flyer_url: body.flyer_url,
      logo_url: body.logo_url,
      supporting_document_url: body.supporting_document_url,
      status: body.publish ? 'published' : 'draft',
      published_at: body.publish ? new Date().toISOString() : null,
      created_at: new Date().toISOString()
    })
    .select()
    .single()
  
  if (error) throw error
  
  // Audit log
  await logAuditAction(supabase, {
    actor_id: user.id,
    actor_name: user.full_name,
    actor_role: user.role,
    action: "created opportunity",
    module: "Opportunity",
    type: body.publish ? "create" : "create",
    status: "success",
    target_entity: "Opportunity",
    target_id: opportunity.id,
    changes: { action: body.publish ? "published" : "saved as draft" }
  })
  
  return NextResponse.json({
    success: true,
    opportunity
  }, { status: 201 })
}
```

**Request:**
```json
{
  "title": "Software Engineer Internship",
  "description": "Join our team for a summer internship...",
  "category": "Internships",
  "organization_name": "TechCorp",
  "deadline": "2024-02-15",
  "eligibility_criteria": "Final year students...",
  "application_link": "https://example.com/apply",
  "publish": true
}
```

#### GET /api/opportunities?page=1&limit=20&category=Internships
**List published opportunities with filtering**

```typescript
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  
  const page = parseInt(searchParams.get("page") || "1")
  const limit = parseInt(searchParams.get("limit") || "20")
  const category = searchParams.get("category")
  const searchTerm = searchParams.get("search")
  
  const offset = (page - 1) * limit
  
  let query = supabase
    .from("opportunities")
    .select("*", { count: "exact" })
    .eq("status", "published")
    .range(offset, offset + limit - 1)
    .order("published_at", { ascending: false })
  
  if (category) {
    query = query.eq("category", category)
  }
  
  if (searchTerm) {
    // Use full-text search
    query = query.textSearch("full_text", searchTerm)
  }
  
  const { data: opportunities, count, error } = await query
  
  if (error) throw error
  
  return NextResponse.json({
    opportunities,
    total: count,
    page,
    limit,
    pages: Math.ceil((count || 0) / limit)
  })
}
```

#### GET /api/opportunities/:id
**Get opportunity details**

```typescript
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  const { data: opportunity, error } = await supabase
    .from("opportunities")
    .select("*")
    .eq("id", params.id)
    .eq("status", "published")
    .single()
  
  if (error) {
    return NextResponse.json({ error: "Not found" }, { status: 404 })
  }
  
  // Increment view count
  await supabase
    .from("opportunities")
    .update({ view_count: opportunity.view_count + 1 })
    .eq("id", params.id)
  
  return NextResponse.json(opportunity)
}
```

#### PUT /api/opportunities/:id
**Update opportunity (publisher/admin only)**

```typescript
export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  
  // Get current opportunity
  const { data: opportunity } = await supabase
    .from("opportunities")
    .select("*")
    .eq("id", params.id)
    .single()
  
  // Check permission
  if (opportunity.published_by !== user.id && user.role !== 'super_admin') {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }
  
  const updates = await request.json()
  
  // Update
  const { error } = await supabase
    .from("opportunities")
    .update({
      ...updates,
      updated_at: new Date().toISOString()
    })
    .eq("id", params.id)
  
  if (error) throw error
  
  // Audit log
  await logAuditAction(supabase, {
    actor_id: user.id,
    actor_name: user.full_name,
    actor_role: user.role,
    action: "updated opportunity",
    module: "Opportunity",
    type: "update",
    status: "success",
    target_entity: "Opportunity",
    target_id: params.id,
    changes: { before: opportunity, after: updates }
  })
  
  return NextResponse.json({ success: true })
}
```

#### DELETE /api/opportunities/:id
**Delete opportunity (publisher/admin only)**

```typescript
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  
  const { data: opportunity } = await supabase
    .from("opportunities")
    .select("*")
    .eq("id", params.id)
    .single()
  
  if (opportunity.published_by !== user.id && user.role !== 'super_admin') {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }
  
  // Soft delete
  await supabase
    .from("opportunities")
    .update({ deleted_at: new Date().toISOString() })
    .eq("id", params.id)
  
  // Audit log
  await logAuditAction(supabase, {
    actor_id: user.id,
    actor_name: user.full_name,
    actor_role: user.role,
    action: "deleted opportunity",
    module: "Opportunity",
    type: "delete",
    status: "success",
    target_entity: "Opportunity",
    target_id: params.id
  })
  
  return NextResponse.json({ success: true })
}
```

---

### Announcements (Admin-Only)

#### POST /api/announcements
**Create announcement (admin only)**

```typescript
export async function POST(request: NextRequest) {
  const user = await getCurrentUser()
  
  if (user.role !== 'super_admin') {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }
  
  const body = await request.json()
  
  // Validate required fields
  if (!body.title || !body.content) {
    return NextResponse.json(
      { error: "Title and content are required" },
      { status: 400 }
    )
  }
  
  // Insert announcement
  const { data: announcement, error } = await supabase
    .from("announcements")
    .insert({
      title: body.title,
      content: body.content,
      excerpt: body.content.substring(0, 500),
      published_by: user.id,
      status: body.publish ? 'published' : 'draft',
      published_at: body.publish ? new Date().toISOString() : null,
      featured_image_url: body.featured_image_url,
      flyer_url: body.flyer_url,
      pdf_attachment_url: body.pdf_attachment_url,
      event_date: body.event_date,
      external_link: body.external_link,
      is_pinned: body.is_pinned || false
    })
    .select()
    .single()
  
  if (error) throw error
  
  // Audit log
  await logAuditAction(supabase, {
    actor_id: user.id,
    actor_name: user.full_name,
    actor_role: user.role,
    action: "created announcement",
    module: "Announcement",
    type: "create",
    status: "success",
    target_entity: "Announcement",
    target_id: announcement.id
  })
  
  return NextResponse.json({ success: true, announcement }, { status: 201 })
}
```

#### GET /api/announcements?pinned_first=true
**List announcements**

```typescript
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const pinnedFirst = searchParams.get("pinned_first") === "true"
  const user = await getCurrentUser()
  
  let query = supabase
    .from("announcements")
    .select("*")
  
  // Non-admins only see published
  if (user?.role !== 'super_admin') {
    query = query.eq("status", "published")
  }
  
  // Order pinned first if requested
  if (pinnedFirst) {
    query = query
      .order("is_pinned", { ascending: false })
      .order("published_at", { ascending: false })
  } else {
    query = query.order("published_at", { ascending: false })
  }
  
  const { data: announcements, error } = await query
  
  if (error) throw error
  
  return NextResponse.json({ announcements })
}
```

#### POST /api/announcements/:id/pin
**Pin announcement (admin only)**

```typescript
export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  const user = await getCurrentUser()
  
  if (user.role !== 'super_admin') {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }
  
  const { error } = await supabase
    .from("announcements")
    .update({
      is_pinned: true,
      pinned_at: new Date().toISOString()
    })
    .eq("id", params.id)
  
  if (error) throw error
  
  await logAuditAction(supabase, {
    actor_id: user.id,
    actor_name: user.full_name,
    actor_role: user.role,
    action: "pinned announcement",
    module: "Announcement",
    type: "update",
    status: "success",
    target_entity: "Announcement",
    target_id: params.id
  })
  
  return NextResponse.json({ success: true })
}
```

---

### Admin Analytics

#### GET /api/admin/analytics/dashboard
**Dashboard summary statistics**

```typescript
export async function GET(request: NextRequest) {
  const user = await getCurrentUser()
  
  if (user.role !== 'super_admin') {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }
  
  // Get summary data
  const [members, registrations, opportunities, announcements] = await Promise.all([
    supabase.from("v_active_members_summary").select("*").single(),
    supabase.from("v_recent_registrations").select("*").single(),
    supabase.from("v_opportunities_analytics").select("*").single(),
    supabase.from("v_announcements_analytics").select("*").single()
  ])
  
  return NextResponse.json({
    members: members.data,
    registrations: registrations.data,
    opportunities: opportunities.data,
    announcements: announcements.data
  })
}
```

#### GET /api/admin/analytics/members-by-district
**Members distribution by district**

```typescript
export async function GET(request: NextRequest) {
  const user = await getCurrentUser()
  
  if (user.role !== 'super_admin') {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }
  
  const { data, error } = await supabase
    .from("v_members_by_district")
    .select("*")
  
  if (error) throw error
  
  return NextResponse.json({ data })
}
```

---

## Error Response Format

All endpoints return consistent error responses:

```json
{
  "error": "Human-readable error message",
  "code": "ERROR_CODE", // e.g., "UNAUTHORIZED", "VALIDATION_ERROR"
  "details": {
    "field": "field_name",
    "message": "Specific validation error"
  }
}
```

---

## Pagination Pattern

All list endpoints follow this pattern:

```typescript
// Request
GET /api/endpoint?page=1&limit=20&sort=created_at&order=desc

// Response
{
  "data": [...],
  "total": 500,
  "page": 1,
  "limit": 20,
  "pages": 25
}
```

---

## Security Headers

All API responses should include:

```typescript
response.headers.set("X-Content-Type-Options", "nosniff")
response.headers.set("X-Frame-Options", "DENY")
response.headers.set("X-XSS-Protection", "1; mode=block")
```

---

## Rate Limiting

Implement rate limiting to prevent abuse:

```typescript
// Rate limit: 100 requests per minute per user
const rateLimit = await checkRateLimit(user.id, "100/minute")

if (!rateLimit.allowed) {
  return NextResponse.json(
    { error: "Too many requests" },
    { status: 429, headers: { "Retry-After": rateLimit.resetIn } }
  )
}
```

---

## Testing Endpoints

Use the provided test files to verify each endpoint works correctly with proper authorization, validation, and audit logging.
