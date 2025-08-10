"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { toast } from "@/hooks/use-toast"

export default function LoginPage() {
  const [collaboratorAccessCode, setCollaboratorAccessCode] = useState("")
  const [adminUsername, setAdminUsername] = useState("")
  const [adminPassword, setAdminPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleCollaboratorLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const response = await fetch("/api/auth/collaborator-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ accessCode: collaboratorAccessCode }),
      })

      // Leia o corpo da resposta uma única vez
      const responseText = await response.text()

      if (response.ok) {
        // Se a resposta for OK, esperamos JSON
        try {
          const data = JSON.parse(responseText)
          toast({ title: "Sucesso", description: data.message || "Login do colaborador bem-sucedido!" })
          router.push("/collaborator")
        } catch (jsonParseError) {
          console.error(
            "Erro ao parsear JSON da resposta OK do colaborador:",
            jsonParseError,
            "Resposta:",
            responseText,
          )
          toast({ title: "Erro", description: "Resposta inesperada do servidor." })
        }
      } else {
        // Se a resposta NÃO for OK, tentamos parsear JSON do erro, ou usamos o texto bruto
        let errorDescription = "Código de acesso inválido."
        try {
          const errorData = JSON.parse(responseText)
          errorDescription = errorData.error || errorDescription
        } catch (jsonParseError) {
          errorDescription = responseText || `Erro do servidor: ${response.status} ${response.statusText}`
          console.error(
            "Erro ao parsear JSON da resposta de erro do colaborador:",
            jsonParseError,
            "Resposta:",
            responseText,
          )
        }
        toast({ title: "Erro", description: errorDescription })
      }
    } catch (error) {
      console.error("Erro ao fazer login do colaborador (fetch ou rede):", error)
      toast({ title: "Erro", description: "Ocorreu um erro inesperado na comunicação com o servidor." })
    } finally {
      setLoading(false)
    }
  }

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const response = await fetch("/api/auth/admin-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: adminUsername, password: adminPassword }),
      })

      // Leia o corpo da resposta uma única vez
      const responseText = await response.text()

      if (response.ok) {
        // Se a resposta for OK, esperamos JSON
        try {
          const data = JSON.parse(responseText)
          toast({ title: "Sucesso", description: data.message || "Login do administrador bem-sucedido!" })
          router.push("/admin")
        } catch (jsonParseError) {
          console.error(
            "Erro ao parsear JSON da resposta OK do administrador:",
            jsonParseError,
            "Resposta:",
            responseText,
          )
          toast({ title: "Erro", description: "Resposta inesperada do servidor." })
        }
      } else {
        // Se a resposta NÃO for OK, tentamos parsear JSON do erro, ou usamos o texto bruto
        let errorDescription = "Usuário ou senha inválidos."
        try {
          const errorData = JSON.parse(responseText)
          errorDescription = errorData.error || errorDescription
        } catch (jsonParseError) {
          errorDescription = responseText || `Erro do servidor: ${response.status} ${response.statusText}`
          console.error(
            "Erro ao parsear JSON da resposta de erro do administrador:",
            jsonParseError,
            "Resposta:",
            responseText,
          )
        }
        toast({ title: "Erro", description: errorDescription })
      }
    } catch (error) {
      console.error("Erro ao fazer login do administrador (fetch ou rede):", error)
      toast({ title: "Erro", description: "Ocorreu um erro inesperado na comunicação com o servidor." })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100 dark:bg-gray-950">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl text-center">Gerenciamento de Banco de Horas</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="collaborator" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="collaborator">Colaborador</TabsTrigger>
              <TabsTrigger value="admin">Administrador</TabsTrigger>
            </TabsList>
            <TabsContent value="collaborator" className="mt-4">
              <form onSubmit={handleCollaboratorLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="access-code">Código de Acesso</Label>
                  <Input
                    id="access-code"
                    type="text"
                    placeholder="Digite seu código de acesso"
                    required
                    value={collaboratorAccessCode}
                    onChange={(e) => setCollaboratorAccessCode(e.target.value)}
                  />
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? "Entrando..." : "Entrar como Colaborador"}
                </Button>
              </form>
            </TabsContent>
            <TabsContent value="admin" className="mt-4">
              <form onSubmit={handleAdminLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="username">Usuário</Label>
                  <Input
                    id="username"
                    type="text"
                    placeholder="Digite seu usuário"
                    required
                    value={adminUsername}
                    onChange={(e) => setAdminUsername(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Senha</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="Digite sua senha"
                    required
                    value={adminPassword}
                    onChange={(e) => setAdminPassword(e.target.value)}
                  />
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? "Entrando..." : "Entrar como Administrador"}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
