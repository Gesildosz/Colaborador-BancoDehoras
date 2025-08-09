import { NextResponse } from "next/server"
import { createSupabaseServer } from "@/lib/supabase/server"

type Params = { params: { cracha: string } }

export async function POST(req: Request, { params }: Params) {
  const { cracha } = params
  const body = await req.json().catch(() => null)
  const delta = Number(body?.delta)
  const motivo = body?.motivo?.toString() || null
  const adminUsuario = body?.adminUsuario?.toString() || null

  if (!cracha) return new NextResponse("Crachá obrigatório.", { status: 400 })
  if (!delta || Number.isNaN(delta) || delta === 0) {
    return new NextResponse("Delta inválido.", { status: 400 })
  }

  const supabase = createSupabaseServer()

  // 1. buscar saldo atual
  const { data: colab, error: e1 } = await supabase
    .from("collaborators")
    .select("saldo")
    .eq("cracha", cracha)
    .maybeSingle()
  if (e1) return new NextResponse(e1.message, { status: 500 })
  if (!colab) return new NextResponse("Colaborador não encontrado.", { status: 404 })

  const novoSaldo = Math.round((Number(colab.saldo || 0) + delta) * 10) / 10

  // 2. atualizar saldo
  const { error: e2 } = await supabase.from("collaborators").update({ saldo: novoSaldo }).eq("cracha", cracha)
  if (e2) return new NextResponse(e2.message, { status: 500 })

  // 3. inserir movimento
  const { error: e3 } = await supabase.from("movements").insert({
    cracha,
    delta,
    saldo_after: novoSaldo,
    motivo: motivo ?? `Lançamento manual (${adminUsuario ?? "admin"})`,
  })
  if (e3) return new NextResponse(e3.message, { status: 500 })

  return NextResponse.json({ ok: true })
}
