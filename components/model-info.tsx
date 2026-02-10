"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { FEATURE_LABELS, CLUSTER_INFO } from "@/lib/departments-data"
import { Database, Cpu, Layers, HardDrive } from "lucide-react"

const MODEL_DETAILS = [
  { icon: <Cpu className="h-4 w-4" />, label: "Modelo", value: "KMeans (ONNX)" },
  { icon: <Layers className="h-4 w-4" />, label: "Clusters", value: "4" },
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
      <Card className="border-border bg-card text-card-foreground">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg font-semibold text-card-foreground">
            Sobre el Modelo
          </CardTitle>
          <p className="text-xs text-muted-foreground">
            Modelo de clustering KMeans entrenado con datos de la EPHPM y
            desplegado como API en Vercel.
          </p>
        </CardHeader>
        <Separator />
        <CardContent className="pt-4">
          <div className="grid grid-cols-2 gap-3">
            {MODEL_DETAILS.map((item) => (
              <div
                key={item.label}
                className="flex items-center gap-2 rounded-md bg-muted px-3 py-2.5"
              >
                <span className="text-muted-foreground">{item.icon}</span>
                <div>
                  <p className="text-[10px] text-muted-foreground">
                    {item.label}
                  </p>
                  <p className="text-xs font-semibold text-card-foreground">
                    {item.value}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="border-border bg-card text-card-foreground">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold text-card-foreground">
            Clusters
          </CardTitle>
        </CardHeader>
        <Separator />
        <CardContent className="pt-4 flex flex-col gap-2">
          {Object.entries(CLUSTER_INFO).map(([key, info]) => (
            <div
              key={key}
              className="flex items-center gap-3 rounded-md bg-muted px-3 py-2"
            >
              <span
                className="inline-block h-3 w-3 rounded-full shrink-0"
                style={{ backgroundColor: info.color }}
              />
              <div className="flex-1">
                <p className="text-xs font-semibold text-card-foreground">
                  {info.name}
                </p>
                <p className="text-[10px] text-muted-foreground">
                  {info.description}
                </p>
              </div>
              <Badge variant="secondary" className="text-[10px]">
                {key}
              </Badge>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card className="border-border bg-card text-card-foreground">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold text-card-foreground">
            Variables de Entrada
          </CardTitle>
        </CardHeader>
        <Separator />
        <CardContent className="pt-4 flex flex-col gap-1.5">
          {Object.entries(FEATURE_LABELS).map(([key, info]) => (
            <div
              key={key}
              className="flex items-center justify-between rounded-md bg-muted px-3 py-2"
            >
              <div>
                <p className="text-xs font-medium text-card-foreground">
                  {info.label}
                </p>
                <p className="text-[10px] text-muted-foreground">
                  {info.description}
                </p>
              </div>
              <code className="text-[10px] font-mono text-muted-foreground bg-background px-1.5 py-0.5 rounded">
                {key}
              </code>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}
