import { NextResponse } from "next/server"
import { createSupabaseServer } from "@/lib/supabase/server"

type Params = { params: { cracha: string } }

export async function PATCH(req: Request, { params }: Params) {
  const { cracha } = params
  const body = await req.json().catch(() => null)
  const novoId = body?.novoId?.toString().trim()
  if (!novoId || !/^\d{6,10}$/.test(novoId)) {
    return new NextResponse("ID inválido (6-10 números).", { status: 400 })
  }
  const supabase = createSupabaseServer()
  // checar se novoId já existe
  const { data: exists, error: e1 } = await supabase
    .from("collaborators")
    .select("id_access")
    .eq("id_access", novoId)
    .maybeSingle()
  if (e1) return new NextResponse(e1.message, { status: 500 })
  if (exists) return new NextResponse("ID de acesso já está em uso.", { status: 409 })

  const { data, error } = await supabase
    .from("collaborators")
    .update({ id_access: novoId })
    .eq("cracha", cracha)
    .select()
  if (error) return new NextResponse(error.message, { status: 500 })
  if (!data || data.length === 0) return new NextResponse("Crachá não encontrado.", { status: 404 })

  return NextResponse.json({ ok: true })
}
