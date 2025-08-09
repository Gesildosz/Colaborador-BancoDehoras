"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"

export function IntroductionModal() {
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    const hasSeenIntro = localStorage.getItem("hasSeenIntro")
    if (!hasSeenIntro) {
      setIsOpen(true)
    }
  }, [])

  const handleClose = () => {
    localStorage.setItem("hasSeenIntro", "true")
    setIsOpen(false)
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-[425px] shadow-lg">
        <DialogHeader>
          <DialogTitle>Bem-vindo ao Sistema de Gestão de Veículos!</DialogTitle>
          <DialogDescription>
            Este sistema foi desenvolvido para otimizar o recebimento e a expedição de veículos, oferecendo uma visão
            clara e relatórios rápidos.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <p>Aqui você poderá acompanhar o status dos veículos, registrar ocorrências e gerar relatórios detalhados.</p>
          <p className="text-sm text-muted-foreground">
            Explore as funcionalidades e tenha total controle sobre suas operações.
          </p>
        </div>
        <Button onClick={handleClose}>Começar</Button>
      </DialogContent>
    </Dialog>
  )
}
