import { createServerClient } from "@/lib/server-supabase"
import { getSession, deleteSession } from "@/lib/session"
import { redirect } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import { UserPlus, Users, Clock, KeyRound } from "lucide-react"

export default async function AdminDashboardPage() {
  const session = await getSession()
  if (!session || session.role !== "admin") {
    redirect("/login")
  }

  const supabase = createServerClient()
  const { data: admin, error } = await supabase.from("administrators").select("*").eq("id", session.userId).single()

  if (error || !admin) {
    console.error("Erro ao buscar dados do administrador:", error?.message)
    await deleteSession()
    redirect("/login")
  }

  const handleLogout = async () => {
    "use server"
    await deleteSession()
    redirect("/login")
  }

  return (
    <div className="flex min-h-screen flex-col items-center bg-gray-100 p-4 dark:bg-gray-950">
      <Card className="w-full max-w-4xl">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-2xl">Painel do Administrador</CardTitle>
          <form action={handleLogout}>
            <Button variant="outline" size="sm">
              Sair
            </Button>
          </form>
        </CardHeader>
        <CardContent className="space-y-6">
          <p className="text-lg">Bem-vindo, {admin.full_name}!</p>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {admin.can_create_collaborator && (
              <Link href="/admin/collaborators" className="block">
                <Card className="flex flex-col items-center justify-center p-6 text-center hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                  <UserPlus className="h-10 w-10 text-primary mb-3" />
                  <h3 className="text-lg font-semibold">Cadastrar Colaboradores</h3>
                  <p className="text-sm text-muted-foreground">Adicionar novos colaboradores ao sistema.</p>
                </Card>
              </Link>
            )}
            {admin.can_create_admin && (
              <Link href="/admin/administrators" className="block">
                <Card className="flex flex-col items-center justify-center p-6 text-center hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                  <Users className="h-10 w-10 text-primary mb-3" />
                  <h3 className="text-lg font-semibold">Cadastrar Administradores</h3>
                  <p className="text-sm text-muted-foreground">Gerenciar contas de administradores.</p>
                </Card>
              </Link>
            )}
            {admin.can_enter_hours && (
              <Link href="/admin/time-entry" className="block">
                <Card className="flex flex-col items-center justify-center p-6 text-center hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                  <Clock className="h-10 w-10 text-primary mb-3" />
                  <h3 className="text-lg font-semibold">Lançamento de Horas</h3>
                  <p className="text-sm text-muted-foreground">Atualizar o banco de horas dos colaboradores.</p>
                </Card>
              </Link>
            )}
            {admin.can_change_access_code && (
              <Link href="/admin/change-access-code" className="block">
                <Card className="flex flex-col items-center justify-center p-6 text-center hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                  <KeyRound className="h-10 w-10 text-primary mb-3" />
                  <h3 className="text-lg font-semibold">Alterar Código de Acesso</h3>
                  <p className="text-sm text-muted-foreground">Modificar códigos de acesso de colaboradores.</p>
                </Card>
              </Link>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
