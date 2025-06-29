"use client";

import { useState } from "react";
import { ProductFilter } from "@/types";
import { ProductCategory, ProductCondition } from "@prisma/client";
import { PRODUCT_CATEGORIES, PRODUCT_CONDITIONS } from "@/types";
import { Button } from "@/components/ui/Button";

interface ProductFiltersProps {
  filters: ProductFilter;
  onFiltersChange: (filters: ProductFilter) => void;
  onClearFilters: () => void;
}

export default function ProductFilters({
  filters,
  onFiltersChange,
  onClearFilters,
}: ProductFiltersProps) {
  const [isOpen, setIsOpen] = useState(false);

  const updateFilter = (
    key: keyof ProductFilter,
    value: string | number | ProductCategory | ProductCondition | undefined
  ) => {
    onFiltersChange({
      ...filters,
      [key]: value,
    });
  };

  const hasActiveFilters = Object.values(filters).some(
    (value) => value !== undefined && value !== "" && value !== null
  );

  return (
    <div className="bg-white rounded-lg border p-4 mb-6">
      {/* Header móvil */}
      <div className="flex justify-between items-center md:hidden mb-4">
        <h3 className="font-semibold">Filtros</h3>
        <Button variant="outline" size="sm" onClick={() => setIsOpen(!isOpen)}>
          {isOpen ? "Ocultar" : "Mostrar"}
        </Button>
      </div>

      {/* Filtros */}
      <div className={`space-y-4 ${isOpen ? "block" : "hidden md:block"}`}>
        {/* Búsqueda */}
        <div>
          <label className="block text-sm font-medium mb-2">Buscar</label>
          <input
            type="text"
            placeholder="Marca, modelo, descripción..."
            value={filters.search || ""}
            onChange={(e) => updateFilter("search", e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
          />
        </div>

        {/* Categoría */}
        <div>
          <label className="block text-sm font-medium mb-2">Categoría</label>
          <select
            value={filters.category || ""}
            onChange={(e) =>
              updateFilter(
                "category",
                (e.target.value as ProductCategory) || undefined
              )
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
          >
            <option value="">Todas las categorías</option>
            {Object.entries(PRODUCT_CATEGORIES).map(([key, value]) => (
              <option key={key} value={key}>
                {value}
              </option>
            ))}
          </select>
        </div>

        {/* Estado */}
        <div>
          <label className="block text-sm font-medium mb-2">Estado</label>
          <select
            value={filters.condition || ""}
            onChange={(e) =>
              updateFilter(
                "condition",
                (e.target.value as ProductCondition) || undefined
              )
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
          >
            <option value="">Todos los estados</option>
            {Object.entries(PRODUCT_CONDITIONS).map(([key, value]) => (
              <option key={key} value={key}>
                {value}
              </option>
            ))}
          </select>
        </div>

        {/* Marca */}
        <div>
          <label className="block text-sm font-medium mb-2">Marca</label>
          <input
            type="text"
            placeholder="Ej: Trek, Giant, Specialized..."
            value={filters.brand || ""}
            onChange={(e) => updateFilter("brand", e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
          />
        </div>

        {/* Rango de precios */}
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="block text-sm font-medium mb-2">
              Precio mín.
            </label>
            <input
              type="number"
              placeholder="€0"
              value={filters.minPrice || ""}
              onChange={(e) =>
                updateFilter(
                  "minPrice",
                  e.target.value ? Number(e.target.value) : undefined
                )
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">
              Precio máx.
            </label>
            <input
              type="number"
              placeholder="€9999"
              value={filters.maxPrice || ""}
              onChange={(e) =>
                updateFilter(
                  "maxPrice",
                  e.target.value ? Number(e.target.value) : undefined
                )
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>
        </div>

        {/* Limpiar filtros */}
        {hasActiveFilters && (
          <Button
            variant="outline"
            size="sm"
            onClick={onClearFilters}
            className="w-full"
          >
            Limpiar filtros
          </Button>
        )}
      </div>
    </div>
  );
}
