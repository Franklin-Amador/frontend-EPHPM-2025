"use client"

import { CLUSTER_INFO } from "@/lib/departments-data"

export default function ClusterLegend() {
  return (
    <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5">
      {Object.entries(CLUSTER_INFO).map(([key, info]) => (
        <div key={key} className="flex items-center gap-1.5">
          <span
            className="inline-block h-2.5 w-2.5 rounded-sm shrink-0"
            style={{ backgroundColor: info.color }}
          />
          <span className="text-[11px] text-muted-foreground font-medium whitespace-nowrap">
            {info.name}
          </span>
        </div>
      ))}
      <div className="flex items-center gap-1.5">
        <span
          className="inline-block h-2.5 w-2.5 rounded-sm shrink-0"
          style={{ backgroundColor: "#6b7280" }}
        />
        <span className="text-[11px] text-muted-foreground font-medium whitespace-nowrap">
          Sin datos
        </span>
      </div>
    </div>
  )
}
