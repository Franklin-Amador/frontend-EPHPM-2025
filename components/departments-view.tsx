"use client"

import { useMemo, useState } from "react"
import dynamic from "next/dynamic"
import { Info, MousePointerClick } from "lucide-react"
import TrendChart from "@/components/trend-chart"
import type { MapEntry } from "@/components/honduras-map"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  CLUSTERS,
  CLUSTER_COLORS,
  CLUSTER_METRIC,
  DEPARTMENTS,
  INDICATORS,
  LATEST_YEAR,
  NO_DATA_COLOR,
  YEARS,
  colorFor,
  deptRow,
  formatValue,
  getDepartment,
  getIndicator,
  indicatorExtent,
  labelFor,
  nationalRow,
  panel,
  rampCss,
  rowsForDepartment,
  rowsForYear,
} from "@/lib/panel"
import { cn } from "@/lib/utils"

const HondurasMap = dynamic(() => import("@/components/honduras-map"), {
  ssr: false,
  loading: () => <div className="h-full w-full animate-pulse rounded-xl bg-muted" />,
})

function Legend({ metric }: { metric: string }) {
  if (metric === CLUSTER_METRIC) {
    return (
      <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
        {CLUSTERS.map((c) => (
          <span key={c.id} className="inline-flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full" style={{ background: CLUSTER_COLORS[c.id] }} />
            {c.name}
          </span>
        ))}
        <span className="inline-flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full opacity-40" style={{ background: NO_DATA_COLOR }} />
          Sin dato
        </span>
      </div>
    )
  }
  const indicator = getIndicator(metric)
  const [min, max] = indicatorExtent(metric)
  return (
    <div className="flex items-center gap-2 text-xs tabular-nums text-muted-foreground">
      {formatValue(indicator.format, min)}
      <span className="h-2 w-32 rounded-full" style={{ background: rampCss }} />
      {formatValue(indicator.format, max)}
    </div>
  )
}

export default function DepartmentsView() {
  const [year, setYear] = useState(LATEST_YEAR)
  const [metric, setMetric] = useState(CLUSTER_METRIC)
  const [selected, setSelected] = useState<number | null>(null)

  const rows = useMemo(() => rowsForYear(year), [year])
  const entries = useMemo(() => {
    const out: Record<number, MapEntry> = {}
    for (const d of DEPARTMENTS) {
      const row = rows.find((r) => r.depto === d.code)
      const hasData = !!row && (metric === CLUSTER_METRIC ? row.cluster !== null : row[metric] != null)
      out[d.code] = { color: colorFor(metric, row), label: labelFor(metric, row), hasData }
    }
    return out
  }, [rows, metric])

  const indicator = metric === CLUSTER_METRIC ? null : getIndicator(metric)
  const metricAvailable = indicator ? indicator.years.includes(year) : panel.cluster_years.includes(year)
  // The ranking and the detail chart need a numeric indicator; fall back to poverty for the level view.
  const chartIndicator = indicator ?? getIndicator("tasa_pobreza")

  const ranking = rows
    .filter((r) => r[chartIndicator.key] != null)
    .sort((a, b) => (b[chartIndicator.key] as number) - (a[chartIndicator.key] as number))
  const rankingMax = Math.max(...ranking.map((r) => r[chartIndicator.key] as number), 0)

  const dept = selected ? getDepartment(selected) : null
  const selectedRow = selected ? deptRow(selected, year) : undefined
  const national = nationalRow(year)

  return (
    <div className="flex flex-col gap-4">
      <section className="flex flex-col gap-3 rounded-2xl border border-border bg-card p-3 sm:flex-row sm:items-center sm:justify-between sm:p-4">
        <div className="flex flex-wrap gap-1" role="tablist" aria-label="Año de la encuesta">
          {YEARS.map((y) => (
            <button
              key={y}
              role="tab"
              aria-selected={y === year}
              onClick={() => setYear(y)}
              className={cn(
                "shrink-0 rounded-lg px-2.5 py-1.5 text-sm font-medium tabular-nums transition-colors",
                y === year ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:bg-muted hover:text-foreground",
              )}
            >
              {y}
            </button>
          ))}
        </div>
        <Select value={metric} onValueChange={setMetric}>
          <SelectTrigger className="h-9 w-full rounded-lg sm:w-64" aria-label="Qué mostrar en el mapa">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={CLUSTER_METRIC}>Nivel de condiciones de vida</SelectItem>
            {INDICATORS.map((i) => (
              <SelectItem key={i.key} value={i.key}>{i.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </section>

      <div className="grid gap-4 lg:grid-cols-5">
        <section className="flex flex-col rounded-2xl border border-border bg-card p-4 lg:col-span-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h3 className="text-base font-semibold tracking-tight">
              {indicator ? indicator.label : "Nivel de condiciones de vida"} · {year}
            </h3>
            <Legend metric={metric} />
          </div>
          <div className="mt-2 h-[320px] sm:h-[420px]">
            <HondurasMap entries={entries} selected={selected} onSelect={setSelected} />
          </div>
          {!metricAvailable && (
            <p className="mt-2 flex items-start gap-2 rounded-xl bg-amber-500/10 px-3 py-2 text-xs text-amber-800 dark:text-amber-300">
              <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" />
              {indicator
                ? `La base de ${year} no trae este indicador.`
                : `La base de ${year} no incluye la medición de pobreza, así que ese año no tiene nivel asignado.`}
            </p>
          )}
          {indicator?.note && (
            <p className="mt-2 text-xs text-muted-foreground">{indicator.note}</p>
          )}
        </section>

        <section className="flex flex-col rounded-2xl border border-border bg-card p-4 lg:col-span-2">
          {!dept ? (
            <div className="flex flex-1 flex-col items-center justify-center gap-3 py-10 text-center">
              <MousePointerClick className="h-6 w-6 text-muted-foreground" />
              <p className="max-w-[16rem] text-sm text-muted-foreground">
                Elige un departamento en el mapa o en la lista para ver su situación en {year} y su recorrido.
              </p>
            </div>
          ) : (
            <>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs text-muted-foreground">{year}</p>
                  <h3 className="text-xl font-semibold tracking-tight">{dept.name}</h3>
                </div>
                {selectedRow && selectedRow.cluster !== null && (
                  <span
                    className="rounded-full px-2.5 py-1 text-xs font-medium text-white"
                    style={{ background: CLUSTER_COLORS[selectedRow.cluster] }}
                  >
                    {CLUSTERS[selectedRow.cluster].name}
                  </span>
                )}
              </div>

              {!selectedRow ? (
                <p className="mt-6 text-sm text-muted-foreground">
                  La encuesta de {year} no tiene muestra en {dept.name}.
                </p>
              ) : (
                <dl className="mt-4 grid grid-cols-2 gap-x-4 gap-y-3">
                  {["tasa_pobreza", "tasa_pobreza_extrema", "ymophg_median", "tasa_desempleo", "tasa_dependencia", "totper_mean"].map((key) => {
                    const i = getIndicator(key)
                    return (
                      <div key={key}>
                        <dt className="text-xs text-muted-foreground">{i.label}</dt>
                        <dd className="text-base font-semibold tabular-nums">{formatValue(i.format, selectedRow[key])}</dd>
                        <dd className="text-[11px] tabular-nums text-muted-foreground">
                          País: {formatValue(i.format, national?.[key])}
                        </dd>
                      </div>
                    )
                  })}
                </dl>
              )}

              <div className="mt-5 border-t border-border pt-4">
                <p className="text-xs font-medium text-muted-foreground">{chartIndicator.label} en el tiempo</p>
                <TrendChart
                  format={chartIndicator.format}
                  height={190}
                  highlightYear={year}
                  series={[
                    {
                      name: dept.name,
                      color: "hsl(var(--primary))",
                      values: Object.fromEntries(rowsForDepartment(dept.code).map((r) => [r.anio, r[chartIndicator.key]])),
                    },
                    {
                      name: "Honduras",
                      color: "hsl(var(--muted-foreground))",
                      dashed: true,
                      values: Object.fromEntries(panel.national.map((r) => [r.anio, r[chartIndicator.key]])),
                    },
                  ]}
                />
              </div>
              {selectedRow && (
                <p className="mt-2 text-[11px] text-muted-foreground">
                  Muestra: {selectedRow.n_hogares.toLocaleString("es-HN")} hogares.
                  {selectedRow.n_hogares < 150 && " Con tan pocos hogares, los cambios de un año a otro pueden ser ruido."}
                </p>
              )}
            </>
          )}
        </section>
      </div>

      <div className="grid gap-4 lg:grid-cols-5">
        <section className="rounded-2xl border border-border bg-card p-4 lg:col-span-2">
          <h3 className="text-base font-semibold tracking-tight">{chartIndicator.label} por departamento · {year}</h3>
          {ranking.length === 0 ? (
            <p className="mt-4 text-sm text-muted-foreground">Sin datos para este año.</p>
          ) : (
            <ul className="mt-3 flex flex-col gap-1">
              {ranking.map((r) => {
                const v = r[chartIndicator.key] as number
                return (
                  <li key={r.depto}>
                    <button
                      onClick={() => setSelected(r.depto)}
                      className={cn(
                        "grid w-full grid-cols-[7.5rem_1fr_4.5rem] items-center gap-2 rounded-lg px-2 py-1 text-left text-sm hover:bg-muted",
                        r.depto === selected && "bg-muted",
                      )}
                    >
                      <span className="truncate">{getDepartment(r.depto).name}</span>
                      <span className="h-2 overflow-hidden rounded-full bg-muted">
                        <span
                          className="block h-full rounded-full"
                          style={{ width: `${(v / rankingMax) * 100}%`, background: colorFor(metric, r) }}
                        />
                      </span>
                      <span className="text-right tabular-nums text-muted-foreground">
                        {formatValue(chartIndicator.format, v)}
                      </span>
                    </button>
                  </li>
                )
              })}
            </ul>
          )}
        </section>

        <section className="rounded-2xl border border-border bg-card p-4 lg:col-span-3">
          <h3 className="text-base font-semibold tracking-tight">
            {indicator ? indicator.label : "Nivel"} de cada departamento, año por año
          </h3>
          <div className="mt-3 overflow-x-auto">
            <table className="w-full min-w-[560px] border-separate border-spacing-1 text-xs">
              <thead>
                <tr className="text-muted-foreground">
                  <th className="text-left font-medium" />
                  {YEARS.map((y) => (
                    <th key={y} className={cn("font-medium tabular-nums", y === year && "text-foreground")}>
                      ’{String(y).slice(2)}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {DEPARTMENTS.map((d) => (
                  <tr key={d.code}>
                    <th
                      className={cn(
                        "whitespace-nowrap pr-2 text-left font-normal text-muted-foreground",
                        d.code === selected && "font-semibold text-foreground",
                      )}
                    >
                      {d.name}
                    </th>
                    {YEARS.map((y) => {
                      const row = deptRow(d.code, y)
                      const has = !!row && (metric === CLUSTER_METRIC ? row.cluster !== null : row[metric] != null)
                      return (
                        <td key={y} className="p-0">
                          <button
                            title={`${d.name}, ${y}: ${labelFor(metric, row)}`}
                            aria-label={`${d.name}, ${y}: ${labelFor(metric, row)}`}
                            onClick={() => {
                              setSelected(d.code)
                              setYear(y)
                            }}
                            className={cn(
                              "block h-5 w-full min-w-6 rounded-[5px] transition-transform hover:scale-110",
                              y === year && d.code === selected && "ring-2 ring-foreground ring-offset-1 ring-offset-card",
                            )}
                            style={{ background: colorFor(metric, row), opacity: has ? 1 : 0.18 }}
                          />
                        </td>
                      )
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-3 text-xs text-muted-foreground">
            Las celdas tenues son años sin dato. Gracias a Dios e Islas de la Bahía solo tienen muestra en 2023 y 2024.
          </p>
        </section>
      </div>
    </div>
  )
}
