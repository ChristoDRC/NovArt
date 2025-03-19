// Ruta de API para crear la tabla de perfiles si no existe
import { createServerSupabaseClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

// Manejador de la ruta POST para crear la tabla de perfiles
export async function POST() {
  try {
    const supabase = createServerSupabaseClient()

    // Ejecutamos la función RPC para crear la tabla de perfiles
    const { error } = await supabase.rpc("create_profiles_table_if_not_exists")

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, message: "Tabla de perfiles creada o ya existente" })
  } catch (error) {
    console.error("Error al crear tabla de perfiles:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}

