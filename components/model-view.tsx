"use client"

import { useState } from "react"
import { Loader2 } from "lucide-react"
import ModelsSection from "@/components/models-section"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  API_URL,
  CLUSTERS,
  CLUSTER_COLORS,
  DEPARTMENTS,
  LATEST_YEAR,
  YEARS,
  deptRow,
  getIndicator,
  panel,
  perHundred,
} from "@/lib/panel"

const FEATURES = panel.model.features

// Slider bounds per feature, in the units the API expects.
const RANGE: Record<string, [number, number, number]> = {
  tasa_pobreza: [0.2, 1, 0.01],
  tasa_pobreza_extrema: [0, 0.9, 0.01],
  ymophg_median_rel: [0.2, 2, 0.01],
  tasa_ocupacion: [0.3, 0.8, 0.01],
  tasa_desempleo: [0, 0.2, 0.005],
  tasa_dependencia: [0.3, 1.2, 0.01],
}

// The same six inputs, said the way a person would say them.
const PLAIN: Record<string, string> = {
  tasa_pobreza: "Hogares en pobreza",
  tasa_pobreza_extrema: "Hogares en pobreza extrema",
  ymophg_median_rel: "Ingreso comparado con el del país",
  tasa_ocupacion: "Adultos con trabajo",
  tasa_desempleo: "Personas sin empleo que lo buscan",
  tasa_dependencia: "Niños y adultos mayores por cada adulto",
}

const GLOSSARY = [
  ["Hogar", "Las personas que viven juntas y comparten la comida. Las cifras se cuentan por hogar, no por persona."],
  ["Pobreza", "Lo que gana el hogar no alcanza para la canasta básica: comida, vivienda, salud, educación y transporte."],
  ["Pobreza extrema", "Lo que gana el hogar no alcanza ni siquiera para la comida."],
  ["Ingreso típico", "El ingreso del hogar que queda justo en medio: la mitad gana menos y la otra mitad gana más."],
  ["Remesas", "Dinero que envían familiares que viven en otro país."],
] as const

const LEVEL_TEXT = [
  "Menos hogares pobres y mejores ingresos que el resto del país.",
  "Una situación parecida al promedio nacional.",
  "Más hogares pobres, ingresos muy bajos y más personas que mantener por cada adulto.",
]

type Result = { cluster: number; cluster_name: string; description: string }

function valuesOf(code: number): Record<string, number> {
  const row = deptRow(code, LATEST_YEAR)!
  return Object.fromEntries(FEATURES.map((f) => [f, row[f] as number]))
}

function plainValue(key: string, value: number): string {
  if (key === "ymophg_median_rel") return `${Math.round(value * 100)}% del nacional`
  if (key === "tasa_dependencia") return value.toFixed(2)
  return perHundred(value)
}

export default function ModelView() {
  const [preset, setPreset] = useState("8")
  const [values, setValues] = useState(() => valuesOf(8))
  const [result, setResult] = useState<Result | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const presets = DEPARTMENTS.filter((d) => deptRow(d.code, LATEST_YEAR))

  async function submit() {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`${API_URL}/predict`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      })
      if (!res.ok) throw new Error(`el servicio respondió ${res.status}`)
      setResult(await res.json())
    } catch (e) {
      setResult(null)
      setError(e instanceof Error ? e.message : "no hubo respuesta")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col gap-12 pt-7 sm:gap-16 sm:pt-0">
      <section>
        <h1 className="text-balance text-[1.75rem] font-bold leading-tight tracking-tight sm:text-4xl">
          ¿De dónde salen estos números?
        </h1>
        <p className="mt-3 max-w-2xl text-[15px] leading-relaxed text-muted-foreground">
          Cada año el Instituto Nacional de Estadística visita miles de hogares en todo el país y les pregunta
          cuántos son, en qué trabajan y cuánto ganan. Aquí se resumen {YEARS.length} de esas encuestas, de{" "}
          {YEARS[0]} a {LATEST_YEAR}.
        </p>
      </section>

      <section>
        <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">Palabras que usamos</h2>
        <dl className="mt-5 grid gap-4 sm:grid-cols-2">
          {GLOSSARY.map(([term, meaning]) => (
            <div key={term} className="rounded-3xl bg-card p-5 shadow-sm ring-1 ring-border/60">
              <dt className="text-base font-bold">{term}</dt>
              <dd className="mt-1 text-sm leading-relaxed text-muted-foreground">{meaning}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section>
        <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">Los tres colores del mapa</h2>
        <p className="mt-2 max-w-2xl text-[15px] leading-relaxed text-muted-foreground">
          Un programa compara los departamentos en cada año y los reúne en tres grupos según qué tan parecida es su
          situación.
        </p>
        <div className="mt-5 grid gap-4 md:grid-cols-3">
          {CLUSTERS.map((c) => (
            <article key={c.id} className="overflow-hidden rounded-3xl bg-card shadow-sm ring-1 ring-border/60">
              <div className="h-2" style={{ background: CLUSTER_COLORS[c.id] }} />
              <div className="p-5">
                <h3 className="text-base font-bold">{c.name}</h3>
                <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{LEVEL_TEXT[c.id]}</p>
                <p className="mt-4 text-3xl font-bold tracking-tight">{Math.round(c.profile.tasa_pobreza * 100)}</p>
                <p className="text-sm text-muted-foreground">de cada 100 hogares en pobreza, en promedio</p>
              </div>
            </article>
          ))}
        </div>
        <p className="mt-4 max-w-2xl text-sm leading-relaxed text-muted-foreground">
          Los grupos son una guía, no una frontera exacta: dos departamentos de colores distintos pueden estar muy
          cerca entre sí.
        </p>
      </section>

      <section>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">Pruébalo tú</h2>
            <p className="mt-2 max-w-xl text-[15px] leading-relaxed text-muted-foreground">
              Parte de un departamento, cambia sus números y mira en qué grupo quedaría.
            </p>
          </div>
          <Select
            value={preset}
            onValueChange={(v) => {
              setPreset(v)
              setValues(valuesOf(Number(v)))
              setResult(null)
            }}
          >
            <SelectTrigger className="h-11 w-full rounded-full bg-card font-medium sm:w-60" aria-label="Partir de un departamento">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {presets.map((d) => (
                <SelectItem key={d.code} value={String(d.code)}>{d.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="mt-5 rounded-3xl bg-card p-5 shadow-sm ring-1 ring-border/60 sm:p-7">
          <div className="grid gap-x-10 gap-y-5 md:grid-cols-2">
            {FEATURES.map((f) => {
              const [min, max, step] = RANGE[f]
              return (
                <label key={f} className="block">
                  <span className="flex items-baseline justify-between gap-3 text-sm">
                    <span className="font-medium">{PLAIN[f] ?? getIndicator(f).label}</span>
                    <span className="shrink-0 tabular-nums text-muted-foreground">{plainValue(f, values[f])}</span>
                  </span>
                  <input
                    type="range"
                    min={min}
                    max={max}
                    step={step}
                    value={values[f]}
                    onChange={(e) => {
                      setValues({ ...values, [f]: Number(e.target.value) })
                      setResult(null)
                    }}
                    className="mt-2 h-6 w-full accent-[hsl(var(--primary))]"
                  />
                </label>
              )
            })}
          </div>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
            <button
              onClick={submit}
              disabled={loading}
              className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-primary px-6 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-60"
            >
              {loading && <Loader2 className="h-4 w-4 animate-spin" />}
              Ver en qué grupo queda
            </button>
            {result && (
              <p
                className="rounded-full px-4 py-2 text-sm font-semibold"
                style={{ background: CLUSTER_COLORS[result.cluster], color: result.cluster === 1 ? "#0b0b0b" : "#fff" }}
              >
                {CLUSTERS[result.cluster].name}
              </p>
            )}
            {error && <p className="text-sm text-muted-foreground">No se pudo consultar ahora ({error}).</p>}
          </div>
        </div>

      </section>

      <ModelsSection />
    </div>
  )
}
