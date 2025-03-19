import type React from "react"
import { Inter } from "next/font/google"
import { ThemeProvider } from "@/components/theme-provider"
import { AuthProvider } from "@/lib/auth-provider"
import "./globals.css"

const inter = Inter({ subsets: ["latin"] })

export const metadata = {
  title: "Retro Shop | Tienda de Productos Retro Gaming",
  description:
    "Descubre nuestra colección de productos inspirados en juegos retro, desde réplicas de consolas clásicas hasta arte de juegos vintage.",
  keywords: "retro gaming, consolas retro, videojuegos clásicos, merchandising gaming, coleccionables retro",
  authors: [{ name: "Retro Shop" }],
  creator: "Retro Shop",
  publisher: "Retro Shop",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL("https://retroshop.vercel.app"),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "Retro Shop | Tienda de Productos Retro Gaming",
    description:
      "Descubre nuestra colección de productos inspirados en juegos retro, desde réplicas de consolas clásicas hasta arte de juegos vintage.",
    url: "https://retroshop.vercel.app",
    siteName: "Retro Shop",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Retro Shop - Tienda de Productos Retro Gaming",
      },
    ],
    locale: "es_ES",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Retro Shop | Tienda de Productos Retro Gaming",
    description:
      "Descubre nuestra colección de productos inspirados en juegos retro, desde réplicas de consolas clásicas hasta arte de juegos vintage.",
    images: ["/og-image.jpg"],
    creator: "@retroshop",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es" suppressHydrationWarning={true}>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="light">
          <AuthProvider>{children}</AuthProvider>
        </body>
      </html>
    )
  }



import './globals.css'