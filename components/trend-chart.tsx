"use client"

import {
  CartesianGrid,
  Line,
  LineChart,
  ReferenceArea,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"
import { YEARS, formatValue, type IndicatorFormat } from "@/lib/panel"

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
  /** Start the scale at zero so small changes are not exaggerated. */
  zeroBased?: boolean
}

const axisTick = { fontSize: 11, fill: "hsl(var(--muted-foreground))" }

function compact(format: IndicatorFormat, v: number): string {
  if (format === "pct") return `${Math.round(v * 100)}%`
  if (format === "lps") return `${(v / 1000).toFixed(0)}k`
  return v.toFixed(format === "years" ? 0 : 1)
}

// The axis shows only the years that have a survey, evenly spaced. Where the INE
// published no microdata (2012-2017, 2020) a narrow break slot takes the place of the
// missing years: the line stops there instead of implying a trend nobody measured.
type Slot = { slot: string; year?: number; gap?: string }

const SLOTS: Slot[] = YEARS.flatMap((year, i) => {
  const prev = YEARS[i - 1]
  const here: Slot = { slot: String(year), year }
  if (prev === undefined || year - prev === 1) return [here]
  const gap = year - prev === 2 ? String(prev + 1) : `${prev + 1}–${String(year - 1).slice(2)}`
  return [{ slot: `gap-${prev}`, gap }, here]
})

export default function TrendChart({ series, format, height = 280, highlightYear, zeroBased }: TrendChartProps) {
  const data = SLOTS.map((s) => {
    const row: Record<string, string | number | null> = { slot: s.slot }
    series.forEach((line, i) => (row[`s${i}`] = s.year ? (line.values[s.year] ?? null) : null))
    return row
  })

  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={data} margin={{ top: 18, right: 8, bottom: 0, left: -6 }}>
        <CartesianGrid stroke="hsl(var(--border))" strokeDasharray="3 3" vertical={false} />
        {SLOTS.filter((s) => s.gap).map((s) => (
          <ReferenceLine
            key={s.slot}
            x={s.slot}
            stroke="hsl(var(--muted-foreground))"
            strokeOpacity={0.45}
            strokeDasharray="2 4"
            label={{
              value: s.gap,
              position: "top",
              fontSize: 10,
              fill: "hsl(var(--muted-foreground))",
            }}
          />
        ))}
        {highlightYear && (
          <ReferenceArea
            x1={String(highlightYear)}
            x2={String(highlightYear)}
            stroke="hsl(var(--chart-1))"
            strokeOpacity={0.3}
            strokeWidth={14}
          />
        )}
        <XAxis
          dataKey="slot"
          type="category"
          interval={0}
          tick={axisTick}
          tickLine={false}
          axisLine={{ stroke: "hsl(var(--border))" }}
          tickFormatter={(slot: string) => (slot.startsWith("gap") ? "" : `’${slot.slice(2)}`)}
        />
        <YAxis
          width={40}
          tick={axisTick}
          tickLine={false}
          axisLine={false}
          domain={[zeroBased ? 0 : "auto", "auto"]}
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
