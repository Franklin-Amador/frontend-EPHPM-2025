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
    <div className="flex flex-col gap-10 sm:gap-14">
      <section>
        <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">Cómo se asigna el nivel</h1>
        <p className="mt-3 max-w-xl text-[15px] leading-relaxed text-muted-foreground">
          Un modelo {panel.model.algorithm} agrupa cada departamento en cada año según {FEATURES.length} indicadores
          comparables en el tiempo, a partir de {panel.model.rows} observaciones.
        </p>

        <div className="mt-7 grid gap-x-8 gap-y-7 md:grid-cols-3">
          {CLUSTERS.map((c) => (
            <div key={c.id} className="border-t-2 pt-3" style={{ borderColor: CLUSTER_COLORS[c.id] }}>
              <h2 className="text-sm font-semibold">{c.name}</h2>
              <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{c.description}</p>
              <dl className="mt-3 space-y-1.5 text-xs">
                {FEATURES.map((f) => (
                  <div key={f} className="flex justify-between gap-2">
                    <dt className="text-muted-foreground">{getIndicator(f).label}</dt>
                    <dd className="tabular-nums">{formatValue(getIndicator(f).format, c.profile[f])}</dd>
                  </div>
                ))}
              </dl>
            </div>
          ))}
        </div>

        <p className="mt-7 max-w-xl text-xs leading-relaxed text-muted-foreground">
          Los niveles son tramos de un gradiente continuo, no tipos nítidos de departamento (silhouette{" "}
          {panel.model.silhouette.toFixed(2)}). Los departamentos más pobres muestran menos desempleo porque allí
          casi todos trabajan, sobre todo en agricultura, aunque con ingresos muy bajos.
        </p>
      </section>

      <section>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-lg font-semibold tracking-tight">Probar el modelo</h2>
            <p className="mt-0.5 text-sm text-muted-foreground">Mueve los indicadores y consulta el nivel.</p>
          </div>
          <Select
            value={preset}
            onValueChange={(v) => {
              setPreset(v)
              setValues(valuesOf(Number(v)))
              setResult(null)
            }}
          >
            <SelectTrigger className="h-10 w-full rounded-full bg-card sm:w-60" aria-label="Partir de un departamento">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {presets.map((d) => (
                <SelectItem key={d.code} value={String(d.code)}>{d.name} · {LATEST_YEAR}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="mt-5 rounded-2xl bg-card p-5 shadow-[0_1px_2px_rgb(0_0_0/0.04)] ring-1 ring-border/70 sm:p-6">
          <div className="grid gap-x-10 gap-y-5 md:grid-cols-2">
            {FEATURES.map((f) => {
              const indicator = getIndicator(f)
              const [min, max, step] = RANGE[f]
              return (
                <label key={f} className="block">
                  <span className="flex justify-between text-sm">
                    <span>{indicator.label}</span>
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
                    className="mt-2 h-6 w-full accent-[hsl(var(--chart-1))]"
                  />
                </label>
              )
            })}
          </div>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
            <button
              onClick={submit}
              disabled={loading}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-full bg-primary px-5 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-60"
            >
              {loading && <Loader2 className="h-4 w-4 animate-spin" />}
              Consultar nivel
            </button>
            {result && (
              <p className="flex items-center gap-2 text-sm">
                <span className="h-2 w-2 shrink-0 rounded-full" style={{ background: CLUSTER_COLORS[result.cluster] }} />
                <span className="font-medium">{result.cluster_name}</span>
              </p>
            )}
            {error && <p className="text-sm text-muted-foreground">No se pudo consultar el modelo: {error}.</p>}
          </div>
        </div>
      </section>
    </div>
  )
}
