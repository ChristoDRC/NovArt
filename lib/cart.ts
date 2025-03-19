// Archivo para gestionar las operaciones relacionadas con el carrito de compras
import { getSupabaseClient } from "@/lib/supabase/client"
import type { Product } from "@/lib/products"

// Definimos el tipo para los items del carrito
export type CartItem = {
  id: string
  user_id: string
  product_id: string
  quantity: number
  created_at: string
  updated_at: string
  // Información adicional del producto
  product?: Product
}

// Función para obtener los items del carrito de un usuario
export async function getCartItems(userId: string): Promise<CartItem[]> {
  const supabase = getSupabaseClient()

  const { data, error } = await supabase
    .from("cart_items")
    .select(`
      *,
      product:product_id(*)
    `)
    .eq("user_id", userId)

  if (error) {
    console.error("Error al obtener items del carrito:", error)
    return []
  }

  return data
}

// Función para añadir un producto al carrito
export async function addToCart(userId: string, productId: string, quantity = 1): Promise<boolean> {
  const supabase = getSupabaseClient()

  // Verificamos si el producto ya está en el carrito
  const { data: existingItem } = await supabase
    .from("cart_items")
    .select("*")
    .eq("user_id", userId)
    .eq("product_id", productId)
    .single()

  if (existingItem) {
    // Si ya existe, actualizamos la cantidad
    const { error } = await supabase
      .from("cart_items")
      .update({
        quantity: existingItem.quantity + quantity,
        updated_at: new Date().toISOString(),
      })
      .eq("id", existingItem.id)

    if (error) {
      console.error("Error al actualizar item del carrito:", error)
      return false
    }
  } else {
    // Si no existe, creamos un nuevo item
    const { error } = await supabase.from("cart_items").insert([
      {
        user_id: userId,
        product_id: productId,
        quantity,
      },
    ])

    if (error) {
      console.error("Error al añadir item al carrito:", error)
      return false
    }
  }

  return true
}

// Función para actualizar la cantidad de un producto en el carrito
export async function updateCartItemQuantity(cartItemId: string, quantity: number): Promise<boolean> {
  const supabase = getSupabaseClient()

  const { error } = await supabase
    .from("cart_items")
    .update({
      quantity,
      updated_at: new Date().toISOString(),
    })
    .eq("id", cartItemId)

  if (error) {
    console.error("Error al actualizar cantidad del item:", error)
    return false
  }

  return true
}

// Función para eliminar un producto del carrito
export async function removeFromCart(cartItemId: string): Promise<boolean> {
  const supabase = getSupabaseClient()

  const { error } = await supabase.from("cart_items").delete().eq("id", cartItemId)

  if (error) {
    console.error("Error al eliminar item del carrito:", error)
    return false
  }

  return true
}

// Función para vaciar el carrito de un usuario
export async function clearCart(userId: string): Promise<boolean> {
  const supabase = getSupabaseClient()

  const { error } = await supabase.from("cart_items").delete().eq("user_id", userId)

  if (error) {
    console.error("Error al vaciar el carrito:", error)
    return false
  }

  return true
}

// Función para contar los items en el carrito
export async function getCartItemsCount(userId: string): Promise<number> {
  const supabase = getSupabaseClient()

  const { data, error } = await supabase.from("cart_items").select("quantity").eq("user_id", userId)

  if (error) {
    console.error("Error al contar items del carrito:", error)
    return 0
  }

  // Sumamos todas las cantidades
  return data.reduce((total, item) => total + item.quantity, 0)
}

