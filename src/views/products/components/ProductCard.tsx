import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { useSession } from "next-auth/react";
import { toast } from "react-hot-toast";
import { Product } from "@/types";
import { Button } from "@/components/ui/Button";
import { formatPrice } from "@/libs/utils";
import { PRODUCT_CONDITIONS } from "@/types";

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
  const [isLoadingFavorite, setIsLoadingFavorite] = useState(false);

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
        // Lógica por defecto para agregar/quitar favoritos
        if (isFavorite) {
          const response = await fetch(`/api/favorites/${product.id}`, {
            method: "DELETE",
          });

          if (response.ok) {
            toast.success("Eliminado de favoritos");
          } else {
            toast.error("Error al eliminar favorito");
          }
        } else {
          const response = await fetch("/api/favorites", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ productId: product.id }),
          });

          if (response.ok) {
            toast.success("Agregado a favoritos");
          } else {
            toast.error("Error al agregar favorito");
          }
        }
      }
    } catch {
      toast.error("Error al procesar favorito");
    } finally {
      setIsLoadingFavorite(false);
    }
  };

  return (
    <div className="bg-white rounded-lg border hover:shadow-lg transition-shadow overflow-hidden group">
      {/* Imagen del producto */}
      <div className="relative h-48 bg-gray-200 overflow-hidden">
        <Image
          src="/placeholder-product.jpg"
          alt={`${product.brand} ${product.model}`}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-300"
        />

        {/* Badge de estado */}
        <div className="absolute top-2 right-2 bg-green-500 text-white px-2 py-1 rounded text-sm font-medium">
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
              isFavorite
                ? "bg-pink-500 text-white hover:bg-pink-600"
                : "bg-white text-gray-400 hover:text-pink-500 hover:bg-pink-50"
            } ${isLoadingFavorite ? "opacity-50 cursor-not-allowed" : ""}`}
          >
            <svg
              className="w-4 h-4"
              fill={isFavorite ? "currentColor" : "none"}
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
        <div className="flex justify-between items-center">
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

          <Link href={`/productos/${product.id}`}>
            <Button size="sm" disabled={product.sold}>
              {product.sold ? "Vendido" : "Ver detalles"}
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
