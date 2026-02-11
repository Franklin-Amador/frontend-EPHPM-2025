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
  ymophg_mean: <TrendingUp className="h-3.5 w-3.5" />,
  ymophg_median: <TrendingUp className="h-3.5 w-3.5" />,
  anosest_mean: <GraduationCap className="h-3.5 w-3.5" />,
  edad_mean: <Users className="h-3.5 w-3.5" />,
  totper_mean: <Users className="h-3.5 w-3.5" />,
  tasa_ocupacion: <Briefcase className="h-3.5 w-3.5" />,
  tasa_pobreza: <AlertTriangle className="h-3.5 w-3.5" />,
  tasa_nbi: <AlertTriangle className="h-3.5 w-3.5" />,
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
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <CardTitle className="text-base font-bold text-card-foreground truncate">
              {getDisplayName(department)}
            </CardTitle>
            <p className="text-[11px] text-muted-foreground mt-1 leading-tight">
              {cluster.description}
            </p>
          </div>
          <Badge
            style={{ backgroundColor: cluster.color }}
            className="text-white text-[10px] font-semibold shrink-0 shadow-sm px-2 py-0.5"
          >
            {cluster.name}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="flex flex-col gap-3.5 pt-0">
        {/* Ingresos */}
        <div>
          <p className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground mb-1.5">
            Ingresos
          </p>
          <div className="grid grid-cols-1 gap-1.5 sm:grid-cols-2">
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
          <p className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground mb-1.5">
            {"Demografía & Educación"}
          </p>
          <div className="grid grid-cols-1 gap-1.5 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
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
          <p className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground mb-1.5">
            Tasas
          </p>
          <div className="grid grid-cols-1 gap-1.5 sm:grid-cols-3 lg:grid-cols-1 xl:grid-cols-3">
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
    <div className="flex items-center gap-2.5 rounded-lg bg-muted/60 px-2.5 py-2 transition-colors hover:bg-muted">
      <span className="text-muted-foreground shrink-0">{icon}</span>
      <div className="flex-1 min-w-0">
        <p className="text-[11px] font-semibold text-card-foreground truncate leading-tight">
          {label}
        </p>
        <p className="text-[9px] text-muted-foreground truncate mt-0.5 leading-tight">
          {description}
        </p>
      </div>
      <span className="text-xs font-bold text-card-foreground tabular-nums shrink-0">
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
    <div className="flex flex-col items-center gap-1 rounded-lg bg-muted/60 px-2.5 py-2.5 transition-colors hover:bg-muted">
      <p className="text-[9px] font-semibold text-muted-foreground text-center leading-tight">
        {label}
      </p>
      <span className="text-base font-bold tabular-nums" style={{ color }}>
        {value}
      </span>
      <div className="w-full h-1 rounded-full bg-border overflow-hidden mt-0.5">
        <div
          className="h-full rounded-full transition-all"
          style={{ width: `${pct}%`, backgroundColor: color }}
        />
      </div>
    </div>
  )
}
