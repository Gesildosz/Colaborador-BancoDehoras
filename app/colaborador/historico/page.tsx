"use client"

import { useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartLine } from "@/components/chart-line"
import { ArrowLeft, LogOut } from "lucide-react"
import { fetchCollaboratorByAccessId } from "@/lib/api"
import type { Colaborador } from "@/lib/types"

const K_COLAB_CURRENT = "timebank.currentCollaboratorAccessId"

export default function HistoricoColaboradorPage() {
  const router = useRouter()
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
      }
    })()
  }, [router])

  const onLogout = () => {
    localStorage.removeItem(K_COLAB_CURRENT)
    router.replace("/colaborador")
  }

  const points = useMemo(() => {
    if (!colab) return []
    return [...(colab.historico || [])]
      .sort((a, b) => new Date(a.dataISO).getTime() - new Date(b.dataISO).getTime())
      .map((h) => ({ date: new Date(h.dataISO), value: h.saldoApos ?? 0 }))
  }, [colab])

  if (!colab) return null

  return (
    <main className="min-h-[100dvh] bg-muted/30">
      <div className="max-w-5xl mx-auto px-4 py-8 md:py-12">
        <header className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Link href="/colaborador/painel">
              <Button variant="ghost" size="icon" aria-label="Voltar para o painel">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Histórico de Saldos</h1>
          </div>
          <Button variant="destructive" onClick={onLogout}>
            <LogOut className="mr-2 h-4 w-4" />
            Sair
          </Button>
        </header>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-lg">
              Evolução do saldo de horas — {colab.nome} ({colab.cracha})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="w-full">
              <ChartLine data={points} height={260} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Movimentações</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="divide-y">
              {points.length === 0 && <div className="text-sm text-muted-foreground">Sem movimentações.</div>}
              {colab.historico
                ?.sort((a, b) => new Date(b.dataISO).getTime() - new Date(a.dataISO).getTime())
                .map((h, idx) => (
                  <div key={idx} className="py-3 text-sm flex items-center justify-between gap-4">
                    <div className="flex-1">
                      <div className="font-medium">{new Date(h.dataISO).toLocaleString("pt-BR")}</div>
                      <div className="text-muted-foreground">{h.motivo || "Lançamento de horas"}</div>
                    </div>
                    <div className="text-right">
                      <div
                        className={
                          h.delta >= 0
                            ? "text-green-600 dark:text-green-500 font-medium"
                            : "text-red-600 dark:text-red-500 font-medium"
                        }
                      >
                        {h.delta >= 0 ? `+${h.delta} h` : `${h.delta} h`}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Saldo: {h.saldoApos >= 0 ? `+${h.saldoApos}` : h.saldoApos} h
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  )
}
