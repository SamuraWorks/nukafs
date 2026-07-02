/**
 * Geography Service
 * 
 * Client-side service for fetching districts and chiefdoms from the API.
 * Falls back to hardcoded data if the API is unavailable (offline resilience).
 */

export interface District {
  id: string
  name: string
  status: "active" | "inactive"
  created_at?: string
  updated_at?: string
}

export interface Chiefdom {
  id: string
  name: string
  district_id: string
  status: "active" | "inactive"
  created_at?: string
  updated_at?: string
}

// ──────────────────────────────────────────────────────────────────
// Fallback data (used when DB tables don't exist yet)
// ──────────────────────────────────────────────────────────────────
const FALLBACK_DISTRICTS: District[] = [
  { id: "koinadugu", name: "Koinadugu", status: "active" },
  { id: "falaba", name: "Falaba", status: "active" },
]

const FALLBACK_CHIEFDOMS: Chiefdom[] = [
  // Koinadugu
  { id: "k1", name: "Diang", district_id: "koinadugu", status: "active" },
  { id: "k2", name: "Gbonkobon Kayaka", district_id: "koinadugu", status: "active" },
  { id: "k3", name: "Kalian", district_id: "koinadugu", status: "active" },
  { id: "k4", name: "Kamukeh", district_id: "koinadugu", status: "active" },
  { id: "k5", name: "Kasunko", district_id: "koinadugu", status: "active" },
  { id: "k6", name: "Kellian", district_id: "koinadugu", status: "active" },
  { id: "k7", name: "Nieni", district_id: "koinadugu", status: "active" },
  { id: "k8", name: "Sengbe", district_id: "koinadugu", status: "active" },
  { id: "k9", name: "Tamiso", district_id: "koinadugu", status: "active" },
  { id: "k10", name: "Wara-Wara Bafodea", district_id: "koinadugu", status: "active" },
  { id: "k11", name: "Wara-Wara Yagala", district_id: "koinadugu", status: "active" },
  // Falaba
  { id: "f1", name: "Dembelia Sikunia", district_id: "falaba", status: "active" },
  { id: "f2", name: "Dembelia-Musaia", district_id: "falaba", status: "active" },
  { id: "f3", name: "Delemandugu", district_id: "falaba", status: "active" },
  { id: "f4", name: "Folasaba", district_id: "falaba", status: "active" },
  { id: "f5", name: "Kamadu Yiraia", district_id: "falaba", status: "active" },
  { id: "f6", name: "Kebelia", district_id: "falaba", status: "active" },
  { id: "f7", name: "Kulor Saradu", district_id: "falaba", status: "active" },
  { id: "f8", name: "Mongo", district_id: "falaba", status: "active" },
  { id: "f9", name: "Morfindugu", district_id: "falaba", status: "active" },
  { id: "f10", name: "Neya", district_id: "falaba", status: "active" },
  { id: "f11", name: "Nyedu", district_id: "falaba", status: "active" },
  { id: "f12", name: "Sulima", district_id: "falaba", status: "active" },
  { id: "f13", name: "Wollay Barawa", district_id: "falaba", status: "active" },
]

// ──────────────────────────────────────────────────────────────────
// Fetchers
// ──────────────────────────────────────────────────────────────────

export async function fetchDistricts(): Promise<District[]> {
  try {
    const res = await fetch("/api/geography/districts", { cache: "no-store" })
    if (!res.ok) throw new Error("Districts fetch failed")
    const json = await res.json()
    if (!json.success || !Array.isArray(json.data) || json.data.length === 0) {
      return FALLBACK_DISTRICTS
    }
    return json.data as District[]
  } catch {
    return FALLBACK_DISTRICTS
  }
}

export async function fetchChiefdomsByDistrict(districtId: string): Promise<Chiefdom[]> {
  try {
    const res = await fetch(`/api/geography/chiefdoms?district_id=${encodeURIComponent(districtId)}`, {
      cache: "no-store",
    })
    if (!res.ok) throw new Error("Chiefdoms fetch failed")
    const json = await res.json()
    if (!json.success || !Array.isArray(json.data) || json.data.length === 0) {
      return FALLBACK_CHIEFDOMS.filter((c) => c.district_id === districtId)
    }
    return json.data as Chiefdom[]
  } catch {
    return FALLBACK_CHIEFDOMS.filter((c) => c.district_id === districtId)
  }
}

export async function fetchAllChiefdoms(): Promise<Chiefdom[]> {
  try {
    const res = await fetch("/api/geography/chiefdoms", { cache: "no-store" })
    if (!res.ok) throw new Error("Chiefdoms fetch failed")
    const json = await res.json()
    if (!json.success || !Array.isArray(json.data) || json.data.length === 0) {
      return FALLBACK_CHIEFDOMS
    }
    return json.data as Chiefdom[]
  } catch {
    return FALLBACK_CHIEFDOMS
  }
}

// ──────────────────────────────────────────────────────────────────
// Admin Mutations
// ──────────────────────────────────────────────────────────────────

export async function createDistrict(name: string): Promise<District> {
  const res = await fetch("/api/geography/districts", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name }),
  })
  const json = await res.json()
  if (!json.success) throw new Error(json.message || "Failed to create district")
  return json.data
}

export async function updateDistrict(id: string, payload: { name?: string; status?: string }): Promise<District> {
  const res = await fetch(`/api/geography/districts/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  })
  const json = await res.json()
  if (!json.success) throw new Error(json.message || "Failed to update district")
  return json.data
}

export async function createChiefdom(name: string, district_id: string): Promise<Chiefdom> {
  const res = await fetch("/api/geography/chiefdoms", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, district_id }),
  })
  const json = await res.json()
  if (!json.success) throw new Error(json.message || "Failed to create chiefdom")
  return json.data
}

export async function updateChiefdom(id: string, payload: { name?: string; status?: string }): Promise<Chiefdom> {
  const res = await fetch(`/api/geography/chiefdoms/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  })
  const json = await res.json()
  if (!json.success) throw new Error(json.message || "Failed to update chiefdom")
  return json.data
}
