"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import dynamic from "next/dynamic"
import { Pause, Play } from "lucide-react"
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
  perHundred,
  rampCss,
  rowsForDepartment,
  rowsForYear,
} from "@/lib/panel"
import { cn } from "@/lib/utils"

const HondurasMap = dynamic(() => import("@/components/honduras-map"), {
  ssr: false,
  loading: () => <div className="h-full w-full animate-pulse rounded-xl bg-muted" />,
})

const card = "rounded-3xl bg-card shadow-sm ring-1 ring-border/60"

function YearPicker({ year, onChange }: { year: number; onChange: (y: number) => void }) {
  const active = useRef<HTMLButtonElement>(null)
  useEffect(() => {
    active.current?.scrollIntoView({ inline: "center", block: "nearest" })
  }, [year])
  return (
    <div
      className="no-scrollbar -mx-5 flex gap-1 overflow-x-auto px-5 sm:mx-0 sm:px-0"
      role="tablist"
      aria-label="Año de la encuesta"
    >
      {YEARS.map((y) => (
        <button
          key={y}
          ref={y === year ? active : undefined}
          role="tab"
          aria-selected={y === year}
          onClick={() => onChange(y)}
          className={cn(
            "shrink-0 rounded-full px-3 py-1.5 text-sm tabular-nums transition-colors",
            y === year
              ? "bg-primary font-semibold text-primary-foreground"
              : "text-muted-foreground hover:bg-muted hover:text-foreground",
          )}
        >
          {y}
        </button>
      ))}
    </div>
  )
}

function Legend({ metric }: { metric: string }) {
  if (metric === CLUSTER_METRIC) {
    return (
      <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
        {CLUSTERS.map((c) => (
          <span key={c.id} className="inline-flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full" style={{ background: CLUSTER_COLORS[c.id] }} />
            {c.name.replace("Condiciones ", "")}
          </span>
        ))}
      </div>
    )
  }
  const indicator = getIndicator(metric)
  const [min, max] = indicatorExtent(metric)
  return (
    <div className="flex items-center gap-2 text-xs tabular-nums text-muted-foreground">
      {formatValue(indicator.format, min)}
      <span className="h-1.5 w-24 rounded-full" style={{ background: rampCss }} />
      {formatValue(indicator.format, max)}
    </div>
  )
}

export default function DepartmentsView() {
  const [year, setYear] = useState(LATEST_YEAR)
  const [metric, setMetric] = useState(CLUSTER_METRIC)
  const [selected, setSelected] = useState<number | null>(null)
  const [tab, setTab] = useState<"ranking" | "grid">("ranking")
  const detailRef = useRef<HTMLElement>(null)
  const [playing, setPlaying] = useState(false)

  // "Play" steps through the survey years so the map changes in front of the reader.
  useEffect(() => {
    if (!playing) return
    const id = setInterval(() => {
      setYear((y) => {
        const next = YEARS[YEARS.indexOf(y) + 1]
        if (next === undefined) {
          setPlaying(false)
          return y
        }
        return next
      })
    }, 1200)
    return () => clearInterval(id)
  }, [playing])

  // Picking from the lists below the fold brings the detail card back into view.
  const selectFromList = (code: number) => {
    setSelected(code)
    detailRef.current?.scrollIntoView({ behavior: "smooth", block: "start" })
  }

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
  // The ranking and the detail chart need a number; the level view falls back to poverty.
  const chartIndicator = indicator ?? getIndicator("tasa_pobreza")

  const ranking = rows
    .filter((r) => r[chartIndicator.key] != null)
    .sort((a, b) => (b[chartIndicator.key] as number) - (a[chartIndicator.key] as number))
  const rankingMax = Math.max(...ranking.map((r) => r[chartIndicator.key] as number), 0)

  const dept = selected ? getDepartment(selected) : null
  const selectedRow = selected ? deptRow(selected, year) : undefined
  const national = nationalRow(year)

  return (
    <div className="flex flex-col gap-6 pt-7 sm:gap-8 sm:pt-0">
      <section className="flex flex-col gap-4">
        <div>
          <h1 className="text-balance text-[1.75rem] font-bold leading-tight tracking-tight sm:text-4xl">
            ¿Dónde es más difícil vivir?
          </h1>
          <p className="mt-2 max-w-2xl text-[15px] leading-relaxed text-muted-foreground">
            No todo el país vive igual. Toca un departamento para conocer su situación, o reproduce los años para
            ver cómo cambia el mapa.
          </p>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <button
            onClick={() => {
              if (!playing && year === LATEST_YEAR) setYear(YEARS[0])
              setPlaying(!playing)
            }}
            className="inline-flex h-11 items-center justify-center gap-2 self-start rounded-full bg-primary px-5 text-sm font-semibold text-primary-foreground"
          >
            {playing ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
            {playing ? "Pausar" : "Reproducir los años"}
          </button>
          <Select value={metric} onValueChange={setMetric}>
            <SelectTrigger className="h-11 w-full rounded-full bg-card font-medium sm:w-72" aria-label="Qué mostrar en el mapa">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={CLUSTER_METRIC}>Nivel de condiciones de vida</SelectItem>
              {INDICATORS.map((i) => (
                <SelectItem key={i.key} value={i.key}>{i.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <YearPicker
          year={year}
          onChange={(y) => {
            setPlaying(false)
            setYear(y)
          }}
        />
      </section>

      <div className="grid gap-4 lg:grid-cols-5 lg:gap-5">
        <section className={cn(card, "p-4 sm:p-5 lg:col-span-3")}>
          <div className="relative h-[210px] sm:h-[380px]">
            <span className="pointer-events-none absolute right-0 top-0 text-4xl font-bold tabular-nums text-foreground/10 sm:text-6xl">
              {year}
            </span>
            <HondurasMap entries={entries} selected={selected} onSelect={setSelected} />
          </div>
          <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
            <Legend metric={metric} />
            <span className="text-xs text-muted-foreground">Gris: sin dato ese año</span>
          </div>
          {!metricAvailable && (
            <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
              {indicator
                ? `La base de ${year} no trae este indicador.`
                : `La base de ${year} no mide pobreza, así que ese año no tiene nivel asignado.`}
            </p>
          )}
          {indicator?.note && metricAvailable && (
            <p className="mt-3 text-xs leading-relaxed text-muted-foreground">{indicator.note}</p>
          )}
        </section>

        <section ref={detailRef} className={cn(card, "scroll-mt-28 p-5 lg:col-span-2")}>
          {!dept ? (
            <div className="flex h-full min-h-[8rem] items-center justify-center">
              <p className="max-w-[15rem] text-center text-sm leading-relaxed text-muted-foreground">
                Elige un departamento para ver su situación en {year} y cómo ha cambiado.
              </p>
            </div>
          ) : (
            <>
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h2 className="text-2xl font-bold tracking-tight">{dept.name}</h2>
                {selectedRow && selectedRow.cluster !== null && (
                  <span
                    className="rounded-full px-3 py-1 text-xs font-semibold"
                    style={{
                      background: CLUSTER_COLORS[selectedRow.cluster],
                      color: selectedRow.cluster === 1 ? "#0b0b0b" : "#fff",
                    }}
                  >
                    {CLUSTERS[selectedRow.cluster].name}
                  </span>
                )}
              </div>

              {!selectedRow || selectedRow.tasa_pobreza == null ? (
                <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
                  {selectedRow
                    ? `La encuesta de ${year} no midió la pobreza.`
                    : `La encuesta de ${year} no visitó hogares en ${dept.name}.`}
                </p>
              ) : (
                <>
                  <p className="mt-3 text-[15px] leading-relaxed">
                    En {year}, <strong>{perHundred(selectedRow.tasa_pobreza)} hogares</strong> vivían en pobreza.
                  </p>
                  <div className="mt-3 space-y-2">
                    {(
                      [
                        [dept.name, selectedRow.tasa_pobreza, "hsl(var(--chart-1))"],
                        ["Todo el país", national?.tasa_pobreza ?? null, "var(--no-data)"],
                      ] as const
                    ).map(([label, value, color]) => (
                      <div key={label} className="grid grid-cols-[6.5rem_1fr_2rem] items-center gap-2 text-xs">
                        <span className="truncate text-muted-foreground">{label}</span>
                        <span className="h-2.5 overflow-hidden rounded-full bg-muted">
                          <span
                            className="block h-full rounded-full"
                            style={{ width: `${(value ?? 0) * 100}%`, background: color }}
                          />
                        </span>
                        <span className="text-right font-semibold tabular-nums">{Math.round((value ?? 0) * 100)}</span>
                      </div>
                    ))}
                  </div>
                  <ul className="mt-4 space-y-1.5 text-sm leading-relaxed text-muted-foreground">
                    <li>
                      <strong className="text-foreground">{perHundred(selectedRow.tasa_pobreza_extrema)}</strong> no
                      tienen ni para la comida.
                    </li>
                    <li>
                      Un hogar típico gana{" "}
                      <strong className="text-foreground">{formatValue("lps", selectedRow.ymophg_median)}</strong> al
                      mes (en el país, {formatValue("lps", national?.ymophg_median)}).
                    </li>
                  </ul>
                </>
              )}

              <div className="mt-5">
                <p className="text-xs text-muted-foreground">
                  {chartIndicator.label} en el tiempo · línea punteada: país
                </p>
                <TrendChart
                  format={chartIndicator.format}
                  height={170}
                  highlightYear={year}
                  series={[
                    {
                      name: dept.name,
                      color: "hsl(var(--chart-1))",
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
              {selectedRow && selectedRow.n_hogares < 150 && (
                <p className="mt-2 text-[11px] leading-relaxed text-muted-foreground">
                  Muestra pequeña ({selectedRow.n_hogares} hogares): los cambios de un año a otro pueden ser ruido.
                </p>
              )}
            </>
          )}
        </section>
      </div>

      <section>
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-xl font-bold tracking-tight sm:text-2xl">
            {tab === "ranking" ? `${chartIndicator.label} en ${year}` : "Año por año"}
          </h2>
          <div className="flex rounded-full bg-muted p-0.5 text-xs">
            {([["ranking", "Ranking"], ["grid", "Año por año"]] as const).map(([id, label]) => (
              <button
                key={id}
                onClick={() => setTab(id)}
                className={cn(
                  "rounded-full px-3 py-1.5 transition-colors",
                  tab === id ? "bg-card font-medium text-foreground shadow-sm" : "text-muted-foreground",
                )}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {tab === "ranking" ? (
          ranking.length === 0 ? (
            <p className="mt-4 text-sm text-muted-foreground">Sin datos para este año.</p>
          ) : (
            <ul className="mt-4 sm:columns-2 sm:gap-x-10">
              {ranking.map((r) => {
                const v = r[chartIndicator.key] as number
                return (
                  <li key={r.depto} className="break-inside-avoid">
                    <button
                      onClick={() => selectFromList(r.depto)}
                      className={cn(
                        "grid w-full grid-cols-[1fr_auto] items-center gap-x-3 gap-y-1 rounded-lg px-2 py-2 text-left text-sm transition-colors hover:bg-muted",
                        r.depto === selected && "bg-muted",
                      )}
                    >
                      <span className="truncate">{getDepartment(r.depto).name}</span>
                      <span className="tabular-nums text-muted-foreground">{formatValue(chartIndicator.format, v)}</span>
                      <span className="col-span-2 h-1 overflow-hidden rounded-full bg-muted">
                        <span
                          className="block h-full rounded-full"
                          style={{ width: `${(v / rankingMax) * 100}%`, background: colorFor(metric, r) }}
                        />
                      </span>
                    </button>
                  </li>
                )
              })}
            </ul>
          )
        ) : (
          <div className="mt-4">
            <table className="w-full table-fixed border-separate border-spacing-[3px] text-[11px] sm:text-xs">
              <thead>
                <tr className="text-muted-foreground">
                  <th className="w-[5.5rem] sm:w-36" />
                  {YEARS.map((y) => (
                    <th key={y} className={cn("font-normal tabular-nums", y === year && "font-semibold text-foreground")}>
                      {String(y).slice(2)}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {DEPARTMENTS.map((d) => (
                  <tr key={d.code}>
                    <th
                      className={cn(
                        "truncate pr-1 text-left font-normal text-muted-foreground",
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
                              setYear(y)
                              selectFromList(d.code)
                            }}
                            className={cn(
                              "block h-4 w-full rounded-[4px] sm:h-5",
                              y === year && d.code === selected && "ring-2 ring-foreground ring-offset-1 ring-offset-background",
                            )}
                            style={{ background: colorFor(metric, row), opacity: has ? 1 : 0.15 }}
                          />
                        </td>
                      )
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
            <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
              Cada celda es un departamento en un año; las tenues no tienen dato. Toca una para ir a ese año.
            </p>
          </div>
        )}
      </section>
    </div>
  )
}
