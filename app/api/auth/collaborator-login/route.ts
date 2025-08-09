import { NextResponse } from "next/server"
import { createSupabaseServer } from "@/lib/supabase/server"

export async function POST(req: Request) {
  const body = await req.json().catch(() => null)
  const accessId = body?.accessId?.toString().trim()
  if (!accessId || !/^\d{6,10}$/.test(accessId)) {
    return new NextResponse("Código de Acesso inválido (6-10 números).", { status: 400 })
  }
  const supabase = createSupabaseServer()
  const { data, error } = await supabase
    .from("collaborators")
    .select("id_access")
    .eq("id_access", accessId)
    .limit(1)
    .maybeSingle()
  if (error) return new NextResponse(error.message, { status: 500 })
  if (!data) return new NextResponse("Código de Acesso não encontrado.", { status: 404 })
  return NextResponse.json({ ok: true })
}
