"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { CalendarDays, History, LogOut } from "lucide-react"
import { fetchCollaboratorByAccessId } from "@/lib/api"
import type { Colaborador } from "@/lib/types"

const K_COLAB_CURRENT = "timebank.currentCollaboratorAccessId"

export default function PainelColaboradorPage() {
  const router = useRouter()
  const [now, setNow] = useState<Date>(new Date())
  const [loading, setLoading] = useState(true)
  const [colab, setColab] = useState<Colaborador | null>(null)

  useEffect(() => {
    const id = localStorage.getItem(K_COLAB_CURRENT)
    if (!id) {
      router.replace("/colaborador")
      return
    }
    ;(async () => {
      try {
        const { collaborator } = await fetchCollaboratorByAccessId(id)
        setColab(collaborator)
      } catch {
        setColab(null)
      } finally {
        setLoading(false)
      }
    })()
    const t = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(t)
  }, [router])

  const onLogout = () => {
    localStorage.removeItem(K_COLAB_CURRENT)
    router.replace("/colaborador")
  }

  if (loading) {
    return <div className="min-h-[60vh] grid place-items-center">Carregando...</div>
  }
  if (!colab) {
    return (
      <div className="min-h-[60vh] grid place-items-center">
        <Card className="p-6">
          <div>Colaborador não encontrado.</div>
          <div className="mt-4">
            <Link href="/colaborador">
              <Button>Voltar</Button>
            </Link>
          </div>
        </Card>
      </div>
    )
  }

  const saldo = colab.saldo ?? 0
  const positivo = saldo > 0
  const negativo = saldo < 0

  return (
    <main className="min-h-[100dvh] bg-muted/30">
      <div className="max-w-5xl mx-auto px-4 py-8 md:py-12">
        <header className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Meu Banco de Horas</h1>
            <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
              <CalendarDays className="h-4 w-4" />
              <span aria-live="polite">{now.toLocaleString("pt-BR")}</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/colaborador/historico">
              <Button variant="outline">
                <History className="mr-2 h-4 w-4" />
                Histórico
              </Button>
            </Link>
            <Button variant="destructive" onClick={onLogout}>
              <LogOut className="mr-2 h-4 w-4" />
              Sair
            </Button>
          </div>
        </header>

        <Card>
          <CardHeader>
            <CardTitle>Dados do Colaborador</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <section className="grid md:grid-cols-3 gap-4 text-sm">
              <div className="rounded-md border p-3">
                <div className="text-muted-foreground">Nome completo</div>
                <div className="font-medium">{colab.nome}</div>
              </div>
              <div className="rounded-md border p-3">
                <div className="text-muted-foreground">Crachá</div>
                <div className="font-medium">{colab.cracha}</div>
              </div>
              <div className="rounded-md border p-3">
                <div className="text-muted-foreground">Cargo</div>
                <div className="font-medium">{colab.cargo}</div>
              </div>
            </section>

            <section>
              <div className="text-sm text-muted-foreground mb-2">Detalhes</div>
              <div className="grid md:grid-cols-3 gap-4 text-sm">
                <div className="rounded-md border p-3">
                  <div className="text-muted-foreground">Turno</div>
                  <div className="font-medium">{colab.turno || "—"}</div>
                </div>
                <div className="rounded-md border p-3">
                  <div className="text-muted-foreground">Supervisor</div>
                  <div className="font-medium">{colab.supervisor || "—"}</div>
                </div>
                <div className="rounded-md border p-3">
                  <div className="text-muted-foreground">Código de Acesso</div>
                  <div className="font-medium">{colab.id}</div>
                </div>
              </div>
            </section>

            <Separator />

            <section className="grid md:grid-cols-3 gap-4 items-stretch">
              <div className="rounded-md border p-4 flex flex-col justify-center">
                <div className="text-muted-foreground text-sm">Saldo de horas</div>
                <div className="text-2xl font-bold">{saldo === 0 ? "0 h" : `${saldo > 0 ? "+" : ""}${saldo} h`}</div>
              </div>
              <div className="rounded-md border p-4 flex flex-col justify-center">
                <div className="text-muted-foreground text-sm">Saldo Positivo</div>
                <div className="text-xl font-semibold">{positivo ? `+${saldo} h` : "0 h"}</div>
                {positivo && <Badge className="w-fit mt-2">Ativo</Badge>}
              </div>
              <div className="rounded-md border p-4 flex flex-col justify-center">
                <div className="text-muted-foreground text-sm">Saldo Negativo</div>
                <div className="text-xl font-semibold">{negativo ? `${saldo} h` : "0 h"}</div>
                {negativo && (
                  <Badge variant="destructive" className="w-fit mt-2">
                    Ativo
                  </Badge>
                )}
              </div>
            </section>

            <div className="pt-2">
              <Link href="/colaborador/historico">
                <Button className="w-full md:w-auto">
                  <History className="mr-2 h-4 w-4" />
                  Ir para o Histórico
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  )
}
