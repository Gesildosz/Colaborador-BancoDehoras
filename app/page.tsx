import { redirect } from "next/navigation"

export default function HomePage() {
  // Redireciona para a página de login.
  // O middleware se encarregará de redirecionar para o dashboard
  // do colaborador ou administrador se já houver uma sessão ativa.
  redirect("/login")
}
