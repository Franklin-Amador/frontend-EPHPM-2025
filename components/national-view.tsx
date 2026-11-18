"use client"

import { useState } from "react"
import TrendChart from "@/components/trend-chart"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  INDICATORS,
  LATEST_YEAR,
  YEARS,
  formatDelta,
  formatValue,
  getIndicator,
  panel,
} from "@/lib/panel"
import { cn } from "@/lib/utils"

// Four headline figures; everything else is one tap away in the selector.
const KPI_KEYS = ["tasa_pobreza", "tasa_pobreza_extrema", "ymophg_median", "tasa_desempleo"]
const CHOICES = INDICATORS.filter((i) => i.key !== "ymophg_median_rel")

function nationalSeries(key: string): Record<number, number | null> {
  return Object.fromEntries(panel.national.map((r) => [r.anio, r[key]]))
}

export default function NationalView() {
  const [selected, setSelected] = useState("tasa_pobreza")
  const indicator = getIndicator(selected)
  const series = nationalSeries(selected)
  const missing = YEARS.filter((y) => !indicator.years.includes(y))

  return (
    <div className="flex flex-col gap-10 sm:gap-14">
      <section>
        <p className="text-sm text-muted-foreground">Honduras · {LATEST_YEAR}</p>
        <h1 className="mt-2 max-w-2xl text-balance text-3xl font-semibold leading-tight tracking-tight sm:text-4xl">
          Seis de cada diez hogares siguen en pobreza, igual que en {YEARS[0]}.
        </h1>
        <p className="mt-3 max-w-xl text-[15px] leading-relaxed text-muted-foreground">
          En ese tiempo los hogares se hicieron más pequeños y más de un tercio tiene hoy jefatura femenina.
        </p>
      </section>

      <section className="grid grid-cols-2 gap-x-6 gap-y-7 sm:grid-cols-4">
        {KPI_KEYS.map((key) => {
          const i = getIndicator(key)
          const s = nationalSeries(key)
          const from = s[i.years[0]] as number
          const to = s[LATEST_YEAR] as number
          return (
            <button
              key={key}
              onClick={() => setSelected(key)}
              className={cn(
                "border-t pt-3 text-left transition-colors",
                key === selected ? "border-foreground" : "border-border hover:border-muted-foreground",
              )}
            >
              <span className="block text-xs text-muted-foreground">{i.label}</span>
              <span className="mt-1 block text-2xl font-semibold tracking-tight tabular-nums sm:text-[28px]">
                {formatValue(i.format, to)}
              </span>
              <span className="mt-1 block text-xs tabular-nums text-muted-foreground">
                {formatDelta(i.format, from, to)} desde {i.years[0]}
              </span>
            </button>
          )
        })}
      </section>

      <section>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-lg font-semibold tracking-tight">{indicator.label}</h2>
            <p className="mt-0.5 max-w-xl text-sm text-muted-foreground">{indicator.description}</p>
          </div>
          <Select value={selected} onValueChange={setSelected}>
            <SelectTrigger className="h-10 w-full rounded-full bg-card sm:w-60" aria-label="Indicador">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {CHOICES.map((i) => (
                <SelectItem key={i.key} value={i.key}>{i.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="mt-5 rounded-2xl bg-card p-3 shadow-[0_1px_2px_rgb(0_0_0/0.04)] ring-1 ring-border/70 sm:p-5">
          <TrendChart
            format={indicator.format}
            height={300}
            series={[{ name: "Honduras", color: "hsl(var(--chart-1))", values: series }]}
          />
        </div>

        <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
          {indicator.note && <>{indicator.note} </>}
          {missing.length > 0 && <>Las bases de {missing.join(" y ")} no traen este indicador. </>}
          Las líneas punteadas marcan años sin microdatos publicados.
        </p>
      </section>

      <details className="group">
        <summary className="cursor-pointer list-none text-sm font-medium text-muted-foreground transition-colors hover:text-foreground [&::-webkit-details-marker]:hidden">
          <span className="group-open:hidden">Ver todos los indicadores en tabla +</span>
          <span className="hidden group-open:inline">Ocultar tabla −</span>
        </summary>
        <div className="-mx-5 mt-4 overflow-x-auto px-5 sm:mx-0 sm:px-0">
          <table className="w-full min-w-[680px] text-sm">
            <thead>
              <tr className="border-b border-border text-xs text-muted-foreground">
                <th className="py-2 pr-4 text-left font-normal">Indicador</th>
                {YEARS.map((y) => (
                  <th key={y} className="px-2 py-2 text-right font-normal tabular-nums">{y}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {CHOICES.map((i) => (
                <tr key={i.key} className="border-b border-border/60 last:border-0">
                  <td className="whitespace-nowrap py-2 pr-4">{i.label}</td>
                  {YEARS.map((y) => (
                    <td key={y} className="px-2 py-2 text-right tabular-nums text-muted-foreground">
                      {formatValue(i.format, nationalSeries(i.key)[y]).replace(" años", "")}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </details>
    </div>
  )
}
