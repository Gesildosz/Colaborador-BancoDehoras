"use client"

import { useEffect, useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import { Package2 } from "lucide-react"
import Link from "next/link"
import { ModeToggle } from "@/components/shared/dark-mode-toggle"
import { WhatsappPopup } from "@/components/shared/whatsapp-popup"
import { DashboardCards } from "@/components/dashboard/dashboard-cards"
import { VehicleTable } from "@/components/dashboard/vehicle-table"
import type { VehicleFormData } from "@/components/dashboard/add-vehicle-form"
import type { OccurrenceData } from "@/components/dashboard/occurrence-modal"
import { Button } from "@/components/ui/button"
import { getVehicles, addVehicle, updateVehicle, deleteVehicle, getOccurrences, addOccurrence } from "@/app/actions"

export default function DashboardPage() {
  const router = useRouter()
  const [vehicles, setVehicles] = useState<VehicleFormData[]>([])
  const [occurrences, setOccurrences] = useState<OccurrenceData[]>([])
  const [loading, setLoading] = useState(true)

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

  const handleAddOrUpdateVehicle = async (newVehicle: VehicleFormData) => {
    if (newVehicle.id) {
      const result = await updateVehicle(newVehicle)
      if (result.success && result.data) {
        setVehicles((prev) => prev.map((v) => (v.id === result.data!.id ? result.data! : v)))
      } else {
        alert(`Erro ao atualizar veículo: ${result.error}`)
      }
    } else {
      const result = await addVehicle(newVehicle)
      if (result.success && result.data) {
        setVehicles((prev) => [...prev, result.data!])
      } else {
        alert(`Erro ao adicionar veículo: ${result.error}`)
      }
    }
  }

  const handleDeleteVehicle = async (id: string) => {
    if (confirm("Tem certeza que deseja excluir este veículo e todas as suas ocorrências?")) {
      const result = await deleteVehicle(id)
      if (result.success) {
        setVehicles((prev) => prev.filter((v) => v.id !== id))
        setOccurrences((prev) => prev.filter((o) => o.vehicleId !== id)) // Filter out associated occurrences
      } else {
        alert(`Erro ao excluir veículo: ${result.error}`)
      }
    }
  }

  const handleRegisterOccurrence = async (newOccurrence: OccurrenceData) => {
    const result = await addOccurrence(newOccurrence)
    if (result.success && result.data) {
      setOccurrences((prev) => [...prev, result.data!])
    } else {
      alert(`Erro ao registrar ocorrência: ${result.error}`)
    }
  }

  const getOccurrencesForVehicle = (vehicleId: string) => {
    return occurrences.filter((occ) => occ.vehicleId === vehicleId)
  }

  // Calculate card data
  const cdData = {
    descarga: vehicles.filter((v) => v.vehicleType === "Seca").length,
    congelado: vehicles.filter((v) => v.vehicleType === "Congelado").length,
    resfriado: vehicles.filter((v) => v.vehicleType === "Resfriado").length,
    kitFesta: vehicles.filter((v) => v.vehicleType === "Mista").length, // Assuming Mista for Kit Festa/Festivo
  }

  const statusData = {
    descarga: vehicles.filter((v) => v.status === "Descarga").length,
    patio: vehicles.filter((v) => v.status === "Pátio").length,
    finalizado: vehicles.filter((v) => v.status === "Finalizado").length,
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500"></div>
        <p className="ml-4 text-lg">Carregando dados...</p>
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
          <Link href="#" className="text-foreground transition-colors hover:text-foreground">
            Dashboard
          </Link>
        </nav>
        <div className="flex items-center gap-4 md:ml-auto md:gap-2 lg:gap-4">
          <ModeToggle />
        </div>
      </header>
      <main id="dashboard-content" className="flex flex-1 flex-col gap-8 p-4 md:p-8">
        <h1 className="text-3xl font-bold">Visão Geral do Recebimento e Expedição</h1>

        <DashboardCards cdData={cdData} statusData={statusData} />

        <VehicleTable
          vehicles={vehicles}
          onAddOrUpdateVehicle={handleAddOrUpdateVehicle}
          onDeleteVehicle={handleDeleteVehicle}
          onRegisterOccurrence={handleRegisterOccurrence}
          getOccurrencesForVehicle={getOccurrencesForVehicle}
        />
      </main>
      <WhatsappPopup reportElementId="dashboard-content" reportFilename="Relatorio_Dashboard" />
      <div className="flex justify-end p-4">
        <Button
          onClick={() => router.push("/analytics")}
          className="bg-blue-600 hover:bg-blue-700 text-white shadow-md"
        >
          Próxima página
        </Button>
      </div>
    </div>
  )
}
