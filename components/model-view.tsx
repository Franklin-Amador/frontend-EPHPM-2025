"use client"

import { useState } from "react"
import { Loader2 } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  API_URL,
  CLUSTERS,
  CLUSTER_COLORS,
  DEPARTMENTS,
  LATEST_YEAR,
  deptRow,
  formatValue,
  getIndicator,
  panel,
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

type Result = { cluster: number; cluster_name: string; description: string }

function valuesOf(code: number): Record<string, number> {
  const row = deptRow(code, LATEST_YEAR)!
  return Object.fromEntries(FEATURES.map((f) => [f, row[f] as number]))
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
      if (!res.ok) throw new Error(`La API respondió ${res.status}`)
      setResult(await res.json())
    } catch (e) {
      setResult(null)
      setError(e instanceof Error ? e.message : "No se pudo consultar la API")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <section className="rounded-2xl border border-border bg-card p-4 sm:p-6">
        <h2 className="text-xl font-semibold tracking-tight">Cómo se asigna el nivel</h2>
        <p className="mt-2 max-w-3xl text-sm text-muted-foreground">
          Un modelo {panel.model.algorithm} agrupa cada departamento en cada año según {FEATURES.length} indicadores
          comparables en el tiempo. Se entrenó con {panel.model.rows} observaciones departamento-año de los cortes
          que incluyen medición de pobreza.
        </p>
        <div className="mt-4 grid gap-3 md:grid-cols-3">
          {CLUSTERS.map((c) => (
            <div key={c.id} className="rounded-xl border border-border p-4">
              <span className="inline-flex items-center gap-2 text-sm font-semibold">
                <span className="h-2.5 w-2.5 rounded-full" style={{ background: CLUSTER_COLORS[c.id] }} />
                {c.name}
              </span>
              <p className="mt-1 text-xs text-muted-foreground">{c.description}</p>
              <dl className="mt-3 space-y-1 text-xs">
                {FEATURES.map((f) => (
                  <div key={f} className="flex justify-between gap-2">
                    <dt className="text-muted-foreground">{getIndicator(f).label}</dt>
                    <dd className="font-medium tabular-nums">{formatValue(getIndicator(f).format, c.profile[f])}</dd>
                  </div>
                ))}
                <div className="flex justify-between gap-2 border-t border-border pt-1">
                  <dt className="text-muted-foreground">Observaciones</dt>
                  <dd className="font-medium tabular-nums">{c.profile.n}</dd>
                </div>
              </dl>
            </div>
          ))}
        </div>
        <ul className="mt-4 max-w-3xl list-disc space-y-1 pl-5 text-xs text-muted-foreground">
          <li>
            Los niveles son tramos de un gradiente continuo, no tipos nítidos de departamento: la separación entre
            grupos es moderada (silhouette {panel.model.silhouette.toFixed(2)}).
          </li>
          <li>
            Los departamentos más pobres muestran menos desempleo: allí casi todos trabajan, sobre todo en
            agricultura, aunque con ingresos muy bajos.
          </li>
          <li>Fuente: {panel.source}. Datos procesados el {panel.generated}.</li>
        </ul>
      </section>

      <section className="rounded-2xl border border-border bg-card p-4 sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-xl font-semibold tracking-tight">Probar el modelo</h2>
            <p className="text-sm text-muted-foreground">Mueve los indicadores y consulta qué nivel les asigna.</p>
          </div>
          <Select
            value={preset}
            onValueChange={(v) => {
              setPreset(v)
              setValues(valuesOf(Number(v)))
              setResult(null)
            }}
          >
            <SelectTrigger className="h-9 w-full rounded-lg sm:w-60" aria-label="Partir de un departamento">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {presets.map((d) => (
                <SelectItem key={d.code} value={String(d.code)}>{d.name} · {LATEST_YEAR}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="mt-5 grid gap-x-8 gap-y-4 md:grid-cols-2">
          {FEATURES.map((f) => {
            const indicator = getIndicator(f)
            const [min, max, step] = RANGE[f]
            return (
              <label key={f} className="block">
                <span className="flex justify-between text-sm">
                  <span className="font-medium">{indicator.label}</span>
                  <span className="tabular-nums text-muted-foreground">{formatValue(indicator.format, values[f])}</span>
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
                  className="mt-2 w-full accent-[hsl(var(--primary))]"
                />
              </label>
            )
          })}
        </div>

        <div className="mt-6 flex flex-wrap items-center gap-4">
          <button
            onClick={submit}
            disabled={loading}
            className="inline-flex h-10 items-center gap-2 rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-60"
          >
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
            Consultar nivel
          </button>
          {result && (
            <p className="flex items-center gap-2 text-sm">
              <span className="h-2.5 w-2.5 rounded-full" style={{ background: CLUSTER_COLORS[result.cluster] }} />
              <span className="font-semibold">{result.cluster_name}</span>
              <span className="text-muted-foreground">{result.description}</span>
            </p>
          )}
          {error && <p className="text-sm text-rose-600 dark:text-rose-400">No se pudo consultar el modelo: {error}.</p>}
        </div>
      </section>
    </div>
  )
}
