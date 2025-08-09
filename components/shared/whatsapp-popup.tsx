"use client"

import { useState } from "react"
import { MessageCircleMore } from "lucide-react"
import { Button } from "@/components/ui/button"
import { sharePdfViaWhatsapp } from "@/lib/whatsapp-utils"
import { generatePdf } from "@/lib/pdf-utils"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

interface WhatsappPopupProps {
  reportElementId: string
  reportFilename: string
}

export function WhatsappPopup({ reportElementId, reportFilename }: WhatsappPopupProps) {
  const [isLoading, setIsLoading] = useState(false)

  const handleShare = async () => {
    setIsLoading(true)
    try {
      await generatePdf(reportElementId, reportFilename)
      sharePdfViaWhatsapp("Aqui está o Relatório da controladoria")
      alert("PDF gerado e WhatsApp aberto. Por favor, anexe o PDF baixado manualmente.")
    } catch (error) {
      console.error("Erro ao gerar PDF ou abrir WhatsApp:", error)
      alert("Ocorreu um erro ao gerar o relatório ou abrir o WhatsApp.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            onClick={handleShare}
            className="fixed bottom-4 left-4 bg-green-500 hover:bg-green-600 text-white rounded-full p-3 shadow-lg z-50"
            size="icon"
            disabled={isLoading}
          >
            {isLoading ? (
              <span className="animate-spin border-2 border-white border-t-transparent rounded-full h-5 w-5" />
            ) : (
              <MessageCircleMore className="h-6 w-6" />
            )}
            <span className="sr-only">Enviar relatório via WhatsApp</span>
          </Button>
        </TooltipTrigger>
        <TooltipContent side="right">
          <p>Enviar relatório via WhatsApp (PDF)</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
