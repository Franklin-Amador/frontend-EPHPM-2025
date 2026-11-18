"use client"

import { useEffect, useState } from "react"
import { useTheme } from "next-themes"
import { Moon, Sun } from "lucide-react"
import NationalView from "@/components/national-view"
import DepartmentsView from "@/components/departments-view"
import ModelView from "@/components/model-view"
import { LATEST_YEAR, YEARS, panel } from "@/lib/panel"
import { cn } from "@/lib/utils"

const VIEWS = [
  { id: "pais", label: "País" },
  { id: "departamentos", label: "Departamentos" },
  { id: "modelo", label: "Modelo" },
] as const

type ViewId = (typeof VIEWS)[number]["id"]

function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])
  const dark = mounted && resolvedTheme === "dark"
  return (
    <button
      onClick={() => setTheme(dark ? "light" : "dark")}
      aria-label={dark ? "Cambiar a tema claro" : "Cambiar a tema oscuro"}
      className="flex h-9 w-9 items-center justify-center rounded-lg border border-border text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
    >
      {dark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
    </button>
  )
}

export default function HomePage() {
  const [view, setView] = useState<ViewId>("pais")

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-[1000] border-b border-border bg-background/80 backdrop-blur-lg">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-x-4 gap-y-2 px-4 py-3 sm:px-6">
          <div className="flex items-baseline gap-2">
            <h1 className="text-base font-semibold tracking-tight">Honduras en cifras</h1>
            <span className="hidden text-xs text-muted-foreground sm:inline">
              EPHPM {YEARS[0]}–{LATEST_YEAR}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <nav className="flex rounded-xl bg-muted p-1" aria-label="Vistas">
              {VIEWS.map((v) => (
                <button
                  key={v.id}
                  onClick={() => setView(v.id)}
                  aria-current={view === v.id ? "page" : undefined}
                  className={cn(
                    "rounded-lg px-3 py-1.5 text-sm font-medium transition-colors",
                    view === v.id ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  {v.label}
                </button>
              ))}
            </nav>
            <ThemeToggle />
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-6 sm:px-6 sm:py-8">
        {view === "pais" && <NationalView />}
        {view === "departamentos" && <DepartmentsView />}
        {view === "modelo" && <ModelView />}
      </main>

      <footer className="border-t border-border">
        <div className="mx-auto max-w-7xl px-4 py-4 text-xs text-muted-foreground sm:px-6">
          Fuente: {panel.source}. Cifras ponderadas con el factor de expansión de cada encuesta.
        </div>
      </footer>
    </div>
  )
}
