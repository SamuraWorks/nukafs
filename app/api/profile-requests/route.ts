import { NextRequest, NextResponse } from "next/server"

// In-memory storage for profile requests (mock persistence)
let profileRequests: Array<{
  id: string
  membershipNumber: string
  userId: string
  portal: string
  originalProfile: Record<string, any>
  changedFields: Record<string, { oldValue: any; newValue: any }>
  reason: string
  documents?: string[]
  status: "pending" | "approved" | "rejected"
  reviewerId?: string
  createdAt: string
  updatedAt: string
  auditEntries: Array<{
    timestamp: string
    action: "created" | "approved" | "rejected"
    userId: string
    note?: string
  }>
}> = []

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      membershipNumber,
      userId,
      portal,
      originalProfile,
      fieldsToSubmit,
      reason,
      documents = []
    } = body

    // Validate required fields
    if (!membershipNumber || !userId || !portal || !fieldsToSubmit || !reason) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      )
    }

    // Build changedFields object
    const changedFields: Record<string, { oldValue: any; newValue: any }> = {}
    fieldsToSubmit.forEach(
      (field: { field: string; newValue: string }) => {
        changedFields[field.field] = {
          oldValue: originalProfile?.[field.field] ?? null,
          newValue: field.newValue
        }
      }
    )

    // Create new request
    const newRequest = {
      id: `req_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`,
      membershipNumber,
      userId,
      portal,
      originalProfile: originalProfile || {},
      changedFields,
      reason,
      documents,
      status: "pending" as const,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      auditEntries: [
        {
          timestamp: new Date().toISOString(),
          action: "created" as const,
          userId,
          note: "Profile update request submitted"
        }
      ]
    }

    profileRequests.push(newRequest)

    return NextResponse.json(
      { success: true, request: newRequest },
      { status: 201 }
    )
  } catch (error) {
    console.error("Error creating profile request:", error)
    return NextResponse.json(
      { error: "Failed to create profile request" },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const membershiNumber = searchParams.get("membershipNumber")
    const status = searchParams.get("status")
    const portal = searchParams.get("portal")

    let filtered = profileRequests

    if (membershiNumber) {
      filtered = filtered.filter(
        (r) => r.membershipNumber === membershiNumber
      )
    }
    if (status) {
      filtered = filtered.filter((r) => r.status === status)
    }
    if (portal) {
      filtered = filtered.filter((r) => r.portal === portal)
    }

    return NextResponse.json({ requests: filtered }, { status: 200 })
  } catch (error) {
    console.error("Error fetching profile requests:", error)
    return NextResponse.json(
      { error: "Failed to fetch profile requests" },
      { status: 500 }
    )
  }
}
