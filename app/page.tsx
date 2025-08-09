"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { IntroductionModal } from "@/components/shared/introduction-modal"

export default function LoginPage() {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const router = useRouter()

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    if (username === "gesildocraft" && password === "3360") {
      localStorage.setItem("isLoggedIn", "true")
      localStorage.setItem("userRole", "admin")
      router.push("/dashboard")
    } else {
      setError("Usuário ou senha inválidos.")
    }
  }

  const handleGuestLogin = () => {
    localStorage.setItem("isLoggedIn", "true")
    localStorage.setItem("userRole", "guest")
    router.push("/dashboard")
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100 dark:bg-gray-950 p-4">
      <IntroductionModal />
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl">Entrar no Sistema</CardTitle>
          <CardDescription>Selecione uma opção para continuar</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className="flex flex-col gap-2">
            <Button
              onClick={() => {
                /* Logic to show login form */
              }}
              variant="outline"
              className="w-full"
            >
              Entrar com conta
            </Button>
            <div className="relative my-4">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">ou</span>
              </div>
            </div>
            <Button onClick={handleGuestLogin} variant="secondary" className="w-full">
              Entrar como visitante
            </Button>
          </div>

          <form onSubmit={handleLogin} className="grid gap-4 mt-4">
            <div className="grid gap-2">
              <Label htmlFor="username">Usuário</Label>
              <Input
                id="username"
                type="text"
                placeholder="gesildocraft"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="password">Senha</Label>
              <Input
                id="password"
                type="password"
                placeholder="3360"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            {error && <p className="text-red-500 text-sm">{error}</p>}
            <Button type="submit" className="w-full">
              Login Administrador
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
