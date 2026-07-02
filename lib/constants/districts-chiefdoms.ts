/**
 * Official District & Chiefdom Data
 * Post-2017 Administrative Structure for Koinadugu and Falaba Districts
 * 
 * This is the authoritative source for all district and chiefdom data
 * used throughout the NUKaFs Registry Platform.
 */

export const OFFICIAL_DISTRICTS = ["Koinadugu", "Falaba"] as const
export type OfficialDistrict = typeof OFFICIAL_DISTRICTS[number]

export const OFFICIAL_CHIEFDOMS_BY_DISTRICT: Record<OfficialDistrict, readonly string[]> = {
  Koinadugu: [
    "Diang",
    "Gbonkobon Kayaka",
    "Kalian",
    "Kamukeh",
    "Kasunko",
    "Kellian",
    "Nieni",
    "Sengbe",
    "Tamiso",
    "Wara-Wara Bafodea",
    "Wara-Wara Yagala",
  ] as const,
  Falaba: [
    "Dembelia Sikunia",
    "Dembelia-Musaia",
    "Delemandugu",
    "Folasaba",
    "Kamadu Yiraia",
    "Kebelia",
    "Kulor Saradu",
    "Mongo",
    "Morfindugu",
    "Neya",
    "Nyedu",
    "Sulima",
    "Wollay Barawa",
  ] as const,
}

/**
 * Get all chiefdoms for a given district
 * @param district The district name
 * @returns Array of chiefdom names, or empty array if district is invalid
 */
export function getChiefdomsForDistrict(
  district: string | null | undefined
): readonly string[] {
  if (!district || !OFFICIAL_DISTRICTS.includes(district as OfficialDistrict)) {
    return []
  }
  return OFFICIAL_CHIEFDOMS_BY_DISTRICT[district as OfficialDistrict]
}

/**
 * Validate if a chiefdom belongs to a district
 * @param district The district name
 * @param chiefdom The chiefdom name
 * @returns true if the chiefdom belongs to the district, false otherwise
 */
export function isValidChiefdomForDistrict(
  district: string | null | undefined,
  chiefdom: string | null | undefined
): boolean {
  if (!district || !chiefdom) return false
  const validChiefdoms = getChiefdomsForDistrict(district)
  return validChiefdoms.includes(chiefdom)
}

/**
 * Validate if a district is official
 * @param district The district name
 * @returns true if the district is in the official list
 */
export function isValidDistrict(district: string | null | undefined): boolean {
  return Boolean(district && OFFICIAL_DISTRICTS.includes(district as OfficialDistrict))
}

/**
 * Get all official chiefdoms across both districts
 * @returns Array of all chiefdom names
 */
export function getAllOfficialChiefdoms(): string[] {
  return [
    ...OFFICIAL_CHIEFDOMS_BY_DISTRICT.Koinadugu,
    ...OFFICIAL_CHIEFDOMS_BY_DISTRICT.Falaba,
  ]
}

/**
 * Sanitize user input to official district/chiefdom values
 * Useful for migrating legacy data
 * @param input The user input
 * @returns The official name if found, otherwise null
 */
export function findOfficialDistrict(input: string): OfficialDistrict | null {
  if (!input) return null
  const normalized = input.trim().toLowerCase()
  return (
    OFFICIAL_DISTRICTS.find((d) => d.toLowerCase() === normalized) ?? null
  ) as OfficialDistrict | null
}

/**
 * Sanitize user input to official chiefdom value
 * Useful for migrating legacy data
 * @param input The user input
 * @returns The official name if found, otherwise null
 */
export function findOfficialChiefdom(input: string): string | null {
  if (!input) return null
  const normalized = input.trim().toLowerCase()
  return (
    getAllOfficialChiefdoms().find(
      (c) => c.toLowerCase() === normalized
    ) ?? null
  )
}
