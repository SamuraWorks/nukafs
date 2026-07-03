import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

function ensureAdminClient() {
  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error("Supabase is not configured for registry snapshot queries.")
  }

  return createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  })
}

function normalizeStudentFromUser(user: any) {
  return {
    id: user.id,
    fullName: user.full_name || user.fullName || user.name,
    membershipType: user.membership_type || user.membershipType || user.employment_status || user.employmentStatus || "Student",
    membershipNumber: user.membership_number || user.membershipNumber || null,
    membershipId: user.membership_id || user.membershipId || null,
    qrCode: user.qr_code || user.permanent_qr_code || user.qrCode,
    university: user.university,
    department: user.department,
    course: user.course || user.courseName,
    level: user.level,
    status: user.membership_status || user.status || "active",
    phone: user.phone,
    email: user.email,
    district: user.district,
    chiefdom: user.chiefdom,
    avatarColor: user.avatar_color || user.avatarColor,
    joinedDate: user.joined_date || user.created_at,
    dateIssued: user.date_issued || user.dateIssued,
    qrCodeStatus: user.qr_code_status || user.qrCodeStatus,
  }
}

export async function GET(request: NextRequest) {
  try {
    const adminClient = ensureAdminClient()

    const [studentsRes, pendingRes, editRequestsRes, announcementsRes, eventsRes, opportunitiesRes, universitiesRes, studentUsersRes] =
      await Promise.all([
        adminClient.from("students").select("*").order("created_at", { ascending: false }),
        adminClient.from("registrations").select("*").eq("status", "pending").order("submitted_at", { ascending: true }).order("created_at", { ascending: true }),
        adminClient.from("edit_requests").select("*").order("submitted_date", { ascending: false }),
        adminClient.from("announcements").select("*").order("date", { ascending: false }),
        adminClient.from("events").select("*").order("date", { ascending: false }),
        adminClient.from("opportunities").select("*").order("deadline", { ascending: true }),
        adminClient.from("universities").select("*").order("name", { ascending: true }),
        adminClient.from("users").select("*").or("membership_type.ilike.%student%,employment_status.ilike.%student%"),
      ])

    const studentTableMissing = Boolean(
      studentsRes.error &&
      typeof studentsRes.error.message === "string" &&
      studentsRes.error.message.toLowerCase().includes("could not find the table")
    )

    const errors = [
      studentTableMissing ? null : studentsRes.error,
      pendingRes.error,
      editRequestsRes.error,
      announcementsRes.error,
      eventsRes.error,
      opportunitiesRes.error,
      universitiesRes.error,
      studentUsersRes.error,
    ].filter(Boolean)

    if (errors.length > 0) {
      const message = errors.map((err) => err?.message).filter(Boolean).join("; ")
      return NextResponse.json({ success: false, message: message || "Failed to fetch registry snapshot." }, { status: 500 })
    }

    const students = Array.isArray(studentsRes.data) ? studentsRes.data : []
    const pendingRegistrations = Array.isArray(pendingRes.data) ? pendingRes.data : []
    const editRequests = Array.isArray(editRequestsRes.data) ? editRequestsRes.data : []
    const announcements = Array.isArray(announcementsRes.data) ? announcementsRes.data : []
    const events = Array.isArray(eventsRes.data) ? eventsRes.data : []
    const opportunities = Array.isArray(opportunitiesRes.data) ? opportunitiesRes.data : []
    const universities = Array.isArray(universitiesRes.data) ? universitiesRes.data : []
    const studentUsers = Array.isArray(studentUsersRes.data) ? studentUsersRes.data : []

    const studentsById = new Map<string, any>()

    students.forEach((student: any) => {
      if (student?.id) {
        studentsById.set(String(student.id), student)
      } else if (student?.user_id) {
        studentsById.set(String(student.user_id), student)
      }
    })

    studentUsers.forEach((user) => {
      const id = String(user.id)
      if (!studentsById.has(id)) {
        studentsById.set(id, normalizeStudentFromUser(user))
      }
    })

    return NextResponse.json({
      success: true,
      data: {
        students: Array.from(studentsById.values()),
        pendingRegistrations,
        editRequests,
        announcements,
        events,
        opportunities,
        universities,
      },
    })
  } catch (error: any) {
    console.error("Registry snapshot error:", error)
    return NextResponse.json(
      { success: false, message: error?.message || "Failed to fetch registry snapshot." },
      { status: 500 },
    )
  }
}
