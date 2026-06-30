export const API_CONFIG = {
  baseUrl: process.env.NEXT_PUBLIC_API_URL ?? "/api",
  timeoutMs: 30_000,
  defaultPageSize: 25,
  maxPageSize: 100,
} as const

export const AUTH_CONFIG = {
  tokenHeader: "Authorization",
  tokenPrefix: "Bearer",
  refreshSkewMs: 60_000,
} as const
