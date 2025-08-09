"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle, LogIn, ShieldCheck } from "lucide-react"
import { loginAdmin } from "@/lib/api"
import type { AdminSession } from "@/lib/types"

const K_ADMIN_SESSION = "timebank.admin.session"
const K_ACTIVE_PROFILE = "timebank.admin.activeProfile"

export default function AdminLoginPage() {
  const router = useRouter()
  const [usuario, setUsuario] = useState("")
  const [senha, setSenha] = useState("")
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const session = localStorage.getItem(K_ADMIN_SESSION)
    if (session) router.replace("/admin/painel")
  }, [router])

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    try {
      const session = await loginAdmin(usuario, senha)
      const toSave: AdminSession = {
        ...session,
        perfilId: "master",
      }
      localStorage.setItem(K_ADMIN_SESSION, JSON.stringify(toSave))
      localStorage.setItem(K_ACTIVE_PROFILE, "master")
      router.push("/admin/painel")
    } catch (err: any) {
      setError(err?.message || "Falha no login.")
    }
  }

  return (
    <main className="min-h-[100dvh] grid place-items-center bg-muted/30 px-4 py-10">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShieldCheck className="size-5" />
            Painel do Administrador
          </CardTitle>
          <CardDescription>Autentique-se para gerenciar colaboradores e lançamentos.</CardDescription>
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
              <Label htmlFor="usuario">Usuário</Label>
              <Input id="usuario" value={usuario} onChange={(e) => setUsuario(e.target.value)} autoFocus />
            </div>
            <div className="space-y-2">
              <Label htmlFor="senha">Senha</Label>
              <Input id="senha" type="password" value={senha} onChange={(e) => setSenha(e.target.value)} />
            </div>
            <Button type="submit" className="w-full">
              <LogIn className="mr-2 h-4 w-4" />
              Entrar
            </Button>
          </form>
          <div className="text-xs text-muted-foreground">
            Em produção, valide e armazene sessões no servidor e centralize a autorização perto da fonte de dados.[^1]
          </div>
        </CardContent>
      </Card>
    </main>
  )
}
