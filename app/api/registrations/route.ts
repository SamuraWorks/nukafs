import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

function getAdminClient() {
  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error("Supabase is not configured for registration writes.")
  }

  return createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  })
}

export async function GET() {
  try {
    const adminClient = getAdminClient()
    const { data, error } = await adminClient
      .from("registrations")
      .select("*")
      .order("submitted_date", { ascending: false })

    if (error) {
      return NextResponse.json(
        { success: false, message: error.message ?? "Failed to fetch registrations." },
        { status: 500 },
      )
    }

    return NextResponse.json({ success: true, data: data ?? [] })
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error instanceof Error ? error.message : "Failed to fetch registrations." },
      { status: 500 },
    )
  }
}

export async function POST(request: Request) {
  try {
    const registration = await request.json()
    const adminClient = getAdminClient()

    const { data, error } = await adminClient
      .from("registrations")
      .insert([{ ...registration, status: registration?.status ?? "pending" }])
      .select()

    if (error) {
      return NextResponse.json(
        { success: false, message: error.message ?? "Failed to create registration." },
        { status: 500 },
      )
    }

    return NextResponse.json({ success: true, data: data?.[0] ?? null })
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error instanceof Error ? error.message : "Failed to create registration." },
      { status: 500 },
    )
  }
}
