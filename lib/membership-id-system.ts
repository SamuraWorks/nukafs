/**
 * Production Membership ID & QR Code Generation System
 *
 * This module implements:
 * - Sequential Membership IDs (NUKaFs-000001, NUKaFs-000002, etc.)
 * - Sequential Stakeholder IDs (STK-000001, STK-000002, etc.)
 * - Permanent QR Codes with secure verification tokens
 * - Permanent identity for all users (never regenerated)
 */

import crypto from "crypto"

/**
 * Types
 */
export type MembershipPrefix = "NUKaFs" | "STK"

export interface MembershipIdentity {
  membershipId: string
  memberId?: string
  membershipType: "student" | "stakeholder"
  verificationToken: string
  verificationUrl: string
  qrCodeData: string
  createdAt: string
}

/**
 * Generate next sequential Membership ID from counter
 * 
 * @param sequence - Sequential number from database counter (1, 2, 3...)
 * @returns Formatted membership ID like NUKaFs-000001
 */
export function generateMembershipId(sequence: number): string {
  if (sequence < 1) {
    throw new Error("Sequence number must be >= 1")
  }
  const padded = String(sequence).padStart(6, "0")
  return `NUKaFs-${padded}`
}

/**
 * Generate next sequential Stakeholder ID from counter
 * 
 * @param sequence - Sequential number from database counter (1, 2, 3...)
 * @returns Formatted stakeholder ID like STK-000001
 */
export function generateStakeholderId(sequence: number): string {
  if (sequence < 1) {
    throw new Error("Sequence number must be >= 1")
  }
  const padded = String(sequence).padStart(6, "0")
  return `STK-${padded}`
}

/**
 * Generate cryptographically secure verification token
 * Used for QR code verification links
 * 
 * @returns 32-byte hex string token
 */
export function generateVerificationToken(): string {
  return crypto.randomBytes(32).toString("hex")
}

/**
 * Generate QR code data from verification token
 * QR codes encode the verification URL, not the membership ID
 * 
 * @param verificationToken - The secure token
 * @param origin - Base URL (default: https://your-domain.com)
 * @returns QR code data string (URL)
 */
export function generateQrCodeData(
  verificationToken: string,
  origin: string = "https://registry.nukafs-sl.org"
): string {
  return `${origin}/verify/${verificationToken}`
}

/**
 * Create complete membership identity
 * This is called once when an account is approved
 * 
 * @param membershipSequence - Next available member number from counter
 * @param membershipType - "student" or "stakeholder"
 * @param origin - Base URL for verification links
 * @returns Complete membership identity
 */
export function createMembershipIdentity(
  membershipSequence: number,
  membershipType: "student" | "stakeholder" = "student",
  origin: string = "https://registry.nukafs-sl.org"
): MembershipIdentity {
  const isStakeholder = membershipType === "stakeholder"
  const membershipId = isStakeholder
    ? generateStakeholderId(membershipSequence)
    : generateMembershipId(membershipSequence)

  const verificationToken = generateVerificationToken()
  const verificationUrl = generateQrCodeData(verificationToken, origin)

  return {
    membershipId,
    membershipType,
    verificationToken,
    verificationUrl,
    qrCodeData: verificationUrl,
    createdAt: new Date().toISOString(),
  }
}

/**
 * Verify that a token is valid format (before checking in DB)
 * 
 * @param token - The verification token to check
 * @returns true if token is valid hex format
 */
export function isValidVerificationToken(token: string): boolean {
  return /^[a-f0-9]{64}$/.test(token)
}

/**
 * Parse verification URL to extract token
 * 
 * @param verificationUrl - Full verification URL
 * @returns Extracted token or null if invalid
 */
export function extractVerificationToken(verificationUrl: string): string | null {
  const match = verificationUrl.match(/\/verify\/([a-f0-9]{64})$/)
  return match ? match[1] : null
}

/**
 * Format membership date for display
 * 
 * @param isoDate - ISO date string
 * @returns Formatted date like "28 JUN 2026"
 */
export function formatMembershipDate(isoDate: string): string {
  try {
    const date = new Date(isoDate)
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "2-digit",
    }).toUpperCase()
  } catch {
    return isoDate
  }
}

/**
 * Build membership card serial number from membership ID
 * Example: NUKaFs-000042 -> NUKaFs26-000042
 * 
 * @param membershipId - The membership ID
 * @returns Card serial number
 */
export function buildCardSerial(membershipId: string): string {
  const year = new Date().getFullYear()
  const yearShort = String(year).slice(-2)

  if (membershipId.startsWith("NUKaFs-")) {
    const sequence = membershipId.replace("NUKaFs-", "")
    return `NUKaFs${yearShort}-${sequence}`
  }

  if (membershipId.startsWith("STK-")) {
    const sequence = membershipId.replace("STK-", "")
    return `STK${yearShort}-${sequence}`
  }

  return membershipId
}
