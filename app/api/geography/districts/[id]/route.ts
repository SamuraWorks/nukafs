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

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const { name, status } = body
    const { id } = params

    if (!id) {
      return NextResponse.json({ success: false, message: "District ID is required." }, { status: 400 })
    }

    const updatePayload: Record<string, string> = { updated_at: new Date().toISOString() }
    if (name !== undefined) updatePayload.name = name
    if (status !== undefined) updatePayload.status = status

    const adminClient = getAdminClient()
    const { data, error } = await adminClient
      .from("districts")
      .update(updatePayload)
      .eq("id", id)
      .select()

    if (error) throw error

    return NextResponse.json({ success: true, data: data?.[0] ?? null })
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error?.message || "Failed to update district." },
      { status: 500 }
    )
  }
}
