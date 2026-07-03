export const DISTRICTS = ["Koinadugu", "Falaba"] as const
export type District = (typeof DISTRICTS)[number]

export const CHIEFDOMS: Record<District, string[]> = {
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
  ],
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
  ],
}

export const UNIVERSITIES = [
  "Fourah Bay College (USL)",
  "Njala University",
  "Institute of Public Administration (IPAM)",
  "Ernest Bai Koroma University",
  "Eastern Technical University",
  "Milton Margai Technical University",
  "Limkokwing University",
] as const

export const DEPARTMENTS = [
  "Science & Technology",
  "Health Sciences",
  "Social Sciences",
  "Engineering",
  "Arts & Humanities",
  "Business & Management",
  "Agriculture",
] as const

export const LEVELS = ["Year 1", "Year 2", "Year 3", "Year 4", "Postgraduate"] as const
