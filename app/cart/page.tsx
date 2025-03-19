"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Navbar } from "@/components/navbar"
import { useAuth } from "@/lib/auth-provider"
import { getCartItems, updateCartItemQuantity, removeFromCart, clearCart, type CartItem } from "@/lib/cart"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Trash2, ShoppingBag, ArrowLeft } from "lucide-react"
import Link from "next/link"
import { toast } from "@/components/ui/use-toast"

// Página del carrito de compras
export default function CartPage() {
  // Estados para gestionar el carrito
  const [cartItems, setCartItems] = useState<CartItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const { user } = useAuth()
  const router = useRouter()

  // Calculamos el total del carrito
  const cartTotal = cartItems.reduce((total, item) => {
    return total + (item.product?.price || 0) * item.quantity
  }, 0)

  // Efecto para cargar los items del carrito
  useEffect(() => {
    const loadCartItems = async () => {
      if (!user) {
        router.push("/login")
        return
      }

      try {
        const items = await getCartItems(user.id)
        setCartItems(items)
      } catch (error) {
        console.error("Error al cargar el carrito:", error)
        toast({
          title: "Error",
          description: "No se pudo cargar el carrito",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    loadCartItems()
  }, [user, router])

  // Función para actualizar la cantidad de un producto
  const handleUpdateQuantity = async (cartItemId: string, quantity: number) => {
    if (quantity < 1) return

    try {
      const success = await updateCartItemQuantity(cartItemId, quantity)

      if (success) {
        setCartItems(cartItems.map((item) => (item.id === cartItemId ? { ...item, quantity } : item)))
      }
    } catch (error) {
      console.error("Error al actualizar cantidad:", error)
      toast({
        title: "Error",
        description: "No se pudo actualizar la cantidad",
        variant: "destructive",
      })
    }
  }

  // Función para eliminar un producto del carrito
  const handleRemoveItem = async (cartItemId: string) => {
    try {
      const success = await removeFromCart(cartItemId)

      if (success) {
        setCartItems(cartItems.filter((item) => item.id !== cartItemId))
        toast({
          title: "Producto eliminado",
          description: "El producto ha sido eliminado del carrito",
        })
      }
    } catch (error) {
      console.error("Error al eliminar producto:", error)
      toast({
        title: "Error",
        description: "No se pudo eliminar el producto",
        variant: "destructive",
      })
    }
  }

  // Función para vaciar el carrito
  const handleClearCart = async () => {
    if (!user) return

    try {
      const success = await clearCart(user.id)

      if (success) {
        setCartItems([])
        toast({
          title: "Carrito vaciado",
          description: "Se han eliminado todos los productos del carrito",
        })
      }
    } catch (error) {
      console.error("Error al vaciar el carrito:", error)
      toast({
        title: "Error",
        description: "No se pudo vaciar el carrito",
        variant: "destructive",
      })
    }
  }

  // Función para proceder al checkout
  const handleCheckout = () => {
    toast({
      title: "Procesando pedido",
      description: "Esta funcionalidad estará disponible próximamente",
    })
  }

  // Si está cargando, mostramos un indicador
  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 flex items-center justify-center">
          <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-primary"></div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 container mx-auto py-8 px-4">
        <h1 className="text-3xl font-bold mb-8 text-navy">Tu Carrito</h1>

        {cartItems.length === 0 ? (
          <div className="text-center py-12">
            <ShoppingBag className="mx-auto h-16 w-16 text-gray-400 mb-4" />
            <h2 className="text-2xl font-semibold text-gray-600 mb-4">Tu carrito está vacío</h2>
            <p className="text-gray-500 mb-8">Parece que aún no has añadido productos a tu carrito</p>
            <Link href="/products">
              <Button className="bg-primary hover:bg-primary/90">
                <ArrowLeft className="mr-2 h-4 w-4" /> Continuar Comprando
              </Button>
            </Link>
          </div>
        ) : (
          <div className="grid md:grid-cols-3 gap-8">
            <div className="md:col-span-2">
              <div className="bg-white rounded-lg shadow overflow-hidden">
                <table className="w-full">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="py-4 px-6 text-left">Producto</th>
                      <th className="py-4 px-6 text-center">Cantidad</th>
                      <th className="py-4 px-6 text-right">Precio</th>
                      <th className="py-4 px-6 text-right">Subtotal</th>
                      <th className="py-4 px-6 text-right">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {cartItems.map((item) => (
                      <tr key={item.id} className="border-t">
                        <td className="py-4 px-6">
                          <div className="flex items-center">
                            <img
                              src={item.product?.image_url || "/placeholder.svg"}
                              alt={item.product?.name}
                              className="w-16 h-16 object-cover rounded mr-4"
                            />
                            <div>
                              <h3 className="font-medium text-navy">{item.product?.name}</h3>
                              <p className="text-sm text-gray-500">{item.product?.category_name}</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <div className="flex items-center justify-center">
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}
                              disabled={item.quantity <= 1}
                            >
                              -
                            </Button>
                            <Input
                              type="number"
                              value={item.quantity}
                              onChange={(e) => handleUpdateQuantity(item.id, Number.parseInt(e.target.value) || 1)}
                              min="1"
                              className="w-16 mx-2 text-center"
                            />
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                            >
                              +
                            </Button>
                          </div>
                        </td>
                        <td className="py-4 px-6 text-right">${item.product?.price.toFixed(2)}</td>
                        <td className="py-4 px-6 text-right font-medium">
                          ${((item.product?.price || 0) * item.quantity).toFixed(2)}
                        </td>
                        <td className="py-4 px-6 text-right">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleRemoveItem(item.id)}
                            className="text-red-500 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="mt-4 flex justify-between">
                <Button
                  variant="outline"
                  className="border-navy text-navy hover:bg-navy hover:text-white"
                  onClick={handleClearCart}
                >
                  Vaciar Carrito
                </Button>
                <Link href="/products">
                  <Button variant="outline" className="border-primary text-primary hover:bg-primary hover:text-white">
                    Continuar Comprando
                  </Button>
                </Link>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-bold mb-4 text-navy">Resumen del Pedido</h2>

              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-medium">${cartTotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Envío</span>
                  <span className="font-medium">Gratis</span>
                </div>
                <div className="border-t pt-4 flex justify-between">
                  <span className="text-lg font-bold text-navy">Total</span>
                  <span className="text-lg font-bold text-primary">${cartTotal.toFixed(2)}</span>
                </div>
              </div>

              <Button
                className="w-full mt-6 bg-secondary text-navy hover:bg-secondary/90 py-6 text-lg"
                onClick={handleCheckout}
              >
                Proceder al Pago
              </Button>

              <p className="text-xs text-gray-500 mt-4 text-center">Los impuestos se calcularán en el checkout</p>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}

