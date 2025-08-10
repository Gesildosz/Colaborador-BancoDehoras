import { createServerClient } from "@/lib/server-supabase"
import { getSession, deleteSession } from "@/lib/session"
import { redirect } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import Link from "next/link"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"

export default async function CollaboratorDashboardPage() {
  const session = await getSession()
  if (!session || session.role !== "collaborator") {
    redirect("/login")
  }

  const supabase = createServerClient()
  const { data: collaborator, error } = await supabase
    .from("collaborators")
    .select("*")
    .eq("id", session.userId)
    .single()

  if (error || !collaborator) {
    console.error("Erro ao buscar dados do colaborador:", error?.message)
    await deleteSession() // Log out if data is corrupted/missing
    redirect("/login")
  }

  const handleLogout = async () => {
    "use server"
    await deleteSession()
    redirect("/login")
  }

  const now = new Date()

  return (
    <div className="flex min-h-screen flex-col items-center bg-gray-100 p-4 dark:bg-gray-950">
      <Card className="w-full max-w-3xl">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-2xl">Painel do Colaborador</CardTitle>
          <form action={handleLogout}>
            <Button variant="outline" size="sm">
              Sair
            </Button>
          </form>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <h2 className="text-xl font-semibold">Meu Banco de Horas</h2>
            <p className="text-sm text-muted-foreground">
              Data: {format(now, "dd/MM/yyyy", { locale: ptBR })} | Hora: {format(now, "HH:mm:ss", { locale: ptBR })}
            </p>
          </div>

          <Separator />

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <h3 className="text-lg font-medium">Informações do Colaborador</h3>
              <p>
                <span className="font-semibold">Nome Completo:</span> {collaborator.full_name}
              </p>
              <p>
                <span className="font-semibold">Crachá:</span> {collaborator.badge_number}
              </p>
              <p>
                <span className="font-semibold">Cargo:</span> {collaborator.position}
              </p>
            </div>

            <div className="space-y-2">
              <h3 className="text-lg font-medium">Detalhes das Horas</h3>
              {collaborator.balance_type === "positive" && (
                <p className="text-green-600 dark:text-green-400">
                  <span className="font-semibold">Saldo Positivo:</span> {collaborator.balance.toFixed(2)} horas
                </p>
              )}
              {collaborator.balance_type === "negative" && (
                <p className="text-red-600 dark:text-red-400">
                  <span className="font-semibold">Saldo Negativo:</span> {Math.abs(collaborator.balance).toFixed(2)}{" "}
                  horas
                </p>
              )}
              {collaborator.balance_type === "none" && (
                <p className="text-muted-foreground">
                  <span className="font-semibold">Saldo:</span> 0.00 horas
                </p>
              )}
            </div>
          </div>

          <Separator />

          <div className="flex justify-end">
            <Button asChild>
              <Link href="/collaborator/history">
                Histórico <span className="ml-2">➡️</span>
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
