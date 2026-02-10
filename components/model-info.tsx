"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { FEATURE_LABELS, CLUSTER_INFO } from "@/lib/departments-data"
import { Cpu, Layers, Database, HardDrive } from "lucide-react"

const MODEL_DETAILS = [
  {
    icon: <Cpu className="h-4 w-4" />,
    label: "Modelo",
    value: "KMeans (ONNX)",
  },
  {
    icon: <Layers className="h-4 w-4" />,
    label: "Clusters",
    value: "4",
  },
  {
    icon: <Database className="h-4 w-4" />,
    label: "Features",
    value: "8 variables",
  },
  {
    icon: <HardDrive className="h-4 w-4" />,
    label: "Runtime",
    value: "onnxruntime",
  },
]

export default function ModelInfo() {
  return (
    <div className="flex flex-col gap-4">
      {/* Model details */}
      <Card className="border-border bg-card text-card-foreground shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg font-bold text-card-foreground">
            Sobre el Modelo
          </CardTitle>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Modelo de clustering KMeans entrenado con datos de la EPHPM y
            desplegado como API en Vercel.
          </p>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="grid grid-cols-2 gap-2">
            {MODEL_DETAILS.map((item) => (
              <div
                key={item.label}
                className="flex items-center gap-2.5 rounded-lg bg-muted/60 px-3 py-3 transition-colors hover:bg-muted"
              >
                <span className="text-primary shrink-0">{item.icon}</span>
                <div>
                  <p className="text-[10px] text-muted-foreground leading-none mb-0.5">
                    {item.label}
                  </p>
                  <p className="text-xs font-bold text-card-foreground">
                    {item.value}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Clusters */}
      <Card className="border-border bg-card text-card-foreground shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-bold text-card-foreground">
            Clusters
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0 flex flex-col gap-2">
          {Object.entries(CLUSTER_INFO).map(([key, info]) => (
            <div
              key={key}
              className="flex items-center gap-3 rounded-lg bg-muted/60 px-3 py-2.5 transition-colors hover:bg-muted"
            >
              <span
                className="inline-block h-3.5 w-3.5 rounded-md shrink-0 shadow-sm"
                style={{ backgroundColor: info.color }}
              />
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-card-foreground">
                  {info.name}
                </p>
                <p className="text-[10px] text-muted-foreground leading-snug">
                  {info.description}
                </p>
              </div>
              <Badge
                variant="secondary"
                className="text-[10px] font-mono shrink-0"
              >
                {key}
              </Badge>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Variables */}
      <Card className="border-border bg-card text-card-foreground shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-bold text-card-foreground">
            Variables de Entrada
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0 flex flex-col gap-1.5">
          {Object.entries(FEATURE_LABELS).map(([key, info]) => (
            <div
              key={key}
              className="flex items-center justify-between gap-2 rounded-lg bg-muted/60 px-3 py-2.5 transition-colors hover:bg-muted"
            >
              <div className="min-w-0">
                <p className="text-xs font-medium text-card-foreground">
                  {info.label}
                </p>
                <p className="text-[10px] text-muted-foreground leading-snug">
                  {info.description}
                </p>
              </div>
              <code className="text-[10px] font-mono text-muted-foreground bg-background px-2 py-0.5 rounded-md border border-border shrink-0">
                {key}
              </code>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}
