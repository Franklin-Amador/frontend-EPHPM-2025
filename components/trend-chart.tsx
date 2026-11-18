"use client"

import {
  CartesianGrid,
  Line,
  LineChart,
  ReferenceArea,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"
import { GAP_RANGES, GAP_YEARS, LATEST_YEAR, YEARS, formatValue, type IndicatorFormat } from "@/lib/panel"

export interface TrendSeries {
  name: string
  color: string
  dashed?: boolean
  /** value per survey year */
  values: Record<number, number | null | undefined>
}

interface TrendChartProps {
  series: TrendSeries[]
  format: IndicatorFormat
  height?: number
  highlightYear?: number
}

const axisTick = { fontSize: 11, fill: "hsl(var(--muted-foreground))" }

function compact(format: IndicatorFormat, v: number): string {
  if (format === "pct") return `${Math.round(v * 100)}%`
  if (format === "lps") return `${(v / 1000).toFixed(0)}k`
  return v.toFixed(format === "years" ? 0 : 1)
}

export default function TrendChart({ series, format, height = 280, highlightYear }: TrendChartProps) {
  // One row per calendar year. Years without a survey carry nulls so the line breaks
  // instead of drawing a straight segment across a gap that was never measured.
  const data = [...YEARS, ...GAP_YEARS]
    .sort((a, b) => a - b)
    .map((anio) => {
      const row: Record<string, number | null> = { anio }
      series.forEach((s, i) => (row[`s${i}`] = s.values[anio] ?? null))
      return row
    })

  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={data} margin={{ top: 8, right: 12, bottom: 0, left: 0 }}>
        <CartesianGrid stroke="hsl(var(--border))" strokeDasharray="3 3" vertical={false} />
        {GAP_RANGES.map(([from, to]) => (
          <ReferenceArea
            key={from}
            x1={from - 0.5}
            x2={to + 0.5}
            fill="hsl(var(--muted))"
            fillOpacity={0.7}
            stroke="none"
            label={
              to - from >= 2
                ? { value: "sin microdatos", fontSize: 10, fill: "hsl(var(--muted-foreground))" }
                : undefined
            }
          />
        ))}
        {highlightYear && (
          <ReferenceArea
            x1={highlightYear - 0.4}
            x2={highlightYear + 0.4}
            fill="hsl(var(--primary))"
            fillOpacity={0.1}
            stroke="none"
          />
        )}
        <XAxis
          dataKey="anio"
          type="number"
          domain={[YEARS[0] - 0.5, LATEST_YEAR + 0.5]}
          ticks={YEARS}
          tick={axisTick}
          tickLine={false}
          axisLine={{ stroke: "hsl(var(--border))" }}
          tickFormatter={(y: number) => `’${String(y).slice(2)}`}
        />
        <YAxis
          width={44}
          tick={axisTick}
          tickLine={false}
          axisLine={false}
          domain={["auto", "auto"]}
          tickFormatter={(v: number) => compact(format, v)}
        />
        <Tooltip
          cursor={{ stroke: "hsl(var(--muted-foreground))", strokeDasharray: "3 3" }}
          content={({ active, payload, label }) => {
            const rows = (payload ?? []).filter((p) => p.value !== null && p.value !== undefined)
            if (!active || rows.length === 0) return null
            return (
              <div className="rounded-xl border border-border bg-popover px-3 py-2 text-xs shadow-lg">
                <p className="mb-1 font-semibold text-popover-foreground">{label}</p>
                {rows.map((p) => (
                  <p key={p.dataKey as string} className="flex items-center gap-2 text-muted-foreground">
                    <span className="h-2 w-2 rounded-full" style={{ background: p.color }} />
                    {p.name}
                    <span className="ml-auto pl-3 font-semibold tabular-nums text-popover-foreground">
                      {formatValue(format, p.value as number)}
                    </span>
                  </p>
                ))}
              </div>
            )
          }}
        />
        {series.map((s, i) => (
          <Line
            key={s.name}
            name={s.name}
            dataKey={`s${i}`}
            type="monotone"
            stroke={s.color}
            strokeWidth={s.dashed ? 1.75 : 2.5}
            strokeDasharray={s.dashed ? "5 4" : undefined}
            dot={{ r: s.dashed ? 0 : 3, strokeWidth: 0, fill: s.color }}
            activeDot={{ r: 5, strokeWidth: 0 }}
            connectNulls={false}
            isAnimationActive={false}
          />
        ))}
      </LineChart>
    </ResponsiveContainer>
  )
}
