"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import { Button } from "@/components/ui/Button";
import MyProductCard from "./components/MyProductCard";

interface Product {
  id: string;
  brand: string;
  model: string;
  year: number;
  condition: string;
  category: string;
  publicPrice: number;
  sold: boolean;
  views: number;
  likes: number;
  createdAt: string;
}

export default function MyProductsView() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "available" | "sold">("all");
  const [sortBy, setSortBy] = useState<
    "newest" | "oldest" | "price-high" | "price-low"
  >("newest");

  useEffect(() => {
    if (session?.user) {
      loadProducts();
    }
  }, [session]);

  // Redirigir si no está autenticado
  if (status === "unauthenticated") {
    router.push("/auth/signin");
    return null;
  }

  const loadProducts = async () => {
    try {
      const response = await fetch("/api/my-products");
      if (response.ok) {
        const data = await response.json();
        setProducts(data);
      } else {
        toast.error("Error al cargar productos");
      }
    } catch {
      toast.error("Error al cargar productos");
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (productId: string) => {
    router.push(`/producto/${productId}/editar`);
  };

  const handleDelete = async (productId: string) => {
    if (!confirm("¿Estás seguro de que quieres eliminar este producto?")) {
      return;
    }

    try {
      const response = await fetch(`/api/products/${productId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setProducts(products.filter((p) => p.id !== productId));
        toast.success("Producto eliminado exitosamente");
      } else {
        toast.error("Error al eliminar producto");
      }
    } catch {
      toast.error("Error al eliminar producto");
    }
  };

  const handleToggleStatus = async (productId: string, sold: boolean) => {
    try {
      const response = await fetch(`/api/products/${productId}/status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sold }),
      });

      if (response.ok) {
        setProducts(
          products.map((p) => (p.id === productId ? { ...p, sold } : p))
        );
        toast.success(
          sold ? "Producto marcado como vendido" : "Producto republicado"
        );
      } else {
        toast.error("Error al actualizar estado");
      }
    } catch {
      toast.error("Error al actualizar estado");
    }
  };

  // Filtrar y ordenar productos
  const filteredProducts = products
    .filter((product) => {
      if (filter === "available") return !product.sold;
      if (filter === "sold") return product.sold;
      return true;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "newest":
          return (
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
        case "oldest":
          return (
            new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
          );
        case "price-high":
          return b.publicPrice - a.publicPrice;
        case "price-low":
          return a.publicPrice - b.publicPrice;
        default:
          return 0;
      }
    });

  const stats = {
    total: products.length,
    available: products.filter((p) => !p.sold).length,
    sold: products.filter((p) => p.sold).length,
    totalViews: products.reduce((sum, p) => sum + p.views, 0),
    totalLikes: products.reduce((sum, p) => sum + p.likes, 0),
  };

  if (status === "loading" || isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">
            Cargando productos...
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
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Mis Productos
              </h1>
              <p className="mt-2 text-gray-600 dark:text-gray-400">
                Gestiona y administra tus productos publicados
              </p>
            </div>
            <Button onClick={() => router.push("/vender")}>
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
                  d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                />
              </svg>
              Publicar Producto
            </Button>
          </div>
        </div>

        {/* Estadísticas */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {stats.total}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Total Productos
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">
              {stats.available}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Disponibles
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-red-600 dark:text-red-400">
              {stats.sold}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Vendidos
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
              {stats.totalViews}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Visualizaciones
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-pink-600 dark:text-pink-400">
              {stats.totalLikes}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Me Gusta
            </div>
          </div>
        </div>

        {/* Filtros y ordenación */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-8">
          <div className="flex flex-col sm:flex-row justify-between gap-4">
            {/* Filtros */}
            <div className="flex space-x-2">
              <button
                onClick={() => setFilter("all")}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  filter === "all"
                    ? "bg-green-600 text-white"
                    : "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
                }`}
              >
                Todos ({stats.total})
              </button>
              <button
                onClick={() => setFilter("available")}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  filter === "available"
                    ? "bg-green-600 text-white"
                    : "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
                }`}
              >
                Disponibles ({stats.available})
              </button>
              <button
                onClick={() => setFilter("sold")}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  filter === "sold"
                    ? "bg-green-600 text-white"
                    : "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
                }`}
              >
                Vendidos ({stats.sold})
              </button>
            </div>

            {/* Ordenación */}
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-600 dark:text-gray-400">
                Ordenar por:
              </span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <option value="newest">Más recientes</option>
                <option value="oldest">Más antiguos</option>
                <option value="price-high">Precio mayor</option>
                <option value="price-low">Precio menor</option>
              </select>
            </div>
          </div>
        </div>

        {/* Lista de productos */}
        {filteredProducts.length === 0 ? (
          <div className="text-center py-12">
            <svg
              className="mx-auto h-12 w-12 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-6a2 2 0 00-2 2v3a2 2 0 01-2 2 2 2 0 01-2-2v-3a2 2 0 00-2-2H4"
              />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">
              {filter === "all"
                ? "No tienes productos"
                : `No tienes productos ${filter === "sold" ? "vendidos" : "disponibles"}`}
            </h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              {filter === "all"
                ? "Comienza publicando tu primer producto."
                : "Cambia el filtro para ver otros productos."}
            </p>
            {filter === "all" && (
              <div className="mt-6">
                <Button onClick={() => router.push("/vender")}>
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
                      d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                    />
                  </svg>
                  Publicar primer producto
                </Button>
              </div>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProducts.map((product) => (
              <MyProductCard
                key={product.id}
                product={product}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onToggleStatus={handleToggleStatus}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
