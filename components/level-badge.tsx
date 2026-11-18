import { CLUSTERS, CLUSTER_COLORS } from "@/lib/panel"
import { cn } from "@/lib/utils"

/**
 * A level shown as a coloured dot next to its name in normal ink.
 * White text on the level colours only reached 3.9-4.4:1; the name is the
 * signal and the dot carries the colour, so the level never depends on colour alone.
 */
export default function LevelBadge({ level, className }: { level: number; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-2 rounded-full border border-border bg-muted px-3 py-1 text-xs font-semibold text-foreground",
        className,
      )}
    >
      <span data-mark className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ background: CLUSTER_COLORS[level] }} />
      {CLUSTERS[level].name}
    </span>
  )
}
