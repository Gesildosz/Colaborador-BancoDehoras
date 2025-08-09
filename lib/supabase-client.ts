// lib/supabase-client.ts (para uso no lado do cliente, se necessário, mas preferimos Server Actions)
import { createBrowserClient } from "@supabase/ssr"

let supabase: ReturnType<typeof createBrowserClient> | undefined

export function getClientSupabase() {
  if (!supabase) {
    supabase = createBrowserClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)
  }
  return supabase
}
