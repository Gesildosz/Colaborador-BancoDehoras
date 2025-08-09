"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Link from "next/link"
import { AlertCircle, LogIn } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { loginCollaborator } from "@/lib/api"

const K_COLAB_CURRENT = "timebank.currentCollaboratorAccessId"

export default function ColaboradorLoginPage() {
  const router = useRouter()
  const [codigo, setCodigo] = useState("")
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const current = localStorage.getItem(K_COLAB_CURRENT)
    if (current) router.replace("/colaborador/painel")
  }, [router])

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    const trimmed = codigo.trim()
    if (!/^\d{6,10}$/.test(trimmed)) {
      setError("O Código de Acesso deve ter entre 6 e 10 números.")
      return
    }
    try {
      await loginCollaborator(trimmed)
      localStorage.setItem(K_COLAB_CURRENT, trimmed)
      router.push("/colaborador/painel")
    } catch (err: any) {
      setError(err?.message || "Falha no login.")
    }
  }

  return (
    <main className="min-h-[100dvh] grid place-items-center bg-muted/30 px-4 py-10">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Meu Banco de Horas</CardTitle>
          <CardDescription>Informe seu Código de Acesso para entrar no painel do colaborador.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Não foi possível entrar</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          <form className="space-y-4" onSubmit={onSubmit}>
            <div className="space-y-2">
              <Label htmlFor="codigo">Código de Acesso</Label>
              <Input
                id="codigo"
                inputMode="numeric"
                pattern="\d*"
                placeholder="Ex.: 123456"
                value={codigo}
                onChange={(e) => setCodigo(e.target.value.replace(/\D/g, ""))}
                autoFocus
                aria-describedby="codigo-help"
              />
              <p id="codigo-help" className="text-xs text-muted-foreground">
                Apenas números (6 a 10 dígitos).
              </p>
            </div>
            <Button type="submit" className="w-full">
              <LogIn className="mr-2 h-4 w-4" />
              Entrar
            </Button>
          </form>
          <div className="text-xs text-muted-foreground">A atualização de saldos é realizada pelo administrador.</div>
          <div className="text-xs">
            É administrador?{" "}
            <Link className="underline" href="/admin">
              Entrar no Painel do Administrador
            </Link>
          </div>
        </CardContent>
      </Card>
    </main>
  )
}
