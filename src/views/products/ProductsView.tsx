"use client";

import { useState, useEffect } from "react";
import { Product, ProductFilter } from "@/types";
import ProductFilters from "./components/ProductFilters";
import ProductSorting from "./components/ProductSorting";
import ProductGrid from "./components/ProductGrid";

// Mock data - esto se reemplazará con la API de Strapi
const mockProducts: Product[] = [
  {
    id: "1",
    brand: "Trek",
    model: "Domane SL 5",
    year: 2022,
    condition: "A",
    category: "ROAD_BIKE",
    description:
      "Bicicleta de carretera de carbono en excelente estado. Perfecta para largas distancias y competición.",
    publicPrice: 2500,
    discount: 10,
    sold: false,
    paid: false,
    views: 145,
    likes: 23,
    createdAt: new Date("2024-01-15"),
    updatedAt: new Date("2024-01-20"),
  },
  {
    id: "2",
    brand: "Giant",
    model: "Trance X 29",
    year: 2023,
    condition: "B",
    category: "MOUNTAIN_BIKE",
    description:
      "Mountain bike de doble suspensión. Ideal para trails y senderos técnicos.",
    publicPrice: 1800,
    sold: false,
    paid: false,
    views: 98,
    likes: 15,
    createdAt: new Date("2024-01-10"),
    updatedAt: new Date("2024-01-18"),
  },
  {
    id: "3",
    brand: "Specialized",
    model: "Turbo Vado SL",
    year: 2023,
    condition: "A",
    category: "ELECTRIC_BIKE",
    description:
      "Bicicleta eléctrica ultraligera con motor SL 1.1 y batería integrada.",
    publicPrice: 3200,
    discount: 15,
    sold: true,
    paid: true,
    views: 203,
    likes: 45,
    createdAt: new Date("2024-01-05"),
    updatedAt: new Date("2024-01-15"),
  },
  {
    id: "4",
    brand: "Xiaomi",
    model: "Mi Electric Scooter Pro 2",
    year: 2022,
    condition: "B",
    category: "ELECTRIC_SCOOTER",
    description:
      "Patinete eléctrico con autonomía de 45km y velocidad máxima de 25km/h.",
    publicPrice: 450,
    sold: false,
    paid: false,
    views: 76,
    likes: 8,
    createdAt: new Date("2024-01-12"),
    updatedAt: new Date("2024-01-19"),
  },
];

export default function ProductsView() {
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [filters, setFilters] = useState<ProductFilter>({});
  const [sortBy, setSortBy] = useState("newest");
  const [loading, setLoading] = useState(true);

  // Simulación de carga de datos
  useEffect(() => {
    // Aquí se haría la llamada a la API de Strapi
    setTimeout(() => {
      setProducts(mockProducts);
      setFilteredProducts(mockProducts);
      setLoading(false);
    }, 1000);
  }, []);

  // Aplicar filtros y ordenación combinados
  useEffect(() => {
    let filtered = [...products];

    // Aplicar filtros
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      filtered = filtered.filter(
        (product) =>
          product.brand.toLowerCase().includes(searchTerm) ||
          product.model.toLowerCase().includes(searchTerm) ||
          product.description.toLowerCase().includes(searchTerm)
      );
    }

    if (filters.category) {
      filtered = filtered.filter(
        (product) => product.category === filters.category
      );
    }

    if (filters.condition) {
      filtered = filtered.filter(
        (product) => product.condition === filters.condition
      );
    }

    if (filters.brand) {
      const brandTerm = filters.brand.toLowerCase();
      filtered = filtered.filter((product) =>
        product.brand.toLowerCase().includes(brandTerm)
      );
    }

    if (filters.minPrice) {
      filtered = filtered.filter((product) => {
        const price = product.discount
          ? product.publicPrice - (product.publicPrice * product.discount) / 100
          : product.publicPrice;
        return price >= filters.minPrice!;
      });
    }

    if (filters.maxPrice) {
      filtered = filtered.filter((product) => {
        const price = product.discount
          ? product.publicPrice - (product.publicPrice * product.discount) / 100
          : product.publicPrice;
        return price <= filters.maxPrice!;
      });
    }

    // Aplicar ordenación
    const sorted = [...filtered];
    switch (sortBy) {
      case "newest":
        sorted.sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        break;
      case "oldest":
        sorted.sort(
          (a, b) =>
            new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        );
        break;
      case "price-asc":
        sorted.sort((a, b) => {
          const priceA = a.discount
            ? a.publicPrice - (a.publicPrice * a.discount) / 100
            : a.publicPrice;
          const priceB = b.discount
            ? b.publicPrice - (b.publicPrice * b.discount) / 100
            : b.publicPrice;
          return priceA - priceB;
        });
        break;
      case "price-desc":
        sorted.sort((a, b) => {
          const priceA = a.discount
            ? a.publicPrice - (a.publicPrice * a.discount) / 100
            : a.publicPrice;
          const priceB = b.discount
            ? b.publicPrice - (b.publicPrice * b.discount) / 100
            : b.publicPrice;
          return priceB - priceA;
        });
        break;
      case "popular":
        sorted.sort((a, b) => b.likes - a.likes);
        break;
      case "views":
        sorted.sort((a, b) => b.views - a.views);
        break;
    }

    setFilteredProducts(sorted);
  }, [products, filters, sortBy]);

  const handleFiltersChange = (newFilters: ProductFilter) => {
    setFilters(newFilters);
  };

  const handleClearFilters = () => {
    setFilters({});
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Productos</h1>
        <p className="text-gray-600">
          Descubre nuestra selección de bicicletas y patinetes de segunda mano
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Sidebar con filtros */}
        <div className="lg:w-80 flex-shrink-0">
          <ProductFilters
            filters={filters}
            onFiltersChange={handleFiltersChange}
            onClearFilters={handleClearFilters}
          />
        </div>

        {/* Contenido principal */}
        <div className="flex-1">
          {/* Ordenación */}
          <ProductSorting
            sortBy={sortBy}
            onSortChange={setSortBy}
            totalProducts={filteredProducts.length}
          />

          {/* Grid de productos */}
          <ProductGrid products={filteredProducts} loading={loading} />
        </div>
      </div>
    </div>
  );
}
