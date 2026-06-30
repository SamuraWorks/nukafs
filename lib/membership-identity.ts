/**
 * Membership Identity System
 * Generates and manages permanent membership IDs and QR codes for all registered users
 */

/**
 * Generate a membership ID in the format NUKAFS-000001
 * IDs auto-increment and are never reused
 */
export function generateMembershipId(sequenceNumber: number): string {
  const paddedNumber = String(sequenceNumber).padStart(6, '0')
  return `NUKAFS-${paddedNumber}`
}

/**
 * Create QR code data for membership verification
 * Returns a JSON string that will be encoded into QR code
 */
export function createMembershipQRData(userId: string, membershipId: string): string {
  const qrData = {
    type: 'nukafs_membership',
    userId,
    membershipId,
    timestamp: new Date().toISOString(),
    version: '1.0',
  }
  return JSON.stringify(qrData)
}

/**
 * Generate QR code image URL using external service
 * Uses QR Server (free, no API key needed)
 */
export function generateQRCodeUrl(data: string, size: number = 200): string {
  const encodedData = encodeURIComponent(data)
  return `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodedData}`
}

/**
 * Verify membership QR code data
 */
export function verifyMembershipQRData(qrData: string): {
  valid: boolean
  userId?: string
  membershipId?: string
  error?: string
} {
  try {
    const parsed = JSON.parse(qrData)
    if (parsed.type !== 'nukafs_membership' || !parsed.userId || !parsed.membershipId) {
      return { valid: false, error: 'Invalid QR data structure' }
    }
    return {
      valid: true,
      userId: parsed.userId,
      membershipId: parsed.membershipId,
    }
  } catch {
    return { valid: false, error: 'Failed to parse QR data' }
  }
}
