import React from "react"
import type { Metadata, Viewport } from "next"
import { Inter, JetBrains_Mono } from "next/font/google"

import "./globals.css"

const _inter = Inter({ subsets: ["latin"] })
const _jetbrainsMono = JetBrains_Mono({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "EPHPM Honduras - Dashboard Socioeconómico",
  description:
    "Visualización interactiva de indicadores socioeconómicos por departamento de Honduras con predicción de clusters mediante Machine Learning.",
}

export const viewport: Viewport = {
  themeColor: "#1565c0",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="es">
      <body className="font-sans antialiased">{children}</body>
    </html>
  )
}
