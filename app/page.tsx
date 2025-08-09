import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ShieldCheck, UserCircle2 } from "lucide-react"

export default function Page() {
  return (
    <main className="min-h-[100dvh] bg-muted/30">
      <div className="max-w-5xl mx-auto px-4 py-12 md:py-20">
        <header className="mb-10 text-center">
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight">Gerenciador de Banco de Horas</h1>
          <p className="text-muted-foreground mt-2">Acesse como Colaborador ou Administrador</p>
        </header>

        <div className="grid md:grid-cols-2 gap-6">
          <Card className="border-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UserCircle2 className="size-5" />
                Painel do Colaborador
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Consulte seu saldo, detalhes das horas e histórico de atualizações.
              </p>
              <Link href="/colaborador">
                <Button className="w-full">Acessar</Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="border-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShieldCheck className="size-5" />
                Painel do Administrador
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Cadastre colaboradores e administradores, lance horas e gerencie permissões.
              </p>
              <Link href="/admin">
                <Button variant="outline" className="w-full bg-transparent">
                  Entrar
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        <footer className="mt-12 text-center text-xs text-muted-foreground">
          Dica: Este protótipo usa verificações otimistas no cliente. Em produção, combine checagens otimistas
          (UI/redirect) e seguras (próximas à fonte de dados).[^1]
        </footer>
      </div>
    </main>
  )
}
