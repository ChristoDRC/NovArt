import { Navbar } from "@/components/navbar"
import { getProducts, getCategories } from "@/lib/products"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import AddToCartButton from "@/components/add-to-cart-button"
import type { Metadata } from "next"

// Definimos los metadatos para la página de productos
export const metadata: Metadata = {
  title: "Productos | Retro Shop",
  description:
    "Explora nuestra colección de productos retro gaming, desde consolas clásicas hasta accesorios y coleccionables.",
  openGraph: {
    title: "Productos | Retro Shop",
    description:
      "Explora nuestra colección de productos retro gaming, desde consolas clásicas hasta accesorios y coleccionables.",
    url: "https://retroshop.vercel.app/products",
    siteName: "Retro Shop",
    images: [
      {
        url: "/og-products.jpg",
        width: 1200,
        height: 630,
        alt: "Productos Retro Shop",
      },
    ],
    locale: "es_ES",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Productos | Retro Shop",
    description:
      "Explora nuestra colección de productos retro gaming, desde consolas clásicas hasta accesorios y coleccionables.",
    images: ["/og-products.jpg"],
  },
  alternates: {
    canonical: "/products",
  },
}

// Página de listado de productos
export default async function ProductsPage() {
  // Obtenemos todos los productos y categorías
  const products = await getProducts()
  const categories = await getCategories()

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 container mx-auto py-8 px-4">
        <h1 className="text-3xl font-bold mb-8 text-navy">Todos los Productos</h1>

        {/* Filtros de categorías */}
        <div className="mb-8 flex flex-wrap gap-2">
          <Link href="/products">
            <Button variant="outline" className="border-navy text-navy hover:bg-navy hover:text-white">
              Todos
            </Button>
          </Link>
          {categories.map((category) => (
            <Link key={category.id} href={`/products/category/${category.id}`}>
              <Button variant="outline" className="border-primary text-primary hover:bg-primary hover:text-white">
                {category.name}
              </Button>
            </Link>
          ))}
        </div>

        {/* Grid de productos */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {products.map((product) => (
            <Card key={product.id} className="overflow-hidden flex flex-col h-full">
              <div className="relative h-48 bg-gray-100">
                <img
                  src={product.image_url || "/placeholder.svg"}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
                {product.featured && (
                  <div className="absolute top-2 right-2 bg-secondary-accent text-navy text-xs font-bold px-2 py-1 rounded">
                    Destacado
                  </div>
                )}
              </div>
              <CardContent className="pt-6 flex-1">
                <h3 className="font-semibold text-lg mb-2 text-navy">{product.name}</h3>
                <p className="text-gray-600 text-sm mb-4">{product.description}</p>
                <div className="flex items-center justify-between">
                  <span className="text-primary font-bold">${product.price.toFixed(2)}</span>
                  <span className="text-sm text-gray-500">{product.stock} en stock</span>
                </div>
              </CardContent>
              <CardFooter className="pt-0 flex gap-2">
                <Link href={`/products/${product.id}`} className="flex-1">
                  <Button variant="outline" className="w-full border-navy text-navy hover:bg-navy hover:text-white">
                    Ver Detalles
                  </Button>
                </Link>
                <AddToCartButton productId={product.id} className="bg-secondary text-navy hover:bg-secondary/90" />
              </CardFooter>
            </Card>
          ))}
        </div>
      </main>
    </div>
  )
}

