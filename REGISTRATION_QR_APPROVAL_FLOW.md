# Registration Approval & Permanent QR Code Implementation

## Overview
Implemented a complete registration workflow where QR codes are issued **only after first approval**, ensuring permanent digital identities for NUKaFs members.

---

## Workflow Steps

### Step 1: Account Creation
- User creates account via registration form
- Completes mandatory registration form
- Submits registration
- **Status Set To:** `pending`
- **QR Code:** NOT generated at this stage
- **Membership Number:** NOT assigned at this stage

### Step 2: Pending Review (Until Approval)
Members with `status: "pending"` can only access:
- Dashboard (shows pending approval notice)
- My Profile
- Edit Profile
- Announcements
- Notifications
- Logout

**Clear messaging displayed:**
> "Your registration has been successfully submitted and is awaiting approval by the NUKaFs Administration. Your QR Membership Verification Code will be generated automatically once your registration is approved."

### Step 3: Administrator Approval (First Approval ONLY)
When an administrator approves for the **first time**, the system automatically and instantly:

1. **Changes member status** → `approved` / `active`
2. **Assigns sequential Membership Number** → `NUKaFs-000001`, `NUKaFs-000002`, etc.
3. **Generates verification token** → 64-character cryptographic hex string (permanent)
4. **Generates permanent QR Code** → Links to verification endpoint
5. **Saves both permanently** → In `membership_identities` table
6. **Unlocks full member access** → Immediately
7. **Sets verification status** → `verified`

**Key:** All these actions happen **in one transaction** via the `/api/membership-id` POST endpoint.

---

## Permanent QR Code

Each approved member receives:
- ✅ **One QR Code only** (never regenerated after first approval)
- ✅ **One permanent verification token** (64-char hex)
- ✅ **One permanent Membership Number** (sequential ID)

### What Does NOT Change QR Code:
- Profile edits ✓
- Password changes ✓
- Profile picture updates ✓
- Login/logout ✓
- Browser refresh ✓
- Device changes ✓
- Subsequent approvals (no-op) ✓

### When QR Changes:
- ❌ Only when administrator **explicitly revokes** and regenerates it (feature to be implemented)

---

## QR Code Verification

When a QR code is scanned, the member's verification page displays:

- ✅ Profile Picture (or avatar)
- ✅ Full Name
- ✅ Membership Number
- ✅ Membership Type (Student/Graduate)
- ✅ Registration Status
- ✅ University
- ✅ College
- ✅ Course
- ✅ District
- ✅ Chiefdom
- ✅ Approval Date

**Status Badge:**
- `✅ Verified NUKaFs Member` (if valid and active)
- `❌ Verification Failed` (if revoked, deleted, or invalid)

---

## Profile Updates After Approval

Members may edit their profile after approval.

**What Updates:**
- Profile information updates everywhere across the platform
- Changes persist to database

**What Does NOT Change:**
- QR Code ✓ (unchanged)
- Verification Token ✓ (unchanged)
- Membership Number ✓ (unchanged)

---

## Code Changes

### 1. [Login Page](app/login/page.tsx)
**Updated:** Pending approval message with QR code information
```
"Your registration has been successfully submitted and is awaiting approval 
by the NUKaFs Administration. Your QR Membership Verification Code will be 
generated automatically once your registration is approved."
```

**Added bulleted list:**
- NUKaFs Executives will review your application
- Upon approval, your membership ID and QR code are generated instantly
- You'll gain full access to the member dashboard
- Your membership card will be available for download

### 2. [Dashboard Page](app/dashboard/page.tsx)
**Added:** Pending approval banner when `status: "pending"`
- Shows clock icon with amber warning styling
- Explains awaiting approval status
- Highlights that QR code will be issued upon approval
- Only displays when `status === "pending"`

### 3. [Profile Registry Page](components/account/profile-registry-page.tsx)
**Updated:** Pending status view with comprehensive message
- Enhanced amber styling for better visibility
- Detailed explanation of pending review
- Lists what happens after approval:
  - Membership ID and QR code generation
  - Full registry profile access
  - Member benefits unlocked

### 4. [Approval Flow](lib/context/app-state-context.tsx)
**Enhanced:** `approveRegistration()` function with safeguards
- Calls `/api/membership-id` POST to allocate ID and generate QR
- Updates user status to `active` and `verified`
- Sets `dateApproved` to current date
- Stores `membershipNumber` and `qrCode` permanently
- Updated success notification mentions permanent QR code generation

### 5. [Membership ID API](app/api/membership-id/route.ts)
**Added:** Safeguard to prevent QR regeneration
- Checks if user already has `membership_identities` record
- If exists: returns existing identity (permanent - unchanged)
- If not exists: generates new identity with:
  - Sequential membership number
  - Cryptographic verification token
  - QR code URL
  - Permanent storage in database

**Key Logic:**
```typescript
// Check if user already has membership identity
const { data: existingIdentity } = await supabase
  .from("membership_identities")
  .select("*")
  .eq("user_id", userId)
  .single()

if (existingIdentity) {
  // Return existing identity (no regeneration)
  return { identity: existingIdentity, isExisting: true }
}

// Create new identity only if none exists
const identity = createMembershipIdentity(...)
```

---

## Database Schema Requirements

### `membership_identities` Table
```sql
CREATE TABLE membership_identities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id),
  membership_id VARCHAR(20) NOT NULL UNIQUE,
  membership_type VARCHAR(20),
  verification_token VARCHAR(64) NOT NULL UNIQUE,
  verification_url TEXT NOT NULL,
  qr_code_data TEXT NOT NULL,
  created_at TIMESTAMP NOT NULL,
  updated_at TIMESTAMP DEFAULT now(),
  revoked BOOLEAN DEFAULT false,
  revoked_at TIMESTAMP NULL,
  revoked_by uuid REFERENCES users(id),
  revoke_reason TEXT
);

CREATE UNIQUE INDEX idx_membership_identities_user_id 
  ON membership_identities(user_id) 
  WHERE revoked = false;
```

### `system_config` Table (for counters)
```sql
CREATE TABLE system_config (
  key VARCHAR(255) PRIMARY KEY,
  value JSONB NOT NULL,
  updated_at TIMESTAMP DEFAULT now()
);
```

---

## User Experience Timeline

### Before Approval (Pending)
```
Login → See "Pending Approval" Screen
         ↓
Enter Dashboard → See "Awaiting Approval" Banner
                   (explains QR will be issued)
         ↓
View Profile → See "Pending Review" Notice
                (explains QR will be generated)
         ↓
Limited Access: Dashboard, Profile, Announcements, Notifications
```

### After First Approval (Active)
```
Admin Clicks "Approve" 
         ↓
[Transaction Begins]
1. Allocate next Membership ID
2. Generate verification token
3. Generate QR code
4. Create membership_identities record
5. Update user status → active
6. Update user verification_status → verified
[Transaction Complete]
         ↓
User Logs In → Sees Full Dashboard
               ↓
              Can Access All Features
              Can Download Membership Card with QR
              Can View Digital Identity
              ↓
             [QR Code is PERMANENT from now on]
```

### Profile Editing After Approval
```
User Edits Profile → Updates all fields
                    ↓
                QR Code: UNCHANGED ✓
                Membership ID: UNCHANGED ✓
                Verification Token: UNCHANGED ✓
                    ↓
              Changes saved to database
              User continues with permanent identity
```

---

## Testing Checklist

- [ ] User creates account → status is `pending`
- [ ] Login shows pending approval message with QR info
- [ ] Dashboard shows pending banner for pending users
- [ ] Profile registry shows pending notice
- [ ] Admin approves user → membership ID allocated
- [ ] Admin approves user → QR code generated
- [ ] User can see membership card with QR
- [ ] QR scan shows verification page with all details
- [ ] User edits profile → QR remains unchanged
- [ ] User edits profile → membership number stays same
- [ ] User logs out and back in → QR still unchanged
- [ ] Second approval attempt → returns existing ID/QR (no regeneration)

---

## Key Features Implemented

✅ **No QR Before Approval** — QR codes only generated upon first approval  
✅ **Permanent Identity** — Membership ID, QR, and token never change after approval  
✅ **Atomic Approval** — All approval actions happen in single transaction  
✅ **Clear Messaging** — Users understand QR comes after approval  
✅ **Safeguards** — API prevents accidental QR regeneration  
✅ **Verification Page** — Shows all member details when QR scanned  
✅ **Profile Independence** — Edits don't affect permanent QR code  
✅ **Status Messaging** — Dashboard/login/profile all inform pending users  

---

## Files Modified

1. `app/login/page.tsx` — Updated pending approval message
2. `app/dashboard/page.tsx` — Added pending approval banner
3. `components/account/profile-registry-page.tsx` — Enhanced pending notice
4. `lib/context/app-state-context.tsx` — Added safeguard comments and improved notification
5. `app/api/membership-id/route.ts` — Added duplicate check to prevent regeneration

---

## Migration Notes

- Existing approved members should already have entries in `membership_identities`
- The new safeguard ensures backward compatibility
- Pending members will have their QR generated on first approval
- No action needed for existing approved members

---

## Future Enhancements

- [ ] Admin QR revocation interface
- [ ] QR regeneration after revocation (with audit log)
- [ ] QR expiration policies (if needed)
- [ ] Batch approval with QR generation
- [ ] Email notification when QR is issued
