export interface DepartmentData {
  depto: string
  ymophg_mean: number
  ymophg_median: number
  anosest_mean: number
  edad_mean: number
  totper_mean: number
  tasa_ocupacion: number
  tasa_pobreza: number
  tasa_nbi: number
  cluster: number
}

export const CLUSTER_INFO: Record<
  number,
  { name: string; description: string; color: string; bgClass: string }
> = {
  0: {
    name: "Desarrollo Alto",
    description: "Indicadores socioeconómicos altos",
    color: "#22c55e",
    bgClass: "bg-green-500",
  },
  1: {
    name: "Desarrollo Medio",
    description: "Indicadores socioeconómicos moderados",
    color: "#3b82f6",
    bgClass: "bg-blue-500",
  },
  2: {
    name: "Desarrollo Bajo",
    description: "Indicadores socioeconómicos bajos",
    color: "#f59e0b",
    bgClass: "bg-amber-500",
  },
  3: {
    name: "Desarrollo Muy Bajo",
    description: "Indicadores socioeconómicos muy bajos",
    color: "#ef4444",
    bgClass: "bg-red-500",
  },
}

export const FEATURE_LABELS: Record<string, { label: string; unit: string; description: string }> = {
  ymophg_mean: {
    label: "Ingreso Promedio",
    unit: "Lps.",
    description: "Ingreso mensual promedio del hogar",
  },
  ymophg_median: {
    label: "Ingreso Mediana",
    unit: "Lps.",
    description: "Mediana del ingreso mensual del hogar",
  },
  anosest_mean: {
    label: "Escolaridad Promedio",
    unit: "años",
    description: "Años de estudio promedio",
  },
  edad_mean: {
    label: "Edad Promedio",
    unit: "años",
    description: "Edad promedio de la población",
  },
  totper_mean: {
    label: "Personas por Hogar",
    unit: "",
    description: "Promedio de personas por hogar",
  },
  tasa_ocupacion: {
    label: "Tasa de Ocupación",
    unit: "%",
    description: "Porcentaje de población ocupada",
  },
  tasa_pobreza: {
    label: "Tasa de Pobreza",
    unit: "%",
    description: "Porcentaje de hogares en pobreza",
  },
  tasa_nbi: {
    label: "Tasa de NBI",
    unit: "%",
    description: "Necesidades Básicas Insatisfechas",
  },
}

export const departmentsData: DepartmentData[] = [
  {
    depto: "Atlántida",
    ymophg_mean: 12115.98,
    ymophg_median: 10150.0,
    anosest_mean: 6.86,
    edad_mean: 31.71,
    totper_mean: 4.45,
    tasa_ocupacion: 0.3427,
    tasa_pobreza: 0.1022,
    tasa_nbi: 0.3497,
    cluster: 1,
  },
  {
    depto: "Choluteca",
    ymophg_mean: 10882.87,
    ymophg_median: 8350.0,
    anosest_mean: 6.49,
    edad_mean: 32.55,
    totper_mean: 4.94,
    tasa_ocupacion: 0.4408,
    tasa_pobreza: 0.1008,
    tasa_nbi: 0.521,
    cluster: 2,
  },
  {
    depto: "Colón",
    ymophg_mean: 12250.09,
    ymophg_median: 8600.0,
    anosest_mean: 6.74,
    edad_mean: 29.64,
    totper_mean: 4.56,
    tasa_ocupacion: 0.3704,
    tasa_pobreza: 0.1181,
    tasa_nbi: 0.4294,
    cluster: 1,
  },
  {
    depto: "Comayagua",
    ymophg_mean: 10528.71,
    ymophg_median: 7375.0,
    anosest_mean: 6.14,
    edad_mean: 30.96,
    totper_mean: 4.7,
    tasa_ocupacion: 0.3849,
    tasa_pobreza: 0.1341,
    tasa_nbi: 0.3541,
    cluster: 1,
  },
  {
    depto: "Copán",
    ymophg_mean: 10481.37,
    ymophg_median: 8000.0,
    anosest_mean: 5.7,
    edad_mean: 33.04,
    totper_mean: 4.27,
    tasa_ocupacion: 0.3805,
    tasa_pobreza: 0.1497,
    tasa_nbi: 0.394,
    cluster: 1,
  },
  {
    depto: "Cortes",
    ymophg_mean: 18706.84,
    ymophg_median: 15000.0,
    anosest_mean: 7.87,
    edad_mean: 32.52,
    totper_mean: 4.31,
    tasa_ocupacion: 0.4637,
    tasa_pobreza: 0.0698,
    tasa_nbi: 0.2757,
    cluster: 0,
  },
  {
    depto: "ElParaíso",
    ymophg_mean: 11696.92,
    ymophg_median: 7200.0,
    anosest_mean: 6.4,
    edad_mean: 32.63,
    totper_mean: 4.76,
    tasa_ocupacion: 0.4036,
    tasa_pobreza: 0.1262,
    tasa_nbi: 0.4849,
    cluster: 2,
  },
  {
    depto: "FranciscoMorazán",
    ymophg_mean: 17473.82,
    ymophg_median: 13000.0,
    anosest_mean: 8.34,
    edad_mean: 33.98,
    totper_mean: 4.58,
    tasa_ocupacion: 0.4712,
    tasa_pobreza: 0.0875,
    tasa_nbi: 0.3673,
    cluster: 0,
  },
  {
    depto: "Intubucá",
    ymophg_mean: 12491.14,
    ymophg_median: 7200.0,
    anosest_mean: 6.48,
    edad_mean: 29.32,
    totper_mean: 4.88,
    tasa_ocupacion: 0.4195,
    tasa_pobreza: 0.1222,
    tasa_nbi: 0.329,
    cluster: 1,
  },
  {
    depto: "LaPaz",
    ymophg_mean: 8618.18,
    ymophg_median: 5200.0,
    anosest_mean: 6.44,
    edad_mean: 29.39,
    totper_mean: 4.83,
    tasa_ocupacion: 0.4044,
    tasa_pobreza: 0.1384,
    tasa_nbi: 0.3795,
    cluster: 1,
  },
  {
    depto: "Lempira",
    ymophg_mean: 8474.16,
    ymophg_median: 6000.0,
    anosest_mean: 5.07,
    edad_mean: 28.67,
    totper_mean: 5.23,
    tasa_ocupacion: 0.3413,
    tasa_pobreza: 0.1387,
    tasa_nbi: 0.5351,
    cluster: 3,
  },
  {
    depto: "Ocotepeque",
    ymophg_mean: 12726.81,
    ymophg_median: 8000.0,
    anosest_mean: 6.05,
    edad_mean: 32.7,
    totper_mean: 4.27,
    tasa_ocupacion: 0.3464,
    tasa_pobreza: 0.1327,
    tasa_nbi: 0.4619,
    cluster: 1,
  },
  {
    depto: "Olancho",
    ymophg_mean: 11258.54,
    ymophg_median: 8000.0,
    anosest_mean: 6.03,
    edad_mean: 30.26,
    totper_mean: 4.58,
    tasa_ocupacion: 0.3912,
    tasa_pobreza: 0.1088,
    tasa_nbi: 0.4195,
    cluster: 1,
  },
  {
    depto: "SantaBárbara",
    ymophg_mean: 11616.88,
    ymophg_median: 7850.0,
    anosest_mean: 6.18,
    edad_mean: 33.07,
    totper_mean: 4.26,
    tasa_ocupacion: 0.3858,
    tasa_pobreza: 0.1275,
    tasa_nbi: 0.3531,
    cluster: 1,
  },
  {
    depto: "Valle",
    ymophg_mean: 10185.78,
    ymophg_median: 7500.0,
    anosest_mean: 6.62,
    edad_mean: 32.68,
    totper_mean: 4.74,
    tasa_ocupacion: 0.4328,
    tasa_pobreza: 0.1123,
    tasa_nbi: 0.5101,
    cluster: 2,
  },
  {
    depto: "Yoro",
    ymophg_mean: 12218.25,
    ymophg_median: 8100.0,
    anosest_mean: 5.99,
    edad_mean: 30.48,
    totper_mean: 4.8,
    tasa_ocupacion: 0.3955,
    tasa_pobreza: 0.1116,
    tasa_nbi: 0.4115,
    cluster: 1,
  },
]

// Mapeo de nombres GeoJSON (NAME_1) -> nombres CSV (depto)
const GEOJSON_TO_CSV_NAME: Record<string, string> = {
  "Atlántida": "Atlántida",
  "Choluteca": "Choluteca",
  "Colón": "Colón",
  "Comayagua": "Comayagua",
  "Copán": "Copán",
  "Cortés": "Cortes",
  "El Paraíso": "ElParaíso",
  "Francisco Morazán": "FranciscoMorazán",
  "Intibucá": "Intubucá",
  "La Paz": "LaPaz",
  "Lempira": "Lempira",
  "Ocotepeque": "Ocotepeque",
  "Olancho": "Olancho",
  "Santa Bárbara": "SantaBárbara",
  "Valle": "Valle",
  "Yoro": "Yoro",
  "Islas de la Bahía": "",
  "Gracias a Dios": "",
}

// Mapeo inverso: CSV name -> GeoJSON name (nombre bonito para mostrar)
const CSV_TO_DISPLAY: Record<string, string> = Object.fromEntries(
  Object.entries(GEOJSON_TO_CSV_NAME)
    .filter(([, csv]) => csv !== "")
    .map(([geo, csv]) => [csv, geo])
)

export function getDisplayName(dept: DepartmentData): string {
  return CSV_TO_DISPLAY[dept.depto] ?? dept.depto
}

export function getDepartmentByName(geoJsonName: string): DepartmentData | undefined {
  const trimmed = geoJsonName.trim().normalize("NFC")
  // Try exact match first
  const csvName = GEOJSON_TO_CSV_NAME[trimmed]
  if (csvName !== undefined) {
    if (csvName === "") return undefined
    return departmentsData.find((d) => d.depto === csvName)
  }
  // Fallback: normalize both sides and compare without accents
  const stripped = trimmed.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/\s+/g, "")
  for (const [geoName, csvN] of Object.entries(GEOJSON_TO_CSV_NAME)) {
    const geoStripped = geoName.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/\s+/g, "")
    if (geoStripped === stripped) {
      if (csvN === "") return undefined
      return departmentsData.find((d) => d.depto === csvN)
    }
  }
  return undefined
}

export function formatValue(key: string, value: number): string {
  const info = FEATURE_LABELS[key]
  if (!info) return value.toFixed(2)

  if (info.unit === "%") {
    return `${(value * 100).toFixed(1)}%`
  }
  if (info.unit === "Lps.") {
    return `L. ${value.toLocaleString("es-HN", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`
  }
  if (info.unit === "años") {
    return `${value.toFixed(1)} años`
  }
  return value.toFixed(2)
}
