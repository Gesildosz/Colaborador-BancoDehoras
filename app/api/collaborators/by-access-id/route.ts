import { NextResponse } from "next/server"
import { createSupabaseServer } from "@/lib/supabase/server"
import type { Colaborador, HistoricoItem } from "@/lib/types"

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const accessId = searchParams.get("accessId")?.trim()
  if (!accessId) return new NextResponse("accessId é obrigatório", { status: 400 })

  const supabase = createSupabaseServer()
  const { data: colab, error } = await supabase
    .from("collaborators")
    .select("id_access, cracha, nome, cargo, turno, supervisor, saldo")
    .eq("id_access", accessId)
    .maybeSingle()
  if (error) return new NextResponse(error.message, { status: 500 })
  if (!colab) return new NextResponse("Colaborador não encontrado", { status: 404 })

  const { data: moves, error: mErr } = await supabase
    .from("movements")
    .select("id, created_at, delta, saldo_after, motivo")
    .eq("cracha", colab.cracha)
    .order("created_at", { ascending: true })
  if (mErr) return new NextResponse(mErr.message, { status: 500 })

  const historico: HistoricoItem[] =
    moves?.map((m: any) => ({
      id: m.id,
      dataISO: new Date(m.created_at).toISOString(),
      delta: Number(m.delta),
      saldoApos: Number(m.saldo_after),
      motivo: m.motivo ?? undefined,
    })) ?? []

  const collaborator: Colaborador = {
    id: colab.id_access,
    cracha: colab.cracha,
    nome: colab.nome,
    cargo: colab.cargo || "",
    turno: colab.turno || "",
    supervisor: colab.supervisor || "",
    saldo: Number(colab.saldo || 0),
    historico,
  }

  return NextResponse.json({ collaborator })
}
