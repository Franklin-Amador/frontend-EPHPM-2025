"use client"

import { CLUSTER_INFO } from "@/lib/departments-data"

export default function ClusterLegend() {
  return (
    <div className="flex flex-wrap items-center gap-4">
      {Object.entries(CLUSTER_INFO).map(([key, info]) => (
        <div key={key} className="flex items-center gap-1.5">
          <span
            className="inline-block h-3 w-3 rounded-full"
            style={{ backgroundColor: info.color }}
          />
          <span className="text-xs text-muted-foreground font-medium">
            {info.name}
          </span>
        </div>
      ))}
      <div className="flex items-center gap-1.5">
        <span
          className="inline-block h-3 w-3 rounded-full"
          style={{ backgroundColor: "#6b7280" }}
        />
        <span className="text-xs text-muted-foreground font-medium">
          Sin datos
        </span>
      </div>
    </div>
  )
}
