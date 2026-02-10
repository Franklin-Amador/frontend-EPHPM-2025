"use client"

import React from "react"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
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

export default function DepartmentPanel({
  department,
}: DepartmentPanelProps) {
  if (!department) {
    return (
      <Card className="border-border bg-card text-card-foreground">
        <CardContent className="flex flex-col items-center justify-center py-12">
          <MapPin className="h-12 w-12 text-muted-foreground mb-4" />
          <p className="text-muted-foreground text-center text-sm leading-relaxed">
            Selecciona un departamento en el mapa para ver sus indicadores
            socioeconómicos.
          </p>
        </CardContent>
      </Card>
    )
  }

  const cluster = CLUSTER_INFO[department.cluster]
  const metrics = Object.entries(FEATURE_LABELS)

  return (
    <Card className="border-border bg-card text-card-foreground">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold text-card-foreground">
            {getDisplayName(department)}
          </CardTitle>
          <Badge
            style={{ backgroundColor: cluster.color }}
            className="text-white text-xs font-medium"
          >
            {cluster.name}
          </Badge>
        </div>
        <p className="text-xs text-muted-foreground">{cluster.description}</p>
      </CardHeader>
      <Separator />
      <CardContent className="pt-4">
        <div className="grid grid-cols-1 gap-3">
          {metrics.map(([key, info]) => {
            const value = department[key as keyof DepartmentData] as number
            return (
              <div
                key={key}
                className="flex items-center justify-between rounded-md bg-muted px-3 py-2"
              >
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground">
                    {METRIC_ICONS[key]}
                  </span>
                  <div>
                    <p className="text-xs font-medium text-card-foreground">
                      {info.label}
                    </p>
                    <p className="text-[10px] text-muted-foreground">
                      {info.description}
                    </p>
                  </div>
                </div>
                <span className="text-sm font-semibold text-card-foreground tabular-nums">
                  {formatValue(key, value)}
                </span>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
