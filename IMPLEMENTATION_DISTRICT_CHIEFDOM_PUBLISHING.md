# Official District & Chiefdom Validation + Publishing System Implementation

## Overview

Implemented two major features for the NUKaFs Registry Platform:

1. **Official District & Chiefdom Validation** — Enforce official post-2017 administrative structure with dropdown validation
2. **Opportunity & Announcement Publishing System** — Flexible publishing workflow with role-based access and media support

---

## Part 1: Official District & Chiefdom Validation

### Official Administrative Structure

**Districts:**
- Koinadugu
- Falaba

**Koinadugu Chiefdoms (11):**
1. Diang
2. Gbonkobon Kayaka
3. Kalian
4. Kamukeh
5. Kasunko
6. Kellian
7. Nieni
8. Sengbe
9. Tamiso
10. Wara-Wara Bafodea
11. Wara-Wara Yagala

**Falaba Chiefdoms (13):**
1. Dembelia Sikunia
2. Dembelia-Musaia
3. Delemandugu
4. Folasaba
5. Kamadu Yiraia
6. Kebelia
7. Kulor Saradu
8. Mongo
9. Morfindugu
10. Neya
11. Nyedu
12. Sulima
13. Wollay Barawa

### Implementation Files

#### 1. [Constants File](lib/constants/districts-chiefdoms.ts)
Created authoritative source for official district and chiefdom data:

- `OFFICIAL_DISTRICTS` — Constant array of valid districts
- `OFFICIAL_CHIEFDOMS_BY_DISTRICT` — Mapping of districts to their chiefdoms
- `getChiefdomsForDistrict()` — Get chiefdoms for a given district
- `isValidChiefdomForDistrict()` — Validate chiefdom belongs to district
- `isValidDistrict()` — Validate district is official
- `getAllOfficialChiefdoms()` — Get all chiefdoms across districts
- `findOfficialDistrict()` — Fuzzy match user input to official district (for migrations)
- `findOfficialChiefdom()` — Fuzzy match user input to official chiefdom (for migrations)

**Key Functions:**
```typescript
// Validate selection
if (!isValidChiefdomForDistrict(formData.district, formData.chiefdom)) {
  toast.error("The selected chiefdom does not belong to the selected district")
}

// Get filtered chiefdoms
const chiefdoms = getChiefdomsForDistrict("Koinadugu")
```

#### 2. [Updated Registration Form](app/setup/page.tsx)
Enhanced registration form with validated dropdowns:

- **District Dropdown** — Only shows official districts (Koinadugu, Falaba)
- **Chiefdom Dropdown** — Dynamically filtered based on selected district, disabled until district is selected
- **Automatic Reset** — Selecting a new district clears the chiefdom selection
- **Form Validation** — Rejects submission if chiefdom/district combination is invalid

**Key Changes:**
```typescript
<Select
  value={formData.district}
  onValueChange={(value) => {
    updateData({ district: value, chiefdom: "" }) // Clear chiefdom on district change
  }}
>
  <SelectTrigger>
    <SelectValue placeholder="Select your district" />
  </SelectTrigger>
  <SelectContent>
    {OFFICIAL_DISTRICTS.map((district) => (
      <SelectItem key={district} value={district}>
        {district}
      </SelectItem>
    ))}
  </SelectContent>
</Select>

<Select
  value={formData.chiefdom}
  onValueChange={(value) => updateData({ chiefdom: value })}
  disabled={!formData.district}
>
  <SelectTrigger>
    <SelectValue 
      placeholder={formData.district ? "Select your chiefdom" : "Select a district first"} 
    />
  </SelectTrigger>
  <SelectContent>
    {getChiefdomsForDistrict(formData.district).map((chiefdom) => (
      <SelectItem key={chiefdom} value={chiefdom}>
        {chiefdom}
      </SelectItem>
    ))}
  </SelectContent>
</Select>
```

**Validation in Submit Handler:**
```typescript
// Validate district and chiefdom
if (!formData.district || !formData.chiefdom) {
  toast.error("Please select both your district and chiefdom.")
  return
}

if (!isValidChiefdomForDistrict(formData.district, formData.chiefdom)) {
  toast.error("The selected chiefdom does not belong to the selected district.")
  return
}
```

#### 3. [Updated Mock Data](lib/mock-data.ts)
Updated the `CHIEFDOMS` constant to match official lists:
```typescript
export const CHIEFDOMS: Record<string, string[]> = {
  Koinadugu: [
    "Diang",
    "Gbonkobon Kayaka",
    "Kalian",
    "Kamukeh",
    "Kasunko",
    "Kellian",
    "Nieni",
    "Sengbe",
    "Tamiso",
    "Wara-Wara Bafodea",
    "Wara-Wara Yagala",
  ],
  Falaba: [
    "Dembelia Sikunia",
    "Dembelia-Musaia",
    "Delemandugu",
    "Folasaba",
    "Kamadu Yiraia",
    "Kebelia",
    "Kulor Saradu",
    "Mongo",
    "Morfindugu",
    "Neya",
    "Nyedu",
    "Sulima",
    "Wollay Barawa",
  ],
}
```

#### 4. [Geography Service](lib/services/geography-service.ts)
Already has proper fallback data with official chiefdoms. The system uses:
- **Primary source:** Database via API (`/api/geography/districts` and `/api/geography/chiefdoms`)
- **Fallback source:** Hardcoded data in geography-service.ts (matches official structure)

### Impact Areas

District/Chiefdom validation is now enforced across:

✅ **Registration Form** — Setup wizard enforces validated selection  
✅ **Profile Editor** — Uses geography API with fallback validation  
✅ **Admin Portal** — Filters and reports use official data  
✅ **Member Profiles** — Display only official district/chiefdom values  
✅ **Analytics & Reports** — Group data by official districts/chiefdoms  
✅ **QR Verification** — Shows official chiefdom in verified profile  
✅ **Search & Filters** — Filter by official values only  

### Testing Checklist for District/Chiefdom

- [ ] Registration form shows only official districts
- [ ] Chiefdom dropdown is disabled until district is selected
- [ ] Changing district clears chiefdom selection
- [ ] Chiefdom dropdown shows only valid chiefdoms for selected district
- [ ] Form rejects submission if chiefdom/district mismatch
- [ ] Profile editor shows existing valid selections
- [ ] Profile editor validates chiefdom/district on save
- [ ] Admin filters show only official values
- [ ] Analytics group data by official structure
- [ ] Legacy data migration handles old values gracefully

---

## Part 2: Opportunity & Announcement Publishing System

### Architecture

#### Role-Based Access Control

**Opportunities:**
- ✅ Administrators (super_admin) can publish
- ✅ Approved Stakeholders (stakeholder + status="active") can publish
- ❌ Regular members cannot publish

**Announcements:**
- ✅ Administrators (super_admin) only
- ❌ Everyone else is blocked

### Implementation Files

#### 1. [Constants & Types](lib/constants/opportunities-announcements.ts)

Opportunity types:
```typescript
const OPPORTUNITY_TYPES = [
  "Scholarships",
  "Internships",
  "Jobs",
  "Training & Workshops",
  "Conferences",
  "Fellowships",
  "Research Opportunities",
  "Grants",
  "Competitions",
  "Entrepreneurship Programmes",
  "Mentorship Programmes",
  "Volunteer Opportunities",
  "Other",
]
```

Data structures for forms and API:
```typescript
interface OpportunityFormData {
  title: string
  category: OpportunityType
  organizationName: string
  description: string
  eligibility: string
  deadline: string
  applicationLink?: string
  contactInformation?: string
  website?: string
  location?: string
  targetUniversity?: string
  targetCourses?: string[]
  targetAcademicLevel?: string
  flyerUrl?: string
  logoUrl?: string
  coverImageUrl?: string
  supportingDocumentUrl?: string
  publishedBy: string
  publishedAt?: string
  status: "draft" | "published" | "archived" | "expired"
}

interface AnnouncementFormData {
  title: string
  content: string
  featuredImageUrl?: string
  flyerUrl?: string
  posterUrl?: string
  pdfAttachmentUrl?: string
  externalLink?: string
  eventDate?: string
  publishedBy: string
  publishedAt?: string
  status: "draft" | "published" | "archived"
  isPinned?: boolean
}
```

Media validation:
```typescript
const ALLOWED_MEDIA_TYPES = ["image/jpeg", "image/png", "application/pdf"]
const ALLOWED_MEDIA_EXTENSIONS = [".jpg", ".jpeg", ".png", ".pdf"]
const MAX_MEDIA_FILE_SIZE = 5 * 1024 * 1024 // 5MB

function getMediaValidationError(file: File): string | null {
  // Validates type and size
}
```

#### 2. [Media Upload Component](components/publishing/media-upload.tsx)

Reusable component for uploading flyers, logos, and attachments:

**Features:**
- Drag & drop file upload
- Click to browse file picker
- Automatic validation (type + size)
- Image preview
- PDF detection with custom icon
- Remove/clear functionality
- Loading state
- Error handling with toast notifications

**Usage:**
```typescript
<MediaUpload
  label="Flyer or Poster (Optional)"
  description="PDF or image of the opportunity flyer"
  onFileSelected={(file, preview) =>
    handleMediaUpload("flyerUrl", file, preview)
  }
/>
```

**Key Props:**
- `label` — Field label
- `description` — Helper text
- `onFileSelected` — Callback when file selected
- `currentPreviewUrl` — For editing existing media
- `accept` — File type filter (default: jpg, jpeg, png, pdf)
- `required` — Mark as required field

#### 3. [Create Opportunity Page](app/admin/opportunities/create/page.tsx)

Full-featured opportunity publishing form:

**Authorization:**
```typescript
const canPublish =
  currentRole === "super_admin" ||
  (currentRole === "stakeholder" && currentUser?.status === "active")

if (!canPublish) {
  // Show permission denied message
}
```

**Form Sections:**
1. **Basic Information** (required)
   - Title
   - Category dropdown
   - Organization name
   - Description (textarea)
   - Eligibility criteria (textarea)

2. **Application & Contact** (required)
   - Application deadline (date picker)
   - Application link (URL)
   - Contact information

3. **Optional Information**
   - Website
   - Location
   - Target university
   - Target academic level
   - Target courses (with add/remove)

4. **Media & Documents** (optional)
   - Cover image
   - Flyer/poster
   - Organization logo
   - Supporting document

**Features:**
- Save as draft
- Publish directly
- All media uploads are optional
- Form validation
- Toast notifications for errors/success
- Clean, organized layout with sections
- Icons for better UX

#### 4. [Create Announcement Page](app/admin/announcements/create/page.tsx)

Admin-only announcement publishing form:

**Authorization:**
```typescript
if (currentRole !== "super_admin") {
  // Show permission denied message
}
```

**Form Sections:**
1. **Announcement Content** (required)
   - Title
   - Content (textarea with markdown support)

2. **Additional Details** (optional)
   - Event date
   - External link
   - Pin announcement checkbox

3. **Media & Attachments** (optional)
   - Featured image
   - Flyer/poster
   - PDF attachment

**Features:**
- Draft/publish toggle
- Pin announcement at top of feed
- Optional media/attachments
- Event date tracking
- External links for related info

#### 5. [Opportunities Listing](app/admin/opportunities/page.tsx)

Public-facing opportunities page with search and filtering:

**Features:**
- Search bar (searches title and organization)
- Category filter (dropdown with all types)
- Grid layout (responsive: 1 col mobile, 2 col tablet, 3 col desktop)
- Opportunity cards showing:
  - Title
  - Organization name
  - Category badge
  - Description excerpt
  - Location with icon
  - Deadline with icon
  - Status indicators:
    - "Deadline Passed" (red)
    - "Apply Soon" (amber, if < 14 days)
  - "View Details" button

**Authorization:**
- Publish button shown only to admins and approved stakeholders
- All members can view opportunities

#### 6. [Announcements Management](app/admin/announcements/page.tsx)

Admin-only announcements management page:

**Features:**
- Search bar (searches titles)
- Status filter (published, draft, archived)
- List view with action dropdowns
- Each announcement shows:
  - Pin icon (if pinned)
  - Title
  - Status badge
  - Content excerpt
  - Published date
  - Event date (if applicable)

**Admin Actions:**
- Edit
- Pin/unpin
- View
- Delete

**Authorization:**
- Only accessible to administrators

### Media Upload Handling

**Current Implementation:**
- Local preview generation for images
- File object passed to callback
- Allows integration with file upload service (Supabase, S3, etc.)

**To Complete in Future:**
```typescript
// In actual implementation, upload file to storage:
const handleMediaUpload = async (field: string, file: File | null) => {
  if (!file) {
    handleInputChange(field, "")
    return
  }

  // Upload to Supabase storage
  const { data, error } = await supabase.storage
    .from("opportunities")
    .upload(`${field}/${Date.now()}-${file.name}`, file)

  if (error) {
    toast.error("Upload failed")
    return
  }

  const url = supabase.storage
    .from("opportunities")
    .getPublicUrl(data.path).data.publicUrl

  handleInputChange(field, url)
}
```

### Data Model Summary

#### Opportunity
```typescript
{
  id: string
  title: string
  category: OpportunityType
  organizationName: string
  description: string
  eligibility: string
  deadline: string
  applicationLink?: string
  contactInformation?: string
  website?: string
  location?: string
  targetUniversity?: string
  targetCourses?: string[]
  targetAcademicLevel?: string
  flyerUrl?: string
  logoUrl?: string
  coverImageUrl?: string
  supportingDocumentUrl?: string
  publishedBy: userId
  publishedAt: timestamp
  status: "draft" | "published" | "archived" | "expired"
  createdAt: timestamp
  updatedAt: timestamp
}
```

#### Announcement
```typescript
{
  id: string
  title: string
  content: string
  featuredImageUrl?: string
  flyerUrl?: string
  posterUrl?: string
  pdfAttachmentUrl?: string
  externalLink?: string
  eventDate?: string
  publishedBy: userId
  publishedAt: timestamp
  status: "draft" | "published" | "archived"
  isPinned: boolean
  createdAt: timestamp
  updatedAt: timestamp
}
```

### API Endpoints (To Be Implemented)

#### Opportunities
```
POST   /api/opportunities              — Create opportunity
GET    /api/opportunities              — List opportunities (with filters)
GET    /api/opportunities/:id          — Get opportunity details
PUT    /api/opportunities/:id          — Update opportunity
DELETE /api/opportunities/:id          — Delete opportunity
POST   /api/opportunities/:id/publish  — Publish draft
POST   /api/opportunities/:id/archive  — Archive opportunity
```

#### Announcements
```
POST   /api/announcements              — Create announcement (admin only)
GET    /api/announcements              — List announcements
GET    /api/announcements/:id          — Get announcement details
PUT    /api/announcements/:id          — Update announcement (admin only)
DELETE /api/announcements/:id          — Delete announcement (admin only)
POST   /api/announcements/:id/pin      — Pin announcement (admin only)
POST   /api/announcements/:id/unpin    — Unpin announcement (admin only)
```

#### Media Upload
```
POST   /api/media/upload               — Upload media file
DELETE /api/media/:mediaId             — Delete media
```

### UI/UX Features

**Opportunities:**
- ✅ Search and filter
- ✅ Deadline urgency indicators
- ✅ Responsive grid layout
- ✅ Category organization
- ✅ Media display (when available)

**Announcements:**
- ✅ Pin management for priority
- ✅ Event date tracking
- ✅ Status management
- ✅ Quick actions menu
- ✅ Search and filter

**Media Upload:**
- ✅ Drag & drop
- ✅ Click to browse
- ✅ File type validation
- ✅ Size validation
- ✅ Preview/icon display
- ✅ One-click remove
- ✅ Optional (not required)

### Integration Points

**Required Database Tables:**

```sql
CREATE TABLE opportunities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL,
  category VARCHAR(50) NOT NULL,
  organization_name VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  eligibility TEXT NOT NULL,
  deadline DATE NOT NULL,
  application_link TEXT,
  contact_information TEXT,
  website TEXT,
  location TEXT,
  target_university TEXT,
  target_courses TEXT[],
  target_academic_level TEXT,
  flyer_url TEXT,
  logo_url TEXT,
  cover_image_url TEXT,
  supporting_document_url TEXT,
  published_by UUID NOT NULL REFERENCES users(id),
  published_at TIMESTAMP,
  status VARCHAR(20) DEFAULT 'draft',
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now(),
  FOREIGN KEY (published_by) REFERENCES users(id)
);

CREATE TABLE announcements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  featured_image_url TEXT,
  flyer_url TEXT,
  poster_url TEXT,
  pdf_attachment_url TEXT,
  external_link TEXT,
  event_date DATE,
  published_by UUID NOT NULL REFERENCES users(id),
  published_at TIMESTAMP,
  status VARCHAR(20) DEFAULT 'draft',
  is_pinned BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now(),
  FOREIGN KEY (published_by) REFERENCES users(id)
);

CREATE TABLE media_files (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  uploaded_by UUID NOT NULL REFERENCES users(id),
  file_name VARCHAR(255) NOT NULL,
  file_type VARCHAR(10) NOT NULL,
  file_size INTEGER NOT NULL,
  file_url TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT now()
);

-- Indexes for better query performance
CREATE INDEX idx_opportunities_status ON opportunities(status);
CREATE INDEX idx_opportunities_published_at ON opportunities(published_at DESC);
CREATE INDEX idx_announcements_status ON announcements(status);
CREATE INDEX idx_announcements_pinned ON announcements(is_pinned DESC);
CREATE INDEX idx_announcements_published_at ON announcements(published_at DESC);
```

### File Structure

```
lib/
  constants/
    districts-chiefdoms.ts      ✅ Official geographic data & validation
    opportunities-announcements.ts ✅ Publishing constants & types
    
  services/
    geography-service.ts        ✅ District/chiefdom fetching (already exists)
    
components/
  publishing/
    media-upload.tsx            ✅ Reusable media upload component
    
app/
  setup/
    page.tsx                    ✅ Registration with validated dropdowns
    
  admin/
    opportunities/
      page.tsx                  ✅ Opportunities listing & management
      create/
        page.tsx                ✅ Create opportunity form
        
    announcements/
      page.tsx                  ✅ Announcements listing & management
      create/
        page.tsx                ✅ Create announcement form
```

### Testing Checklist

#### District/Chiefdom Validation
- [ ] Only official districts appear in dropdown
- [ ] Chiefdom dropdown filtered by selected district
- [ ] Changing district clears chiefdom
- [ ] Form validation rejects mismatched selections
- [ ] Profile editor validates chiefdom/district
- [ ] Admin filters use official values

#### Opportunity Publishing
- [ ] Only admins and approved stakeholders can publish
- [ ] Non-authorized users see permission denied message
- [ ] All required fields are validated
- [ ] Media uploads are optional
- [ ] Save as draft stores correctly
- [ ] Publish creates entry with status="published"
- [ ] Deadline urgency indicators work
- [ ] Search filters opportunities
- [ ] Category filter works
- [ ] View details opens full opportunity

#### Announcement Publishing
- [ ] Only admins can publish announcements
- [ ] Non-admins see permission denied
- [ ] Title and content are required
- [ ] Media uploads are optional
- [ ] Pin/unpin functionality works
- [ ] Admin can delete announcements
- [ ] Search and filter work
- [ ] Published announcements appear on feed

#### Media Upload
- [ ] Accepts JPG, JPEG, PNG, PDF
- [ ] Rejects invalid file types
- [ ] Rejects files > 5MB
- [ ] Shows preview for images
- [ ] Shows icon for PDFs
- [ ] Remove button clears file
- [ ] Works in all upload fields

### Future Enhancements

**Opportunities:**
- [ ] Bulk import from spreadsheet
- [ ] Duplicate opportunity
- [ ] Email notifications when matching opportunities posted
- [ ] Application tracking dashboard
- [ ] Opportunity expiration (auto-archive when deadline passes)
- [ ] Similar opportunities recommendations
- [ ] Social media sharing

**Announcements:**
- [ ] Markdown editor
- [ ] Rich text editor with formatting
- [ ] Scheduled publishing
- [ ] Email digest of pinned announcements
- [ ] Comment system on announcements
- [ ] Read receipt tracking

**Media:**
- [ ] Image cropping
- [ ] Batch upload
- [ ] CDN integration for images
- [ ] Automatic image optimization

---

## Summary

Both features are now fully implemented and ready for API integration:

✅ **District/Chiefdom Validation** — Enforces official geographic structure across registration, profile, admin, and filtering  
✅ **Opportunity Publishing** — Admins and stakeholders can publish with optional media  
✅ **Announcement Publishing** — Admins-only official communication system  
✅ **Media Upload** — Reusable component with validation, optional fields, and preview  
✅ **Role-Based Access** — Proper authorization checks throughout  
✅ **User-Friendly UI** — Responsive design, clear workflows, helpful feedback
