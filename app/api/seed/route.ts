// Ruta de API para sembrar datos iniciales en la base de datos
import { createServerSupabaseClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

// Categorías iniciales para la tienda
const initialCategories = [
  {
    name: "Consolas Retro",
    description: "Consolas de videojuegos clásicas y sus réplicas modernas",
  },
  {
    name: "Accesorios",
    description: "Accesorios para tus consolas y dispositivos de juego",
  },
  {
    name: "Ropa",
    description: "Ropa y accesorios con diseños de videojuegos clásicos",
  },
  {
    name: "Coleccionables",
    description: "Figuras, posters y otros artículos coleccionables",
  },
]

// Productos iniciales para la tienda
const initialProducts = [
  {
    name: "Consola Retro Gaming",
    description: "Una consola clásica con 500 juegos preinstalados",
    price: 99.99,
    stock: 15,
    category_id: "", // Se asignará dinámicamente
    image_url: "/placeholder.svg?height=300&width=300",
    featured: true,
  },
  {
    name: "Control Vintage",
    description: "Réplica auténtica del control original",
    price: 29.99,
    stock: 25,
    category_id: "", // Se asignará dinámicamente
    image_url: "/placeholder.svg?height=300&width=300",
    featured: false,
  },
  {
    name: "Camiseta Pixel Art",
    description: "Camiseta 100% algodón con diseño de personaje de juego clásico",
    price: 24.99,
    stock: 50,
    category_id: "", // Se asignará dinámicamente
    image_url: "/placeholder.svg?height=300&width=300",
    featured: true,
  },
  {
    name: "Poster de Juego Retro",
    description: "Impresión de alta calidad de arte de juego clásico",
    price: 19.99,
    stock: 30,
    category_id: "", // Se asignará dinámicamente
    image_url: "/placeholder.svg?height=300&width=300",
    featured: false,
  },
  {
    name: "Taza 8-Bit",
    description: "Taza de cerámica con diseño de pixel art",
    price: 14.99,
    stock: 40,
    category_id: "", // Se asignará dinámicamente
    image_url: "/placeholder.svg?height=300&width=300",
    featured: true,
  },
  {
    name: "Miniatura de Arcade",
    description: "Gabinete arcade en miniatura completamente funcional",
    price: 199.99,
    stock: 10,
    category_id: "", // Se asignará dinámicamente
    image_url: "/placeholder.svg?height=300&width=300",
    featured: true,
  },
]

// Función para crear un usuario administrador
async function createAdminUser(supabase: any) {
  // Verificamos si ya existe un usuario admin
  const { data: existingAdmin } = await supabase.from("profiles").select("id").eq("role", "admin").single()

  if (existingAdmin) {
    return { message: "El usuario administrador ya existe" }
  }

  // Creamos un nuevo usuario administrador
  const { data: user, error: authError } = await supabase.auth.admin.createUser({
    email: "admin@retroshop.com",
    password: "Admin123!",
    email_confirm: true,
  })

  if (authError) {
    return { error: `Error al crear usuario administrador: ${authError.message}` }
  }

  // Creamos el perfil de administrador
  const { error: profileError } = await supabase.from("profiles").insert([
    {
      id: user.user.id,
      full_name: "Administrador",
      role: "admin",
    },
  ])

  if (profileError) {
    return { error: `Error al crear perfil de administrador: ${profileError.message}` }
  }

  return { message: "Usuario administrador creado con éxito" }
}

// Función para sembrar las categorías
async function seedCategories(supabase: any) {
  // Verificamos si ya existen categorías
  const { count, error: countError } = await supabase.from("categories").select("*", { count: "exact", head: true })

  if (countError) {
    return { error: `Error al verificar categorías existentes: ${countError.message}` }
  }

  if (count > 0) {
    return { message: "Las categorías ya existen" }
  }

  // Insertamos las categorías
  const { data, error } = await supabase.from("categories").insert(initialCategories).select()

  if (error) {
    return { error: `Error al sembrar categorías: ${error.message}` }
  }

  return { message: "Categorías sembradas con éxito", data }
}

// Función para sembrar los productos
async function seedProducts(supabase: any, categories: any[]) {
  // Verificamos si ya existen productos
  const { count, error: countError } = await supabase.from("products").select("*", { count: "exact", head: true })

  if (countError) {
    return { error: `Error al verificar productos existentes: ${countError.message}` }
  }

  if (count > 0) {
    return { message: "Los productos ya existen" }
  }

  // Asignamos categorías a los productos
  const productsWithCategories = initialProducts.map((product, index) => {
    const categoryIndex = index % categories.length
    return {
      ...product,
      category_id: categories[categoryIndex].id,
    }
  })

  // Insertamos los productos
  const { data, error } = await supabase.from("products").insert(productsWithCategories).select()

  if (error) {
    return { error: `Error al sembrar productos: ${error.message}` }
  }

  return { message: "Productos sembrados con éxito", data }
}

// Manejador de la ruta POST para sembrar datos
export async function POST() {
  try {
    const supabase = createServerSupabaseClient()

    // Creamos la tabla de perfiles si no existe
    const { error: profilesTableError } = await supabase.rpc("create_profiles_table_if_not_exists")

    if (profilesTableError) {
      return NextResponse.json(
        { error: `Error al crear tabla de perfiles: ${profilesTableError.message}` },
        { status: 500 },
      )
    }

    // Creamos el usuario administrador
    const adminResult = await createAdminUser(supabase)

    // Sembramos las categorías
    const categoriesResult = await seedCategories(supabase)

    // Si hay un error o no hay datos, devolvemos el resultado
    if (categoriesResult.error || !categoriesResult.data) {
      return NextResponse.json({
        admin: adminResult,
        categories: categoriesResult,
      })
    }

    // Sembramos los productos con las categorías creadas
    const productsResult = await seedProducts(supabase, categoriesResult.data)

    return NextResponse.json({
      admin: adminResult,
      categories: categoriesResult,
      products: productsResult,
    })
  } catch (error) {
    console.error("Error al sembrar datos:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}

