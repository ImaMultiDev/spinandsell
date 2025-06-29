"use client";

import { useState, useEffect, useCallback } from "react";
import { toast } from "react-hot-toast";
import { Product, ProductFilter } from "@/types";
import ProductFilters from "./components/ProductFilters";
import ProductSorting from "./components/ProductSorting";
import ProductGrid from "./components/ProductGrid";

interface ProductsResponse {
  products: Product[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
    hasMore: boolean;
  };
}

export default function ProductsView() {
  const [products, setProducts] = useState<Product[]>([]);
  const [filters, setFilters] = useState<ProductFilter>({});
  const [sortBy, setSortBy] = useState("newest");
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [totalProducts, setTotalProducts] = useState(0);

  // Cargar productos desde la API
  const loadProducts = useCallback(
    async (reset = false) => {
      try {
        setLoading(true);

        const params = new URLSearchParams();

        // Añadir filtros
        if (filters.category) params.set("category", filters.category);
        if (filters.condition) params.set("condition", filters.condition);
        if (filters.brand) params.set("brand", filters.brand);
        if (filters.minPrice)
          params.set("minPrice", filters.minPrice.toString());
        if (filters.maxPrice)
          params.set("maxPrice", filters.maxPrice.toString());
        if (filters.search) params.set("search", filters.search);

        // Añadir ordenación y paginación
        params.set("sortBy", sortBy);
        params.set("page", reset ? "1" : page.toString());
        params.set("limit", "12");

        const response = await fetch(`/api/products?${params.toString()}`);

        if (!response.ok) {
          throw new Error("Error al cargar productos");
        }

        const data: ProductsResponse = await response.json();

        if (reset || page === 1) {
          setProducts(data.products);
        } else {
          setProducts((prev) => [...prev, ...data.products]);
        }

        setHasMore(data.pagination.hasMore);
        setTotalProducts(data.pagination.total);

        if (reset) {
          setPage(1);
        }
      } catch (error) {
        console.error("Error loading products:", error);
        toast.error("Error al cargar productos");
      } finally {
        setLoading(false);
      }
    },
    [filters, sortBy, page]
  );

  // Cargar productos iniciales
  useEffect(() => {
    loadProducts(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters, sortBy]); // Removido loadProducts de dependencias para evitar loop

  // Manejar cambio de filtros
  const handleFiltersChange = (newFilters: ProductFilter) => {
    setFilters(newFilters);
  };

  // Limpiar filtros
  const handleClearFilters = () => {
    setFilters({});
  };

  // Manejar cambio de ordenación
  const handleSortChange = (newSortBy: string) => {
    setSortBy(newSortBy);
  };

  // Cargar más productos
  const loadMore = async () => {
    if (hasMore && !loading) {
      const nextPage = page + 1;
      setPage(nextPage);

      try {
        setLoading(true);

        const params = new URLSearchParams();

        // Añadir filtros
        if (filters.category) params.set("category", filters.category);
        if (filters.condition) params.set("condition", filters.condition);
        if (filters.brand) params.set("brand", filters.brand);
        if (filters.minPrice)
          params.set("minPrice", filters.minPrice.toString());
        if (filters.maxPrice)
          params.set("maxPrice", filters.maxPrice.toString());
        if (filters.search) params.set("search", filters.search);

        // Añadir ordenación y paginación
        params.set("sortBy", sortBy);
        params.set("page", nextPage.toString());
        params.set("limit", "12");

        const response = await fetch(`/api/products?${params.toString()}`);

        if (!response.ok) {
          throw new Error("Error al cargar más productos");
        }

        const data: ProductsResponse = await response.json();

        setProducts((prev) => [...prev, ...data.products]);
        setHasMore(data.pagination.hasMore);
      } catch (error) {
        console.error("Error loading more products:", error);
        toast.error("Error al cargar más productos");
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Filtros */}
        <aside className="lg:w-64 flex-shrink-0">
          <div className="sticky top-4">
            <ProductFilters
              filters={filters}
              onFiltersChange={handleFiltersChange}
              onClearFilters={handleClearFilters}
            />
          </div>
        </aside>

        {/* Contenido principal */}
        <main className="flex-1">
          {/* Header con ordenación */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                Productos
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                {loading
                  ? "Cargando..."
                  : `${totalProducts} productos encontrados`}
              </p>
            </div>

            <ProductSorting
              sortBy={sortBy}
              onSortChange={handleSortChange}
              totalProducts={totalProducts}
            />
          </div>

          {/* Grid de productos */}
          <ProductGrid products={products} loading={loading} />

          {/* Botón cargar más */}
          {!loading && hasMore && products.length > 0 && (
            <div className="text-center mt-8">
              <button
                onClick={loadMore}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
              >
                Cargar más productos
              </button>
            </div>
          )}

          {/* Mensaje si no hay productos */}
          {!loading && products.length === 0 && (
            <div className="text-center py-12">
              <div className="text-gray-400 dark:text-gray-500 mb-4">
                <svg
                  className="mx-auto h-12 w-12"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2M4 13h2m13-8-4 4-4-4m6 4v7"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                No hay productos
              </h3>
              <p className="text-gray-500 dark:text-gray-400">
                No se encontraron productos que coincidan con los filtros
                seleccionados.
              </p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
