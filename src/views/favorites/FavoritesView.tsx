"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import { Product } from "@/types";
import ProductCard from "@/views/products/components/ProductCard";

interface Favorite {
  id: string;
  createdAt: string;
  product: Product;
}

export default function FavoritesView() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (session?.user) {
      loadFavorites();
    }
  }, [session]);

  // Redirigir si no está autenticado
  if (status === "unauthenticated") {
    router.push("/auth/signin");
    return null;
  }

  const loadFavorites = async () => {
    try {
      const response = await fetch("/api/favorites");
      if (response.ok) {
        const data = await response.json();
        setFavorites(data);
      } else {
        toast.error("Error al cargar favoritos");
      }
    } catch {
      toast.error("Error al cargar favoritos");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveFavorite = async (productId: string) => {
    try {
      const response = await fetch(`/api/favorites/${productId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setFavorites(favorites.filter((fav) => fav.product.id !== productId));
        toast.success("Eliminado de favoritos");
      } else {
        toast.error("Error al eliminar favorito");
      }
    } catch {
      toast.error("Error al eliminar favorito");
    }
  };

  const handleToggleFavorite = async (productId: string) => {
    // Para favoritos siempre es eliminar
    await handleRemoveFavorite(productId);
  };

  if (status === "loading" || isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">
            Cargando favoritos...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Mis Favoritos
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Los productos que has marcado como favoritos
          </p>
        </div>

        {/* Estadísticas */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Total de Favoritos
              </h2>
              <p className="text-3xl font-bold text-green-600 dark:text-green-400 mt-2">
                {favorites.length}
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Guardados para ver más tarde
              </p>
              <div className="flex items-center mt-2 text-pink-600 dark:text-pink-400">
                <svg
                  className="w-5 h-5 mr-1"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z"
                    clipRule="evenodd"
                  />
                </svg>
                <span className="font-medium">Favoritos</span>
              </div>
            </div>
          </div>
        </div>

        {/* Lista de favoritos */}
        {favorites.length === 0 ? (
          <div className="text-center py-12">
            <svg
              className="mx-auto h-12 w-12 text-gray-400"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z"
                clipRule="evenodd"
              />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">
              No tienes favoritos
            </h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Explora productos y marca tus favoritos para encontrarlos
              fácilmente.
            </p>
            <div className="mt-6">
              <button
                onClick={() => router.push("/productos")}
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
              >
                <svg
                  className="w-5 h-5 mr-2"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
                Explorar Productos
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* Información adicional */}
            <div className="mb-6 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
              <div className="flex items-start">
                <svg
                  className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5 mr-2"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                    clipRule="evenodd"
                  />
                </svg>
                <div>
                  <h3 className="text-sm font-medium text-blue-800 dark:text-blue-200">
                    Productos Favoritos
                  </h3>
                  <p className="mt-1 text-sm text-blue-700 dark:text-blue-300">
                    Haz clic en el corazón de cualquier producto para eliminarlo
                    de favoritos. Los productos favoritos se ordenan por fecha
                    de agregado, los más recientes primero.
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {favorites.map((favorite) => (
                <div key={favorite.id} className="relative">
                  <ProductCard
                    product={favorite.product}
                    onToggleFavorite={handleToggleFavorite}
                    isFavorite={true}
                  />

                  {/* Fecha de agregado a favoritos */}
                  <div className="absolute top-2 left-2 bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200 px-2 py-1 rounded-full text-xs font-medium">
                    <svg
                      className="w-3 h-3 inline mr-1"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z"
                        clipRule="evenodd"
                      />
                    </svg>
                    {new Date(favorite.createdAt).toLocaleDateString("es-ES", {
                      day: "numeric",
                      month: "short",
                    })}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
