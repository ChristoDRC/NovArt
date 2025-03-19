// Componente para generar datos estructurados JSON-LD para productos
// Esto ayuda a los motores de búsqueda a entender mejor la información del producto
import type { Product } from "@/lib/products"

export default function ProductJsonLd({ product }: { product: Product }) {
  // Creamos el objeto JSON-LD para el producto
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description,
    image: product.image_url,
    sku: product.id,
    mpn: product.id,
    brand: {
      "@type": "Brand",
      name: "Retro Shop",
    },
    offers: {
      "@type": "Offer",
      url: `https://retroshop.vercel.app/products/${product.id}`,
      priceCurrency: "USD",
      price: product.price,
      priceValidUntil: new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString(),
      availability: product.stock > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
      seller: {
        "@type": "Organization",
        name: "Retro Shop",
      },
    },
  }

  // Devolvemos el script con los datos estructurados
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
}

