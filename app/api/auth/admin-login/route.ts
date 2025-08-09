import { NextResponse } from "next/server"
import { createSupabaseServer } from "@/lib/supabase/server"
import type { AdminSession } from "@/lib/types"

export async function POST(req: Request) {
  const body = await req.json().catch(() => null)
  const usuario = body?.usuario?.toString().trim()
  const senha = body?.senha?.toString()

  if (!usuario || !senha) {
    return new NextResponse("Usuário e senha são obrigatórios.", { status: 400 })
  }

  const supabase = createSupabaseServer()
  const { data, error } = await supabase
    .from("admins")
    .select(
      "usuario, senha, nome, cracha, perm_criar_colaborador, perm_criar_admin, perm_lancar_horas, perm_alterar_codigo",
    )
    .eq("usuario", usuario)
    .limit(1)
    .maybeSingle()

  if (error) return new NextResponse(error.message, { status: 500 })
  if (!data || data.senha !== senha) {
    return new NextResponse("Credenciais inválidas.", { status: 401 })
  }

  const session: AdminSession = {
    usuario: data.usuario,
    perfilId: "master", // padrão ao logar; pode ser alternado na UI
    permissoes: {
      criarColaborador: !!data.perm_criar_colaborador,
      criarAdmin: !!data.perm_criar_admin,
      lancarHoras: !!data.perm_lancar_horas,
      alterarCodigoAcesso: !!data.perm_alterar_codigo,
    },
  }
  return NextResponse.json(session)
}
