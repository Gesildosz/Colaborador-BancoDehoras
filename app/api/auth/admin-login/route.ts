import { NextResponse } from "next/server"
import { createServerClient } from "@/lib/server-supabase"
import { createSession } from "@/lib/session"
import bcrypt from "bcrypt"

export async function POST(request: Request) {
  const { username, password } = await request.json()
  const supabase = createServerClient()

  // --- LOGS DE DEPURACAO ---
  console.log("--- INICIANDO LOGIN ADMIN ---")
  console.log("Tentativa de login para usuário:", username)
  console.log("Senha recebida (CUIDADO: NÃO FAÇA ISSO EM PRODUÇÃO!):", password)
  console.log("URL Supabase (do env):", process.env.NEXT_PUBLIC_SUPABASE_URL ? "Carregada" : "NÃO CARREGADA")
  console.log("Service Role Key (do env):", process.env.SUPABASE_SERVICE_ROLE_KEY ? "Carregada" : "NÃO CARREGADA")
  // --- FIM DOS LOGS DE DEPURACAO ---

  try {
    // Check against database for admins
    const { data, error } = await supabase
      .from("administrators")
      .select("id, password_hash")
      .eq("username", username)
      .single()

    // --- LOGS DE DEPURACAO ---
    console.log("Dados do admin do DB (data):", data)
    console.log("Erro do DB (error):", error)
    console.log("Hash do DB:", data?.password_hash)
    // --- FIM DOS LOGS DE DEPURACAO ---

    if (error || !data) {
      console.log("Usuário não encontrado ou erro no DB.")
      return NextResponse.json({ error: "Usuário ou senha inválidos." }, { status: 401 })
    }

    const passwordMatch = await bcrypt.compare(password, data.password_hash)

    // --- LOGS DE DEPURACAO ---
    console.log("Resultado da comparação de senha (bcrypt.compare):", passwordMatch)
    console.log("--- FIM LOGIN ADMIN ---")
    // --- FIM DOS LOGS DE DEPURACAO ---

    if (!passwordMatch) {
      return NextResponse.json({ error: "Usuário ou senha inválidos." }, { status: 401 })
    }

    await createSession(data.id, "admin")
    return NextResponse.json({ message: "Login bem-sucedido." })
  } catch (error: any) {
    console.error("Erro no login do administrador (catch):", error.message)
    return NextResponse.json({ error: "Erro interno do servidor." }, { status: 500 })
  }
}
