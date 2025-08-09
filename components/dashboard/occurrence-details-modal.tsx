"use client"

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import type { OccurrenceData } from "./occurrence-modal"
import { generatePdf } from "@/lib/pdf-utils"
import { Button } from "@/components/ui/button"

interface OccurrenceDetailsModalProps {
  isOpen: boolean
  onClose: () => void
  occurrence: OccurrenceData | null
}

export function OccurrenceDetailsModal({ isOpen, onClose, occurrence }: OccurrenceDetailsModalProps) {
  if (!occurrence) return null

  const totalWeight = occurrence.items.reduce((sum, item) => sum + item.totalItemWeight, 0)

  const handleGeneratePdf = async () => {
    const element = document.getElementById("occurrence-details-view-for-pdf")
    if (element) {
      await generatePdf(
        "occurrence-details-view-for-pdf",
        `Detalhes_Ocorrencia_${occurrence.vehicleId}_${occurrence.type}`,
      )
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[900px] max-h-[90vh] overflow-y-auto shadow-lg">
        <DialogHeader>
          <DialogTitle>Detalhes da Ocorrência</DialogTitle>
          <DialogDescription>Informações detalhadas da ocorrência registrada.</DialogDescription>
        </DialogHeader>
        <div id="occurrence-details-view-for-pdf" className="py-4">
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Tipo de Ocorrência:</p>
              <p className="text-lg font-semibold">{occurrence.type}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Registrado em:</p>
              <p className="text-lg font-semibold">{new Date(occurrence.registeredAt).toLocaleString()}</p>
            </div>
          </div>

          <h3 className="text-lg font-semibold mb-2">Itens da Ocorrência:</h3>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Código</TableHead>
                <TableHead>Descrição</TableHead>
                <TableHead>SIF</TableHead>
                <TableHead>Validade Etiqueta</TableHead>
                <TableHead>Qt</TableHead>
                <TableHead>Tipo Peso</TableHead>
                <TableHead>Peso Total (kg)</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {occurrence.items.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>{item.code}</TableCell>
                  <TableCell>{item.description}</TableCell>
                  <TableCell>{item.sif}</TableCell>
                  <TableCell>{item.validityLabel}</TableCell>
                  <TableCell>{item.quantity}</TableCell>
                  <TableCell>{item.weightType === "fixo" ? "Fixo" : "Variável"}</TableCell>
                  <TableCell>{item.totalItemWeight.toFixed(2)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <div className="mt-4 text-right font-bold text-lg">Peso Total da Ocorrência: {totalWeight.toFixed(2)} kg</div>
        </div>
        <div className="flex justify-end gap-2 mt-4">
          <Button variant="outline" onClick={handleGeneratePdf}>
            Gerar PDF
          </Button>
          <Button onClick={onClose}>Fechar</Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
