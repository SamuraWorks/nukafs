import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

function getAdminClient() {
  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error("Supabase is not configured for geography writes.")
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
      .from("districts")
      .select("*")
      .order("name", { ascending: true })

    if (error) {
      throw error
    }

    return NextResponse.json({ success: true, data: data ?? [] })
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error?.message || "Failed to fetch districts." },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { name, status } = body

    if (!name) {
      return NextResponse.json(
        { success: false, message: "District name is required." },
        { status: 400 }
      )
    }

    const adminClient = getAdminClient()
    const { data, error } = await adminClient
      .from("districts")
      .insert([{ name, status: status ?? "active" }])
      .select()

    if (error) {
      throw error
    }

    return NextResponse.json({ success: true, data: data?.[0] ?? null })
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error?.message || "Failed to create district." },
      { status: 500 }
    )
  }
}
