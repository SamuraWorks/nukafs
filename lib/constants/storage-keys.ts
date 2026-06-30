/** Centralised localStorage keys — swap for secure cookies/session storage with backend */
export const STORAGE_KEYS = {
  students: "NUKAFS_students",
  pending: "NUKAFS_pending",
  editRequests: "NUKAFS_edit_requests",
  events: "NUKAFS_events",
  announcements: "NUKAFS_announcements",
  opportunities: "NUKAFS_opportunities",
  teamMembers: "NUKAFS_team_members",
  auditLog: "NUKAFS_audit_log",
  role: "NUKAFS_role",
  user: "NUKAFS_user",
  registeredEvents: "NUKAFS_reg_events",
  notifications: "NUKAFS_notifications",
  settings: "NUKAFS_settings",
  universities: "NUKAFS_universities",
  accessToken: "NUKAFS_access_token",
  refreshToken: "NUKAFS_refresh_token",
  csrfToken: "NUKAFS_csrf_token",
  sessionTimestamp: "NUKAFS_session_timestamp",
  selectedPortal: "NUKAFS_selected_portal",
  lastPath: "NUKAFS_last_path",
  permissionMatrix: "NUKAFS_permission_matrix",
  userPreferences: "NUKAFS_user_preferences",
} as const

export type StorageKey = (typeof STORAGE_KEYS)[keyof typeof STORAGE_KEYS]
