/** Centralised localStorage keys — swap for secure cookies/session storage with backend */
export const STORAGE_KEYS = {
  students: "NUKaFs_students",
  pending: "NUKaFs_pending",
  editRequests: "NUKaFs_edit_requests",
  events: "NUKaFs_events",
  announcements: "NUKaFs_announcements",
  opportunities: "NUKaFs_opportunities",
  teamMembers: "NUKaFs_team_members",
  auditLog: "NUKaFs_audit_log",
  role: "NUKaFs_role",
  user: "NUKaFs_user",
  registeredEvents: "NUKaFs_reg_events",
  notifications: "NUKaFs_notifications",
  settings: "NUKaFs_settings",
  universities: "NUKaFs_universities",
  accessToken: "NUKaFs_access_token",
  refreshToken: "NUKaFs_refresh_token",
  csrfToken: "NUKaFs_csrf_token",
  sessionTimestamp: "NUKaFs_session_timestamp",
  selectedPortal: "NUKaFs_selected_portal",
  lastPath: "NUKaFs_last_path",
  permissionMatrix: "NUKaFs_permission_matrix",
  userPreferences: "NUKaFs_user_preferences",
} as const

export type StorageKey = (typeof STORAGE_KEYS)[keyof typeof STORAGE_KEYS]
