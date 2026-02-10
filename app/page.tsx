"use client"

import { useState } from "react"
import dynamic from "next/dynamic"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import DepartmentPanel from "@/components/department-panel"
import PredictionForm from "@/components/prediction-form"
import ClusterLegend from "@/components/cluster-legend"
import ModelInfo from "@/components/model-info"
import type { DepartmentData } from "@/lib/departments-data"
import { Map, Brain, Info } from "lucide-react"

const HondurasMap = dynamic(() => import("@/components/honduras-map"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full w-full items-center justify-center bg-muted rounded-lg">
      <p className="text-muted-foreground text-sm">Cargando mapa...</p>
    </div>
  ),
})

export default function HomePage() {
  const [selectedDepartment, setSelectedDepartment] =
    useState<DepartmentData | null>(null)

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="border-b border-border bg-card px-6 py-4">
        <div className="mx-auto flex max-w-screen-2xl items-center justify-between">
          <div>
            <h1 className="text-xl font-bold tracking-tight text-card-foreground">
              EPHPM Honduras
            </h1>
            <p className="text-xs text-muted-foreground">
              Dashboard de Indicadores Socioeconómicos por Departamento
            </p>
          </div>
          <div className="hidden items-center gap-2 sm:flex">
            <span className="rounded-md bg-primary px-2.5 py-1 text-xs font-medium text-primary-foreground">
              KMeans ONNX
            </span>
            <span className="rounded-md bg-muted px-2.5 py-1 text-xs font-medium text-muted-foreground">
              4 clusters
            </span>
          </div>
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-screen-2xl flex-1 flex-col gap-4 p-4 lg:flex-row lg:p-6">
        <section className="flex flex-col gap-4 lg:w-2/3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-foreground">
              Mapa de Departamentos
            </h2>
            <ClusterLegend />
          </div>
          <div className="h-[400px] overflow-hidden rounded-lg border border-border lg:h-[calc(100vh-180px)]">
            <HondurasMap
              onSelectDepartment={setSelectedDepartment}
              selectedDepartment={selectedDepartment}
            />
          </div>
        </section>

        <aside className="flex flex-col gap-4 lg:w-1/3">
          <Tabs defaultValue="datos" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="datos" className="flex items-center gap-1.5 text-xs">
                <Map className="h-3.5 w-3.5" />
                Datos
              </TabsTrigger>
              <TabsTrigger value="predictor" className="flex items-center gap-1.5 text-xs">
                <Brain className="h-3.5 w-3.5" />
                Predictor
              </TabsTrigger>
              <TabsTrigger value="info" className="flex items-center gap-1.5 text-xs">
                <Info className="h-3.5 w-3.5" />
                Modelo
              </TabsTrigger>
            </TabsList>

            <TabsContent value="datos" className="mt-4">
              <DepartmentPanel department={selectedDepartment} />
            </TabsContent>

            <TabsContent value="predictor" className="mt-4">
              <PredictionForm selectedDepartment={selectedDepartment} />
            </TabsContent>

            <TabsContent value="info" className="mt-4">
              <ModelInfo />
            </TabsContent>
          </Tabs>
        </aside>
      </main>
    </div>
  )
}
