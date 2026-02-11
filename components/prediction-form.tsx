"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import {
  FEATURE_LABELS,
  CLUSTER_INFO,
  type DepartmentData,
  getDisplayName,
} from "@/lib/departments-data"
import { Loader2, Send, RotateCcw, Sparkles, CheckCircle2 } from "lucide-react"

const predictionSchema = z.object({
  ymophg_mean: z
    .number({ message: "Requerido" })
    .min(0, "Debe ser mayor o igual a 0")
    .max(100000, "Ingreso excede límite razonable"),
  ymophg_median: z
    .number({ message: "Requerido" })
    .min(0, "Debe ser mayor o igual a 0")
    .max(100000, "Ingreso excede límite razonable"),
  anosest_mean: z
    .number({ message: "Requerido" })
    .min(0, "No puede ser negativo")
    .max(20, "Máximo 20 años de estudio"),
  edad_mean: z
    .number({ message: "Requerido" })
    .min(0, "No puede ser negativo")
    .max(100, "Edad debe ser menor a 100"),
  totper_mean: z
    .number({ message: "Requerido" })
    .min(1, "Mínimo 1 persona")
    .max(20, "Máximo 20 personas por hogar"),
  tasa_ocupacion: z
    .number({ message: "Requerido" })
    .min(0, "Debe estar entre 0 y 1")
    .max(1, "Debe estar entre 0 y 1"),
  tasa_pobreza: z
    .number({ message: "Requerido" })
    .min(0, "Debe estar entre 0 y 1")
    .max(1, "Debe estar entre 0 y 1"),
  tasa_nbi: z
    .number({ message: "Requerido" })
    .min(0, "Debe estar entre 0 y 1")
    .max(1, "Debe estar entre 0 y 1"),
})

type PredictionInput = z.infer<typeof predictionSchema>

interface PredictionResult {
  cluster: number
  cluster_name: string
  description: string
}

interface PredictionFormProps {
  selectedDepartment: DepartmentData | null
}

const API_URL = "https://base-ephpm-julio-2025.vercel.app"

const FIELD_ORDER: (keyof PredictionInput)[] = [
  "ymophg_mean",
  "ymophg_median",
  "anosest_mean",
  "edad_mean",
  "totper_mean",
  "tasa_ocupacion",
  "tasa_pobreza",
  "tasa_nbi",
]

export default function PredictionForm({
  selectedDepartment,
}: PredictionFormProps) {
  const [result, setResult] = useState<PredictionResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<PredictionInput>({
    resolver: zodResolver(predictionSchema),
  })

  function fillFromDepartment() {
    if (!selectedDepartment) return
    for (const key of FIELD_ORDER) {
      setValue(key, selectedDepartment[key] as number, {
        shouldValidate: true,
      })
    }
  }

  async function onSubmit(data: PredictionInput) {
    setLoading(true)
    setError(null)
    setResult(null)
    try {
      const res = await fetch(`${API_URL}/predict`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })
      if (!res.ok) {
        throw new Error(`Error ${res.status}: ${res.statusText}`)
      }
      const json: PredictionResult = await res.json()
      setResult(json)
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Error al conectar con la API"
      )
    } finally {
      setLoading(false)
    }
  }

  function handleReset() {
    reset()
    setResult(null)
    setError(null)
  }

  return (
    <Card className="border-border bg-card text-card-foreground shadow-sm">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <CardTitle className="text-lg font-bold text-card-foreground">
              Predictor de Cluster
            </CardTitle>
            <p className="text-xs text-muted-foreground mt-0.5">
              Ingresa indicadores para predecir el cluster.
            </p>
          </div>
          {selectedDepartment && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={fillFromDepartment}
              className="text-xs bg-transparent shrink-0"
            >
              <Sparkles className="mr-1 h-3 w-3" />
              <span className="hidden sm:inline">
                Usar {getDisplayName(selectedDepartment)}
              </span>
              <span className="sm:hidden">Auto</span>
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-x-3 gap-y-3">
            {FIELD_ORDER.map((key) => {
              const info = FEATURE_LABELS[key]
              const isRate = key.startsWith("tasa_")
              
              // Definir min, max y step según el campo
              let min: number | undefined
              let max: number | undefined
              let step: string
              let placeholder: string
              
              if (isRate) {
                min = 0
                max = 1
                step = "0.0001"
                placeholder = "0.00 - 1.00"
              } else if (key === "ymophg_mean" || key === "ymophg_median") {
                min = 0
                max = 100000
                step = "0.01"
                placeholder = "0 - 100,000"
              } else if (key === "anosest_mean") {
                min = 0
                max = 20
                step = "0.01"
                placeholder = "0 - 20 años"
              } else if (key === "edad_mean") {
                min = 0
                max = 100
                step = "0.01"
                placeholder = "0 - 100 años"
              } else if (key === "totper_mean") {
                min = 1
                max = 20
                step = "0.01"
                placeholder = "1 - 20 personas"
              } else {
                step = "0.01"
                placeholder = "0"
              }
              
              return (
                <div key={key} className="flex flex-col gap-1">
                  <Label
                    htmlFor={key}
                    className="text-[11px] font-medium text-card-foreground leading-tight"
                  >
                    {info.label}
                  </Label>
                  <Input
                    id={key}
                    type="number"
                    min={min}
                    max={max}
                    step={step}
                    placeholder={placeholder}
                    className="h-9 text-xs tabular-nums"
                    {...register(key, { valueAsNumber: true })}
                  />
                  {errors[key] && (
                    <p className="text-[10px] text-destructive">
                      {errors[key]?.message}
                    </p>
                  )}
                </div>
              )
            })}
          </div>

          <div className="flex items-center gap-2">
            <Button
              type="submit"
              disabled={loading}
              className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90"
              size="sm"
            >
              {loading ? (
                <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
              ) : (
                <Send className="mr-1.5 h-3.5 w-3.5" />
              )}
              {loading ? "Prediciendo..." : "Predecir Cluster"}
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleReset}
              className="bg-transparent"
            >
              <RotateCcw className="h-3.5 w-3.5" />
            </Button>
          </div>
        </form>

        {error && (
          <div className="mt-4 rounded-lg bg-destructive/10 border border-destructive/20 p-3 text-sm text-destructive">
            {error}
          </div>
        )}

        {result && (
          <div className="mt-4 rounded-xl border-2 p-4" style={{ borderColor: CLUSTER_INFO[result.cluster]?.color ?? "#6b7280" }}>
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle2
                className="h-5 w-5 shrink-0"
                style={{ color: CLUSTER_INFO[result.cluster]?.color }}
              />
              <h3 className="text-sm font-bold text-card-foreground">
                Resultado
              </h3>
              <Badge
                style={{
                  backgroundColor:
                    CLUSTER_INFO[result.cluster]?.color ?? "#6b7280",
                }}
                className="text-white text-[10px] font-semibold ml-auto"
              >
                Cluster {result.cluster}
              </Badge>
            </div>
            <p className="text-base font-bold text-card-foreground">
              {result.cluster_name}
            </p>
            <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
              {result.description}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
