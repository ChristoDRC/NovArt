"use client"

import Link from "next/link"
import { useAuth } from "@/lib/auth-provider"
import { Button } from "@/components/ui/button"
import { ShoppingCart, Package, User, LogOut } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useEffect, useState } from "react"
import { getCartItemsCount } from "@/lib/cart"

export function Navbar() {
  // Utilizamos el hook de autenticación para obtener información del usuario
  const { user, logout, isAdmin } = useAuth()
  // Estado para almacenar el número de items en el carrito
  const [cartItemsCount, setCartItemsCount] = useState(0)

  // Efecto para cargar el número de items en el carrito cuando el usuario está autenticado
  useEffect(() => {
    const loadCartItemsCount = async () => {
      if (user) {
        const count = await getCartItemsCount(user.id)
        setCartItemsCount(count)
      } else {
        setCartItemsCount(0)
      }
    }

    loadCartItemsCount()

    // Configuramos un intervalo para actualizar el contador cada 30 segundos
    const interval = setInterval(loadCartItemsCount, 30000)

    return () => clearInterval(interval)
  }, [user])

  return (
    <nav className="bg-navy text-white py-4">
      <div className="container mx-auto flex items-center justify-between">
        {/* Logo y nombre de la tienda */}
        <Link href="/" className="text-2xl font-bold flex items-center">
          <span className="text-primary mr-2">Retro</span>
          <span className="text-secondary">Shop</span>
        </Link>

        <div className="flex items-center space-x-6">
          {/* Enlace a productos */}
          <Link href="/products" className="hover:text-secondary transition-colors">
            Productos
          </Link>

          {/* Enlace al dashboard solo para administradores */}
          {isAdmin && (
            <Link href="/dashboard" className="hover:text-secondary transition-colors">
              Dashboard
            </Link>
          )}

          {/* Icono del carrito con contador */}
          <Link href="/cart" className="relative">
            <ShoppingCart className="h-6 w-6 text-secondary-accent hover:text-secondary transition-colors" />
            {cartItemsCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-primary text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                {cartItemsCount}
              </span>
            )}
          </Link>

          {/* Menú de usuario o botón de login */}
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                  <User className="h-5 w-5 text-secondary" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{user.user_metadata?.full_name || user.email}</p>
                    <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
                    <p className="text-xs leading-none text-primary capitalize">{user.role}</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/profile">Perfil</Link>
                </DropdownMenuItem>
                {isAdmin && (
                  <DropdownMenuItem asChild>
                    <Link href="/dashboard">
                      <Package className="mr-2 h-4 w-4" />
                      <span>Dashboard</span>
                    </Link>
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => logout()}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Cerrar sesión</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Link href="/login">
              <Button
                variant="outline"
                className="bg-transparent border-secondary text-white hover:bg-secondary hover:text-navy"
              >
                Iniciar sesión
              </Button>
            </Link>
          )}
        </div>
      </div>
    </nav>
  )
}

