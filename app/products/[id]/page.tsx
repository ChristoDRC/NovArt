import { Navbar } from "@/components/navbar"
import { getProductById, getProducts } from "@/lib/products"
import AddToCartButton from "@/components/add-to-cart-button"
import { notFound } from "next/navigation"
import ProductJsonLd from "@/components/product-json-ld"
import type { Metadata } from "next"

// Generamos rutas estáticas para los productos
export async function generateStaticParams() {
  const products = await getProducts()

  return products.map((product) => ({
    id: product.id,
  }))
}

// Generamos metadatos dinámicos para cada producto
export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  const product = await getProductById(params.id)

  if (!product) {
    return {
      title: "Producto no encontrado | Retro Shop",
      description: "Lo sentimos, el producto que buscas no está disponible.",
    }
  }

  return {
    title: `${product.name} | Retro Shop`,
    description: product.description,
    openGraph: {
      title: `${product.name} | Retro Shop`,
      description: product.description,
      url: `https://retroshop.vercel.app/products/${product.id}`,
      siteName: "Retro Shop",
      images: [
        {
          url: product.image_url || "/og-image.jpg",
          width: 1200,
          height: 630,
          alt: product.name,
        },
      ],
      locale: "es_ES",
      type: "product",
    },
    twitter: {
      card: "summary_large_image",
      title: `${product.name} | Retro Shop`,
      description: product.description,
      images: [product.image_url || "/og-image.jpg"],
    },
    alternates: {
      canonical: `/products/${product.id}`,
    },
  }
}

// Página de detalle de producto
export default async function ProductPage({ params }: { params: { id: string } }) {
  // Obtenemos el producto por su ID
  const product = await getProductById(params.id)

  // Si no existe el producto, mostramos la página 404
  if (!product) {
    notFound()
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 container mx-auto py-8 px-4">
        {/* Añadimos los datos estructurados JSON-LD */}
        <ProductJsonLd product={product} />

        <div className="grid md:grid-cols-2 gap-8">
          {/* Imagen del producto */}
          <div className="bg-white p-4 rounded-lg shadow">
            <img
              src={product.image_url || "/placeholder.svg"}
              alt={product.name}
              className="w-full h-auto object-contain rounded-lg"
              style={{ maxHeight: "500px" }}
            />
          </div>

          {/* Detalles del producto */}
          <div className="flex flex-col">
            <h1 className="text-3xl font-bold text-navy mb-2">{product.name}</h1>

            {product.featured && (
              <div className="inline-block bg-secondary-accent text-navy text-sm font-bold px-3 py-1 rounded-full mb-4 self-start">
                Producto Destacado
              </div>
            )}

            <div className="text-2xl font-bold text-primary mb-4">${product.price.toFixed(2)}</div>

            <p className="text-gray-700 mb-6">{product.description}</p>

            <div className="flex items-center mb-6">
              <span className="text-gray-600 mr-2">Categoría:</span>
              <span className="font-medium">{product.category_name}</span>
            </div>

            <div className="flex items-center mb-8">
              <span className="text-gray-600 mr-2">Disponibilidad:</span>
              {product.stock > 0 ? (
                <span className="text-green-600 font-medium">{product.stock} en stock</span>
              ) : (
                <span className="text-red-600 font-medium">Agotado</span>
              )}
            </div>

            <div className="mt-auto">
              <div className="flex gap-4">
                <AddToCartButton
                  productId={product.id}
                  className="flex-1 bg-secondary text-navy hover:bg-secondary/90 py-6 text-lg"
                />
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

