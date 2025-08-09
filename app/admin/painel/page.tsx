"use client"

import type React from "react"

import { useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { useToast } from "@/hooks/use-toast"
import {
  createAdmin,
  createCollaborator,
  launchHours,
  listAdmins,
  listCollaborators,
  searchCollaborator,
  updateCollaboratorAccessId,
} from "@/lib/api"
import type { AdminSession, AdminUser, Colaborador } from "@/lib/types"
import { LogOut, Plus, Search, Shield, UserPlus, UsersRound } from "lucide-react"

const K_ADMIN_SESSION = "timebank.admin.session"
const K_ACTIVE_PROFILE = "timebank.admin.activeProfile"

export default function AdminPanelPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [activeTab, setActiveTab] = useState("colaboradores")
  const [refresh, setRefresh] = useState(0)

  // Guard
  const [session, setSession] = useState<AdminSession | null>(null)
  useEffect(() => {
    const raw = localStorage.getItem(K_ADMIN_SESSION)
    if (!raw) {
      router.replace("/admin")
      return
    }
    setSession(JSON.parse(raw))
  }, [router])

  const [colaboradores, setColaboradores] = useState<Colaborador[]>([])
  const [admins, setAdmins] = useState<AdminUser[]>([])

  useEffect(() => {
    ;(async () => {
      try {
        const [cols, ads] = await Promise.all([listCollaborators(), listAdmins()])
        setColaboradores(cols)
        setAdmins(ads)
      } catch (e) {
        // eslint-disable-next-line no-console
        console.error(e)
      }
    })()
  }, [refresh])

  const permissoes =
    session?.permissoes ||
    ({
      criarColaborador: false,
      criarAdmin: false,
      lancarHoras: false,
      alterarCodigoAcesso: false,
    } as AdminSession["permissoes"])

  // Forms state
  const [novoColab, setNovoColab] = useState({
    nome: "",
    cracha: "",
    cargo: "",
    turno: "",
    supervisor: "",
    acessoId: "",
  })

  const [novoAdmin, setNovoAdmin] = useState({
    nome: "",
    cracha: "",
    usuario: "",
    senha: "",
    criarColaborador: false,
    criarAdmin: false,
    lancarHoras: true,
    alterarCodigoAcesso: false,
  })

  // Lançamento
  const [busca, setBusca] = useState("")
  const [horas, setHoras] = useState<string>("")
  const [encontrado, setEncontrado] = useState<Colaborador | null>(null)

  useEffect(() => {
    let canceled = false
    ;(async () => {
      if (!busca.trim()) {
        setEncontrado(null)
        return
      }
      try {
        const res = await searchCollaborator(busca)
        if (!canceled) setEncontrado(res)
      } catch {
        if (!canceled) setEncontrado(null)
      }
    })()
    return () => {
      canceled = true
    }
  }, [busca, refresh])

  const activeProfileId = useMemo(() => localStorage.getItem(K_ACTIVE_PROFILE) || "master", [session, refresh])

  const onLogout = () => {
    localStorage.removeItem(K_ADMIN_SESSION)
    localStorage.removeItem(K_ACTIVE_PROFILE)
    router.replace("/admin")
  }

  const forceRefresh = () => setRefresh((x) => x + 1)

  const handleCreateColab = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!permissoes.criarColaborador) {
      toast({
        title: "Ação não permitida",
        description: "Seu perfil não permite criar colaboradores.",
        variant: "destructive",
      })
      return
    }
    if (!novoColab.nome || !novoColab.cracha || !novoColab.acessoId) {
      toast({
        title: "Campos obrigatórios",
        description: "Preencha Nome, Crachá e ID de Acesso.",
        variant: "destructive",
      })
      return
    }
    if (!/^\d{6,10}$/.test(novoColab.acessoId)) {
      toast({
        title: "ID inválido",
        description: "O ID de acesso deve ter entre 6 e 10 números.",
        variant: "destructive",
      })
      return
    }
    try {
      await createCollaborator({
        nome: novoColab.nome,
        cracha: novoColab.cracha,
        cargo: novoColab.cargo,
        turno: novoColab.turno,
        supervisor: novoColab.supervisor,
        id: novoColab.acessoId,
      })
      toast({ title: "Colaborador criado", description: "Cadastro realizado com sucesso." })
      setNovoColab({ nome: "", cracha: "", cargo: "", turno: "", supervisor: "", acessoId: "" })
      forceRefresh()
    } catch (err: any) {
      toast({
        title: "Erro",
        description: err?.message || "Não foi possível criar colaborador.",
        variant: "destructive",
      })
    }
  }

  const handleCreateAdmin = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!permissoes.criarAdmin) {
      toast({
        title: "Ação não permitida",
        description: "Seu perfil não permite criar administradores.",
        variant: "destructive",
      })
      return
    }
    if (!novoAdmin.nome || !novoAdmin.cracha || !novoAdmin.usuario || !novoAdmin.senha) {
      toast({ title: "Campos obrigatórios", description: "Preencha todos os campos.", variant: "destructive" })
      return
    }
    try {
      await createAdmin({
        nome: novoAdmin.nome,
        cracha: novoAdmin.cracha,
        usuario: novoAdmin.usuario,
        senha: novoAdmin.senha,
        permissoes: {
          criarColaborador: novoAdmin.criarColaborador,
          criarAdmin: novoAdmin.criarAdmin,
          lancarHoras: novoAdmin.lancarHoras,
          alterarCodigoAcesso: novoAdmin.alterarCodigoAcesso,
        },
      })
      toast({ title: "Administrador criado", description: "Perfil de acesso configurado." })
      setNovoAdmin({
        nome: "",
        cracha: "",
        usuario: "",
        senha: "",
        criarColaborador: false,
        criarAdmin: false,
        lancarHoras: true,
        alterarCodigoAcesso: false,
      })
      forceRefresh()
    } catch (err: any) {
      toast({ title: "Erro", description: err?.message || "Não foi possível criar admin.", variant: "destructive" })
    }
  }

  const handleAlterarCodigo = async (cracha: string, novoCodigo: string) => {
    if (!permissoes.alterarCodigoAcesso) {
      toast({
        title: "Ação não permitida",
        description: "Seu perfil não permite alterar código de acesso.",
        variant: "destructive",
      })
      return
    }
    if (!/^\d{6,10}$/.test(novoCodigo)) {
      toast({ title: "ID inválido", description: "O ID deve ter entre 6 e 10 números.", variant: "destructive" })
      return
    }
    try {
      await updateCollaboratorAccessId(cracha, novoCodigo)
      toast({ title: "Código alterado", description: "O ID de acesso foi atualizado." })
      forceRefresh()
    } catch (err: any) {
      toast({
        title: "Erro",
        description: err?.message || "Não foi possível alterar o ID de acesso.",
        variant: "destructive",
      })
    }
  }

  const handleLancamento = async () => {
    if (!permissoes.lancarHoras) {
      toast({
        title: "Ação não permitida",
        description: "Seu perfil não permite lançar horas.",
        variant: "destructive",
      })
      return
    }
    const delta = Number.parseFloat(horas.replace(",", "."))
    if (!encontrado) {
      toast({
        title: "Colaborador não encontrado",
        description: "Busque por Crachá, Nome ou Código de Acesso.",
        variant: "destructive",
      })
      return
    }
    if (isNaN(delta) || delta === 0) {
      toast({ title: "Valor inválido", description: "Informe horas positivas ou negativas.", variant: "destructive" })
      return
    }
    try {
      await launchHours(
        encontrado.cracha,
        delta,
        `Lançamento manual (${session?.usuario || "admin"})`,
        session?.usuario,
      )
      toast({ title: "Lançamento confirmado", description: `Saldo atualizado em ${delta > 0 ? "+" : ""}${delta} h.` })
      setHoras("")
      forceRefresh()
    } catch (err: any) {
      toast({ title: "Erro no lançamento", description: err?.message || "Tente novamente.", variant: "destructive" })
    }
  }

  if (!session) return null

  return (
    <main className="min-h-[100dvh] bg-muted/30">
      <div className="max-w-6xl mx-auto px-4 py-8 md:py-12">
        <header className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Painel do Administrador</h1>
            <div className="text-sm text-muted-foreground mt-1 flex items-center gap-2">
              <Shield className="h-4 w-4" />
              <span>
                Usuário: {session?.usuario}{" "}
                {activeProfileId !== "master" && <Badge variant="outline">Perfil simulado: {activeProfileId}</Badge>}
              </span>
            </div>
          </div>
          <Button variant="destructive" onClick={onLogout}>
            <LogOut className="mr-2 h-4 w-4" />
            Sair
          </Button>
        </header>

        <Card className="mb-6">
          <CardContent className="py-4">
            <div className="flex flex-wrap items-center gap-4 text-xs md:text-sm">
              <div className="flex items-center gap-2">
                <Badge variant={permissoes.criarColaborador ? "default" : "secondary"}>Criar Colaborador</Badge>
                <Badge variant={permissoes.criarAdmin ? "default" : "secondary"}>Criar Admin</Badge>
                <Badge variant={permissoes.lancarHoras ? "default" : "secondary"}>Lançamento de Horas</Badge>
                <Badge variant={permissoes.alterarCodigoAcesso ? "default" : "secondary"}>
                  Alterar Código de Acesso
                </Badge>
              </div>
              <div className="ml-auto flex items-center gap-2">
                <span className="text-muted-foreground">Trocar perfil ativo (simulação)</span>
                <select
                  className="px-2 py-1 border rounded-md bg-background"
                  value={activeProfileId}
                  onChange={(e) => {
                    localStorage.setItem(K_ACTIVE_PROFILE, e.target.value)
                    const raw = localStorage.getItem(K_ADMIN_SESSION)
                    if (raw) {
                      const s: AdminSession = JSON.parse(raw)
                      if (e.target.value === "master") {
                        s.perfilId = "master"
                        s.permissoes = {
                          criarColaborador: true,
                          criarAdmin: true,
                          lancarHoras: true,
                          alterarCodigoAcesso: true,
                        }
                      } else {
                        const selected = admins.find((a) => a.usuario === e.target.value)
                        if (selected) {
                          s.perfilId = selected.usuario
                          s.permissoes = selected.permissoes
                        }
                      }
                      localStorage.setItem(K_ADMIN_SESSION, JSON.stringify(s))
                      setSession(s)
                    }
                  }}
                >
                  <option value="master">master (todas permissões)</option>
                  {admins.map((a) => (
                    <option key={a.usuario} value={a.usuario}>
                      {a.usuario}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="flex flex-wrap">
            <TabsTrigger value="colaboradores">Colaboradores</TabsTrigger>
            <TabsTrigger value="admins">Administradores</TabsTrigger>
            <TabsTrigger value="lancamento">Lançamento de Horas</TabsTrigger>
          </TabsList>

          <TabsContent value="colaboradores" className="mt-6 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <UserPlus className="h-5 w-5" />
                  Cadastro de Novos Colaboradores
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleCreateColab} className="grid md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="nc-nome">Nome Completo*</Label>
                    <Input
                      id="nc-nome"
                      value={novoColab.nome}
                      onChange={(e) => setNovoColab((s) => ({ ...s, nome: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="nc-cracha">N° Crachá*</Label>
                    <Input
                      id="nc-cracha"
                      value={novoColab.cracha}
                      onChange={(e) => setNovoColab((s) => ({ ...s, cracha: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="nc-cargo">Cargo</Label>
                    <Input
                      id="nc-cargo"
                      value={novoColab.cargo}
                      onChange={(e) => setNovoColab((s) => ({ ...s, cargo: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="nc-turno">Turno</Label>
                    <Input
                      id="nc-turno"
                      value={novoColab.turno}
                      onChange={(e) => setNovoColab((s) => ({ ...s, turno: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="nc-supervisor">Supervisor</Label>
                    <Input
                      id="nc-supervisor"
                      value={novoColab.supervisor}
                      onChange={(e) => setNovoColab((s) => ({ ...s, supervisor: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="nc-id">ID de acesso* (6-10 números)</Label>
                    <Input
                      id="nc-id"
                      inputMode="numeric"
                      pattern="\d*"
                      value={novoColab.acessoId}
                      onChange={(e) => setNovoColab((s) => ({ ...s, acessoId: e.target.value.replace(/\D/g, "") }))}
                    />
                  </div>
                  <div className="md:col-span-3">
                    <Button type="submit" disabled={!permissoes.criarColaborador}>
                      <Plus className="mr-2 h-4 w-4" />
                      Cadastrar
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Lista de Colaboradores</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Crachá</TableHead>
                        <TableHead>Nome</TableHead>
                        <TableHead>Cargo</TableHead>
                        <TableHead>Turno</TableHead>
                        <TableHead>Supervisor</TableHead>
                        <TableHead>ID Acesso</TableHead>
                        <TableHead>Saldo</TableHead>
                        <TableHead className="w-56">Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {colaboradores.map((c) => (
                        <TableRow key={c.cracha}>
                          <TableCell>{c.cracha}</TableCell>
                          <TableCell>{c.nome}</TableCell>
                          <TableCell>{c.cargo}</TableCell>
                          <TableCell>{c.turno}</TableCell>
                          <TableCell>{c.supervisor}</TableCell>
                          <TableCell>
                            <code className="text-xs">{c.id}</code>
                          </TableCell>
                          <TableCell>
                            <Badge variant={c.saldo >= 0 ? "default" : "destructive"}>
                              {c.saldo >= 0 ? `+${c.saldo}` : c.saldo} h
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Input
                                placeholder="Novo ID (6-10)"
                                inputMode="numeric"
                                pattern="\d*"
                                className="w-36"
                                defaultValue={c.id}
                                onBlur={async (e) => {
                                  const val = e.currentTarget.value.replace(/\D/g, "")
                                  if (val && val !== c.id) await handleAlterarCodigo(c.cracha, val)
                                }}
                                disabled={!permissoes.alterarCodigoAcesso}
                                aria-label="Alterar código de acesso"
                              />
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                      {colaboradores.length === 0 && (
                        <TableRow>
                          <TableCell colSpan={8} className="text-center text-muted-foreground">
                            Nenhum colaborador cadastrado.
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="admins" className="mt-6 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <UsersRound className="h-5 w-5" />
                  Cadastro de Novos Administradores
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleCreateAdmin} className="grid md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="na-nome">Nome Completo*</Label>
                    <Input
                      id="na-nome"
                      value={novoAdmin.nome}
                      onChange={(e) => setNovoAdmin((s) => ({ ...s, nome: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="na-cracha">N° Crachá*</Label>
                    <Input
                      id="na-cracha"
                      value={novoAdmin.cracha}
                      onChange={(e) => setNovoAdmin((s) => ({ ...s, cracha: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="na-user">Usuário*</Label>
                    <Input
                      id="na-user"
                      value={novoAdmin.usuario}
                      onChange={(e) => setNovoAdmin((s) => ({ ...s, usuario: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="na-pass">Senha*</Label>
                    <Input
                      id="na-pass"
                      type="password"
                      value={novoAdmin.senha}
                      onChange={(e) => setNovoAdmin((s) => ({ ...s, senha: e.target.value }))}
                    />
                  </div>

                  <div className="md:col-span-3">
                    <div className="text-sm text-muted-foreground mb-2">Perfil de Acesso</div>
                    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                      <PermToggle
                        label="Criar novos Colaboradores"
                        checked={novoAdmin.criarColaborador}
                        onCheckedChange={(v) => setNovoAdmin((s) => ({ ...s, criarColaborador: v }))}
                      />
                      <PermToggle
                        label="Criar novos Administradores"
                        checked={novoAdmin.criarAdmin}
                        onCheckedChange={(v) => setNovoAdmin((s) => ({ ...s, criarAdmin: v }))}
                      />
                      <PermToggle
                        label="Lançamento de Horas"
                        checked={novoAdmin.lancarHoras}
                        onCheckedChange={(v) => setNovoAdmin((s) => ({ ...s, lancarHoras: v }))}
                      />
                      <PermToggle
                        label="Alterar Código Acesso Colaborador"
                        checked={novoAdmin.alterarCodigoAcesso}
                        onCheckedChange={(v) => setNovoAdmin((s) => ({ ...s, alterarCodigoAcesso: v }))}
                      />
                    </div>
                  </div>

                  <div className="md:col-span-3">
                    <Button type="submit" disabled={!permissoes.criarAdmin}>
                      <Plus className="mr-2 h-4 w-4" />
                      Cadastrar
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Lista de Administradores</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Usuário</TableHead>
                        <TableHead>Nome</TableHead>
                        <TableHead>Crachá</TableHead>
                        <TableHead>Permissões</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {admins.map((a) => (
                        <TableRow key={a.usuario}>
                          <TableCell>{a.usuario}</TableCell>
                          <TableCell>{a.nome}</TableCell>
                          <TableCell>{a.cracha}</TableCell>
                          <TableCell className="space-x-2">
                            {a.permissoes.criarColaborador && <Badge>Colaborador</Badge>}
                            {a.permissoes.criarAdmin && <Badge>Admin</Badge>}
                            {a.permissoes.lancarHoras && <Badge>Lançamento</Badge>}
                            {a.permissoes.alterarCodigoAcesso && <Badge>Alterar ID</Badge>}
                          </TableCell>
                        </TableRow>
                      ))}
                      {admins.length === 0 && (
                        <TableRow>
                          <TableCell colSpan={4} className="text-center text-muted-foreground">
                            Nenhum administrador cadastrado.
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="lancamento" className="mt-6 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Lançamento de Horas</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-3 gap-4">
                  <div className="md:col-span-2">
                    <Label htmlFor="busca">Buscar por Crachá / Nome / Código de Acesso</Label>
                    <div className="flex items-center gap-2">
                      <Input
                        id="busca"
                        placeholder="Ex.: 220001228 ou Gesildo ou 123456"
                        value={busca}
                        onChange={(e) => setBusca(e.target.value)}
                      />
                      <Button type="button" variant="secondary" onClick={() => setBusca(busca.trim())}>
                        <Search className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="horas">Horas (+/-)</Label>
                    <Input
                      id="horas"
                      placeholder="+8 ou -2"
                      value={horas}
                      onChange={(e) => setHoras(e.target.value.replace(/[^\d+\-,.]/g, ""))}
                    />
                  </div>
                </div>

                <Separator />

                {encontrado ? (
                  <div className="grid md:grid-cols-[1fr_auto] gap-4 items-center">
                    <div className="grid sm:grid-cols-4 gap-3 text-sm">
                      <Info label="Crachá" value={encontrado.cracha} />
                      <Info label="Nome Completo" value={encontrado.nome} />
                      <Info label="Cargo" value={encontrado.cargo} />
                      <Info label="Saldo" value={`${encontrado.saldo >= 0 ? "+" : ""}${encontrado.saldo} h`} />
                    </div>
                    <Button type="button" onClick={handleLancamento} disabled={!permissoes.lancarHoras}>
                      Confirmar
                    </Button>
                  </div>
                ) : (
                  <div className="text-sm text-muted-foreground">Nenhum colaborador selecionado.</div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </main>
  )
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border p-3">
      <div className="text-muted-foreground">{label}</div>
      <div className="font-medium truncate" title={value}>
        {value || "—"}
      </div>
    </div>
  )
}

function PermToggle({
  label,
  checked,
  onCheckedChange,
}: {
  label: string
  checked: boolean
  onCheckedChange: (v: boolean) => void
}) {
  return (
    <label className="flex items-center justify-between gap-3 rounded-md border p-3 cursor-pointer">
      <span className="text-sm">{label}</span>
      <Switch checked={checked} onCheckedChange={onCheckedChange} aria-label={label} />
    </label>
  )
}
