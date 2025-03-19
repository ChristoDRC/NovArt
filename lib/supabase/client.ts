// Archivo para crear el cliente de Supabase en el lado del cliente
import { createClient } from "@supabase/supabase-js"

// Creamos un cliente de Supabase para usar en el navegador
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string

// Utilizamos un patrón singleton para evitar múltiples instancias del cliente
let supabaseClient: ReturnType<typeof createClient> | null = null

// Función para obtener el cliente de Supabase
export const getSupabaseClient = () => {
  if (!supabaseClient) {
    supabaseClient = createClient(supabaseUrl, supabaseAnonKey)
  }
  return supabaseClient
}

