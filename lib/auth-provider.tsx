"use client"

import type React from "react"

import { createContext, useContext, useState, useEffect } from "react"
import { getSupabaseClient } from "@/lib/supabase/client"
import type { User } from "@supabase/supabase-js"

// Definimos el tipo para nuestro usuario con rol
type UserWithRole = User & {
  role?: "admin" | "user"
}

// Definimos el tipo para nuestro contexto de autenticación
type AuthContextType = {
  user: UserWithRole | null
  loading: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
  register: (name: string, email: string, password: string) => Promise<void>
  isAdmin: boolean
}

// Creamos el contexto de autenticación
const AuthContext = createContext<AuthContextType | undefined>(undefined)

// Proveedor de autenticación que utiliza Supabase
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserWithRole | null>(null)
  const [loading, setLoading] = useState(true)
  const [isAdmin, setIsAdmin] = useState(false)
  const supabase = getSupabaseClient()

  // Efecto para verificar la sesión del usuario al cargar
  useEffect(() => {
    const checkUser = async () => {
      setLoading(true)

      // Obtenemos la sesión actual
      const {
        data: { session },
      } = await supabase.auth.getSession()

      if (session?.user) {
        // Si hay un usuario, verificamos si es administrador
        const { data: profile } = await supabase.from("profiles").select("role").eq("id", session.user.id).single()

        // Asignamos el rol al usuario
        const userWithRole: UserWithRole = {
          ...session.user,
          role: profile?.role || "user",
        }

        setUser(userWithRole)
        setIsAdmin(userWithRole.role === "admin")
      } else {
        setUser(null)
        setIsAdmin(false)
      }

      setLoading(false)
    }

    // Verificamos el usuario al inicio
    checkUser()

    // Configuramos un listener para cambios en la autenticación
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        // Si hay un usuario, verificamos si es administrador
        const { data: profile } = await supabase.from("profiles").select("role").eq("id", session.user.id).single()

        // Asignamos el rol al usuario
        const userWithRole: UserWithRole = {
          ...session.user,
          role: profile?.role || "user",
        }

        setUser(userWithRole)
        setIsAdmin(userWithRole.role === "admin")
      } else {
        setUser(null)
        setIsAdmin(false)
      }

      setLoading(false)
    })

    // Limpiamos la suscripción al desmontar
    return () => {
      subscription.unsubscribe()
    }
  }, [supabase])

  // Función para iniciar sesión
  const login = async (email: string, password: string) => {
    setLoading(true)
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) throw error
    } catch (error) {
      console.error("Error al iniciar sesión:", error)
      throw error
    } finally {
      setLoading(false)
    }
  }

  // Función para cerrar sesión
  const logout = async () => {
    try {
      await supabase.auth.signOut()
    } catch (error) {
      console.error("Error al cerrar sesión:", error)
    }
  }

  // Función para registrar un nuevo usuario
  const register = async (name: string, email: string, password: string) => {
    setLoading(true)
    try {
      // Registramos el usuario en Supabase Auth
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: name,
          },
        },
      })

      if (error) throw error

      // Si el registro es exitoso, creamos un perfil para el usuario
      if (data.user) {
        const { error: profileError } = await supabase.from("profiles").insert([
          {
            id: data.user.id,
            full_name: name,
            role: "user", // Por defecto, todos los usuarios nuevos son usuarios normales
          },
        ])

        if (profileError) throw profileError
      }
    } catch (error) {
      console.error("Error al registrar:", error)
      throw error
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, register, isAdmin }}>{children}</AuthContext.Provider>
  )
}

// Hook personalizado para usar el contexto de autenticación
export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth debe ser usado dentro de un AuthProvider")
  }
  return context
}

