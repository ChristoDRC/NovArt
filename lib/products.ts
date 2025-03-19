// Archivo para gestionar las operaciones relacionadas con productos
import { getSupabaseClient } from "@/lib/supabase/client"
import { createServerSupabaseClient } from "@/lib/supabase/server"

// Definimos el tipo para nuestros productos
export type Product = {
  id: string
  name: string
  description: string
  price: number
  stock: number
  category_id: string
  image_url: string
  featured: boolean
  created_at: string
  updated_at: string
  // Campos adicionales que podemos obtener mediante joins
  category_name?: string
}

// Definimos el tipo para las categorías
export type Category = {
  id: string
  name: string
  description: string
  created_at: string
  updated_at: string
}

// Función para obtener todos los productos
export async function getProducts(): Promise<Product[]> {
  const supabase = getSupabaseClient()

  const { data, error } = await supabase
    .from("products")
    .select(`
      *,
      categories(name)
    `)
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Error al obtener productos:", error)
    return []
  }

  // Transformamos los datos para tener una estructura más plana
  return data.map((product) => ({
    ...product,
    category_name: product.categories?.name,
  }))
}

// Función para obtener un producto por su ID
export async function getProductById(id: string): Promise<Product | null> {
  const supabase = getSupabaseClient()

  const { data, error } = await supabase
    .from("products")
    .select(`
      *,
      categories(name)
    `)
    .eq("id", id)
    .single()

  if (error) {
    console.error(`Error al obtener el producto con ID ${id}:`, error)
    return null
  }

  return {
    ...data,
    category_name: data.categories?.name,
  }
}

// Función para obtener productos destacados
export async function getFeaturedProducts(limit = 6): Promise<Product[]> {
  const supabase = getSupabaseClient()

  const { data, error } = await supabase
    .from("products")
    .select(`
      *,
      categories(name)
    `)
    .eq("featured", true)
    .order("created_at", { ascending: false })
    .limit(limit)

  if (error) {
    console.error("Error al obtener productos destacados:", error)
    return []
  }

  return data.map((product) => ({
    ...product,
    category_name: product.categories?.name,
  }))
}

// Función para obtener productos por categoría
export async function getProductsByCategory(categoryId: string): Promise<Product[]> {
  const supabase = getSupabaseClient()

  const { data, error } = await supabase
    .from("products")
    .select(`
      *,
      categories(name)
    `)
    .eq("category_id", categoryId)
    .order("created_at", { ascending: false })

  if (error) {
    console.error(`Error al obtener productos de la categoría ${categoryId}:`, error)
    return []
  }

  return data.map((product) => ({
    ...product,
    category_name: product.categories?.name,
  }))
}

// Función para obtener todas las categorías
export async function getCategories(): Promise<Category[]> {
  const supabase = getSupabaseClient()

  const { data, error } = await supabase.from("categories").select("*").order("name", { ascending: true })

  if (error) {
    console.error("Error al obtener categorías:", error)
    return []
  }

  return data
}

// Función para crear un nuevo producto (solo para administradores)
export async function createProduct(
  product: Omit<Product, "id" | "created_at" | "updated_at">,
): Promise<Product | null> {
  const supabase = createServerSupabaseClient()

  const { data, error } = await supabase.from("products").insert([product]).select().single()

  if (error) {
    console.error("Error al crear producto:", error)
    return null
  }

  return data
}

// Función para actualizar un producto existente (solo para administradores)
export async function updateProduct(id: string, updates: Partial<Product>): Promise<Product | null> {
  const supabase = createServerSupabaseClient()

  const { data, error } = await supabase.from("products").update(updates).eq("id", id).select().single()

  if (error) {
    console.error(`Error al actualizar el producto con ID ${id}:`, error)
    return null
  }

  return data
}

// Función para eliminar un producto (solo para administradores)
export async function deleteProduct(id: string): Promise<boolean> {
  const supabase = createServerSupabaseClient()

  const { error } = await supabase.from("products").delete().eq("id", id)

  if (error) {
    console.error(`Error al eliminar el producto con ID ${id}:`, error)
    return false
  }

  return true
}

// Función para subir una imagen de producto
export async function uploadProductImage(file: File): Promise<string | null> {
  const supabase = getSupabaseClient()

  // Generamos un nombre único para el archivo
  const fileExt = file.name.split(".").pop()
  const fileName = `${Math.random().toString(36).substring(2, 15)}.${fileExt}`
  const filePath = `products/${fileName}`

  // Subimos el archivo a Supabase Storage
  const { error } = await supabase.storage.from("product-images").upload(filePath, file)

  if (error) {
    console.error("Error al subir imagen:", error)
    return null
  }

  // Obtenemos la URL pública de la imagen
  const { data } = supabase.storage.from("product-images").getPublicUrl(filePath)

  return data.publicUrl
}

