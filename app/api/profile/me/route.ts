import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get("userId")

    if (!userId) {
      return NextResponse.json({ error: "Missing userId" }, { status: 400 })
    }

    const { data: user, error } = await supabase
      .from("users")
      .select("*")
      .eq("id", userId)
      .single()

    if (error) {
      if (error.code === "PGRST116") {
        return NextResponse.json({ user: null }, { status: 200 })
      }
      throw error
    }

    return NextResponse.json({ user }, { status: 200 })
  } catch (error: any) {
    console.error("Profile GET error:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
