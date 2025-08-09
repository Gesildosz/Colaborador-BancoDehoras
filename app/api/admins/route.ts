import { NextResponse } from "next/server"
import { createSupabaseServer } from "@/lib/supabase/server"

export async function GET() {
  const supabase = createSupabaseServer()
  const { data, error } = await supabase
    .from("admins")
    .select("usuario, nome, cracha, perm_criar_colaborador, perm_criar_admin, perm_lancar_horas, perm_alterar_codigo")
    .order("usuario", { ascending: true })
  if (error) return new NextResponse(error.message, { status: 500 })
  const items =
    data?.map((a: any) => ({
      usuario: a.usuario,
      nome: a.nome,
      cracha: a.cracha,
      permissoes: {
        criarColaborador: !!a.perm_criar_colaborador,
        criarAdmin: !!a.perm_criar_admin,
        lancarHoras: !!a.perm_lancar_horas,
        alterarCodigoAcesso: !!a.perm_alterar_codigo,
      },
    })) ?? []
  return NextResponse.json({ items })
}

export async function POST(req: Request) {
  const body = await req.json().catch(() => null)
  const nome = body?.nome?.toString().trim()
  const cracha = body?.cracha?.toString().trim()
  const usuario = body?.usuario?.toString().trim()
  const senha = body?.senha?.toString()
  const p = body?.permissoes || {}
  if (!nome || !cracha || !usuario || !senha) {
    return new NextResponse("Todos os campos são obrigatórios.", { status: 400 })
  }

  const supabase = createSupabaseServer()
  // checar conflito
  const { data: exists, error: e1 } = await supabase
    .from("admins")
    .select("usuario")
    .eq("usuario", usuario)
    .maybeSingle()
  if (e1) return new NextResponse(e1.message, { status: 500 })
  if (exists) return new NextResponse("Já existe administrador com este usuário.", { status: 409 })

  const { error } = await supabase.from("admins").insert({
    usuario,
    senha, // Em produção, armazene hash!
    nome,
    cracha,
    perm_criar_colaborador: !!p.criarColaborador,
    perm_criar_admin: !!p.criarAdmin,
    perm_lancar_horas: !!p.lancarHoras,
    perm_alterar_codigo: !!p.alterarCodigoAcesso,
  })
  if (error) return new NextResponse(error.message, { status: 500 })
  return NextResponse.json({ ok: true })
}
