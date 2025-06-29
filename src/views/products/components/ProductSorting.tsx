"use client";

interface ProductSortingProps {
  sortBy: string;
  onSortChange: (sortBy: string) => void;
  totalProducts: number;
}

export default function ProductSorting({
  sortBy,
  onSortChange,
  totalProducts,
}: ProductSortingProps) {
  const sortOptions = [
    { value: "newest", label: "Más recientes" },
    { value: "oldest", label: "Más antiguos" },
    { value: "price-asc", label: "Precio: menor a mayor" },
    { value: "price-desc", label: "Precio: mayor a menor" },
    { value: "popular", label: "Más populares" },
    { value: "views", label: "Más vistos" },
  ];

  return (
    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
      {/* Contador de productos */}
      <div className="text-gray-600">
        <span className="font-medium">{totalProducts}</span> producto
        {totalProducts !== 1 ? "s" : ""} encontrado
        {totalProducts !== 1 ? "s" : ""}
      </div>

      {/* Selector de ordenación */}
      <div className="flex items-center gap-2">
        <span className="text-sm text-gray-600 whitespace-nowrap">
          Ordenar por:
        </span>
        <select
          value={sortBy}
          onChange={(e) => onSortChange(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
        >
          {sortOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
