"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { toast } from "react-hot-toast";
import { Button } from "@/components/ui/Button";
import ImageGallery from "@/views/products/components/ImageGallery";
import { Product } from "@/types";

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

interface FavoriteItem {
  productId: string;
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
  const [isFavorite, setIsFavorite] = useState(false);
  const [addingToFavorites, setAddingToFavorites] = useState(false);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);

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

  const checkFavoriteStatus = useCallback(async () => {
    try {
      const response = await fetch("/api/favorites");
      if (response.ok) {
        const favorites: FavoriteItem[] = await response.json();
        setIsFavorite(favorites.some((fav) => fav.productId === productId));
      }
    } catch (error) {
      console.error("Error checking favorite status:", error);
    }
  }, [productId]);

  useEffect(() => {
    const loadData = async () => {
      await fetchProduct();
      if (session) {
        await checkFavoriteStatus();
      }
    };
    loadData();
  }, [fetchProduct, checkFavoriteStatus, session]);

  const toggleFavorite = async () => {
    if (!session) {
      router.push("/auth/signin");
      return;
    }

    setAddingToFavorites(true);
    try {
      const response = await fetch(`/api/favorites/${productId}`, {
        method: isFavorite ? "DELETE" : "POST",
      });

      if (response.ok) {
        setIsFavorite(!isFavorite);
        toast.success(
          isFavorite ? "Eliminado de favoritos" : "Añadido a favoritos"
        );
      } else {
        throw new Error("Error al actualizar favoritos");
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
        const { checkoutUrl } = await response.json();

        // Redirigir a Stripe Checkout
        window.location.href = checkoutUrl;
      } else {
        const error = await response.json();
        toast.error(error.message || "Error al procesar el pago");
      }
    } catch (error) {
      console.error("Error starting checkout:", error);
      toast.error("Error al iniciar el proceso de pago");
    } finally {
      setIsProcessingPayment(false);
    }
  };

  const formatDate = (date: string | Date) => {
    return new Date(date).toLocaleDateString("es-ES", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const getTimeSincePublished = (date: string | Date) => {
    const now = new Date();
    const published = new Date(date);
    const diffInDays = Math.floor(
      (now.getTime() - published.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (diffInDays === 0) return "Hoy";
    if (diffInDays === 1) return "Ayer";
    if (diffInDays < 7) return `Hace ${diffInDays} días`;
    if (diffInDays < 30) return `Hace ${Math.floor(diffInDays / 7)} semanas`;
    return `Hace ${Math.floor(diffInDays / 30)} meses`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">
            Cargando producto...
          </p>
        </div>
      </div>
    );
  }

  if (!product) {
    return null;
  }

  const condition =
    conditionLabels[product.condition as keyof typeof conditionLabels];
  const category =
    categoryLabels[product.category as keyof typeof categoryLabels];
  const isOwner = session?.user?.email === product.seller.email;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <nav className="flex mb-8" aria-label="Breadcrumb">
          <ol role="list" className="flex items-center space-x-4">
            <li>
              <button
                onClick={() => router.push("/productos")}
                className="text-gray-400 hover:text-gray-500 dark:text-gray-500 dark:hover:text-gray-400"
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
                <span className="ml-4 text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                  {product.brand} {product.model}
                </span>
              </div>
            </li>
          </ol>
        </nav>

        <div className="lg:grid lg:grid-cols-2 lg:gap-x-8 lg:items-start">
          {/* Galería de imágenes */}
          <div className="flex flex-col-reverse">
            <ImageGallery
              images={product.images}
              alt={`${product.brand} ${product.model}`}
            />
          </div>

          {/* Información del producto */}
          <div className="mt-10 px-4 sm:px-0 sm:mt-16 lg:mt-0">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
              {/* Header */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    {category}
                  </span>
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${condition.color}`}
                  >
                    {condition.label}
                  </span>
                </div>

                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                  {product.brand} {product.model}
                </h1>

                <div className="flex items-center space-x-4 mt-2">
                  <span className="text-lg text-gray-600 dark:text-gray-400">
                    Año {product.year}
                  </span>
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    {product.views || 0} visualizaciones
                  </span>
                </div>
              </div>

              {/* Precio */}
              <div className="mb-8">
                <p className="text-4xl font-bold text-green-600">
                  €{product.publicPrice.toLocaleString()}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  {condition.description}
                </p>
              </div>

              {/* Botones de acción */}
              {!isOwner && !product.sold && (
                <div className="space-y-4 mb-8">
                  {/* Botón principal de compra */}
                  <Button
                    onClick={buyProduct}
                    disabled={isProcessingPayment}
                    className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3"
                    size="lg"
                  >
                    {isProcessingPayment ? (
                      <>
                        <svg
                          className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          />
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          />
                        </svg>
                        Procesando...
                      </>
                    ) : (
                      <>
                        <svg
                          className="w-5 h-5 mr-2"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13l2.5 5m0 0H16"
                          />
                        </svg>
                        Comprar Ahora - €{product.publicPrice.toLocaleString()}
                      </>
                    )}
                  </Button>

                  {/* Botones secundarios */}
                  <div className="flex flex-col sm:flex-row gap-4">
                    <Button
                      onClick={contactSeller}
                      variant="outline"
                      className="flex-1"
                      size="lg"
                    >
                      <svg
                        className="w-5 h-5 mr-2"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                        />
                      </svg>
                      Contactar Vendedor
                    </Button>

                    <Button
                      onClick={toggleFavorite}
                      variant="outline"
                      disabled={addingToFavorites}
                      className={`flex-1 ${isFavorite ? "text-red-600 border-red-600 hover:bg-red-50" : "text-gray-600 border-gray-300 hover:bg-gray-50"}`}
                    >
                      <svg
                        className={`w-5 h-5 mr-2 ${isFavorite ? "fill-current" : ""}`}
                        fill={isFavorite ? "currentColor" : "none"}
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                        />
                      </svg>
                      {isFavorite ? "En Favoritos" : "Añadir a Favoritos"}
                    </Button>
                  </div>
                </div>
              )}

              {/* Producto vendido */}
              {!isOwner && product.sold && (
                <div className="mb-8">
                  <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
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
                      <span className="text-sm font-medium text-red-800 dark:text-red-200">
                        Este producto ya ha sido vendido
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Descripción */}
              <div className="mb-8">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                  Descripción
                </h3>
                <div className="prose prose-sm max-w-none dark:prose-invert text-gray-700 dark:text-gray-300">
                  <p className="whitespace-pre-wrap">{product.description}</p>
                </div>
              </div>

              {/* Información adicional */}
              <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                  Detalles
                </h3>
                <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                      Marca
                    </dt>
                    <dd className="mt-1 text-sm text-gray-900 dark:text-white">
                      {product.brand}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                      Modelo
                    </dt>
                    <dd className="mt-1 text-sm text-gray-900 dark:text-white">
                      {product.model}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                      Año
                    </dt>
                    <dd className="mt-1 text-sm text-gray-900 dark:text-white">
                      {product.year}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                      Estado
                    </dt>
                    <dd className="mt-1 text-sm text-gray-900 dark:text-white">
                      {condition.label}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                      Categoría
                    </dt>
                    <dd className="mt-1 text-sm text-gray-900 dark:text-white">
                      {category}
                    </dd>
                  </div>
                  {product.location && (
                    <div>
                      <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                        Ubicación
                      </dt>
                      <dd className="mt-1 text-sm text-gray-900 dark:text-white">
                        {product.location}
                      </dd>
                    </div>
                  )}
                  <div>
                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                      Publicado
                    </dt>
                    <dd className="mt-1 text-sm text-gray-900 dark:text-white">
                      {getTimeSincePublished(product.createdAt)}
                    </dd>
                  </div>
                </dl>
              </div>

              {/* Información del vendedor */}
              <div className="border-t border-gray-200 dark:border-gray-700 pt-6 mt-6">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                  Vendedor
                </h3>
                <div className="flex items-center space-x-4">
                  <div className="flex-shrink-0">
                    {product.seller.image ? (
                      <Image
                        className="h-12 w-12 rounded-full"
                        src={product.seller.image}
                        alt={product.seller.name || "Vendedor"}
                        width={48}
                        height={48}
                      />
                    ) : (
                      <div className="h-12 w-12 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center">
                        <span className="text-lg font-medium text-gray-700 dark:text-gray-200">
                          {product.seller.name?.charAt(0).toUpperCase() || "V"}
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                      {product.seller.name}
                    </h4>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Miembro desde {formatDate(product.seller.createdAt)}
                    </p>
                    {product.seller.location && (
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        📍 {product.seller.location}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Propietario del producto */}
              {isOwner && (
                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-8">
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
                    <span className="text-sm font-medium text-blue-800 dark:text-blue-200">
                      Este es tu producto. Puedes editarlo desde &quot;Mis
                      Productos&quot;.
                    </span>
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
