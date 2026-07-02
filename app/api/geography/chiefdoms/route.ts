import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

function getAdminClient() {
  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error("Supabase is not configured for geography writes.")
  }
  return createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  })
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const districtId = searchParams.get("district_id")

    const adminClient = getAdminClient()
    let query = adminClient
      .from("chiefdoms")
      .select("*")
      .order("name", { ascending: true })

    if (districtId) {
      query = query.eq("district_id", districtId)
    }

    const { data, error } = await query

    if (error) throw error

    return NextResponse.json({ success: true, data: data ?? [] })
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error?.message || "Failed to fetch chiefdoms." },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { name, district_id, status } = body

    if (!name) {
      return NextResponse.json(
        { success: false, message: "Chiefdom name is required." },
        { status: 400 }
      )
    }
    if (!district_id) {
      return NextResponse.json(
        { success: false, message: "District ID is required." },
        { status: 400 }
      )
    }

    const adminClient = getAdminClient()
    const { data, error } = await adminClient
      .from("chiefdoms")
      .insert([{ name, district_id, status: status ?? "active" }])
      .select()

    if (error) throw error

    return NextResponse.json({ success: true, data: data?.[0] ?? null })
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error?.message || "Failed to create chiefdom." },
      { status: 500 }
    )
  }
}
