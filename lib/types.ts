export type HistoricoItem = {
  id?: string
  dataISO: string
  delta: number
  saldoApos: number
  motivo?: string
}

export type Colaborador = {
  id: string // ID de acesso
  cracha: string
  nome: string
  cargo: string
  turno?: string
  supervisor?: string
  saldo: number
  historico: HistoricoItem[]
}

export type Permissoes = {
  criarColaborador: boolean
  criarAdmin: boolean
  lancarHoras: boolean
  alterarCodigoAcesso: boolean
}

export type AdminUser = {
  usuario: string
  senha?: string
  nome: string
  cracha: string
  permissoes: Permissoes
}

export type AdminSession = {
  usuario: string
  perfilId: string
  permissoes: Permissoes
}
