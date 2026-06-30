import { NextResponse } from "next/server"
import { createInitialSuperAdminSeed } from "@/lib/supabase/bootstrap"

export async function POST() {
  try {
    const result = await createInitialSuperAdminSeed({
      fullName: "Samuel Samura",
      email: "samuel540wisesamura@gmail.com",
      phone: "+23279630777",
      university: "Fourah Bay College",
      faculty: "Engineering",
      department: "Electrical and Electronics Engineering",
      course: "Electrical and Electronics Engineering",
      level: "Year 4",
      primarySkill: "Software Development",
      additionalSkills: [],
    })

    return NextResponse.json(result)
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : "Failed to create super admin",
      },
      { status: 500 },
    )
  }
}
