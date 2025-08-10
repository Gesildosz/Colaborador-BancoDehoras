import { NextResponse } from "next/server"
import { createServerClient } from "@/lib/server-supabase"
import { createSession } from "@/lib/session"

export async function POST(request: Request) {
  const { accessCode } = await request.json()
  const supabase = createServerClient()

  try {
    const { data, error } = await supabase.from("collaborators").select("id").eq("access_code", accessCode).single()

    if (error || !data) {
      return NextResponse.json({ error: "Código de acesso inválido." }, { status: 401 })
    }

    await createSession(data.id, "collaborator")
    return NextResponse.json({ message: "Login bem-sucedido." })
  } catch (error: any) {
    console.error("Erro no login do colaborador:", error.message)
    return NextResponse.json({ error: "Erro interno do servidor." }, { status: 500 })
  }
}
