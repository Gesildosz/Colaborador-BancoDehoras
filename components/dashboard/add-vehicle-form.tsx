"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { CalendarIcon } from "lucide-react"
import { format } from "date-fns"
import { cn } from "@/lib/utils"

export interface VehicleFormData {
  id?: string
  dock: string
  plate: string
  seal: string
  temperature: string
  status: "Descarga" | "Pátio" | "Finalizado"
  scheduledDate: Date | undefined
  vehicleType: "Resfriado" | "Congelado" | "Mista" | "Seca" | ""
}

interface AddVehicleFormProps {
  initialData?: VehicleFormData | null
  onSubmit: (data: VehicleFormData) => void
  onCancel: () => void
}

export function AddVehicleForm({ initialData, onSubmit, onCancel }: AddVehicleFormProps) {
  const [formData, setFormData] = useState<VehicleFormData>(
    initialData || {
      dock: "",
      plate: "",
      seal: "",
      temperature: "",
      status: "Descarga",
      scheduledDate: undefined,
      vehicleType: "",
    },
  )

  useEffect(() => {
    if (initialData) {
      setFormData(initialData)
    }
  }, [initialData])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [id]: id === "plate" ? value.toUpperCase() : value,
    }))
  }

  const handleSelectChange = (id: keyof VehicleFormData, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [id]: value,
    }))
  }

  const handleDateChange = (date: Date | undefined) => {
    setFormData((prev) => ({
      ...prev,
      scheduledDate: date,
    }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(formData)
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-4 p-4">
      <div className="grid gap-2">
        <Label htmlFor="dock">Doca</Label>
        <Select onValueChange={(value) => handleSelectChange("dock", value)} value={formData.dock}>
          <SelectTrigger id="dock">
            <SelectValue placeholder="Selecione a doca" />
          </SelectTrigger>
          <SelectContent>
            {Array.from({ length: 50 }, (_, i) => (
              <SelectItem key={i + 1} value={String(i + 1).padStart(2, "0")}>
                {String(i + 1).padStart(2, "0")}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="grid gap-2">
        <Label htmlFor="plate">Placa</Label>
        <Input id="plate" value={formData.plate} onChange={handleChange} placeholder="ABC1234" required />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="seal">Lacre</Label>
        <Input id="seal" value={formData.seal} onChange={handleChange} placeholder="Lacre do veículo" />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="temperature">Temperatura</Label>
        <Input id="temperature" value={formData.temperature} onChange={handleChange} placeholder="Ex: 5°C" />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="vehicleType">Tipo de Veículo</Label>
        <Select onValueChange={(value) => handleSelectChange("vehicleType", value)} value={formData.vehicleType}>
          <SelectTrigger id="vehicleType">
            <SelectValue placeholder="Selecione o tipo" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Resfriado">Resfriado</SelectItem>
            <SelectItem value="Congelado">Congelado</SelectItem>
            <SelectItem value="Mista">Mista</SelectItem>
            <SelectItem value="Seca">Seca</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="grid gap-2">
        <Label htmlFor="status">Status</Label>
        <Select
          onValueChange={(value) => handleSelectChange("status", value as VehicleFormData["status"])}
          value={formData.status}
        >
          <SelectTrigger id="status">
            <SelectValue placeholder="Selecione o status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Descarga">Descarga</SelectItem>
            <SelectItem value="Pátio">Pátio</SelectItem>
            <SelectItem value="Finalizado">Finalizado</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="grid gap-2">
        <Label htmlFor="scheduledDate">Agendamento</Label>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant={"outline"}
              className={cn(
                "w-full justify-start text-left font-normal",
                !formData.scheduledDate && "text-muted-foreground",
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {formData.scheduledDate ? format(formData.scheduledDate, "PPP") : <span>Escolha uma data</span>}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0">
            <Calendar mode="single" selected={formData.scheduledDate} onSelect={handleDateChange} initialFocus />
          </PopoverContent>
        </Popover>
      </div>
      <div className="flex justify-end gap-2 mt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit">{initialData ? "Atualizar Veículo" : "Adicionar Veículo"}</Button>
      </div>
    </form>
  )
}
