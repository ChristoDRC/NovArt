// Archivo para crear el cliente de Supabase en el lado del servidor
import { createClient } from "@supabase/supabase-js"

// Creamos un cliente de Supabase para usar en el servidor
// Esto nos permite realizar operaciones con permisos elevados
export const createServerSupabaseClient = () => {
  const supabaseUrl = process.env.SUPABASE_URL as string
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY as string

  return createClient(supabaseUrl, supabaseServiceKey)
}

