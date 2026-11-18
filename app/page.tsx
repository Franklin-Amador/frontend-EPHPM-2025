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
  { id: "modelo", label: "Cómo se mide" },
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
      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
    >
      {dark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
    </button>
  )
}

export default function HomePage() {
  const [view, setView] = useState<ViewId>("pais")

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-[1000] bg-background/85 backdrop-blur-lg">
        <div className="mx-auto max-w-5xl px-5 sm:px-8">
          <div className="flex h-14 items-center justify-between gap-3">
            <p className="flex items-center gap-2 text-[0.9375rem] font-bold tracking-tight">
              <span className="h-2.5 w-2.5 rounded-full bg-primary" />
              Honduras en cifras
            </p>
            <ThemeToggle />
          </div>
          {/* Underlined tabs: full width on a phone, no boxes competing with the content. */}
          <nav className="-mb-px flex gap-6 border-b border-border" aria-label="Vistas">
            {VIEWS.map((v) => (
              <button
                key={v.id}
                onClick={() => {
                  setView(v.id)
                  window.scrollTo({ top: 0 })
                }}
                aria-current={view === v.id ? "page" : undefined}
                className={cn(
                  "border-b-2 pb-2.5 text-sm whitespace-nowrap transition-colors",
                  view === v.id
                    ? "border-primary font-semibold text-foreground"
                    : "border-transparent text-muted-foreground hover:text-foreground",
                )}
              >
                {v.label}
              </button>
            ))}
          </nav>
        </div>
      </header>

      <main className="mx-auto w-full max-w-5xl flex-1 px-5 pb-10 sm:px-8 sm:py-10">
        {/* key restarts the short slide-in each time the view changes */}
        <div key={view} className="view-enter">
          {view === "pais" && <NationalView />}
          {view === "departamentos" && <DepartmentsView />}
          {view === "modelo" && <ModelView />}
        </div>
      </main>

      <footer className="mt-6 border-t border-border">
        <div className="mx-auto flex w-full max-w-5xl flex-col gap-2 px-5 py-8 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between sm:px-8">
          <p className="flex items-center gap-2 font-semibold text-foreground">
            <span className="h-2.5 w-2.5 rounded-full bg-primary" />
            Honduras en cifras
          </p>
          <p className="text-xs leading-relaxed sm:text-right">
            Datos: {panel.source}, {YEARS[0]}–{LATEST_YEAR}.
            <br />
            Cifras ponderadas con el factor de expansión de cada encuesta.
          </p>
        </div>
      </footer>
    </div>
  )
}
