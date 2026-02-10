"use client"

import { useEffect, useRef, useCallback } from "react"
import L from "leaflet"
import "leaflet/dist/leaflet.css"
import {
  getDepartmentByName,
  CLUSTER_INFO,
  type DepartmentData,
} from "@/lib/departments-data"

interface HondurasMapProps {
  onSelectDepartment: (department: DepartmentData | null) => void
  selectedDepartment: DepartmentData | null
}

export default function HondurasMap({
  onSelectDepartment,
  selectedDepartment,
}: HondurasMapProps) {
  const mapRef = useRef<L.Map | null>(null)
  const geoLayerRef = useRef<L.GeoJSON | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  const getColor = useCallback((cluster: number | undefined) => {
    if (cluster === undefined) return "#6b7280"
    return CLUSTER_INFO[cluster]?.color ?? "#6b7280"
  }, [])

  const styleFeature = useCallback(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (feature: any) => {
      const name = feature?.properties?.NAME_1
      const dept = name ? getDepartmentByName(name) : undefined
      const isSelected =
        selectedDepartment &&
        dept &&
        dept.depto === selectedDepartment.depto

      return {
        fillColor: getColor(dept?.cluster),
        weight: isSelected ? 3 : 1.5,
        opacity: 1,
        color: isSelected ? "#0f172a" : "#ffffff",
        fillOpacity: isSelected ? 0.9 : 0.7,
      }
    },
    [getColor, selectedDepartment]
  )

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return

    let cancelled = false

    const map = L.map(containerRef.current, {
      center: [14.75, -86.25],
      zoom: 7,
      zoomControl: true,
      attributionControl: false,
      scrollWheelZoom: true,
    })

    L.tileLayer(
      "https://{s}.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}{r}.png",
      { maxZoom: 19 }
    ).addTo(map)

    mapRef.current = map

    fetch("/gadm41_HND_1.json")
      .then((res) => res.json())
      .then((geojson) => {
        if (cancelled) return

        const layer = L.geoJSON(geojson, {
          style: styleFeature,
          onEachFeature: (feature, featureLayer) => {
            const name = feature.properties?.NAME_1
            const dept = name ? getDepartmentByName(name) : undefined

            featureLayer.on({
              click: () => {
                onSelectDepartment(dept ?? null)
              },
              mouseover: (e) => {
                const l = e.target
                l.setStyle({
                  weight: 3,
                  color: "#0f172a",
                  fillOpacity: 0.85,
                })
                l.bringToFront()
              },
              mouseout: (e) => {
                geoLayerRef.current?.resetStyle(e.target)
              },
            })

            const tooltipLabel = dept
              ? `${name} - ${dept.depto}`
              : `${name} (sin datos)`

            featureLayer.bindTooltip(tooltipLabel, {
              sticky: true,
              className: "map-tooltip",
            })
          },
        }).addTo(map)

        geoLayerRef.current = layer
      })

    return () => {
      cancelled = true
      map.remove()
      mapRef.current = null
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (geoLayerRef.current) {
      geoLayerRef.current.setStyle(styleFeature as L.StyleFunction)
    }
  }, [selectedDepartment, styleFeature])

  return (
    <div className="relative h-full w-full">
      <div ref={containerRef} className="h-full w-full rounded-lg" />
      <style jsx global>{`
        .map-tooltip {
          background: hsl(220 20% 10%);
          color: hsl(0 0% 98%);
          border: none;
          border-radius: 6px;
          padding: 6px 12px;
          font-size: 13px;
          font-weight: 500;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        }
        .map-tooltip::before {
          border-top-color: hsl(220 20% 10%) !important;
        }
        .leaflet-control-zoom a {
          background: hsl(0 0% 100%) !important;
          color: hsl(220 20% 10%) !important;
          border-color: hsl(220 13% 88%) !important;
        }
      `}</style>
    </div>
  )
}
