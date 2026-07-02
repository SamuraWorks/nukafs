/**
 * Opportunities & Announcements Constants
 */

export const OPPORTUNITY_TYPES = [
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
] as const

export type OpportunityType = typeof OPPORTUNITY_TYPES[number]

export interface OpportunityFormData {
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
  publishedBy: string // userId
  publishedAt?: string
  status: "draft" | "published" | "archived" | "expired"
}

export interface Opportunity extends OpportunityFormData {
  id: string
  createdAt: string
  updatedAt: string
}

export interface AnnouncementFormData {
  title: string
  content: string
  featuredImageUrl?: string
  flyerUrl?: string
  posterUrl?: string
  pdfAttachmentUrl?: string
  externalLink?: string
  eventDate?: string
  publishedBy: string // userId (always admin)
  publishedAt?: string
  status: "draft" | "published" | "archived"
  isPinned?: boolean
}

export interface Announcement extends AnnouncementFormData {
  id: string
  createdAt: string
  updatedAt: string
}

/**
 * Media file type validation
 */
export const ALLOWED_MEDIA_TYPES = ["image/jpeg", "image/png", "application/pdf"]
export const ALLOWED_MEDIA_EXTENSIONS = [".jpg", ".jpeg", ".png", ".pdf"]
export const MAX_MEDIA_FILE_SIZE = 5 * 1024 * 1024 // 5MB

export function isValidMediaType(file: File): boolean {
  return ALLOWED_MEDIA_TYPES.includes(file.type)
}

export function isValidMediaSize(file: File): boolean {
  return file.size <= MAX_MEDIA_FILE_SIZE
}

export function getMediaValidationError(file: File): string | null {
  if (!isValidMediaType(file)) {
    return `Invalid file type. Allowed types: ${ALLOWED_MEDIA_EXTENSIONS.join(", ")}`
  }
  if (!isValidMediaSize(file)) {
    return "File size exceeds 5MB limit"
  }
  return null
}
