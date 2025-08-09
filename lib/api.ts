"use client"

import type { AdminSession, Colaborador, AdminUser } from "./types"

const JSON_HEADERS: HeadersInit = { "Content-Type": "application/json" }

export async function loginCollaborator(accessId: string) {
  const r = await fetch("/api/auth/collaborator-login", {
    method: "POST",
    headers: JSON_HEADERS,
    body: JSON.stringify({ accessId }),
  })
  if (!r.ok) throw new Error(await r.text())
  return (await r.json()) as { ok: true }
}

export async function fetchCollaboratorByAccessId(accessId: string) {
  const r = await fetch(`/api/collaborators/by-access-id?accessId=${encodeURIComponent(accessId)}`)
  if (!r.ok) throw new Error(await r.text())
  return (await r.json()) as { collaborator: Colaborador }
}

export async function loginAdmin(usuario: string, senha: string): Promise<AdminSession> {
  const r = await fetch("/api/auth/admin-login", {
    method: "POST",
    headers: JSON_HEADERS,
    body: JSON.stringify({ usuario, senha }),
  })
  if (!r.ok) throw new Error(await r.text())
  return (await r.json()) as AdminSession
}

export async function listCollaborators(): Promise<Colaborador[]> {
  const r = await fetch("/api/collaborators", { cache: "no-store" })
  if (!r.ok) throw new Error(await r.text())
  const data = await r.json()
  return data.items as Colaborador[]
}

export async function createCollaborator(input: {
  nome: string
  cracha: string
  cargo?: string
  turno?: string
  supervisor?: string
  id: string
}) {
  const r = await fetch("/api/collaborators", {
    method: "POST",
    headers: JSON_HEADERS,
    body: JSON.stringify(input),
  })
  if (!r.ok) throw new Error(await r.text())
  return (await r.json()) as { ok: true }
}

export async function listAdmins(): Promise<AdminUser[]> {
  const r = await fetch("/api/admins", { cache: "no-store" })
  if (!r.ok) throw new Error(await r.text())
  const data = await r.json()
  return data.items as AdminUser[]
}

export async function createAdmin(input: {
  nome: string
  cracha: string
  usuario: string
  senha: string
  permissoes: {
    criarColaborador: boolean
    criarAdmin: boolean
    lancarHoras: boolean
    alterarCodigoAcesso: boolean
  }
}) {
  const r = await fetch("/api/admins", {
    method: "POST",
    headers: JSON_HEADERS,
    body: JSON.stringify(input),
  })
  if (!r.ok) throw new Error(await r.text())
  return (await r.json()) as { ok: true }
}

export async function updateCollaboratorAccessId(cracha: string, novoId: string) {
  const r = await fetch(`/api/collaborators/${encodeURIComponent(cracha)}/access-id`, {
    method: "PATCH",
    headers: JSON_HEADERS,
    body: JSON.stringify({ novoId }),
  })
  if (!r.ok) throw new Error(await r.text())
  return (await r.json()) as { ok: true }
}

export async function launchHours(cracha: string, delta: number, motivo?: string, adminUsuario?: string) {
  const r = await fetch(`/api/collaborators/${encodeURIComponent(cracha)}/hours`, {
    method: "POST",
    headers: JSON_HEADERS,
    body: JSON.stringify({ delta, motivo, adminUsuario }),
  })
  if (!r.ok) throw new Error(await r.text())
  return (await r.json()) as { ok: true }
}

export async function searchCollaborator(query: string) {
  const r = await fetch(`/api/collaborators?q=${encodeURIComponent(query)}`)
  if (!r.ok) throw new Error(await r.text())
  const data = await r.json()
  const items = (data.items as Colaborador[]) || []
  // retorna o primeiro mais relevante
  return items[0] ?? null
}
