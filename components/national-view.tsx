"use client"

import { useEffect, useState } from "react"
import { Briefcase, HandCoins, Hourglass, Pause, Play, UserRound, Users, Wallet, type LucideIcon } from "lucide-react"
import TrendChart from "@/components/trend-chart"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { INDICATORS, LATEST_YEAR, YEARS, formatValue, getIndicator, panel, perHundred } from "@/lib/panel"
import { cn } from "@/lib/utils"

const CHOICES = INDICATORS.filter((i) => i.key !== "ymophg_median_rel")
const POVERTY_YEARS = getIndicator("tasa_pobreza").years

const national = (key: string, year: number) => panel.national.find((r) => r.anio === year)?.[key] ?? null
const nationalSeries = (key: string): Record<number, number | null> =>
  Object.fromEntries(panel.national.map((r) => [r.anio, r[key]]))

/** 100 squares = 100 households. The most intuitive way to show "60 de cada 100". */
function Waffle({ extreme, poor }: { extreme: number; poor: number }) {
  return (
    <div
      className="grid grid-cols-10 gap-1 sm:gap-1.5"
      role="img"
      aria-label={`De cada 100 hogares, ${poor} viven en pobreza; de ellos, ${extreme} en pobreza extrema.`}
    >
      {Array.from({ length: 100 }, (_, i) => (
        <span
          key={i}
          className="waffle-cell aspect-square rounded-[3px] sm:rounded-[5px]"
          style={{
            background: i < extreme ? "var(--level-2)" : i < poor ? "var(--level-1)" : "hsl(var(--muted))",
          }}
        />
      ))}
    </div>
  )
}

function Fact({
  icon: Icon,
  tint,
  figure,
  title,
  detail,
}: {
  icon: LucideIcon
  tint: string
  figure: string
  title: string
  detail: string
}) {
  return (
    <article className="flex flex-col gap-3 rounded-3xl bg-card p-5 shadow-sm ring-1 ring-border/60 transition duration-200 hover:-translate-y-1 hover:shadow-lg">
      <span className={cn("flex h-12 w-12 items-center justify-center rounded-2xl", tint)}>
        <Icon className="h-5 w-5" />
      </span>
      <p className="text-3xl font-bold tracking-tight">{figure}</p>
      <p className="text-[15px] font-medium leading-snug">{title}</p>
      <p className="text-sm leading-relaxed text-muted-foreground">{detail}</p>
    </article>
  )
}

export default function NationalView() {
  const [year, setYear] = useState(LATEST_YEAR)
  const [playing, setPlaying] = useState(false)
  const [selected, setSelected] = useState("ymophg_median")

  // "Play" walks through the survey years so the squares change in front of the reader.
  useEffect(() => {
    if (!playing) return
    const id = setInterval(() => {
      setYear((y) => {
        const next = POVERTY_YEARS[POVERTY_YEARS.indexOf(y) + 1]
        if (next === undefined) {
          setPlaying(false)
          return y
        }
        return next
      })
    }, 1100)
    return () => clearInterval(id)
  }, [playing])

  const poor = Math.round((national("tasa_pobreza", year) ?? 0) * 100)
  const extreme = Math.round((national("tasa_pobreza_extrema", year) ?? 0) * 100)
  const first = POVERTY_YEARS[0]
  const poorFirst = Math.round((national("tasa_pobreza", first) ?? 0) * 100)

  const indicator = getIndicator(selected)
  const missing = YEARS.filter((y) => !indicator.years.includes(y))
  const now = (key: string) => national(key, LATEST_YEAR)
  const remYear = getIndicator("pct_recibe_remesas").years[0]

  return (
    <div className="flex flex-col gap-12 sm:gap-16">
      <section className="hero -mx-5 overflow-hidden px-5 py-8 text-white sm:mx-0 sm:rounded-[2rem] sm:px-10 sm:py-12">
        <div className="grid items-center gap-8 lg:grid-cols-[1.25fr_1fr] lg:gap-12">
          <div className="min-w-0">
            <p className="text-sm font-medium text-white/75">Honduras · Encuesta de Hogares del INE</p>
            <h1 className="mt-3 text-balance text-[2rem] font-bold leading-[1.1] tracking-tight sm:text-5xl">
              De cada 100 hogares, {poor} viven en pobreza.
            </h1>
            <p className="mt-4 max-w-md text-base leading-relaxed text-white/85">
              {year === first
                ? `Así estaba el país en ${first}.`
                : `En ${first} eran ${poorFirst}. Han pasado ${year - first} años y la cifra casi no se ha movido.`}
            </p>
          </div>

          <div className="mx-auto w-full min-w-0 max-w-sm rounded-3xl bg-card p-4 text-card-foreground shadow-xl sm:p-6">
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm font-semibold">100 hogares en {year}</p>
              <button
                onClick={() => {
                  if (!playing && year === LATEST_YEAR) setYear(first)
                  setPlaying(!playing)
                }}
                className="inline-flex items-center gap-1.5 rounded-full bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground"
              >
                {playing ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
                {playing ? "Pausar" : "Ver los años"}
              </button>
            </div>

            <div className="mx-auto mt-4 max-w-[300px]">
              <Waffle extreme={extreme} poor={poor} />
            </div>

            <ul className="mt-4 space-y-2 text-sm">
              <li className="flex gap-2.5">
                <span className="mt-1 h-3 w-3 shrink-0 rounded-[3px]" style={{ background: "var(--level-2)" }} />
                <span>
                  <strong>{extreme} en pobreza extrema:</strong>{" "}
                  <span className="text-muted-foreground">el ingreso no alcanza ni para la comida.</span>
                </span>
              </li>
              <li className="flex gap-2.5">
                <span className="mt-1 h-3 w-3 shrink-0 rounded-[3px]" style={{ background: "var(--level-1)" }} />
                <span>
                  <strong>{poor - extreme} en pobreza:</strong>{" "}
                  <span className="text-muted-foreground">alcanza para comer, pero no para lo demás básico.</span>
                </span>
              </li>
              <li className="flex gap-2.5">
                <span className="mt-1 h-3 w-3 shrink-0 rounded-[3px] bg-muted" />
                <span>
                  <strong>{100 - poor} fuera de la pobreza.</strong>
                </span>
              </li>
            </ul>

            <div className="no-scrollbar -mx-1 mt-4 flex gap-1 overflow-x-auto px-1" aria-label="Año">
              {POVERTY_YEARS.map((y) => (
                <button
                  key={y}
                  onClick={() => {
                    setPlaying(false)
                    setYear(y)
                  }}
                  aria-pressed={y === year}
                  className={cn(
                    "shrink-0 rounded-full px-2.5 py-1 text-xs tabular-nums transition-colors",
                    y === year ? "bg-foreground font-semibold text-background" : "text-muted-foreground hover:bg-muted",
                  )}
                >
                  {y}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">¿Ha cambiado con los años?</h2>
        <p className="mt-2 max-w-2xl text-[15px] leading-relaxed text-muted-foreground">
          Muy poco. La pobreza sube y baja unos puntos, pero lleva casi dos décadas alrededor de 60 de cada 100
          hogares.
        </p>
        <div className="mt-5 rounded-3xl bg-card p-4 shadow-sm ring-1 ring-border/60 sm:p-6">
          <div className="flex flex-wrap gap-x-5 gap-y-1 text-sm">
            <span className="inline-flex items-center gap-2">
              <span className="h-0.5 w-5 rounded-full" style={{ background: "var(--level-1)" }} />
              Hogares en pobreza
            </span>
            <span className="inline-flex items-center gap-2">
              <span className="h-0.5 w-5 rounded-full" style={{ background: "var(--level-2)" }} />
              En pobreza extrema
            </span>
          </div>
          <div className="mt-3">
            <TrendChart
              format="pct"
              height={280}
              zeroBased
              series={[
                { name: "Pobreza", color: "var(--level-1)", values: nationalSeries("tasa_pobreza") },
                { name: "Pobreza extrema", color: "var(--level-2)", values: nationalSeries("tasa_pobreza_extrema") },
              ]}
            />
          </div>
          <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
            Los cortes en la línea son años sin datos: el INE no publicó las bases de 2012 a 2017 ni la de 2020, y las
            de 2021 y 2022 no miden pobreza.
          </p>
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">Así son hoy los hogares</h2>
        <p className="mt-2 max-w-2xl text-[15px] leading-relaxed text-muted-foreground">
          Aunque la pobreza no cede, las familias sí han cambiado desde {YEARS[0]}.
        </p>
        <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Fact
            icon={Users}
            tint="bg-blue-500/10 text-blue-600 dark:text-blue-400"
            figure={`${(now("totper_mean") ?? 0).toFixed(1)} personas`}
            title="viven en un hogar típico"
            detail={`En ${YEARS[0]} eran ${(national("totper_mean", YEARS[0]) ?? 0).toFixed(1)}. Las familias son cada vez más pequeñas.`}
          />
          <Fact
            icon={UserRound}
            tint="bg-fuchsia-500/10 text-fuchsia-600 dark:text-fuchsia-400"
            figure={perHundred(now("pct_jefatura_femenina"))}
            title="hogares tienen a una mujer al frente"
            detail={`En ${YEARS[0]} eran ${perHundred(national("pct_jefatura_femenina", YEARS[0]))}.`}
          />
          <Fact
            icon={HandCoins}
            tint="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
            figure={perHundred(now("pct_recibe_remesas"))}
            title="hogares reciben remesas del exterior"
            detail={`En ${remYear} eran ${perHundred(national("pct_recibe_remesas", remYear))}.`}
          />
          <Fact
            icon={Wallet}
            tint="bg-amber-500/10 text-amber-600 dark:text-amber-400"
            figure={formatValue("lps", now("ymophg_median"))}
            title="gana al mes un hogar típico por su trabajo principal"
            detail="La mitad de los hogares gana menos que eso y la otra mitad, más."
          />
          <Fact
            icon={Hourglass}
            tint="bg-violet-500/10 text-violet-600 dark:text-violet-400"
            figure={`${Math.round(now("edad_mean") ?? 0)} años`}
            title="es la edad promedio de la población"
            detail={`En ${YEARS[0]} era de ${Math.round(national("edad_mean", YEARS[0]) ?? 0)} años. El país ya no es tan joven.`}
          />
          <Fact
            icon={Briefcase}
            tint="bg-rose-500/10 text-rose-600 dark:text-rose-400"
            figure={perHundred(now("tasa_desempleo"))}
            title="personas que quieren trabajar no encuentran empleo"
            detail={`En ${YEARS[0]} eran ${perHundred(national("tasa_desempleo", YEARS[0]))}.`}
          />
        </div>
      </section>

      <section>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">Explora otros datos</h2>
            <p className="mt-2 max-w-xl text-[15px] leading-relaxed text-muted-foreground">{indicator.description}</p>
          </div>
          <Select value={selected} onValueChange={setSelected}>
            <SelectTrigger className="h-11 w-full rounded-full bg-card font-medium sm:w-64" aria-label="Indicador">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {CHOICES.map((i) => (
                <SelectItem key={i.key} value={i.key}>{i.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="mt-5 rounded-3xl bg-card p-4 shadow-sm ring-1 ring-border/60 sm:p-6">
          <TrendChart
            format={indicator.format}
            height={280}
            series={[{ name: indicator.label, color: "hsl(var(--chart-1))", values: nationalSeries(selected) }]}
          />
          <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
            {indicator.note && <>{indicator.note} </>}
            {missing.length > 0 && <>Las bases de {missing.join(" y ")} no traen este dato.</>}
          </p>
        </div>

        <details className="group mt-4">
          <summary className="cursor-pointer list-none text-sm font-medium text-primary [&::-webkit-details-marker]:hidden">
            <span className="group-open:hidden">Ver todos los datos en una tabla</span>
            <span className="hidden group-open:inline">Ocultar la tabla</span>
          </summary>
          <div className="-mx-5 mt-4 overflow-x-auto px-5 sm:mx-0 sm:px-0">
            <table className="w-full min-w-[680px] text-sm">
              <thead>
                <tr className="border-b border-border text-xs text-muted-foreground">
                  <th className="py-2 pr-4 text-left font-normal">Dato</th>
                  {YEARS.map((y) => (
                    <th key={y} className="px-2 py-2 text-right font-normal tabular-nums">{y}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {CHOICES.map((i) => (
                  <tr key={i.key} className="border-b border-border/60 last:border-0">
                    <td className="whitespace-nowrap py-2 pr-4">{i.label}</td>
                    {YEARS.map((y) => (
                      <td key={y} className="px-2 py-2 text-right tabular-nums text-muted-foreground">
                        {formatValue(i.format, national(i.key, y)).replace(" años", "")}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </details>
      </section>
    </div>
  )
}
