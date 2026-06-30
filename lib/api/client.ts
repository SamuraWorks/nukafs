import { API_CONFIG, AUTH_CONFIG } from "@/lib/api/config"
import { STORAGE_KEYS } from "@/lib/constants/storage-keys"
import { readString } from "@/lib/storage/persistence"

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public code?: string,
    public details?: unknown,
  ) {
    super(message)
    this.name = "ApiError"
  }
}

export interface ApiRequestOptions extends Omit<RequestInit, "body"> {
  body?: unknown
  params?: Record<string, string | number | boolean | undefined>
  auth?: boolean
}

function buildUrl(
  path: string,
  params?: ApiRequestOptions["params"],
): string {
  const base = API_CONFIG.baseUrl.replace(/\/$/, "")
  const normalized = path.startsWith("/") ? path : `/${path}`
  const url = new URL(
    `${base}${normalized}`,
    typeof window !== "undefined" ? window.location.origin : "http://localhost",
  )

  if (params) {
    for (const [key, value] of Object.entries(params)) {
      if (value !== undefined) url.searchParams.set(key, String(value))
    }
  }

  return url.toString()
}

function getAuthHeaders(): HeadersInit {
  const token = readString(STORAGE_KEYS.accessToken)
  if (!token) return {}
  return { [AUTH_CONFIG.tokenHeader]: `${AUTH_CONFIG.tokenPrefix} ${token}` }
}

/**
 * HTTP client prepared for JWT, refresh tokens, and CSRF headers.
 * Currently targets mock/local endpoints; swap base URL for Supabase/REST.
 */
export async function apiRequest<T>(
  path: string,
  options: ApiRequestOptions = {},
): Promise<T> {
  const { body, params, auth = true, headers, ...init } = options

  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), API_CONFIG.timeoutMs)

  try {
    const response = await fetch(buildUrl(path, params), {
      ...init,
      signal: controller.signal,
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        ...(auth ? getAuthHeaders() : {}),
        ...headers,
      },
      body: body !== undefined ? JSON.stringify(body) : undefined,
      credentials: "same-origin",
    })

    if (!response.ok) {
      let payload: unknown
      try {
        payload = await response.json()
      } catch {
        payload = undefined
      }
      throw new ApiError(
        `Request failed (${response.status})`,
        response.status,
        undefined,
        payload,
      )
    }

    if (response.status === 204) return undefined as T
    return (await response.json()) as T
  } finally {
    clearTimeout(timeout)
  }
}

export const api = {
  get: <T>(path: string, options?: ApiRequestOptions) =>
    apiRequest<T>(path, { ...options, method: "GET" }),
  post: <T>(path: string, body?: unknown, options?: ApiRequestOptions) =>
    apiRequest<T>(path, { ...options, method: "POST", body }),
  put: <T>(path: string, body?: unknown, options?: ApiRequestOptions) =>
    apiRequest<T>(path, { ...options, method: "PUT", body }),
  patch: <T>(path: string, body?: unknown, options?: ApiRequestOptions) =>
    apiRequest<T>(path, { ...options, method: "PATCH", body }),
  delete: <T>(path: string, options?: ApiRequestOptions) =>
    apiRequest<T>(path, { ...options, method: "DELETE" }),
}
