"use client"

import { useState } from "react"
import dynamic from "next/dynamic"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import DepartmentPanel from "@/components/department-panel"
import PredictionForm from "@/components/prediction-form"
import ClusterLegend from "@/components/cluster-legend"
import ModelInfo from "@/components/model-info"
import type { DepartmentData } from "@/lib/departments-data"
import { Map, Brain, Info, BarChart3 } from "lucide-react"

const HondurasMap = dynamic(() => import("@/components/honduras-map"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full w-full items-center justify-center bg-muted/50 rounded-xl">
      <div className="flex flex-col items-center gap-3">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        <p className="text-muted-foreground text-sm">Cargando mapa...</p>
      </div>
    </div>
  ),
})

export default function HomePage() {
  const [selectedDepartment, setSelectedDepartment] =
    useState<DepartmentData | null>(null)

  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border bg-card/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-screen-2xl items-center justify-between px-4 py-3 sm:px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
              <BarChart3 className="h-5 w-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-base font-bold tracking-tight text-card-foreground sm:text-lg">
                EPHPM Honduras
              </h1>
              <p className="hidden text-xs text-muted-foreground sm:block">
                Dashboard de Indicadores por Departamento
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
              KMeans ONNX
            </span>
            <span className="hidden rounded-full bg-muted px-3 py-1 text-xs font-medium text-muted-foreground sm:inline-flex">
              4 clusters
            </span>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="mx-auto flex w-full max-w-screen-2xl flex-1 flex-col gap-4 p-4 lg:flex-row lg:gap-6 lg:p-6">
        {/* Map section */}
        <section className="flex flex-col gap-3 lg:w-[62%] xl:w-2/3">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <h2 className="text-sm font-semibold text-foreground">
              Mapa de Departamentos
            </h2>
            <ClusterLegend />
          </div>
          <div className="h-[350px] overflow-hidden rounded-xl border border-border shadow-sm sm:h-[420px] lg:h-[calc(100vh-170px)]">
            <HondurasMap
              onSelectDepartment={setSelectedDepartment}
              selectedDepartment={selectedDepartment}
            />
          </div>
        </section>

        {/* Sidebar */}
        <aside className="flex flex-col lg:w-[38%] xl:w-1/3">
          <Tabs defaultValue="datos" className="w-full">
            <TabsList className="grid w-full grid-cols-3 rounded-xl bg-muted/70 p-1">
              <TabsTrigger
                value="datos"
                className="flex items-center gap-1.5 rounded-lg text-xs data-[state=active]:bg-card data-[state=active]:shadow-sm"
              >
                <Map className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Datos</span>
                <span className="sm:hidden">Datos</span>
              </TabsTrigger>
              <TabsTrigger
                value="predictor"
                className="flex items-center gap-1.5 rounded-lg text-xs data-[state=active]:bg-card data-[state=active]:shadow-sm"
              >
                <Brain className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Predictor</span>
                <span className="sm:hidden">ML</span>
              </TabsTrigger>
              <TabsTrigger
                value="info"
                className="flex items-center gap-1.5 rounded-lg text-xs data-[state=active]:bg-card data-[state=active]:shadow-sm"
              >
                <Info className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Modelo</span>
                <span className="sm:hidden">Info</span>
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

      {/* Footer */}
      <footer className="border-t border-border bg-card/50 px-4 py-3 sm:px-6">
        <div className="mx-auto flex max-w-screen-2xl flex-col items-center justify-between gap-1 text-xs text-muted-foreground sm:flex-row">
          <span>Datos: Encuesta Permanente de Hogares (EPHPM)</span>
          <span>
            API:{" "}
            <a
              href="https://base-ephpm-julio-2025.vercel.app"
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-primary hover:underline"
            >
              base-ephpm-julio-2025.vercel.app
            </a>
          </span>
        </div>
      </footer>
    </div>
  )
}
