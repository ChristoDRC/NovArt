"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { ShoppingCart, Check } from "lucide-react"
import { useAuth } from "@/lib/auth-provider"
import { addToCart } from "@/lib/cart"
import { useRouter } from "next/navigation"
import { toast } from "@/components/ui/use-toast"

// Componente para añadir productos al carrito
export default function AddToCartButton({
  productId,
  quantity = 1,
  className = "",
  showIcon = true,
}: {
  productId: string
  quantity?: number
  className?: string
  showIcon?: boolean
}) {
  // Estado para controlar la animación de éxito
  const [isAdding, setIsAdding] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const { user } = useAuth()
  const router = useRouter()

  // Función para manejar la adición al carrito
  const handleAddToCart = async () => {
    // Si no hay usuario, redirigimos al login
    if (!user) {
      router.push("/login")
      return
    }

    setIsAdding(true)

    try {
      // Añadimos el producto al carrito
      const success = await addToCart(user.id, productId, quantity)

      if (success) {
        // Mostramos animación de éxito
        setIsSuccess(true)
        toast({
          title: "Producto añadido",
          description: "El producto se ha añadido a tu carrito",
        })

        // Después de 1.5 segundos, volvemos al estado normal
        setTimeout(() => {
          setIsSuccess(false)
          setIsAdding(false)
        }, 1500)
      } else {
        throw new Error("No se pudo añadir al carrito")
      }
    } catch (error) {
      console.error("Error al añadir al carrito:", error)
      toast({
        title: "Error",
        description: "No se pudo añadir el producto al carrito",
        variant: "destructive",
      })
      setIsAdding(false)
    }
  }

  return (
    <Button onClick={handleAddToCart} disabled={isAdding} className={className}>
      {isSuccess ? (
        <>
          <Check className="mr-2 h-4 w-4" /> Añadido
        </>
      ) : (
        <>
          {showIcon && <ShoppingCart className="mr-2 h-4 w-4" />}
          Añadir al Carrito
        </>
      )}
    </Button>
  )
}

