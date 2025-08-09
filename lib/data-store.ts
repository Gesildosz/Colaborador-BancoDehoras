"use client"

import type { AdminSession, AdminUser, Colaborador, HistoricoItem, Permissoes } from "./types"

const K_COLABS = "timebank.colaboradores"
const K_ADMINS = "timebank.admins"
const K_COLAB_CURRENT = "timebank.currentCollaboratorAccessId"
const K_ADMIN_SESSION = "timebank.admin.session"
const K_ACTIVE_PROFILE = "timebank.admin.activeProfile"

const isBrowser = () => typeof window !== "undefined" && typeof localStorage !== "undefined"

function readJSON<T>(key: string, fallback: T): T {
  if (!isBrowser()) return fallback
  try {
    const s = localStorage.getItem(key)
    if (!s) return fallback
    return JSON.parse(s) as T
  } catch {
    return fallback
  }
}
function writeJSON<T>(key: string, val: T) {
  if (!isBrowser()) return
  localStorage.setItem(key, JSON.stringify(val))
}

export function initSeed() {
  if (!isBrowser()) return
  const seeded = readJSON<Colaborador[]>(K_COLABS, [])
  if (seeded.length === 0) {
    const historico: HistoricoItem[] = [
      {
        dataISO: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7).toISOString(),
        delta: +2,
        saldoApos: 2,
        motivo: "Banco de horas",
      },
      {
        dataISO: new Date(Date.now() - 1000 * 60 * 60 * 24 * 4).toISOString(),
        delta: +3,
        saldoApos: 5,
        motivo: "Banco de horas",
      },
      {
        dataISO: new Date(Date.now() - 1000 * 60 * 60 * 24 * 1).toISOString(),
        delta: +3,
        saldoApos: 8,
        motivo: "Banco de horas",
      },
    ]
    const colab: Colaborador = {
      id: "123456",
      cracha: "220001228",
      nome: "Gesildo Silva",
      cargo: "Controlador",
      turno: "Noturno",
      supervisor: "—",
      saldo: 8,
      historico,
    }
    writeJSON(K_COLABS, [colab])
  }
  const admins = readJSON<AdminUser[]>(K_ADMINS, [])
  if (admins.length === 0) {
    const demo: AdminUser = {
      usuario: "operador",
      senha: "123456",
      nome: "Operador de RH",
      cracha: "000001",
      permissoes: {
        criarColaborador: false,
        criarAdmin: false,
        lancarHoras: true,
        alterarCodigoAcesso: false,
      },
    }
    writeJSON(K_ADMINS, [demo])
  }
}

export function listCollaborators(): Colaborador[] {
  return readJSON<Colaborador[]>(K_COLABS, [])
}

export function listAdmins(): AdminUser[] {
  return readJSON<AdminUser[]>(K_ADMINS, [])
}

export function findCollaboratorByAccessId(accessId: string) {
  return listCollaborators().find((c) => c.id === accessId) || null
}

export function getCollaboratorByAccessId(accessId: string) {
  return findCollaboratorByAccessId(accessId)
}

export function getCurrentCollaboratorAccessId(): string | null {
  if (!isBrowser()) return null
  return localStorage.getItem(K_COLAB_CURRENT)
}

export function setCurrentCollaboratorAccessId(accessId: string) {
  if (!isBrowser()) return
  localStorage.setItem(K_COLAB_CURRENT, accessId)
}

export function clearCurrentCollaboratorAccessId() {
  if (!isBrowser()) return
  localStorage.removeItem(K_COLAB_CURRENT)
}

export function getCurrentAdminSession(): AdminSession | null {
  return readJSON<AdminSession | null>(K_ADMIN_SESSION, null)
}

export function setCurrentAdminSession(session: AdminSession) {
  writeJSON(K_ADMIN_SESSION, session)
  setActiveAdminProfileId(session.perfilId)
}

export function clearCurrentAdminSession() {
  if (!isBrowser()) return
  localStorage.removeItem(K_ADMIN_SESSION)
  localStorage.removeItem(K_ACTIVE_PROFILE)
}

export function setActiveAdminProfileId(id: string) {
  if (!isBrowser()) return
  localStorage.setItem(K_ACTIVE_PROFILE, id)
  // if id == a user, set permissoes from that user into session for gating
  const session = getCurrentAdminSession()
  if (!session) return
  if (id === "master") {
    const s: AdminSession = {
      ...session,
      perfilId: "master",
      permissoes: { criarColaborador: true, criarAdmin: true, lancarHoras: true, alterarCodigoAcesso: true },
    }
    writeJSON(K_ADMIN_SESSION, s)
  } else {
    const usr = listAdmins().find((a) => a.usuario === id)
    if (!usr) return
    const s: AdminSession = { ...session, perfilId: usr.usuario, permissoes: usr.permissoes }
    writeJSON(K_ADMIN_SESSION, s)
  }
}

export function getActiveAdminProfileId(): string {
  if (!isBrowser()) return "master"
  return localStorage.getItem(K_ACTIVE_PROFILE) || "master"
}

export function createCollaborator(input: {
  nome: string
  cracha: string
  cargo?: string
  turno?: string
  supervisor?: string
  id: string
}) {
  const arr = listCollaborators()
  if (arr.some((c) => c.cracha === input.cracha || c.id === input.id)) return false
  const novo: Colaborador = {
    id: input.id,
    cracha: input.cracha,
    nome: input.nome,
    cargo: input.cargo || "",
    turno: input.turno || "",
    supervisor: input.supervisor || "",
    saldo: 0,
    historico: [],
  }
  arr.push(novo)
  writeJSON(K_COLABS, arr)
  return true
}

export function createAdmin(input: {
  nome: string
  cracha: string
  usuario: string
  senha: string
  permissoes: Permissoes
}) {
  const arr = listAdmins()
  if (arr.some((a) => a.usuario === input.usuario)) return false
  const novo: AdminUser = {
    usuario: input.usuario,
    senha: input.senha,
    nome: input.nome,
    cracha: input.cracha,
    permissoes: input.permissoes,
  }
  arr.push(novo)
  writeJSON(K_ADMINS, arr)
  return true
}

export function updateCollaboratorAccessId(cracha: string, novoId: string) {
  const arr = listCollaborators()
  if (arr.some((c) => c.id === novoId)) return false
  const idx = arr.findIndex((c) => c.cracha === cracha)
  if (idx === -1) return false
  arr[idx].id = novoId
  writeJSON(K_COLABS, arr)
  return true
}

export function updateSaldoForCollaborator(cracha: string, delta: number, motivo?: string) {
  const arr = listCollaborators()
  const idx = arr.findIndex((c) => c.cracha === cracha)
  if (idx === -1) return false
  const current = arr[idx]
  const novoSaldo = Math.round((current.saldo + delta) * 10) / 10
  const hist: HistoricoItem = {
    dataISO: new Date().toISOString(),
    delta: Math.round(delta * 10) / 10,
    saldoApos: novoSaldo,
    motivo,
  }
  current.saldo = novoSaldo
  current.historico = [...(current.historico || []), hist]
  arr[idx] = current
  writeJSON(K_COLABS, arr)
  return true
}

export function findCollaboratorByBadgeOrNameOrAccessId(query: string) {
  const q = query.trim().toLowerCase()
  if (!q) return null
  const arr = listCollaborators()
  return arr.find((c) => c.cracha.toLowerCase() === q || c.id === q || c.nome.toLowerCase().includes(q)) || null
}
