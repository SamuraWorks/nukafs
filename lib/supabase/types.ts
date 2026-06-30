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
  district?: string
  chiefdom?: string
  employment_status?: string
  skills?: string[]
  scholarship_applicant?: boolean
  joined_date?: string
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
