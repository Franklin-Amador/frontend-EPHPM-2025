"use client"

import { useEffect, useRef } from "react"
import L from "leaflet"
import "leaflet/dist/leaflet.css"
import { departmentFromGeoName } from "@/lib/panel"

export interface MapEntry {
  color: string
  label: string
  hasData: boolean
}

interface HondurasMapProps {
  /** keyed by department code */
  entries: Record<number, MapEntry>
  selected: number | null
  onSelect: (code: number) => void
}

// Framing the mainland and the Bay Islands. The full extent includes the Swan Islands,
// 150 km offshore, which would shrink the country to half the card.
const MAINLAND: L.LatLngBoundsExpression = [
  [12.95, -89.4],
  [16.6, -83.1],
]

type DeptLayer = L.Path & { deptCode?: number; deptName?: string }

export default function HondurasMap({ entries, selected, onSelect }: HondurasMapProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<L.Map | null>(null)
  const layerRef = useRef<L.GeoJSON | null>(null)
  const latest = useRef({ entries, selected, onSelect })
  latest.current = { entries, selected, onSelect }

  const paint = () => {
    const { entries, selected } = latest.current
    layerRef.current?.eachLayer((l) => {
      const layer = l as DeptLayer
      const entry = layer.deptCode ? entries[layer.deptCode] : undefined
      const isSelected = layer.deptCode === selected
      layer.setStyle({
        fillColor: entry?.color,
        fillOpacity: entry?.hasData ? 0.92 : 0.25,
        weight: isSelected ? 3 : 1,
      })
      layer.getElement()?.classList.toggle("is-selected", isSelected)
      if (isSelected) layer.bringToFront()
      layer.setTooltipContent(
        `<strong>${layer.deptName}</strong><span>${entry?.label ?? "Sin datos"}</span>`,
      )
    })
  }

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return
    let cancelled = false

    // No basemap tiles: the choropleth stands on its own and follows the page theme.
    const map = L.map(containerRef.current, {
      zoomControl: false,
      attributionControl: false,
      scrollWheelZoom: false,
      doubleClickZoom: false,
      zoomSnap: 0.1,
    })
    mapRef.current = map

    const fit = () => {
      if (!layerRef.current) return
      map.invalidateSize()
      map.fitBounds(MAINLAND, { padding: [4, 4] })
    }

    fetch("/gadm41_HND_1.json")
      .then((res) => res.json())
      .then((geojson) => {
        if (cancelled) return
        layerRef.current = L.geoJSON(geojson, {
          style: { className: "dept-shape" },
          onEachFeature: (feature, l) => {
            const layer = l as DeptLayer
            const dept = departmentFromGeoName(String(feature.properties?.NAME_1 ?? ""))
            layer.deptCode = dept?.code
            layer.deptName = dept?.name ?? feature.properties?.NAME_1
            layer.bindTooltip("", { sticky: true, className: "dept-tooltip", direction: "top" })
            layer.on("click", () => dept && latest.current.onSelect(dept.code))
          },
        }).addTo(map)
        fit()
        paint()
      })

    const observer = new ResizeObserver(fit)
    observer.observe(containerRef.current)

    return () => {
      cancelled = true
      observer.disconnect()
      map.remove()
      mapRef.current = null
      layerRef.current = null
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(paint, [entries, selected])

  return <div ref={containerRef} className="h-full w-full bg-transparent" />
}
