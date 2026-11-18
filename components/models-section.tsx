"use client"

import { ChevronRight, ClipboardList, Layers, Scale, Sparkles, Table2, type LucideIcon } from "lucide-react"
import { CLUSTERS, CLUSTER_COLORS, formatValue, getIndicator, panel } from "@/lib/panel"
import { cn } from "@/lib/utils"

const model = panel.model
const poverty = panel.poverty_model

const PIPELINE: [LucideIcon, string, string][] = [
  [ClipboardList, "Encuestas del INE", "Miles de hogares visitados cada año"],
  [Table2, `${model.features.length} indicadores`, "Calculados por departamento y año"],
  [Scale, "Misma escala", "Para que ninguno pese más por su unidad"],
  [Layers, model.algorithm, "Junta los casos más parecidos"],
  [Sparkles, `${model.k} niveles`, "Los colores del mapa"],
]

function Chip({ children }: { children: React.ReactNode }) {
  return (
    <span className="rounded-full border border-white/35 bg-black/25 px-3 py-1 text-xs font-medium text-white">{children}</span>
  )
}

function Stat({ figure, label }: { figure: string; label: string }) {
  return (
    <div className="inset-tile rounded-2xl p-4">
      <p className="text-3xl font-bold tracking-tight">{figure}</p>
      <p className="mt-1 text-sm leading-snug text-muted-foreground">{label}</p>
    </div>
  )
}

function ModelHeader({ kicker, title, chips }: { kicker: string; title: string; chips: string[] }) {
  return (
    <div className="hero px-5 py-6 sm:px-8 sm:py-8">
      <p className="text-xs font-semibold uppercase tracking-widest text-white/90">{kicker}</p>
      <h3 className="mt-2 text-2xl font-bold tracking-tight sm:text-3xl">{title}</h3>
      <div className="mt-4 flex flex-wrap gap-2">
        {chips.map((c) => (
          <Chip key={c}>{c}</Chip>
        ))}
      </div>
    </div>
  )
}

/** One small chart per indicator: the three levels side by side on a shared scale. */
function ProfileChart({ feature }: { feature: string }) {
  const indicator = getIndicator(feature)
  const max = Math.max(...CLUSTERS.map((c) => c.profile[feature]))
  return (
    <div>
      <p className="text-sm font-medium">{indicator.label}</p>
      <div className="mt-2 space-y-1.5">
        {CLUSTERS.map((c) => (
          <div key={c.id} className="grid grid-cols-[1fr_3.25rem] items-center gap-2">
            <span className="h-3 overflow-hidden rounded-full bg-muted">
              <span
                data-mark
                className="block h-full rounded-full"
                style={{ width: `${(c.profile[feature] / max) * 100}%`, background: CLUSTER_COLORS[c.id] }}
                title={`${c.name}: ${formatValue(indicator.format, c.profile[feature])}`}
              />
            </span>
            <span className="text-right text-xs tabular-nums text-muted-foreground">
              {formatValue(indicator.format, c.profile[feature])}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

export default function ModelsSection() {
  const total = CLUSTERS.reduce((sum, c) => sum + c.profile.n, 0)
  // Odds ratios on a log scale, so "half as likely" and "twice as likely" are the same length.
  const reach = Math.max(...poverty.factors.map((f) => Math.abs(Math.log(f.odds))))
  const factors = [...poverty.factors].sort((a, b) => b.odds - a.odds)
  const actual = Math.round(
    (panel.national.find((r) => r.anio === poverty.test_years[0])?.tasa_pobreza ?? 0) * 100,
  )

  return (
    <section>
      <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">Los modelos por dentro</h2>
      <p className="mt-2 max-w-2xl text-[0.9375rem] leading-relaxed text-muted-foreground">
        Detrás de este sitio hay dos modelos. Uno agrupa los departamentos en niveles; el otro estima qué tan
        probable es que un hogar sea pobre.
      </p>

      <article className="mt-6 surface overflow-hidden rounded-[2rem]">
        <ModelHeader
          kicker="Modelo 1 · agrupamiento"
          title="Niveles de condiciones de vida"
          chips={[model.algorithm, `${model.k} grupos`, `${model.rows} observaciones`, `${model.features.length} indicadores`]}
        />
        <div className="space-y-9 p-5 sm:p-8">
          <div>
            <h4 className="text-base font-bold">Cómo trabaja</h4>
            <ol className="mt-4 grid gap-3 sm:grid-cols-5 sm:gap-2">
              {PIPELINE.map(([Icon, title, text], i) => (
                <li key={title} className="relative flex items-start gap-3 sm:flex-col sm:items-center sm:text-center">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                    <Icon className="h-5 w-5" />
                  </span>
                  <span>
                    <span className="block text-sm font-semibold">{title}</span>
                    <span className="block text-xs leading-snug text-muted-foreground">{text}</span>
                  </span>
                  {i < PIPELINE.length - 1 && (
                    <ChevronRight className="absolute -right-2.5 top-3.5 hidden h-4 w-4 text-muted-foreground/50 sm:block" />
                  )}
                </li>
              ))}
            </ol>
          </div>

          <div>
            <h4 className="text-base font-bold">En qué se diferencian los tres niveles</h4>
            <div className="mt-3 flex flex-wrap gap-x-5 gap-y-1 text-sm">
              {CLUSTERS.map((c) => (
                <span key={c.id} className="inline-flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full" style={{ background: CLUSTER_COLORS[c.id] }} />
                  {c.name}
                </span>
              ))}
            </div>
            <div className="mt-5 grid gap-x-8 gap-y-6 sm:grid-cols-2 lg:grid-cols-3">
              {model.features.map((f) => (
                <ProfileChart key={f} feature={f} />
              ))}
            </div>
          </div>

          <div className="grid gap-8 lg:grid-cols-2">
            <div>
              <h4 className="text-base font-bold">Cuántos casos cayeron en cada nivel</h4>
              {/* figures sit under the bar in normal ink: white on these fills was below 4.5:1 */}
              <div className="mt-4 flex gap-0.5">
                {CLUSTERS.map((c) => (
                  <div key={c.id} style={{ width: `${(c.profile.n / total) * 100}%` }}>
                    <span
                      data-mark
                      className={cn("block h-10", c.id === 0 && "rounded-l-xl", c.id === CLUSTERS.length - 1 && "rounded-r-xl")}
                      style={{ background: CLUSTER_COLORS[c.id] }}
                      title={`${c.name}: ${c.profile.n} de ${total}`}
                    />
                    <span className="mt-1 block text-sm font-bold tabular-nums">{c.profile.n}</span>
                  </div>
                ))}
              </div>
              <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                Cada caso es un departamento en un año. Son {total} en total.
              </p>
            </div>

            <div>
              <h4 className="text-base font-bold">Qué tan separados quedan los grupos</h4>
              <div className="mt-4 flex items-end gap-3">
                <p className="text-4xl font-bold tracking-tight tabular-nums">{model.silhouette.toFixed(2)}</p>
                <p className="pb-1 text-sm text-muted-foreground">de 1 posible (índice silhouette)</p>
              </div>
              <div className="mt-3 h-3 overflow-hidden rounded-full bg-muted">
                <span className="block h-full rounded-full bg-primary" style={{ width: `${model.silhouette * 100}%` }} />
              </div>
              <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                Separación moderada: los departamentos forman una escala continua, no tres mundos aparte. Los niveles
                ayudan a leer el mapa, no son fronteras exactas.
              </p>
            </div>
          </div>
        </div>
      </article>

      <article className="mt-6 surface overflow-hidden rounded-[2rem]">
        <ModelHeader
          kicker="Modelo 2 · predicción"
          title="¿Qué hace más probable que un hogar sea pobre?"
          chips={[
            poverty.algorithm,
            `${poverty.n_features} características`,
            `${poverty.n_train.toLocaleString("es-HN")} hogares para aprender`,
          ]}
        />
        <div className="space-y-9 p-5 sm:p-8">
          <div>
            <h4 className="text-base font-bold">Aprende del pasado y se examina con el año más reciente</h4>
            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              {(
                [
                  ["Aprende", poverty.train_years, poverty.n_train],
                  ["Se ajusta", poverty.valid_years, poverty.n_valid],
                  ["Se examina", poverty.test_years, poverty.n_test],
                ] as const
              ).map(([step, years, n], i) => (
                <div key={step} className="inset-tile rounded-2xl p-4">
                  <p className="flex items-center gap-2 text-sm font-bold">
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-xs text-primary-foreground">
                      {i + 1}
                    </span>
                    {step}
                  </p>
                  <p className="mt-1 text-sm tabular-nums">
                    {years.length > 2 ? `${years[0]}–${years[years.length - 1]}` : years.join(" y ")}
                  </p>
                  <p className="text-xs text-muted-foreground">{n.toLocaleString("es-HN")} hogares</p>
                </div>
              ))}
            </div>
            <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
              No usa ningún dato de ingresos: la pobreza se define con el ingreso, y usarlo sería darle la respuesta.
            </p>
          </div>

          <div>
            <h4 className="text-base font-bold">Qué tan bien acierta en {poverty.test_years.join(", ")}</h4>
            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              <Stat
                figure={`${Math.round(poverty.test.recall_pobres * 100)} de 100`}
                label="hogares pobres son reconocidos como pobres"
              />
              <Stat
                figure={`${Math.round(poverty.test.recall_no_pobres * 100)} de 100`}
                label="hogares no pobres son reconocidos como tales"
              />
              <Stat
                figure={poverty.test.roc_auc.toFixed(2)}
                label="capacidad de ordenar hogares, de 0.5 (azar) a 1 (perfecto)"
              />
            </div>
          </div>

          <div>
            <h4 className="text-base font-bold">Lo que más pesa</h4>
            <div className="mt-3 flex flex-wrap gap-x-5 gap-y-1 text-sm">
              <span className="inline-flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full" style={{ background: "var(--level-2)" }} />
                Hace más probable la pobreza
              </span>
              <span className="inline-flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full" style={{ background: "var(--level-0)" }} />
                La hace menos probable
              </span>
            </div>
            <ul className="mt-4 space-y-3">
              {factors.map((f) => {
                const up = f.odds > 1
                const width = (Math.abs(Math.log(f.odds)) / reach) * 50
                return (
                  <li key={f.label} className="grid gap-1 sm:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] sm:items-center sm:gap-4">
                    <span className="text-sm leading-snug">{f.label}</span>
                    <span className="relative block h-4" title={`Razón de momios: ${f.odds.toFixed(2)}`}>
                      <span className="absolute inset-y-0 left-1/2 w-px bg-border" />
                      <span
                        data-mark
                        className={cn("absolute inset-y-0.5", up ? "left-1/2 rounded-r-full" : "right-1/2 rounded-l-full")}
                        style={{ width: `${width}%`, background: up ? "var(--level-2)" : "var(--level-0)" }}
                      />
                    </span>
                  </li>
                )
              })}
            </ul>
            <p className="mt-4 text-xs leading-relaxed text-muted-foreground">
              Cada barra compara hogares parecidos en todo lo demás. Por eso vivir en zona rural aparece reduciendo
              la probabilidad una vez descontados la agricultura y los estudios; lo más probable es que se deba a
              que el costo de la canasta básica se calcula más bajo en el campo.
            </p>
          </div>

          <p className="rounded-2xl bg-amber-500/10 p-4 text-sm leading-relaxed text-amber-900 dark:text-amber-200">
            <strong>Su límite:</strong> en {poverty.test_years[0]} calculó que{" "}
            {Math.round(poverty.test.pct_predicho_pobre * 100)} de cada 100 hogares eran pobres, cuando en realidad
            eran {actual}. Ordena bien a los hogares, pero se queda corto en el total.
          </p>
        </div>
      </article>
    </section>
  )
}
