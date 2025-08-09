"use client"

import { Label } from "@/components/ui/label"

import { useEffect, useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import { Package2 } from "lucide-react"
import Link from "next/link"
import { ModeToggle } from "@/components/shared/dark-mode-toggle"
import { WhatsappPopup } from "@/components/shared/whatsapp-popup"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { getVehicles, getOccurrences } from "@/app/actions"
import type { VehicleFormData } from "@/components/dashboard/add-vehicle-form"
import type { OccurrenceData } from "@/components/dashboard/occurrence-modal"

export default function AnalyticsPage() {
  const router = useRouter()
  const [vehicles, setVehicles] = useState<VehicleFormData[]>([])
  const [occurrences, setOccurrences] = useState<OccurrenceData[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedReport, setSelectedReport] = useState<"doca" | "status" | "vehicleType">("doca")

  const fetchData = useCallback(async () => {
    setLoading(true)
    const [fetchedVehicles, fetchedOccurrences] = await Promise.all([getVehicles(), getOccurrences()])
    setVehicles(fetchedVehicles)
    setOccurrences(fetchedOccurrences)
    setLoading(false)
  }, [])

  useEffect(() => {
    const isLoggedIn = localStorage.getItem("isLoggedIn")
    if (!isLoggedIn) {
      router.push("/")
    } else {
      fetchData()
    }
  }, [router, fetchData])

  // Dynamic data for charts based on fetched vehicles and occurrences
  const getChartData = (reportType: "doca" | "status" | "vehicleType") => {
    switch (reportType) {
      case "doca": {
        const dockCounts: { [key: string]: number } = {}
        vehicles.forEach((v) => {
          dockCounts[v.dock] = (dockCounts[v.dock] || 0) + 1
        })
        const sortedDocks = Object.keys(dockCounts).sort((a, b) => Number.parseInt(a) - Number.parseInt(b))
        return {
          labels: sortedDocks.map((dock) => `Doca ${dock}`),
          data: sortedDocks.map((dock) => dockCounts[dock]),
          title: "Veículos por Doca",
        }
      }
      case "status": {
        const statusCounts: { [key: string]: number } = {
          Descarga: 0,
          Pátio: 0,
          Finalizado: 0,
        }
        vehicles.forEach((v) => {
          if (statusCounts.hasOwnProperty(v.status)) {
            statusCounts[v.status]++
          }
        })
        return {
          labels: Object.keys(statusCounts),
          data: Object.values(statusCounts),
          title: "Status dos Veículos",
        }
      }
      case "vehicleType": {
        const typeCounts: { [key: string]: number } = {
          Resfriado: 0,
          Congelado: 0,
          Mista: 0,
          Seca: 0,
        }
        vehicles.forEach((v) => {
          if (typeCounts.hasOwnProperty(v.vehicleType)) {
            typeCounts[v.vehicleType]++
          }
        })
        return {
          labels: Object.keys(typeCounts),
          data: Object.values(typeCounts),
          title: "Tipos de Veículos",
        }
      }
      default:
        return { labels: [], data: [], title: "" }
    }
  }

  const currentChart = getChartData(selectedReport)

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500"></div>
        <p className="ml-4 text-lg">Carregando dados de relatórios...</p>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen w-full flex-col bg-gray-50 dark:bg-gray-900 shadow-inner">
      <header className="sticky top-0 z-40 flex h-16 items-center gap-4 border-b bg-background px-4 shadow-sm sm:px-6">
        <Link href="#" className="flex items-center gap-2 font-semibold">
          <Package2 className="h-6 w-6" />
          <span className="sr-only">Gestão de Veículos</span>
        </Link>
        <nav className="hidden md:flex md:items-center md:gap-5 lg:gap-6 text-lg font-medium md:text-sm">
          <Link href="/dashboard" className="text-muted-foreground transition-colors hover:text-foreground">
            Dashboard
          </Link>
          <Link href="#" className="text-foreground transition-colors hover:text-foreground">
            Relatórios
          </Link>
        </nav>
        <div className="flex items-center gap-4 md:ml-auto md:gap-2 lg:gap-4">
          <ModeToggle />
        </div>
      </header>
      <main id="analytics-content" className="flex flex-1 flex-col gap-8 p-4 md:p-8">
        <h1 className="text-3xl font-bold">Relatórios Estatísticos</h1>

        <div className="flex items-center gap-4">
          <Label htmlFor="report-type">Selecionar Relatório:</Label>
          <Select
            value={selectedReport}
            onValueChange={(value) => setSelectedReport(value as "doca" | "status" | "vehicleType")}
          >
            <SelectTrigger id="report-type" className="w-[200px]">
              <SelectValue placeholder="Tipo de Relatório" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="doca">Veículos por Doca</SelectItem>
              <SelectItem value="status">Status dos Veículos</SelectItem>
              <SelectItem value="vehicleType">Tipos de Veículos</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Card className="shadow-md">
          <CardHeader>
            <CardTitle>{currentChart.title}</CardTitle>
          </CardHeader>
          <CardContent>
            {/* This is a placeholder for a chart. In a real app, you'd use a charting library like Recharts or Chart.js */}
            <div className="w-full h-64 bg-gray-200 dark:bg-gray-700 flex items-center justify-center rounded-md text-muted-foreground">
              <p>Gráfico de {currentChart.title} (Placeholder)</p>
              <div className="flex flex-col items-start ml-4">
                {currentChart.labels.length > 0 ? (
                  currentChart.labels.map((label, index) => (
                    <p key={label}>
                      {label}: {currentChart.data[index]}
                    </p>
                  ))
                ) : (
                  <p>Nenhum dado disponível para este relatório.</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
      <WhatsappPopup reportElementId="analytics-content" reportFilename={`Relatorio_${selectedReport}`} />
      <div className="flex justify-start p-4">
        <Button
          onClick={() => router.push("/dashboard")}
          className="bg-blue-600 hover:bg-blue-700 text-white shadow-md"
        >
          Voltar ao Dashboard
        </Button>
      </div>
    </div>
  )
}
