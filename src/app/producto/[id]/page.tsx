import { Metadata } from "next";
import { notFound } from "next/navigation";
import ProductDetailView from "@/views/products/ProductDetailView";

interface ProductDetailPageProps {
  params: Promise<{ id: string }>;
}

// Generar metadata dinámicamente
export async function generateMetadata({
  params,
}: ProductDetailPageProps): Promise<Metadata> {
  const { id } = await params;

  try {
    // Construir URL de manera más robusta
    const baseUrl = process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : process.env.NEXTAUTH_URL || "http://localhost:3000";

    const response = await fetch(`${baseUrl}/api/products/${id}`, {
      cache: "no-store",
    });

    if (!response.ok) {
      return {
        title: "Producto no encontrado - SpinAndSell",
        description: "El producto que buscas no está disponible.",
      };
    }

    const product = await response.json();

    return {
      title: `${product.brand} ${product.model} (${product.year}) - SpinAndSell`,
      description: `${product.description.substring(0, 160)}... | €${product.publicPrice} | Estado: ${product.condition === "A" ? "Como Nuevo" : product.condition === "B" ? "Buen Estado" : "Aceptable"}`,
      keywords: `${product.brand}, ${product.model}, ${product.category}, bicicleta, patinete, segunda mano, ${product.year}`,
      openGraph: {
        title: `${product.brand} ${product.model} - €${product.publicPrice}`,
        description: product.description,
        images: product.images.length > 0 ? [product.images[0]] : [],
        type: "website",
      },
    };
  } catch (error) {
    console.error("Error generating metadata:", error);
    return {
      title: "Producto - SpinAndSell",
      description: "Descubre este producto en SpinAndSell",
    };
  }
}

export default async function ProductDetailPage({
  params,
}: ProductDetailPageProps) {
  const { id } = await params;

  // Verificar que el ID es válido
  if (!id || typeof id !== "string") {
    notFound();
  }

  return <ProductDetailView productId={id} />;
}
