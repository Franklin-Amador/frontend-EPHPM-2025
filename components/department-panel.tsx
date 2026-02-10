"use client"

import React from "react"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  type DepartmentData,
  CLUSTER_INFO,
  FEATURE_LABELS,
  formatValue,
  getDisplayName,
} from "@/lib/departments-data"
import {
  MapPin,
  TrendingUp,
  GraduationCap,
  Users,
  Briefcase,
  AlertTriangle,
} from "lucide-react"

interface DepartmentPanelProps {
  department: DepartmentData | null
}

const METRIC_ICONS: Record<string, React.ReactNode> = {
  ymophg_mean: <TrendingUp className="h-4 w-4" />,
  ymophg_median: <TrendingUp className="h-4 w-4" />,
  anosest_mean: <GraduationCap className="h-4 w-4" />,
  edad_mean: <Users className="h-4 w-4" />,
  totper_mean: <Users className="h-4 w-4" />,
  tasa_ocupacion: <Briefcase className="h-4 w-4" />,
  tasa_pobreza: <AlertTriangle className="h-4 w-4" />,
  tasa_nbi: <AlertTriangle className="h-4 w-4" />,
}

export default function DepartmentPanel({ department }: DepartmentPanelProps) {
  if (!department) {
    return (
      <Card className="border-border bg-card text-card-foreground shadow-sm">
        <CardContent className="flex flex-col items-center justify-center py-16">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-muted mb-4">
            <MapPin className="h-7 w-7 text-muted-foreground" />
          </div>
          <p className="text-sm font-medium text-card-foreground mb-1">
            Ningún departamento seleccionado
          </p>
          <p className="text-muted-foreground text-center text-xs leading-relaxed max-w-[220px]">
            Haz clic en un departamento del mapa para ver sus indicadores.
          </p>
        </CardContent>
      </Card>
    )
  }

  const cluster = CLUSTER_INFO[department.cluster]
  const metrics = Object.entries(FEATURE_LABELS)

  // Split metrics into categories for a nicer layout
  const incomeMetrics = metrics.filter(([key]) => key.startsWith("ymophg"))
  const demoMetrics = metrics.filter(([key]) =>
    ["anosest_mean", "edad_mean", "totper_mean"].includes(key)
  )
  const rateMetrics = metrics.filter(([key]) =>
    ["tasa_ocupacion", "tasa_pobreza", "tasa_nbi"].includes(key)
  )

  return (
    <Card className="border-border bg-card text-card-foreground shadow-sm">
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <CardTitle className="text-lg font-bold text-card-foreground truncate">
              {getDisplayName(department)}
            </CardTitle>
            <p className="text-xs text-muted-foreground mt-0.5">
              {cluster.description}
            </p>
          </div>
          <Badge
            style={{ backgroundColor: cluster.color }}
            className="text-white text-xs font-semibold shrink-0 shadow-sm"
          >
            {cluster.name}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="flex flex-col gap-4 pt-0">
        {/* Ingresos */}
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-2">
            Ingresos
          </p>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            {incomeMetrics.map(([key, info]) => {
              const value = department[key as keyof DepartmentData] as number
              return (
                <MetricCard
                  key={key}
                  icon={METRIC_ICONS[key]}
                  label={info.label}
                  description={info.description}
                  value={formatValue(key, value)}
                />
              )
            })}
          </div>
        </div>

        {/* Demografia */}
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-2">
            {"Demografía & Educación"}
          </p>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
            {demoMetrics.map(([key, info]) => {
              const value = department[key as keyof DepartmentData] as number
              return (
                <MetricCard
                  key={key}
                  icon={METRIC_ICONS[key]}
                  label={info.label}
                  description={info.description}
                  value={formatValue(key, value)}
                />
              )
            })}
          </div>
        </div>

        {/* Tasas */}
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-2">
            Tasas
          </p>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-3 lg:grid-cols-1 xl:grid-cols-3">
            {rateMetrics.map(([key, info]) => {
              const value = department[key as keyof DepartmentData] as number
              return (
                <RateCard
                  key={key}
                  label={info.label}
                  value={formatValue(key, value)}
                  raw={value}
                  color={
                    key === "tasa_ocupacion"
                      ? "hsl(142, 60%, 45%)"
                      : key === "tasa_pobreza"
                        ? "hsl(0, 72%, 55%)"
                        : "hsl(36, 90%, 55%)"
                  }
                />
              )
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function MetricCard({
  icon,
  label,
  description,
  value,
}: {
  icon: React.ReactNode
  label: string
  description: string
  value: string
}) {
  return (
    <div className="flex items-center gap-3 rounded-lg bg-muted/60 px-3 py-2.5 transition-colors hover:bg-muted">
      <span className="text-muted-foreground shrink-0">{icon}</span>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-medium text-card-foreground truncate">
          {label}
        </p>
        <p className="text-[10px] text-muted-foreground truncate">
          {description}
        </p>
      </div>
      <span className="text-sm font-bold text-card-foreground tabular-nums shrink-0">
        {value}
      </span>
    </div>
  )
}

function RateCard({
  label,
  value,
  raw,
  color,
}: {
  label: string
  value: string
  raw: number
  color: string
}) {
  const pct = Math.round(raw * 100)
  return (
    <div className="flex flex-col items-center gap-1.5 rounded-lg bg-muted/60 px-3 py-3 transition-colors hover:bg-muted">
      <p className="text-[10px] font-medium text-muted-foreground text-center">
        {label}
      </p>
      <span className="text-lg font-bold tabular-nums" style={{ color }}>
        {value}
      </span>
      <div className="w-full h-1.5 rounded-full bg-border overflow-hidden">
        <div
          className="h-full rounded-full transition-all"
          style={{ width: `${pct}%`, backgroundColor: color }}
        />
      </div>
    </div>
  )
}
