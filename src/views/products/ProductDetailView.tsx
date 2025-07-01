"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { toast } from "react-hot-toast";
import { Button } from "@/components/ui/Button";
import ImageGallery from "@/views/products/components/ImageGallery";
import { Product } from "@/types";
import { useFavorites } from "@/hooks/useFavorites";
import { isAdminProduct, getAdminBranding } from "@/lib/admin";

interface ProductDetailViewProps {
  productId: string;
}

interface ProductWithSeller extends Product {
  seller: {
    id: string;
    name: string | null;
    email: string;
    image: string | null;
    phone: string | null;
    location: string | null;
    createdAt: Date;
  };
}

const categoryLabels = {
  ROAD_BIKE: "Bicicleta de Carretera",
  MOUNTAIN_BIKE: "Bicicleta de Montaña",
  ELECTRIC_BIKE: "Bicicleta Eléctrica",
  SPINNING_BIKE: "Bicicleta de Spinning",
  ELECTRIC_SCOOTER: "Patinete Eléctrico",
};

const conditionLabels = {
  A: {
    label: "Como Nuevo",
    description: "Excelente estado, muy poco uso",
    color: "text-green-600 bg-green-100",
  },
  B: {
    label: "Buen Estado",
    description: "Uso normal, pequeños detalles",
    color: "text-yellow-600 bg-yellow-100",
  },
  C: {
    label: "Estado Aceptable",
    description: "Uso evidente, funciona bien",
    color: "text-orange-600 bg-orange-100",
  },
};

export default function ProductDetailView({
  productId,
}: ProductDetailViewProps) {
  const { data: session } = useSession();
  const router = useRouter();
  const [product, setProduct] = useState<ProductWithSeller | null>(null);
  const [loading, setLoading] = useState(true);
  const [addingToFavorites, setAddingToFavorites] = useState(false);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const { isFavorite: hookIsFavorite, toggleFavorite: hookToggleFavorite } =
    useFavorites();

  const fetchProduct = useCallback(async () => {
    try {
      const response = await fetch(`/api/products/${productId}`);
      if (response.ok) {
        const data = await response.json();
        setProduct(data);
      } else if (response.status === 404) {
        router.push("/productos");
        toast.error("Producto no encontrado");
      } else {
        throw new Error("Error al cargar producto");
      }
    } catch (error) {
      console.error("Error fetching product:", error);
      toast.error("Error al cargar el producto");
      router.push("/productos");
    } finally {
      setLoading(false);
    }
  }, [productId, router]);

  useEffect(() => {
    fetchProduct();
  }, [fetchProduct]);

  const toggleFavorite = async () => {
    if (!session) {
      router.push("/auth/signin");
      return;
    }

    setAddingToFavorites(true);
    try {
      const success = await hookToggleFavorite(productId);
      if (success) {
        toast.success(
          hookIsFavorite(productId)
            ? "Eliminado de favoritos"
            : "Añadido a favoritos"
        );
      } else {
        toast.error("Error al actualizar favoritos");
      }
    } catch (error) {
      console.error("Error toggling favorite:", error);
      toast.error("Error al actualizar favoritos");
    } finally {
      setAddingToFavorites(false);
    }
  };

  const contactSeller = () => {
    if (!session) {
      router.push("/auth/signin");
      return;
    }

    if (product?.seller.email === session.user?.email) {
      toast.error("No puedes contactar contigo mismo");
      return;
    }

    // Redirigir a mensajes con el vendedor
    router.push(`/mensajes?user=${product?.seller.id}`);
  };

  const buyProduct = async () => {
    if (!session) {
      router.push("/auth/signin");
      return;
    }

    if (!product) {
      toast.error("Producto no encontrado");
      return;
    }

    if (product.sold) {
      toast.error("Este producto ya ha sido vendido");
      return;
    }

    if (product.seller.email === session.user?.email) {
      toast.error("No puedes comprar tu propio producto");
      return;
    }

    setIsProcessingPayment(true);

    try {
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          productId: product.id,
        }),
      });

      if (response.ok) {
        const { url } = await response.json();
        window.location.href = url;
      } else {
        const error = await response.json();
        toast.error(error.message || "Error al procesar el pago");
      }
    } catch (error) {
      console.error("Error processing payment:", error);
      toast.error("Error al procesar el pago");
    } finally {
      setIsProcessingPayment(false);
    }
  };

  const formatDate = (date: string | Date) => {
    const dateObj = typeof date === "string" ? new Date(date) : date;
    return dateObj.toLocaleDateString("es-ES", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const getTimeSincePublished = (date: string | Date) => {
    const now = new Date();
    const publishedDate = typeof date === "string" ? new Date(date) : date;
    const diffInMs = now.getTime() - publishedDate.getTime();
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

    if (diffInDays === 0) return "Hoy";
    if (diffInDays === 1) return "Ayer";
    if (diffInDays < 7) return `Hace ${diffInDays} días`;
    if (diffInDays < 30) return `Hace ${Math.floor(diffInDays / 7)} semanas`;
    return `Hace ${Math.floor(diffInDays / 30)} meses`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Producto no encontrado
          </h2>
          <Button onClick={() => router.push("/productos")}>
            Ver todos los productos
          </Button>
        </div>
      </div>
    );
  }

  const discountedPrice = product.discount
    ? product.publicPrice - (product.publicPrice * product.discount) / 100
    : product.publicPrice;

  const currentCondition =
    conditionLabels[product.condition as keyof typeof conditionLabels];
  const currentCategory =
    categoryLabels[product.category as keyof typeof categoryLabels];
  const isOwner = session?.user?.email === product.seller.email;

  // Verificar si es producto del admin
  const isAdmin = isAdminProduct(product.seller.email);
  const adminBranding = getAdminBranding();

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <nav className="flex mb-8" aria-label="Breadcrumb">
          <ol role="list" className="flex items-center space-x-4">
            <li>
              <button
                onClick={() => router.push("/productos")}
                className="text-gray-400 hover:text-gray-500"
              >
                Productos
              </button>
            </li>
            <li>
              <div className="flex items-center">
                <svg
                  className="flex-shrink-0 h-5 w-5 text-gray-300"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                  aria-hidden="true"
                >
                  <path d="M5.555 17.776l8-16 .894.448-8 16-.894-.448z" />
                </svg>
                <span className="ml-4 text-sm font-medium text-gray-500 truncate">
                  {product.brand} {product.model}
                </span>
              </div>
            </li>
          </ol>
        </nav>

        <div
          className={`bg-white rounded-lg shadow-lg overflow-hidden ${
            isAdmin ? "ring-4 ring-yellow-400 ring-opacity-50" : ""
          }`}
        >
          {/* Badge especial para productos del admin */}
          {isAdmin && (
            <div className="bg-gradient-to-r from-yellow-400 to-yellow-600 text-white text-center py-3">
              <div className="flex items-center justify-center gap-2">
                <span className="text-xl">{adminBranding.icon}</span>
                <span className="font-bold text-lg">
                  {adminBranding.badgeText}
                </span>
                <span className="text-xl">{adminBranding.icon}</span>
              </div>
              <p className="text-sm mt-1 opacity-90">
                Producto verificado y garantizado por nuestro equipo
              </p>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 p-6">
            {/* Galería de imágenes */}
            <div className="space-y-4">
              <ImageGallery
                images={product.images || []}
                alt={`${product.brand} ${product.model}`}
              />
            </div>

            {/* Información del producto */}
            <div className="space-y-6">
              {/* Título y estado */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h1 className="text-3xl font-bold text-gray-900">
                    {product.brand} {product.model}
                    {isAdmin && (
                      <span className="ml-3 inline-flex items-center px-3 py-1 rounded-full text-sm font-bold bg-yellow-100 text-yellow-800">
                        <span className="mr-1">{adminBranding.icon}</span>
                        Spin&Sell
                      </span>
                    )}
                  </h1>
                  {session && (
                    <button
                      onClick={toggleFavorite}
                      disabled={addingToFavorites}
                      className={`p-3 rounded-full transition-colors ${
                        hookIsFavorite(productId)
                          ? "bg-pink-500 text-white hover:bg-pink-600"
                          : "bg-gray-100 text-gray-400 hover:text-pink-500 hover:bg-pink-50"
                      } ${addingToFavorites ? "opacity-50 cursor-not-allowed" : ""}`}
                    >
                      <svg
                        className="w-6 h-6"
                        fill={
                          hookIsFavorite(productId) ? "currentColor" : "none"
                        }
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                        />
                      </svg>
                    </button>
                  )}
                </div>

                <p className="text-gray-600">{currentCategory}</p>

                {/* Estado y condición */}
                <div className="flex items-center gap-3 mt-3">
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-medium ${
                      product.sold
                        ? "bg-red-100 text-red-800"
                        : "bg-green-100 text-green-800"
                    }`}
                  >
                    {product.sold ? "Vendido" : "Disponible"}
                  </span>

                  <span
                    className={`px-3 py-1 rounded-full text-sm font-medium ${currentCondition?.color}`}
                  >
                    Estado: {currentCondition?.label}
                  </span>

                  {isAdmin && (
                    <span className="px-3 py-1 rounded-full text-sm font-bold bg-yellow-100 text-yellow-800 border border-yellow-300">
                      ✅ Verificado
                    </span>
                  )}
                </div>
              </div>

              {/* Precio con destacado especial para admin */}
              <div
                className={`p-4 rounded-lg ${
                  isAdmin
                    ? "bg-gradient-to-r from-yellow-50 to-yellow-100 border-2 border-yellow-300"
                    : "bg-gray-50"
                }`}
              >
                {isAdmin && (
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-yellow-600 font-semibold text-sm">
                      🏷️ Precio oficial Spin&Sell
                    </span>
                  </div>
                )}
                <div className="flex items-center gap-3">
                  {product.discount ? (
                    <>
                      <span
                        className={`text-3xl font-bold ${
                          isAdmin ? "text-yellow-700" : "text-green-600"
                        }`}
                      >
                        {discountedPrice.toLocaleString("es-ES")}€
                      </span>
                      <span className="text-xl text-gray-500 line-through">
                        {product.publicPrice.toLocaleString("es-ES")}€
                      </span>
                      <span className="bg-red-500 text-white px-2 py-1 rounded text-sm font-medium">
                        -{product.discount}%
                      </span>
                    </>
                  ) : (
                    <span
                      className={`text-3xl font-bold ${
                        isAdmin ? "text-yellow-700" : "text-green-600"
                      }`}
                    >
                      {product.publicPrice.toLocaleString("es-ES")}€
                    </span>
                  )}
                </div>
                {isAdmin && (
                  <p className="text-xs text-yellow-600 mt-1">
                    ⭐ Producto con garantía de calidad
                  </p>
                )}
              </div>

              {/* Descripción */}
              {product.description && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Descripción
                  </h3>
                  <p className="text-gray-700 leading-relaxed">
                    {product.description}
                  </p>
                </div>
              )}

              {/* Detalles técnicos */}
              <div className="grid grid-cols-2 gap-4 bg-gray-50 p-4 rounded-lg">
                <div>
                  <span className="text-sm text-gray-500">Marca</span>
                  <p className="font-medium">{product.brand}</p>
                </div>
                <div>
                  <span className="text-sm text-gray-500">Modelo</span>
                  <p className="font-medium">{product.model}</p>
                </div>
                <div>
                  <span className="text-sm text-gray-500">Categoría</span>
                  <p className="font-medium">{currentCategory}</p>
                </div>
                <div>
                  <span className="text-sm text-gray-500">Condición</span>
                  <p className="font-medium">{currentCondition?.label}</p>
                </div>
                <div>
                  <span className="text-sm text-gray-500">Visualizaciones</span>
                  <p className="font-medium">{product.views}</p>
                </div>
                <div>
                  <span className="text-sm text-gray-500">Publicado</span>
                  <p className="font-medium">
                    {getTimeSincePublished(product.createdAt)}
                  </p>
                </div>
              </div>

              {/* Botones de acción */}
              {!product.sold && !isOwner && (
                <div className="space-y-3">
                  <Button
                    onClick={buyProduct}
                    disabled={isProcessingPayment}
                    className="w-full bg-green-600 hover:bg-green-700"
                  >
                    {isProcessingPayment ? "Procesando..." : "Comprar ahora"}
                  </Button>

                  <Button
                    onClick={contactSeller}
                    variant="outline"
                    className="w-full"
                  >
                    Contactar vendedor
                  </Button>
                </div>
              )}

              {/* Mensaje para el propietario */}
              {isOwner && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-center">
                    <svg
                      className="h-5 w-5 text-blue-400 mr-2"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span className="text-sm font-medium text-blue-800">
                      Este es tu producto. Puedes editarlo desde &quot;Mis
                      Productos&quot;.
                    </span>
                  </div>
                </div>
              )}

              {/* Producto vendido */}
              {product.sold && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="flex items-center">
                    <svg
                      className="h-5 w-5 text-red-400 mr-2"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span className="text-sm font-medium text-red-800">
                      Este producto ya ha sido vendido
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Información del vendedor */}
          <div
            className={`border-t p-6 ${
              isAdmin
                ? "bg-gradient-to-r from-yellow-50 to-yellow-100"
                : "bg-gray-50"
            }`}
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              {isAdmin ? "Vendedor Oficial" : "Información del vendedor"}
            </h3>

            <div className="flex items-center gap-4">
              <div className="flex-shrink-0">
                {isAdmin ? (
                  <div className="w-15 h-15 bg-gradient-to-r from-yellow-400 to-yellow-600 rounded-full flex items-center justify-center">
                    <span className="text-2xl text-white font-bold">S&S</span>
                  </div>
                ) : product.seller.image ? (
                  <Image
                    src={product.seller.image}
                    alt={product.seller.name || "Vendedor"}
                    width={60}
                    height={60}
                    className="rounded-full object-cover"
                  />
                ) : (
                  <div className="w-15 h-15 bg-gray-300 rounded-full flex items-center justify-center">
                    <svg
                      className="w-8 h-8 text-gray-500"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                )}
              </div>

              <div className="flex-1">
                <h4
                  className={`font-medium ${
                    isAdmin ? "text-yellow-800" : "text-gray-900"
                  }`}
                >
                  {isAdmin
                    ? "Spin & Sell - Tienda Oficial"
                    : product.seller.name || "Vendedor"}
                </h4>
                {isAdmin ? (
                  <div className="space-y-1">
                    <p className="text-sm text-yellow-700 font-medium">
                      ⭐ Vendedor verificado y de confianza
                    </p>
                    <p className="text-sm text-yellow-600">
                      🚚 Envío rápido y seguro garantizado
                    </p>
                    <p className="text-sm text-yellow-600">
                      🔒 Garantía de devolución de 30 días
                    </p>
                    <p className="text-sm text-yellow-600">
                      🛠️ Servicio técnico especializado
                    </p>
                  </div>
                ) : (
                  <>
                    <p className="text-sm text-gray-500">
                      Miembro desde {formatDate(product.seller.createdAt)}
                    </p>
                    {product.seller.location && (
                      <p className="text-sm text-gray-600 flex items-center gap-1">
                        <svg
                          className="w-4 h-4"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"
                            clipRule="evenodd"
                          />
                        </svg>
                        {product.seller.location}
                      </p>
                    )}
                  </>
                )}
              </div>

              {/* Badge adicional para admin */}
              {isAdmin && (
                <div className="flex-shrink-0">
                  <div className="bg-yellow-200 text-yellow-800 px-3 py-2 rounded-lg text-center">
                    <div className="text-lg font-bold">
                      {adminBranding.icon}
                    </div>
                    <div className="text-xs font-semibold">Oficial</div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
