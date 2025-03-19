// Componente para generar datos estructurados JSON-LD para la organización
// Esto ayuda a los motores de búsqueda a entender mejor la información de la empresa
export default function OrganizationJsonLd() {
  // Creamos el objeto JSON-LD para la organización
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Retro Shop",
    url: "https://retroshop.vercel.app",
    logo: "https://retroshop.vercel.app/logo.png",
    sameAs: ["https://facebook.com/retroshop", "https://twitter.com/retroshop", "https://instagram.com/retroshop"],
    contactPoint: {
      "@type": "ContactPoint",
      telephone: "+1-555-555-5555",
      contactType: "customer service",
      availableLanguage: ["English", "Spanish"],
    },
    address: {
      "@type": "PostalAddress",
      streetAddress: "123 Retro Street",
      addressLocality: "Gaming City",
      addressRegion: "RC",
      postalCode: "12345",
      addressCountry: "US",
    },
  }

  // Devolvemos el script con los datos estructurados
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
}

