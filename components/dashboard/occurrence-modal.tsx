"use client"

import { useState, useEffect } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { PlusCircle, Trash2 } from "lucide-react"
import { generatePdf } from "@/lib/pdf-utils"

export interface OccurrenceItemData {
  id: string
  code: string
  description: string
  sif: string
  validityLabel: string
  quantity: number
  weightType: "fixo" | "variavel"
  unitWeight?: number // For fixed weight
  totalItemWeight: number // Calculated or user-inputted
}

export interface OccurrenceData {
  id: string
  vehicleId: string
  type: "Avaria" | "Falta" | "Sobra" | "Shelf" | "Inversão" | ""
  items: OccurrenceItemData[]
  registeredAt: string
}

interface OccurrenceModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (occurrence: OccurrenceData) => void
  vehicleId: string
  plate: string
}

export function OccurrenceModal({ isOpen, onClose, onSave, vehicleId, plate }: OccurrenceModalProps) {
  const [occurrenceType, setOccurrenceType] = useState<OccurrenceData["type"]>("")
  const [items, setItems] = useState<OccurrenceItemData[]>([])

  useEffect(() => {
    if (isOpen) {
      setOccurrenceType("")
      setItems([
        {
          id: crypto.randomUUID(),
          code: "",
          description: "",
          sif: "",
          validityLabel: "",
          quantity: 0,
          weightType: "fixo",
          unitWeight: 0,
          totalItemWeight: 0,
        },
      ])
    }
  }, [isOpen])

  const handleAddItem = () => {
    setItems((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        code: "",
        description: "",
        sif: "",
        validityLabel: "",
        quantity: 0,
        weightType: "fixo",
        unitWeight: 0,
        totalItemWeight: 0,
      },
    ])
  }

  const handleRemoveItem = (id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id))
  }

  const handleItemChange = (id: string, field: keyof OccurrenceItemData, value: any) => {
    setItems((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          const updatedItem = { ...item, [field]: value } as OccurrenceItemData

          if (field === "quantity" || field === "unitWeight" || field === "weightType" || field === "totalItemWeight") {
            if (updatedItem.weightType === "fixo") {
              updatedItem.totalItemWeight = updatedItem.quantity * (updatedItem.unitWeight || 0)
            } else if (updatedItem.weightType === "variavel" && field !== "totalItemWeight") {
              // If weightType is variable, and quantity/unitWeight changes, totalItemWeight should not be auto-calculated
              // It should only be updated if totalItemWeight field itself is changed by user.
              // For this demo, we'll assume user inputs totalItemWeight directly for 'variavel'.
              // If user changes quantity for 'variavel', totalItemWeight remains as is until user updates it.
            }
          }
          return updatedItem
        }
        return item
      }),
    )
  }

  const calculateTotalOccurrenceWeight = () => {
    return items.reduce((sum, item) => sum + item.totalItemWeight, 0)
  }

  const handleSave = () => {
    if (
      !occurrenceType ||
      items.length === 0 ||
      items.some((item) => !item.code || !item.description || item.quantity <= 0 || item.totalItemWeight <= 0)
    ) {
      alert("Por favor, preencha todos os campos obrigatórios e adicione pelo menos um item válido.")
      return
    }

    const newOccurrence: OccurrenceData = {
      id: crypto.randomUUID(),
      vehicleId,
      type: occurrenceType,
      items,
      registeredAt: new Date().toISOString(),
    }
    onSave(newOccurrence)
    onClose()
  }

  const handleGeneratePdf = async () => {
    const element = document.getElementById("occurrence-details-for-pdf")
    if (element) {
      await generatePdf("occurrence-details-for-pdf", `Ocorrencia_${plate}_${occurrenceType}_${new Date().getTime()}`)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto shadow-lg">
        <DialogHeader>
          <DialogTitle>Registrar Ocorrência para Placa: {plate}</DialogTitle>
          <DialogDescription>Preencha os detalhes da ocorrência.</DialogDescription>
        </DialogHeader>
        <div id="occurrence-details-for-pdf" className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="occurrenceType" className="text-right">
              Tipo de Ocorrência
            </Label>
            <Select
              onValueChange={(value) => setOccurrenceType(value as OccurrenceData["type"])}
              value={occurrenceType}
            >
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Selecione o tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Avaria">Avaria</SelectItem>
                <SelectItem value="Falta">Falta</SelectItem>
                <SelectItem value="Sobra">Sobra</SelectItem>
                <SelectItem value="Shelf">Shelf</SelectItem>
                <SelectItem value="Inversão">Inversão</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {occurrenceType && (
            <div className="mt-4 border p-4 rounded-md">
              <h3 className="text-lg font-semibold mb-4">Detalhes da Ocorrência ({occurrenceType})</h3>
              {items.map((item, index) => (
                <div
                  key={item.id}
                  className="grid grid-cols-1 md:grid-cols-6 gap-4 mb-4 p-2 border rounded-md relative"
                >
                  <div className="col-span-6 flex justify-end">
                    {items.length > 1 && (
                      <Button variant="ghost" size="icon" onClick={() => handleRemoveItem(item.id)}>
                        <Trash2 className="h-4 w-4 text-red-500" />
                        <span className="sr-only">Remover item</span>
                      </Button>
                    )}
                  </div>
                  <div className="grid gap-2 col-span-2">
                    <Label htmlFor={`code-${item.id}`}>Código</Label>
                    <Input
                      id={`code-${item.id}`}
                      value={item.code}
                      onChange={(e) => handleItemChange(item.id, "code", e.target.value)}
                    />
                  </div>
                  <div className="grid gap-2 col-span-4">
                    <Label htmlFor={`description-${item.id}`}>Descrição</Label>
                    <Input
                      id={`description-${item.id}`}
                      value={item.description}
                      onChange={(e) => handleItemChange(item.id, "description", e.target.value)}
                    />
                  </div>
                  <div className="grid gap-2 col-span-2">
                    <Label htmlFor={`sif-${item.id}`}>SIF</Label>
                    <Input
                      id={`sif-${item.id}`}
                      value={item.sif}
                      onChange={(e) => handleItemChange(item.id, "sif", e.target.value)}
                    />
                  </div>
                  <div className="grid gap-2 col-span-2">
                    <Label htmlFor={`validityLabel-${item.id}`}>Validade Etiqueta</Label>
                    <Input
                      id={`validityLabel-${item.id}`}
                      value={item.validityLabel}
                      onChange={(e) => handleItemChange(item.id, "validityLabel", e.target.value)}
                    />
                  </div>
                  <div className="grid gap-2 col-span-2">
                    <Label htmlFor={`quantity-${item.id}`}>Qt</Label>
                    <Input
                      id={`quantity-${item.id}`}
                      type="number"
                      value={item.quantity}
                      onChange={(e) => handleItemChange(item.id, "quantity", Number.parseInt(e.target.value) || 0)}
                    />
                  </div>
                  <div className="grid gap-2 col-span-3">
                    <Label htmlFor={`weightType-${item.id}`}>Tipo de Peso</Label>
                    <Select
                      onValueChange={(value) => handleItemChange(item.id, "weightType", value as "fixo" | "variavel")}
                      value={item.weightType}
                    >
                      <SelectTrigger id={`weightType-${item.id}`}>
                        <SelectValue placeholder="Selecione" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="fixo">Peso Fixo</SelectItem>
                        <SelectItem value="variavel">Peso Variável</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  {item.weightType === "fixo" && (
                    <div className="grid gap-2 col-span-3">
                      <Label htmlFor={`unitWeight-${item.id}`}>Peso por Unidade (kg)</Label>
                      <Input
                        id={`unitWeight-${item.id}`}
                        type="number"
                        step="0.01"
                        value={item.unitWeight}
                        onChange={(e) =>
                          handleItemChange(item.id, "unitWeight", Number.parseFloat(e.target.value) || 0)
                        }
                      />
                    </div>
                  )}
                  {item.weightType === "variavel" && (
                    <div className="grid gap-2 col-span-3">
                      <Label htmlFor={`totalItemWeight-${item.id}`}>Peso Total (kg)</Label>
                      <Input
                        id={`totalItemWeight-${item.id}`}
                        type="number"
                        step="0.01"
                        value={item.totalItemWeight}
                        onChange={(e) =>
                          handleItemChange(item.id, "totalItemWeight", Number.parseFloat(e.target.value) || 0)
                        }
                      />
                    </div>
                  )}
                  {item.weightType === "fixo" && (
                    <div className="grid gap-2 col-span-6">
                      <Label>Peso Total do Item (Calculado)</Label>
                      <Input value={`${item.totalItemWeight.toFixed(2)} kg`} readOnly className="font-bold" />
                    </div>
                  )}
                </div>
              ))}
              <Button variant="outline" onClick={handleAddItem} className="mt-2 bg-transparent">
                <PlusCircle className="h-4 w-4 mr-2" /> Adicionar mais Código
              </Button>
              <div className="mt-4 text-right font-bold text-lg">
                Peso Total da Ocorrência: {calculateTotalOccurrenceWeight().toFixed(2)} kg
              </div>
            </div>
          )}
        </div>
        <DialogFooter className="flex flex-col sm:flex-row sm:justify-between gap-2">
          <Button variant="outline" onClick={handleGeneratePdf}>
            Gerar PDF da Ocorrência
          </Button>
          <div className="flex gap-2">
            <Button variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button onClick={handleSave}>Registrar Ocorrência</Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
