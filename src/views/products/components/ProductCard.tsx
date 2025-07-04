import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import { Product } from "@/types";
import { Button } from "@/components/ui/Button";
import { formatPrice } from "@/libs/utils";
import { PRODUCT_CONDITIONS } from "@/types";
import { useFavorites } from "@/hooks/useFavorites";
import {
  isAdminProduct,
  getAdminProductStyles,
  getAdminBranding,
} from "@/lib/admin";

interface ProductCardProps {
  product: Product;
  onToggleFavorite?: (productId: string) => void;
  isFavorite?: boolean;
}

export default function ProductCard({
  product,
  onToggleFavorite,
  isFavorite = false,
}: ProductCardProps) {
  const { data: session } = useSession();
  const router = useRouter();
  const [isLoadingFavorite, setIsLoadingFavorite] = useState(false);
  const [isLoadingContact, setIsLoadingContact] = useState(false);
  const { isFavorite: hookIsFavorite, toggleFavorite } = useFavorites();

  // Verificar si es producto del admin
  const isAdmin = isAdminProduct(product.seller?.email);
  const adminStyles = getAdminProductStyles();
  const adminBranding = getAdminBranding();

  // DEBUG: Agregar logs temporales para debuggear
  console.log("ProductCard Debug:", {
    productId: product.id,
    sellerId: product.sellerId,
    sellerEmail: product.seller?.email,
    isAdmin,
    sellerInfo: product.seller,
  });

  // Usar el valor del hook o el prop como fallback
  const actualIsFavorite = onToggleFavorite
    ? isFavorite
    : hookIsFavorite(product.id);

  const discountedPrice = product.discount
    ? product.publicPrice - (product.publicPrice * product.discount) / 100
    : product.publicPrice;

  const handleToggleFavorite = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!session) {
      toast.error("Debes iniciar sesión para guardar favoritos");
      return;
    }

    setIsLoadingFavorite(true);

    try {
      if (onToggleFavorite) {
        // Si se proporciona una función personalizada, usarla
        onToggleFavorite(product.id);
      } else {
        // Usar el hook useFavorites para manejar el estado
        const success = await toggleFavorite(product.id);
        if (success) {
          toast.success(
            actualIsFavorite ? "Eliminado de favoritos" : "Agregado a favoritos"
          );
        } else {
          toast.error("Error al actualizar favoritos");
        }
      }
    } catch {
      toast.error("Error al procesar favorito");
    } finally {
      setIsLoadingFavorite(false);
    }
  };

  const handleContactSeller = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!session) {
      toast.error("Debes iniciar sesión para contactar al vendedor");
      return;
    }

    if (!product.sellerId) {
      toast.error("No se puede contactar al vendedor");
      return;
    }

    // Verificar que no sea el propio producto
    const userEmail = session.user?.email;
    if (product.sellerId === userEmail) {
      toast.error("No puedes contactarte a ti mismo");
      return;
    }

    setIsLoadingContact(true);

    try {
      // Crear o obtener conversación existente
      const response = await fetch("/api/conversations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          otherUserId: product.sellerId,
          productId: product.id,
        }),
      });

      if (response.ok) {
        const data = await response.json();

        // Redirigir a mensajes
        router.push("/mensajes");

        if (data.conversationId) {
          toast.success("Redirigiendo a conversación existente");
        } else {
          toast.success("Conversación iniciada");
        }
      } else {
        const error = await response.json();
        toast.error(error.message || "Error al contactar vendedor");
      }
    } catch {
      toast.error("Error al contactar vendedor");
    } finally {
      setIsLoadingContact(false);
    }
  };

  return (
    <div
      className={`bg-white rounded-lg border hover:shadow-lg transition-shadow overflow-hidden group ${
        isAdmin ? adminStyles.cardBorder : ""
      }`}
    >
      {/* Imagen del producto */}
      <div className="relative h-48 bg-gray-200 overflow-hidden">
        <Image
          src={product.images?.[0] || "/placeholder-product.jpg"}
          alt={`${product.brand} ${product.model}`}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-300"
        />

        {/* Indicador de múltiples imágenes */}
        {product.images && product.images.length > 1 && (
          <div className="absolute bottom-2 right-2 bg-black bg-opacity-70 text-white px-2 py-1 rounded text-xs">
            +{product.images.length - 1} más
          </div>
        )}

        {/* Badge especial para productos del admin */}
        {isAdmin && (
          <div
            className={`absolute top-2 left-1/2 transform -translate-x-1/2 ${adminBranding.badgeColor} text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg border-2 border-white z-10`}
          >
            <span className="flex items-center gap-1">
              <span>{adminBranding.icon}</span>
              <span>{adminBranding.badgeText}</span>
            </span>
          </div>
        )}

        {/* Badge de estado */}
        <div
          className={`absolute top-2 right-2 bg-green-500 text-white px-2 py-1 rounded text-sm font-medium ${
            isAdmin ? "mt-8" : ""
          }`}
        >
          {PRODUCT_CONDITIONS[product.condition]}
        </div>

        {/* Badge de descuento */}
        {product.discount && (
          <div
            className={`absolute top-2 bg-red-500 text-white px-2 py-1 rounded text-sm font-medium ${
              session ? "left-12" : "left-2"
            }`}
          >
            -{product.discount}%
          </div>
        )}

        {/* Botón de favoritos */}
        {session && (
          <button
            onClick={handleToggleFavorite}
            disabled={isLoadingFavorite}
            className={`absolute top-2 left-2 p-2 rounded-full transition-colors ${
              actualIsFavorite
                ? "bg-pink-500 text-white hover:bg-pink-600"
                : "bg-white text-gray-400 hover:text-pink-500 hover:bg-pink-50"
            } ${isLoadingFavorite ? "opacity-50 cursor-not-allowed" : ""}`}
          >
            <svg
              className="w-4 h-4"
              fill={actualIsFavorite ? "currentColor" : "none"}
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

        {/* Badge de vendido */}
        {product.sold && (
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <span className="bg-red-600 text-white px-4 py-2 rounded-lg font-bold">
              VENDIDO
            </span>
          </div>
        )}
      </div>

      {/* Contenido */}
      <div className="p-4">
        {/* Título y marca */}
        <div className="mb-2">
          <h3 className="font-semibold text-lg line-clamp-1">
            {product.brand} {product.model}
          </h3>
          <p className="text-gray-600 text-sm">
            {product.year} • Estado {product.condition}
          </p>
        </div>

        {/* Descripción */}
        <p className="text-gray-700 text-sm mb-3 line-clamp-2">
          {product.description}
        </p>

        {/* Estadísticas */}
        <div className="flex items-center gap-4 mb-3 text-sm text-gray-500">
          <span className="flex items-center gap-1">
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
              />
            </svg>
            {product.views}
          </span>
          <span className="flex items-center gap-1">
            <svg
              className="w-4 h-4"
              fill="none"
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
            {product.likes}
          </span>
        </div>

        {/* Precio y acciones */}
        <div className="space-y-3">
          {/* Precio */}
          <div className="flex flex-col">
            {product.discount ? (
              <>
                <span className="text-lg font-bold text-green-600">
                  {formatPrice(discountedPrice)}
                </span>
                <span className="text-sm text-gray-500 line-through">
                  {formatPrice(product.publicPrice)}
                </span>
              </>
            ) : (
              <span className="text-xl font-bold text-green-600">
                {formatPrice(product.publicPrice)}
              </span>
            )}
          </div>

          {/* Botones de acción */}
          <div className="flex gap-2">
            <Link href={`/producto/${product.id}`} className="flex-1">
              <Button size="sm" disabled={product.sold} className="w-full">
                {product.sold ? "Vendido" : "Ver detalles"}
              </Button>
            </Link>

            {session &&
              !product.sold &&
              product.sellerId &&
              product.sellerId !== session.user?.email && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleContactSeller}
                  disabled={isLoadingContact}
                  className="flex-1"
                >
                  {isLoadingContact ? (
                    <>
                      <div className="w-3 h-3 border border-gray-400 border-t-transparent rounded-full animate-spin mr-1"></div>
                      Contactando...
                    </>
                  ) : (
                    <>
                      <svg
                        className="w-3 h-3 mr-1"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                        />
                      </svg>
                      Contactar
                    </>
                  )}
                </Button>
              )}
          </div>
        </div>
      </div>
    </div>
  );
}
