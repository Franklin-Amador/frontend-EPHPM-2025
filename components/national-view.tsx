"use client"

import { useState } from "react"
import { ArrowDownRight, ArrowUpRight, Info } from "lucide-react"
import TrendChart from "@/components/trend-chart"
import {
  INDICATORS,
  LATEST_YEAR,
  YEARS,
  formatDelta,
  formatValue,
  getIndicator,
  panel,
  type Indicator,
} from "@/lib/panel"
import { cn } from "@/lib/utils"

const KPI_KEYS = [
  "tasa_pobreza",
  "tasa_pobreza_extrema",
  "ymophg_median",
  "tasa_desempleo",
  "pct_jefatura_femenina",
  "totper_mean",
]

function nationalSeries(key: string): Record<number, number | null> {
  return Object.fromEntries(panel.national.map((r) => [r.anio, r[key]]))
}

function Sparkline({ values }: { values: (number | null)[] }) {
  const points = values
    .map((v, i) => ({ v, i }))
    .filter((p): p is { v: number; i: number } => p.v !== null)
  if (points.length < 2) return null
  const min = Math.min(...points.map((p) => p.v))
  const max = Math.max(...points.map((p) => p.v))
  const x = (i: number) => (i / (values.length - 1)) * 100
  const y = (v: number) => 26 - ((v - min) / (max - min || 1)) * 22
  const d = points.map((p, n) => `${n ? "L" : "M"}${x(p.i).toFixed(1)},${y(p.v).toFixed(1)}`).join(" ")
  const last = points[points.length - 1]
  return (
    <svg viewBox="0 0 100 30" preserveAspectRatio="none" className="h-8 w-full overflow-visible" aria-hidden>
      <path d={d} fill="none" stroke="currentColor" strokeWidth={1.5} vectorEffect="non-scaling-stroke" />
      <circle cx={x(last.i)} cy={y(last.v)} r={1.8} fill="currentColor" />
    </svg>
  )
}

function KpiCard({ indicator, active, onClick }: { indicator: Indicator; active: boolean; onClick: () => void }) {
  const series = nationalSeries(indicator.key)
  const years = indicator.years
  const first = years[0]
  const from = series[first] as number
  const to = series[LATEST_YEAR] as number
  const rose = to > from
  const bad = indicator.worse === "none" ? null : (indicator.worse === "up") === rose
  const Arrow = rose ? ArrowUpRight : ArrowDownRight

  return (
    <button
      onClick={onClick}
      className={cn(
        "group flex flex-col gap-3 rounded-2xl border bg-card p-4 text-left transition-all hover:-translate-y-0.5 hover:shadow-md",
        active ? "border-primary ring-1 ring-primary" : "border-border",
      )}
    >
      <span className="text-xs font-medium text-muted-foreground">{indicator.label}</span>
      <span className="text-2xl font-semibold tracking-tight tabular-nums text-foreground">
        {formatValue(indicator.format, to)}
      </span>
      <span className="text-muted-foreground/70 group-hover:text-primary">
        <Sparkline values={YEARS.map((y) => series[y] ?? null)} />
      </span>
      <span
        className={cn(
          "inline-flex items-center gap-1 text-xs font-medium tabular-nums",
          bad === null ? "text-muted-foreground" : bad ? "text-rose-600 dark:text-rose-400" : "text-teal-600 dark:text-teal-400",
        )}
      >
        <Arrow className="h-3.5 w-3.5" />
        {formatDelta(indicator.format, from, to)}
        <span className="font-normal text-muted-foreground">desde {first}</span>
      </span>
    </button>
  )
}

export default function NationalView() {
  const [selected, setSelected] = useState("tasa_pobreza")
  const indicator = getIndicator(selected)
  const series = nationalSeries(selected)

  return (
    <div className="flex flex-col gap-6">
      <section>
        <p className="text-sm text-muted-foreground">Honduras, {LATEST_YEAR}</p>
        <h2 className="mt-1 max-w-3xl text-balance text-2xl font-semibold tracking-tight sm:text-3xl">
          Seis de cada diez hogares siguen en pobreza, igual que en {YEARS[0]}.
        </h2>
        <p className="mt-2 max-w-3xl text-sm text-muted-foreground">
          Mientras tanto los hogares se hicieron más pequeños, más de un tercio tiene jefatura femenina y
          cada vez más reciben remesas. Elige un indicador para ver su recorrido.
        </p>
      </section>

      <section className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
        {KPI_KEYS.map((key) => (
          <KpiCard
            key={key}
            indicator={getIndicator(key)}
            active={key === selected}
            onClick={() => setSelected(key)}
          />
        ))}
      </section>

      <section className="rounded-2xl border border-border bg-card p-4 sm:p-6">
        <div className="flex flex-wrap gap-1.5">
          {INDICATORS.filter((i) => i.key !== "ymophg_median_rel").map((i) => (
            <button
              key={i.key}
              onClick={() => setSelected(i.key)}
              className={cn(
                "rounded-full px-3 py-1.5 text-xs font-medium transition-colors",
                i.key === selected
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:text-foreground",
              )}
            >
              {i.label}
            </button>
          ))}
        </div>

        <div className="mt-5 flex flex-wrap items-end justify-between gap-2">
          <div>
            <h3 className="text-lg font-semibold tracking-tight">{indicator.label}</h3>
            <p className="max-w-2xl text-sm text-muted-foreground">{indicator.description}</p>
          </div>
          <p className="text-xs text-muted-foreground">Total nacional, {indicator.years[0]}–{LATEST_YEAR}</p>
        </div>

        <div className="mt-4">
          <TrendChart
            format={indicator.format}
            height={340}
            series={[{ name: "Honduras", color: "hsl(var(--primary))", values: series }]}
          />
        </div>

        <div className="mt-4 flex flex-col gap-2 text-xs text-muted-foreground">
          {indicator.note && (
            <p className="flex items-start gap-2 rounded-xl bg-amber-500/10 px-3 py-2 text-amber-800 dark:text-amber-300">
              <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" />
              {indicator.note}
            </p>
          )}
          {YEARS.some((y) => !indicator.years.includes(y)) && (
            <p>
              Las bases de {YEARS.filter((y) => !indicator.years.includes(y)).join(", ")} no traen este indicador.
            </p>
          )}
          <p>{panel.missing_years_note}</p>
        </div>
      </section>

      <section className="rounded-2xl border border-border bg-card p-4 sm:p-6">
        <h3 className="text-lg font-semibold tracking-tight">Todos los cortes</h3>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[720px] text-sm">
            <thead>
              <tr className="border-b border-border text-xs text-muted-foreground">
                <th className="py-2 pr-4 text-left font-medium">Indicador</th>
                {YEARS.map((y) => (
                  <th key={y} className="px-2 py-2 text-right font-medium tabular-nums">{y}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {INDICATORS.filter((i) => i.key !== "ymophg_median_rel").map((i) => (
                <tr
                  key={i.key}
                  onClick={() => setSelected(i.key)}
                  className={cn(
                    "cursor-pointer border-b border-border/60 last:border-0 hover:bg-muted/60",
                    i.key === selected && "bg-muted/60",
                  )}
                >
                  <td className="py-2 pr-4 font-medium">{i.label}</td>
                  {YEARS.map((y) => (
                    <td key={y} className="px-2 py-2 text-right tabular-nums text-muted-foreground">
                      {formatValue(i.format, nationalRowValue(i.key, y)).replace(" años", "")}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  )
}

function nationalRowValue(key: string, year: number): number | null {
  return panel.national.find((r) => r.anio === year)?.[key] ?? null
}
