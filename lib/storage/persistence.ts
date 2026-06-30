import type { StorageKey } from "@/lib/constants/storage-keys"

function isBrowser(): boolean {
  return typeof window !== "undefined"
}

export function readStorage<T>(key: StorageKey, fallback: T): T {
  if (!isBrowser()) return fallback
  try {
    const raw = localStorage.getItem(key)
    if (!raw) return fallback
    return JSON.parse(raw) as T
  } catch {
    return fallback
  }
}

export function writeStorage<T>(key: StorageKey, value: T): void {
  if (!isBrowser()) return
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch {
    // Quota exceeded or private browsing — fail silently in dev
  }
}

export function removeStorage(key: StorageKey): void {
  if (!isBrowser()) return
  localStorage.removeItem(key)
}

export function readString(key: StorageKey): string | null {
  if (!isBrowser()) return null
  return localStorage.getItem(key)
}

export function writeString(key: StorageKey, value: string): void {
  if (!isBrowser()) return
  localStorage.setItem(key, value)
}
