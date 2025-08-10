import bcrypt from "bcrypt"
import { createClient } from "@supabase/supabase-js"
import dotenv from "dotenv" // Importar dotenv

// Carregar variáveis de ambiente do .env.local
dotenv.config({ path: "./.env.local" })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceRoleKey) {
  console.error("NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set in environment variables.")
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey)

async function seedAdmin() {
  const username = "GDSSOUZ5"
  const password = "902512"
  const hashedPassword = await bcrypt.hash(password, 10) // Salt rounds

  try {
    // Check if admin already exists
    const { data: existingAdmin, error: fetchError } = await supabase
      .from("administrators")
      .select("id")
      .eq("username", username)
      .single()

    // console.log("Senha a ser hashed:", password); // CUIDADO: Não faça isso em produção!
    // console.log("Senha hashed:", hashedPassword);

    if (fetchError && fetchError.code !== "PGRST116") {
      // PGRST116 means no rows found
      throw fetchError
    }

    if (existingAdmin) {
      console.log(`Admin user '${username}' already exists. Skipping insertion.`)
      return
    }

    const { data, error } = await supabase.from("administrators").insert([
      {
        full_name: "Initial Admin",
        badge_number: "000000", // Placeholder
        username: username,
        password_hash: hashedPassword,
        can_create_collaborator: true,
        can_create_admin: true,
        can_enter_hours: true,
        can_change_access_code: true,
      },
    ])

    if (error) {
      throw error
    }
    console.log(`Admin user '${username}' seeded successfully.`)
  } catch (error) {
    console.error("Error seeding admin:", error.message)
  }
}

seedAdmin()
