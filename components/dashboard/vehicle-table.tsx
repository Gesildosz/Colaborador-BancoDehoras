"use client"

import { useState } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { AddVehicleForm, type VehicleFormData } from "./add-vehicle-form"
import { OccurrenceModal, type OccurrenceData } from "./occurrence-modal"
import { OccurrenceDetailsModal } from "./occurrence-details-modal"

interface VehicleTableProps {
  vehicles: VehicleFormData[]
  onAddOrUpdateVehicle: (vehicle: VehicleFormData) => Promise<void> // Changed to Promise<void>
  onDeleteVehicle: (id: string) => Promise<void> // Changed to Promise<void>
  onRegisterOccurrence: (occurrence: OccurrenceData) => Promise<void> // Changed to Promise<void>
  getOccurrencesForVehicle: (vehicleId: string) => OccurrenceData[]
}

export function VehicleTable({
  vehicles,
  onAddOrUpdateVehicle,
  onDeleteVehicle,
  onRegisterOccurrence,
  getOccurrencesForVehicle,
}: VehicleTableProps) {
  const [isAddEditModalOpen, setIsAddEditModalOpen] = useState(false)
  const [editingVehicle, setEditingVehicle] = useState<VehicleFormData | null>(null)
  const [isOccurrenceModalOpen, setIsOccurrenceModalOpen] = useState(false)
  const [selectedVehicleForOccurrence, setSelectedVehicleForOccurrence] = useState<{
    id: string
    plate: string
  } | null>(null)
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false)
  const [selectedOccurrenceForDetails, setSelectedOccurrenceForDetails] = useState<OccurrenceData | null>(null)

  const handleAddVehicleClick = () => {
    setEditingVehicle(null)
    setIsAddEditModalOpen(true)
  }

  const handleEditVehicleClick = (vehicle: VehicleFormData) => {
    setEditingVehicle(vehicle)
    setIsAddEditModalOpen(true)
  }

  const handleSaveVehicle = async (data: VehicleFormData) => {
    await onAddOrUpdateVehicle(data)
    setIsAddEditModalOpen(false)
  }

  const handleRegisterOccurrenceClick = (vehicleId: string, plate: string) => {
    setSelectedVehicleForOccurrence({ id: vehicleId, plate })
    setIsOccurrenceModalOpen(true)
  }

  const handleSaveOccurrence = async (occurrence: OccurrenceData) => {
    await onRegisterOccurrence(occurrence)
    setIsOccurrenceModalOpen(false)
  }

  const handleViewOccurrenceDetails = (vehicleId: string) => {
    const occurrences = getOccurrencesForVehicle(vehicleId)
    if (occurrences.length > 0) {
      // For simplicity, showing the first occurrence. Could be a list.
      setSelectedOccurrenceForDetails(occurrences[0])
      setIsDetailsModalOpen(true)
    } else {
      alert("Nenhuma ocorrência registrada para este veículo.")
    }
  }

  return (
    <div className="border shadow-md rounded-lg p-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold">Status da Visão dos Veículos</h2>
        <Button onClick={handleAddVehicleClick}>Adicionar Novo Veículo</Button>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>DOCA</TableHead>
            <TableHead>Placa</TableHead>
            <TableHead>Lacre</TableHead>
            <TableHead>Temperatura</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Agendamento</TableHead>
            <TableHead>Tipo</TableHead>
            <TableHead className="text-right">Ação</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {vehicles.map((vehicle) => {
            const hasOccurrence = getOccurrencesForVehicle(vehicle.id!).length > 0
            return (
              <TableRow key={vehicle.id} className={hasOccurrence ? "border-b-2 border-red-500" : ""}>
                <TableCell>{vehicle.dock}</TableCell>
                <TableCell className="font-medium">
                  {vehicle.plate}
                  {hasOccurrence && (
                    <Button
                      variant="link"
                      size="sm"
                      className="ml-2 p-0 h-auto text-blue-600 dark:text-blue-400"
                      onClick={() => handleViewOccurrenceDetails(vehicle.id!)}
                    >
                      (Ver Ocorrência)
                    </Button>
                  )}
                </TableCell>
                <TableCell>{vehicle.seal}</TableCell>
                <TableCell>{vehicle.temperature}</TableCell>
                <TableCell>{vehicle.status}</TableCell>
                <TableCell>
                  {vehicle.scheduledDate ? new Date(vehicle.scheduledDate).toLocaleDateString() : "N/A"}
                </TableCell>
                <TableCell>{vehicle.vehicleType}</TableCell>
                <TableCell className="text-right space-x-2">
                  <Button variant="outline" size="sm" onClick={() => handleEditVehicleClick(vehicle)}>
                    Editar
                  </Button>
                  <Button variant="destructive" size="sm" onClick={() => onDeleteVehicle(vehicle.id!)}>
                    Excluir
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => handleRegisterOccurrenceClick(vehicle.id!, vehicle.plate)}
                  >
                    Registrar Ocorrência
                  </Button>
                </TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>

      <Dialog open={isAddEditModalOpen} onOpenChange={setIsAddEditModalOpen}>
        <DialogContent className="sm:max-w-[600px] shadow-lg">
          <DialogHeader>
            <DialogTitle>{editingVehicle ? "Editar Veículo" : "Adicionar Novo Veículo"}</DialogTitle>
          </DialogHeader>
          <AddVehicleForm
            initialData={editingVehicle}
            onSubmit={handleSaveVehicle}
            onCancel={() => setIsAddEditModalOpen(false)}
          />
        </DialogContent>
      </Dialog>

      {selectedVehicleForOccurrence && (
        <OccurrenceModal
          isOpen={isOccurrenceModalOpen}
          onClose={() => setIsOccurrenceModalOpen(false)}
          onSave={handleSaveOccurrence}
          vehicleId={selectedVehicleForOccurrence.id}
          plate={selectedVehicleForOccurrence.plate}
        />
      )}

      <OccurrenceDetailsModal
        isOpen={isDetailsModalOpen}
        onClose={() => setIsDetailsModalOpen(false)}
        occurrence={selectedOccurrenceForDetails}
      />
    </div>
  )
}
