import Link from "next/link"
import { Navbar } from "@/components/navbar"
import { Button } from "@/components/ui/button"
import { getFeaturedProducts } from "@/lib/products"
import OrganizationJsonLd from "@/components/organization-json-ld"
import type { Metadata } from "next"

// Definimos los metadatos para la página principal
export const metadata: Metadata = {
  title: "Retro Shop | Tienda de Productos Retro Gaming",
  description:
    "Descubre nuestra colección de productos inspirados en juegos retro, desde réplicas de consolas clásicas hasta arte de juegos vintage.",
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
  },
  alternates: {
    canonical: "/",
  },
}

// Página principal de la tienda
export default async function Home() {
  // Obtenemos los productos destacados para mostrar en la página principal
  const featuredProducts = await getFeaturedProducts(3)

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      {/* Añadimos los datos estructurados JSON-LD */}
      <OrganizationJsonLd />

      <main className="flex-1">
        {/* Sección de héroe */}
        <section className="bg-navy text-white py-20">
          <div className="container mx-auto text-center">
            <h1 className="text-5xl font-bold mb-6">
              <span className="text-primary">Retro</span> Gaming Merchandise
            </h1>
            <p className="text-xl mb-8 max-w-2xl mx-auto">
              Descubre nuestra colección de productos inspirados en juegos retro, desde réplicas de consolas clásicas
              hasta arte de juegos vintage.
            </p>
            <div className="flex justify-center gap-4">
              <Button className="bg-primary hover:bg-primary/90 text-white">Comprar Ahora</Button>
              <Button variant="outline" className="border-secondary text-secondary hover:bg-secondary hover:text-navy">
                Más Información
              </Button>
            </div>
          </div>
        </section>

        {/* Sección de productos destacados */}
        <section className="py-16 bg-white">
          <div className="container mx-auto">
            <h2 className="text-3xl font-bold text-center mb-12 text-navy">Productos Destacados</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {featuredProducts.map((product) => (
                <div key={product.id} className="rounded-lg overflow-hidden shadow-lg group">
                  <div className="relative h-64">
                    <img
                      src={product.image_url || "/placeholder.svg"}
                      alt={product.name}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-primary opacity-60"></div>
                    <div className="absolute inset-0 flex flex-col items-center justify-center p-4">
                      <h3 className="text-2xl font-bold text-white mb-2">{product.name}</h3>
                      <p className="text-white text-center mb-4">{product.description}</p>
                      <Link href={`/products/${product.id}`}>
                        <Button className="bg-secondary text-navy hover:bg-secondary/90">Ver Detalles</Button>
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="text-center mt-8">
              <Link href="/products">
                <Button variant="outline" className="border-primary text-primary hover:bg-primary hover:text-white">
                  Ver Todos los Productos
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Sección de características */}
        <section className="py-16 bg-gray-100">
          <div className="container mx-auto text-center">
            <h2 className="text-3xl font-bold mb-12 text-navy">Por Qué Elegirnos</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                {
                  title: "Productos Auténticos",
                  description: "Todos nuestros productos son auténticos y con licencia oficial.",
                },
                {
                  title: "Envío Rápido",
                  description: "Obtén tus productos retro con nuestro envío rápido y confiable.",
                },
                {
                  title: "Satisfacción Garantizada",
                  description: "¿No estás satisfecho con tu compra? Ofrecemos devoluciones sin complicaciones.",
                },
              ].map((feature, index) => (
                <div key={index} className="p-6 bg-white rounded-lg shadow-md">
                  <h3 className="text-xl font-semibold mb-3 text-primary">{feature.title}</h3>
                  <p className="text-gray-600">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
      {/* Pie de página */}
      <footer className="bg-navy text-white py-8">
        <div className="container mx-auto text-center">
          <p>© 2025 Retro Shop. Todos los derechos reservados.</p>
        </div>
      </footer>
    </div>
  )
}

