// ============================================================================
// NUKAFS Registry — Mock Data Layer (Frontend Phase One)
// ----------------------------------------------------------------------------
// This file centralises all simulated data so the UI looks fully functional
// without a backend. Replace these exports with real data fetching (e.g.
// Supabase queries) later — the component layer only depends on the shapes
// declared here, so the swap should require minimal changes.
// ============================================================================

export type MembershipStatus = "active" | "pending" | "expired" | "suspended" | "inactive" | "revoked"
export type MembershipIdentityStatus = "active" | "revoked" | "expired" | "inactive"
export type RequestStatus = "pending" | "approved" | "rejected"
export type Role = "student" | "executive" | "stakeholder" | "super_admin"

export interface Student {
  id: string
  membershipNumber: string
  fullName: string
  email: string
  phone: string
  gender: "Male" | "Female"
  district: "Koinadugu" | "Falaba"
  chiefdom: string
  university: string
  course: string
  department: string
  level: string
  status: MembershipStatus
  profileCompletion: number
  joinedDate: string
  avatarColor: string
  profilePhoto?: string
  employmentStatus: "Employed" | "Unemployed" | "Self-employed" | "Student"
  skills: string[]
  scholarshipApplicant: boolean
  membershipId?: string
  qrCode?: string
  qrCodeStatus?: MembershipIdentityStatus
  dateIssued?: string
  isMigratedToDigitalRegistry?: boolean
  legacyMembershipHistory?: string
}

export const DISTRICTS = ["Koinadugu", "Falaba"] as const

export const CHIEFDOMS: Record<string, string[]> = {
  Koinadugu: ["Wara Wara Yagala", "Sengbe", "Diang", "Neya", "Nieni", "Mongo", "Sulima"],
  Falaba: ["Dembelia Sinkunia", "Folosaba Dembelia", "Kabala", "Sinkunia", "Gberia Fotombu"],
}

export const UNIVERSITIES = [
  "Fourah Bay College (USL)",
  "Njala University",
  "Institute of Public Administration (IPAM)",
  "Ernest Bai Koroma University",
  "Eastern Technical University",
  "Milton Margai Technical University",
  "Limkokwing University",
]

export const COURSES = [
  "Computer Science",
  "Medicine & Surgery",
  "Law",
  "Economics",
  "Agriculture",
  "Civil Engineering",
  "Nursing",
  "Education",
  "Accounting & Finance",
  "Public Administration",
]

export const DEPARTMENTS = [
  "Science & Technology",
  "Health Sciences",
  "Social Sciences",
  "Engineering",
  "Arts & Humanities",
  "Business & Management",
  "Agriculture",
]

export const LEVELS = ["Year 1", "Year 2", "Year 3", "Year 4", "Postgraduate"]

const AVATAR_COLORS = [
  "oklch(0.52 0.12 158)",
  "oklch(0.62 0.1 200)",
  "oklch(0.72 0.13 85)",
  "oklch(0.55 0.13 25)",
  "oklch(0.45 0.06 280)",
]

const FIRST_NAMES = [
  "Aminata", "Mohamed", "Fatmata", "Ibrahim", "Isatu", "Abubakarr", "Mariama", "Sahr",
  "Kadiatu", "Alusine", "Hawa", "Foday", "Zainab", "Santigie", "Adama", "Brima",
  "Memuna", "Tamba", "Salamatu", "Lansana",
]
const LAST_NAMES = [
  "Kamara", "Sesay", "Conteh", "Bangura", "Koroma", "Mansaray", "Turay", "Jalloh",
  "Fofanah", "Marrah", "Samura", "Dumbuya", "Kargbo", "Daboh", "Sankoh", "Bah",
]

function pick<T>(arr: readonly T[], i: number): T {
  return arr[i % arr.length]
}

function buildMembershipIdentity(index: number) {
  const sequence = (index + 1).toString().padStart(6, "0")
  return {
    membershipId: `NUKAFS-${sequence}`,
    qrCode: `NUKAFS-QR-${sequence}`,
    qrCodeStatus: "active" as MembershipIdentityStatus,
    dateIssued: `2026-01-${String((index % 28) + 1).padStart(2, "0")}`,
    isMigratedToDigitalRegistry: index > 36,
    legacyMembershipHistory: index > 36 ? "Migrated from legacy union records" : "Registered in the digital registry",
  }
}

function makeStudents(count: number): Student[] {
  const students: Student[] = []
  for (let i = 0; i < count; i++) {
    const first = pick(FIRST_NAMES, i * 3 + 1)
    const last = pick(LAST_NAMES, i * 5 + 2)
    const district = i % 3 === 0 ? "Falaba" : "Koinadugu"
    const statusPool: MembershipStatus[] = ["active", "active", "active", "pending", "expired", "suspended"]
    const identity = buildMembershipIdentity(i)
    students.push({
      id: `stu_${(1000 + i).toString()}`,
      membershipNumber: `NUKAFS-${(2024).toString()}-${(1000 + i).toString()}`,
      fullName: `${first} ${last}`,
      email: `${first.toLowerCase()}.${last.toLowerCase()}@student.edu.sl`,
      phone: `+232 ${76 + (i % 10)} ${(100000 + i * 137).toString().slice(0, 6)}`,
      gender: i % 2 === 0 ? "Male" : "Female",
      district,
      chiefdom: pick(CHIEFDOMS[district], i),
      university: pick(UNIVERSITIES, i),
      course: pick(COURSES, i * 2),
      department: pick(DEPARTMENTS, i),
      level: pick(LEVELS, i),
      status: pick(statusPool, i),
      profileCompletion: [100, 100, 85, 60, 40, 100][i % 6],
      joinedDate: `2024-${String((i % 12) + 1).padStart(2, "0")}-${String((i % 27) + 1).padStart(2, "0")}`,
      avatarColor: pick(AVATAR_COLORS, i),
      employmentStatus: pick(["Student", "Unemployed", "Self-employed", "Employed", "Student"] as const, i),
      skills: pick(
        [
          ["Web Development", "Data Analysis"],
          ["Public Speaking", "Leadership"],
          ["Graphic Design", "Marketing"],
          ["Research", "Writing"],
          ["Accounting", "Microsoft Excel"],
        ],
        i,
      ),
      scholarshipApplicant: i % 4 === 0,
      membershipId: identity.membershipId,
      qrCode: identity.qrCode,
      qrCodeStatus: identity.qrCodeStatus,
      dateIssued: identity.dateIssued,
      isMigratedToDigitalRegistry: identity.isMigratedToDigitalRegistry,
      legacyMembershipHistory: identity.legacyMembershipHistory,
    })
  }
  return students
}

export const students: Student[] = makeStudents(48)

// The "current" logged-in student used across the student dashboard.
export const currentStudent: Student = {
  id: "stu_self",
  membershipNumber: "NUKAFS-2024-0420",
  fullName: "Aminata Kamara",
  email: "aminata.kamara@student.edu.sl",
  phone: "+232 76 482 905",
  gender: "Female",
  district: "Koinadugu",
  chiefdom: "Wara Wara Yagala",
  university: "Fourah Bay College (USL)",
  course: "Computer Science",
  department: "Science & Technology",
  level: "Year 3",
  status: "active",
  profileCompletion: 85,
  joinedDate: "2024-02-14",
  avatarColor: "oklch(0.52 0.12 158)",
  employmentStatus: "Student",
  skills: ["Web Development", "Data Analysis", "Public Speaking"],
  scholarshipApplicant: true,
  membershipId: "NUKAFS-000420",
  qrCode: "NUKAFS-QR-000420",
  qrCodeStatus: "active",
  dateIssued: "2026-02-14",
  isMigratedToDigitalRegistry: false,
  legacyMembershipHistory: "Registered in the digital registry",
}

// ---------------------------------------------------------------------------
// Announcements
// ---------------------------------------------------------------------------
export interface Announcement {
  id: string
  title: string
  body: string
  category: "General" | "Academic" | "Event" | "Urgent" | "Opportunity"
  author: string
  date: string
  pinned?: boolean
}

export const announcements: Announcement[] = [
  {
    id: "ann_1",
    title: "2024/2025 Membership Renewal Now Open",
    body: "All returning members are required to renew their membership before the end of the semester. Renewal keeps your access to scholarships, internships and the digital membership card active.",
    category: "Urgent",
    author: "Executive Council",
    date: "2024-09-02",
    pinned: true,
  },
  {
    id: "ann_2",
    title: "Annual General Meeting — Kabala Town Hall",
    body: "The NUKAFS Annual General Meeting will take place at the Kabala Town Hall. All members are encouraged to attend as we elect new executives and review the year's achievements.",
    category: "Event",
    author: "General Secretary",
    date: "2024-08-28",
  },
  {
    id: "ann_3",
    title: "New Partnership with Njala University Scholarship Fund",
    body: "We are pleased to announce a new partnership that will provide ten full-tuition scholarships to deserving members from Koinadugu and Falaba districts.",
    category: "Opportunity",
    author: "Scholarship Committee",
    date: "2024-08-20",
  },
  {
    id: "ann_4",
    title: "Academic Mentorship Programme Applications",
    body: "Senior members in the science and engineering departments can now apply to mentor first-year students. This is a great leadership opportunity.",
    category: "Academic",
    author: "Academic Affairs",
    date: "2024-08-12",
  },
  {
    id: "ann_5",
    title: "Update Your Contact Information",
    body: "Please ensure your phone number and email are up to date so you do not miss important opportunities and announcements.",
    category: "General",
    author: "Registry Office",
    date: "2024-08-05",
  },
]

// ---------------------------------------------------------------------------
// Opportunities: scholarships, internships, jobs, leadership
// ---------------------------------------------------------------------------
export interface Opportunity {
  id: string
  title: string
  organization: string
  type: "Scholarship" | "Internship" | "Job" | "Leadership"
  location: string
  deadline: string
  amount?: string
  tags: string[]
  description: string
}

export const opportunities: Opportunity[] = [
  {
    id: "opp_1",
    title: "Full Tuition Undergraduate Scholarship",
    organization: "Njala University Scholarship Fund",
    type: "Scholarship",
    location: "Njala Campus",
    deadline: "2024-10-15",
    amount: "Full Tuition",
    tags: ["Undergraduate", "Need-based"],
    description: "Covers full tuition for the academic year for members from Koinadugu and Falaba with strong academic records.",
  },
  {
    id: "opp_2",
    title: "Software Engineering Internship",
    organization: "Orange SL Digital",
    type: "Internship",
    location: "Freetown",
    deadline: "2024-10-01",
    tags: ["Tech", "3 months", "Paid"],
    description: "Hands-on internship for computer science and engineering students to work on real telecom products.",
  },
  {
    id: "opp_3",
    title: "Community Health Outreach Officer",
    organization: "Ministry of Health & Sanitation",
    type: "Job",
    location: "Kabala",
    deadline: "2024-09-25",
    tags: ["Health", "Full-time"],
    description: "Entry-level role for nursing and public health graduates to support rural health campaigns.",
  },
  {
    id: "opp_4",
    title: "STEM Bursary for Female Students",
    organization: "NUKAFS Women in Science",
    type: "Scholarship",
    location: "All Campuses",
    deadline: "2024-11-05",
    amount: "Le 5,000,000",
    tags: ["Women", "STEM"],
    description: "A bursary supporting female members pursuing science, technology, engineering and mathematics.",
  },
  {
    id: "opp_5",
    title: "Regional Youth Coordinator",
    organization: "NUKAFS Executive Council",
    type: "Leadership",
    location: "Koinadugu",
    deadline: "2024-09-30",
    tags: ["Leadership", "Volunteer"],
    description: "Lead community engagement and member mobilisation activities across the Koinadugu district.",
  },
  {
    id: "opp_6",
    title: "Agriculture Research Assistant",
    organization: "Njala Agricultural Research Centre",
    type: "Internship",
    location: "Njala",
    deadline: "2024-10-20",
    tags: ["Agriculture", "Research", "Paid"],
    description: "Support ongoing crop research projects. Open to agriculture and science students.",
  },
]

// ---------------------------------------------------------------------------
// Events
// ---------------------------------------------------------------------------
export interface NUKAFSEvent {
  id: string
  title: string
  date: string
  time: string
  location: string
  description: string
  status: "upcoming" | "past"
  attendees: number
}

export const events: NUKAFSEvent[] = [
  {
    id: "evt_1",
    title: "NUKAFS Annual General Meeting",
    date: "2024-10-12",
    time: "10:00 AM",
    location: "Kabala Town Hall",
    description: "Yearly gathering to elect executives and review progress.",
    status: "upcoming",
    attendees: 220,
  },
  {
    id: "evt_2",
    title: "Career & Scholarship Fair",
    date: "2024-10-26",
    time: "9:00 AM",
    location: "Fourah Bay College",
    description: "Meet employers and scholarship providers from across Sierra Leone.",
    status: "upcoming",
    attendees: 340,
  },
  {
    id: "evt_3",
    title: "Leadership Bootcamp",
    date: "2024-11-09",
    time: "8:30 AM",
    location: "Njala University",
    description: "A two-day intensive on leadership and community organising.",
    status: "upcoming",
    attendees: 80,
  },
  {
    id: "evt_4",
    title: "Freshers' Welcome Ceremony",
    date: "2024-03-15",
    time: "2:00 PM",
    location: "IPAM Auditorium",
    description: "Welcoming new members into the union.",
    status: "past",
    attendees: 410,
  },
  {
    id: "evt_5",
    title: "Community Clean-up Drive",
    date: "2024-05-04",
    time: "7:00 AM",
    location: "Kabala Township",
    description: "Members volunteered to clean public spaces in Kabala.",
    status: "past",
    attendees: 130,
  },
]

// ---------------------------------------------------------------------------
// Profile update / edit requests
// ---------------------------------------------------------------------------
export interface EditRequest {
  id: string
  studentName: string
  membershipNumber: string
  field: string
  oldValue: string
  newValue: string
  status: RequestStatus
  submittedDate: string
  reviewedDate?: string
  reason: string
}

export const editRequests: EditRequest[] = [
  {
    id: "req_1",
    studentName: "Aminata Kamara",
    membershipNumber: "NUKAFS-2024-0420",
    field: "Phone Number",
    oldValue: "+232 76 482 905",
    newValue: "+232 78 904 112",
    status: "pending",
    submittedDate: "2024-09-01",
    reason: "Changed mobile network provider.",
  },
  {
    id: "req_2",
    studentName: "Aminata Kamara",
    membershipNumber: "NUKAFS-2024-0420",
    field: "Level",
    oldValue: "Year 2",
    newValue: "Year 3",
    status: "approved",
    submittedDate: "2024-07-18",
    reviewedDate: "2024-07-20",
    reason: "Promoted to next academic year.",
  },
  {
    id: "req_3",
    studentName: "Aminata Kamara",
    membershipNumber: "NUKAFS-2024-0420",
    field: "Course",
    oldValue: "Information Technology",
    newValue: "Computer Science",
    status: "rejected",
    submittedDate: "2024-05-02",
    reviewedDate: "2024-05-06",
    reason: "Requested correction of programme name. Rejected: provide official transcript.",
  },
]

export interface PendingRegistration {
  id: string
  name?: string
  fullName: string
  email: string
  phone: string
  district: string
  submittedDate: string
  status?: "pending" | "approved" | "rejected"
  role?: "student" | "graduate" | "stakeholder"
  profile?: Record<string, unknown>
  university?: string
  department?: string
  course?: string
  level?: string
  employmentStatus?: string
}

export const pendingRegistrations: PendingRegistration[] = [
  { id: "pr_1", fullName: "Sahr Mansaray", email: "sahr.mansaray@student.edu.sl", phone: "+232 77 201 884", district: "Koinadugu", submittedDate: "2024-09-03", status: "pending" },
  { id: "pr_2", fullName: "Mariama Jalloh", email: "mariama.jalloh@student.edu.sl", phone: "+232 76 553 210", district: "Falaba", submittedDate: "2024-09-03", status: "pending" },
  { id: "pr_3", fullName: "Ibrahim Sesay", email: "ibrahim.sesay@student.edu.sl", phone: "+232 78 110 459", district: "Koinadugu", submittedDate: "2024-09-02", status: "pending" },
  { id: "pr_4", fullName: "Hawa Conteh", email: "hawa.conteh@student.edu.sl", phone: "+232 79 884 002", district: "Koinadugu", submittedDate: "2024-09-01", status: "pending" },
  { id: "pr_5", fullName: "Foday Turay", email: "foday.turay@student.edu.sl", phone: "+232 76 332 771", district: "Falaba", submittedDate: "2024-08-31", status: "pending" },
]

// ---------------------------------------------------------------------------
// Admin: executives, stakeholders, roles, audit log
// ---------------------------------------------------------------------------
export interface TeamMember {
  id: string
  name: string
  email: string
  role: Role
  title: string
  status: "active" | "invited" | "disabled"
  lastActive: string
}

export const teamMembers: TeamMember[] = [
  { id: "tm_1", name: "Alusine Bangura", email: "president@NUKAFS.org", role: "super_admin", title: "President", status: "active", lastActive: "2 hours ago" },
  { id: "tm_2", name: "Fatmata Koroma", email: "secretary@NUKAFS.org", role: "executive", title: "General Secretary", status: "active", lastActive: "1 hour ago" },
  { id: "tm_3", name: "Mohamed Sesay", email: "finance@NUKAFS.org", role: "executive", title: "Financial Secretary", status: "active", lastActive: "5 hours ago" },
  { id: "tm_4", name: "Isatu Bah", email: "academic@NUKAFS.org", role: "executive", title: "Academic Affairs Officer", status: "active", lastActive: "Yesterday" },
  { id: "tm_5", name: "Dr. Brima Sankoh", email: "patron@njala.edu.sl", role: "stakeholder", title: "University Patron", status: "active", lastActive: "3 days ago" },
  { id: "tm_6", name: "Hon. Adama Marrah", email: "partner@health.gov.sl", role: "stakeholder", title: "Government Partner", status: "invited", lastActive: "—" },
]

export interface AuditEntry {
  id: string
  actor: string
  action: string
  target: string
  timestamp: string
  type: "create" | "update" | "delete" | "approve" | "login"
}

export const auditLog: AuditEntry[] = [
  { id: "log_1", actor: "Fatmata Koroma", action: "approved registration", target: "Sahr Mansaray", timestamp: "2024-09-03 14:22", type: "approve" },
  { id: "log_2", actor: "Mohamed Sesay", action: "updated profile field", target: "NUKAFS-2024-0412", timestamp: "2024-09-03 11:05", type: "update" },
  { id: "log_3", actor: "Alusine Bangura", action: "added executive", target: "Isatu Bah", timestamp: "2024-09-02 16:40", type: "create" },
  { id: "log_4", actor: "Fatmata Koroma", action: "rejected edit request", target: "REQ-3091", timestamp: "2024-09-02 09:18", type: "delete" },
  { id: "log_5", actor: "Isatu Bah", action: "signed in", target: "Executive Dashboard", timestamp: "2024-09-02 08:55", type: "login" },
  { id: "log_6", actor: "Mohamed Sesay", action: "published announcement", target: "Membership Renewal", timestamp: "2024-09-01 19:30", type: "create" },
]

// ---------------------------------------------------------------------------
// Aggregated analytics (derived-style mock data for charts)
// ---------------------------------------------------------------------------
export const stats = {
  totalMembers: 2480,
  activeMembers: 1986,
  pendingRegistrations: pendingRegistrations.length,
  scholarshipsAwarded: 64,
  universities: UNIVERSITIES.length,
  events: events.length,
}

export const membersByUniversity = [
  { name: "Fourah Bay College", value: 620 },
  { name: "Njala University", value: 540 },
  { name: "IPAM", value: 410 },
  { name: "Ernest Bai Koroma", value: 320 },
  { name: "Eastern Technical", value: 240 },
  { name: "Milton Margai", value: 210 },
  { name: "Limkokwing", value: 140 },
]

export const membersByCourse = [
  { name: "Computer Science", value: 320 },
  { name: "Education", value: 290 },
  { name: "Nursing", value: 260 },
  { name: "Economics", value: 240 },
  { name: "Law", value: 190 },
  { name: "Agriculture", value: 180 },
  { name: "Engineering", value: 160 },
]

export const membersByDepartment = [
  { name: "Science & Technology", value: 480 },
  { name: "Health Sciences", value: 420 },
  { name: "Social Sciences", value: 390 },
  { name: "Business & Management", value: 360 },
  { name: "Engineering", value: 310 },
  { name: "Arts & Humanities", value: 280 },
  { name: "Agriculture", value: 240 },
]

export const membersByLevel = [
  { name: "Year 1", value: 720 },
  { name: "Year 2", value: 640 },
  { name: "Year 3", value: 520 },
  { name: "Year 4", value: 410 },
  { name: "Postgraduate", value: 190 },
]

export const membersByGender = [
  { name: "Male", value: 1340 },
  { name: "Female", value: 1140 },
]

export const membersByDistrict = [
  { name: "Koinadugu", value: 1560 },
  { name: "Falaba", value: 920 },
]

export const membersByChiefdom = [
  { name: "Wara Wara Yagala", value: 320 },
  { name: "Sengbe", value: 280 },
  { name: "Dembelia Sinkunia", value: 240 },
  { name: "Diang", value: 210 },
  { name: "Mongo", value: 180 },
  { name: "Nieni", value: 160 },
  { name: "Sulima", value: 140 },
]

export const registrationTrend = [
  { month: "Jan", members: 120 },
  { month: "Feb", members: 180 },
  { month: "Mar", members: 240 },
  { month: "Apr", members: 210 },
  { month: "May", members: 300 },
  { month: "Jun", members: 280 },
  { month: "Jul", members: 360 },
  { month: "Aug", members: 420 },
  { month: "Sep", members: 370 },
]

export const employmentStats = [
  { name: "Student", value: 1480 },
  { name: "Unemployed", value: 520 },
  { name: "Self-employed", value: 290 },
  { name: "Employed", value: 190 },
]

export const topSkills = [
  { name: "Web Development", value: 320 },
  { name: "Public Speaking", value: 280 },
  { name: "Data Analysis", value: 240 },
  { name: "Graphic Design", value: 190 },
  { name: "Research", value: 170 },
  { name: "Accounting", value: 150 },
]

export const scholarshipRequests = [
  { month: "Apr", requests: 40, approved: 18 },
  { month: "May", requests: 62, approved: 28 },
  { month: "Jun", requests: 54, approved: 24 },
  { month: "Jul", requests: 78, approved: 36 },
  { month: "Aug", requests: 92, approved: 41 },
  { month: "Sep", requests: 70, approved: 30 },
]

export const testimonials = [
  {
    name: "Sahr Mansaray",
    role: "Computer Science, FBC",
    quote: "NUKAFS Registry made it simple to find a scholarship that paid my full tuition. Everything is in one place.",
  },
  {
    name: "Mariama Jalloh",
    role: "Nursing, Njala University",
    quote: "I got my internship through the opportunities board. The digital membership card is so professional.",
  },
  {
    name: "Ibrahim Sesay",
    role: "Law, IPAM",
    quote: "Being part of a verified registry connected me with mentors and leaders from my home district.",
  },
]

export const faqs = [
  {
    q: "Who can register with NUKAFS Registry?",
    a: "Any tertiary student who hails from the Koinadugu or Falaba districts of Sierra Leone is eligible to register and become a member.",
  },
  {
    q: "Why does my account need approval?",
    a: "To keep the registry trustworthy, every registration is verified and approved by the Executive Council before you can complete your profile.",
  },
  {
    q: "Is there a membership fee?",
    a: "Registration is free. Some optional programmes and events may have a small contribution, which is always communicated in advance.",
  },
  {
    q: "How do I access scholarships and internships?",
    a: "Once your profile is complete and approved, the Opportunities board unlocks scholarships, internships, jobs and leadership roles.",
  },
  {
    q: "Can I update my information after submitting?",
    a: "Yes. Your profile is locked after submission for integrity, but you can raise a Profile Update Request that an executive will review.",
  },
]
