import { createClient } from "@supabase/supabase-js"

export function createSupabaseServer() {
  const url = process.env.SUPABASE_URL
  const anon = process.env.SUPABASE_ANON_KEY
  const service = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !(anon || service)) {
    throw new Error(
      "Supabase env vars ausentes. Defina SUPABASE_URL e SUPABASE_ANON_KEY (e opcionalmente SUPABASE_SERVICE_ROLE_KEY).",
    )
  }
  // Preferir service role no servidor para operações administrativas (NUNCA expor no cliente).
  const key = service || anon!
  return createClient(url, key, {
    auth: { persistSession: false },
  })
}
