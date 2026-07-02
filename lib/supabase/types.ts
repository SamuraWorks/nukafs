export interface SupabaseUserProfile {
  id: string
  email: string
  phone?: string
  full_name?: string
  role?: string
  status?: string
  password_change_required?: boolean
  profile_completion?: number
  membership_number?: string
  university?: string
  course?: string
  department?: string
  level?: string
  country?: string
  district?: string
  chiefdom?: string
  town?: string
  employment_status?: string
  skills?: string[]
  scholarship_applicant?: boolean
  joined_date?: string
  college?: string
  expected_graduation_year?: string
  organization?: string
  campus?: string
  faculty?: string
  admission_year?: string
  graduation_year?: string
  occupation?: string
  biography?: string
  gender?: string
  dob?: string
  nationality?: string
  home_address?: string
  current_address?: string
  student_id?: string
  emergency_contact?: any
  profile_photo?: string
  profile_photo_url?: string
  avatar_color?: string
  qr_code?: string
  qr_code_status?: string
  date_issued?: string
  is_migrated_to_digital_registry?: boolean
  legacy_membership_history?: string
  created_at?: string
  updated_at?: string
}

export interface SupabaseRegistration {
  id: string
  user_id?: string
  full_name: string
  email: string
  phone: string
  district?: string
  submitted_date?: string
  status?: string
  approved_by?: string
  reviewed_date?: string
  rejection_reason?: string
  created_at?: string
}

export interface SupabaseFetchResult<T> {
  data: T[]
  total: number
}

export interface SupabaseDistrict {
  id: string
  name: string
  status: "active" | "inactive"
  created_at?: string
  updated_at?: string
}

export interface SupabaseChiefdom {
  id: string
  name: string
  district_id: string
  status: "active" | "inactive"
  created_at?: string
  updated_at?: string
}

