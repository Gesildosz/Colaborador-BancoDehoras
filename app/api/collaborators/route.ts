import { NextResponse } from "next/server"
import { createSupabaseServer } from "@/lib/supabase/server"
import type { Colaborador } from "@/lib/types"

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const q = searchParams.get("q")?.trim().toLowerCase()

  const supabase = createSupabaseServer()
  let query = supabase
    .from("collaborators")
    .select("id_access, cracha, nome, cargo, turno, supervisor, saldo")
    .order("nome", { ascending: true })

  if (q) {
    // buscar por cracha exato, id_access exato ou nome ILIKE
    query = query.or(`cracha.eq.${q},id_access.eq.${q},nome.ilike.%${q}%`)
  }

  const { data, error } = await query
  if (error) return new NextResponse(error.message, { status: 500 })

  const items: Colaborador[] =
    data?.map((r: any) => ({
      id: r.id_access,
      cracha: r.cracha,
      nome: r.nome,
      cargo: r.cargo || "",
      turno: r.turno || "",
      supervisor: r.supervisor || "",
      saldo: Number(r.saldo || 0),
      historico: [],
    })) ?? []

  return NextResponse.json({ items })
}

export async function POST(req: Request) {
  const body = await req.json().catch(() => null)
  const nome = body?.nome?.toString().trim()
  const cracha = body?.cracha?.toString().trim()
  const cargo = body?.cargo?.toString().trim() ?? ""
  const turno = body?.turno?.toString().trim() ?? ""
  const supervisor = body?.supervisor?.toString().trim() ?? ""
  const id = body?.id?.toString().trim()

  if (!nome || !cracha || !id) {
    return new NextResponse("Nome, Crachá e ID de Acesso são obrigatórios.", { status: 400 })
  }
  if (!/^\d{6,10}$/.test(id)) {
    return new NextResponse("ID de Acesso deve ter entre 6 e 10 números.", { status: 400 })
  }

  const supabase = createSupabaseServer()

  // verificar conflitos
  const { data: conflict, error: confErr } = await supabase
    .from("collaborators")
    .select("cracha, id_access")
    .or(`cracha.eq.${cracha},id_access.eq.${id}`)
    .limit(1)
  if (confErr) return new NextResponse(confErr.message, { status: 500 })
  if (conflict && conflict.length > 0) {
    return new NextResponse("Já existe colaborador com este Crachá ou ID de Acesso.", { status: 409 })
  }

  const { error } = await supabase.from("collaborators").insert({
    cracha,
    id_access: id,
    nome,
    cargo,
    turno,
    supervisor,
    saldo: 0,
  })
  if (error) return new NextResponse(error.message, { status: 500 })
  return NextResponse.json({ ok: true })
}
