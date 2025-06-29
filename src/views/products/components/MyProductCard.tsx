"use client";

import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/Button";

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

interface MyProductCardProps {
  product: Product;
  onEdit: (productId: string) => void;
  onDelete: (productId: string) => void;
  onToggleStatus: (productId: string, sold: boolean) => void;
}

export default function MyProductCard({
  product,
  onEdit,
  onDelete,
  onToggleStatus,
}: MyProductCardProps) {
  const conditionLabels = {
    A: "Excelente",
    B: "Bueno",
    C: "Aceptable",
  };

  const categoryLabels = {
    ROAD_BIKE: "Bicicleta de Carretera",
    MOUNTAIN_BIKE: "Bicicleta de Montaña",
    SPINNING_BIKE: "Bicicleta de Spinning",
    ELECTRIC_BIKE: "Bicicleta Eléctrica",
    ELECTRIC_SCOOTER: "Patinete Eléctrico",
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow hover:shadow-lg transition-shadow duration-200">
      {/* Imagen del producto */}
      <div className="relative aspect-video bg-gray-200 dark:bg-gray-700 rounded-t-lg overflow-hidden">
        <Image
          src="/placeholder-product.jpg"
          alt={`${product.brand} ${product.model}`}
          fill
          className="object-cover"
        />

        {/* Estado del producto */}
        <div className="absolute top-2 left-2">
          <span
            className={`px-2 py-1 text-xs font-medium rounded-full ${
              product.sold
                ? "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                : "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
            }`}
          >
            {product.sold ? "Vendido" : "Disponible"}
          </span>
        </div>

        {/* Estadísticas */}
        <div className="absolute top-2 right-2 flex space-x-2">
          <div className="flex items-center bg-black bg-opacity-50 text-white px-2 py-1 rounded text-xs">
            <svg
              className="w-3 h-3 mr-1"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
              <path
                fillRule="evenodd"
                d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z"
                clipRule="evenodd"
              />
            </svg>
            {product.views}
          </div>
          <div className="flex items-center bg-black bg-opacity-50 text-white px-2 py-1 rounded text-xs">
            <svg
              className="w-3 h-3 mr-1"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z"
                clipRule="evenodd"
              />
            </svg>
            {product.likes}
          </div>
        </div>
      </div>

      {/* Contenido */}
      <div className="p-4">
        <div className="flex justify-between items-start mb-2">
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white">
              {product.brand} {product.model}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {product.year} •{" "}
              {categoryLabels[product.category as keyof typeof categoryLabels]}
            </p>
          </div>
          <div className="text-right">
            <p className="text-lg font-bold text-green-600 dark:text-green-400">
              €{product.publicPrice.toLocaleString()}
            </p>
            <p className="text-sm text-gray-500">
              Estado:{" "}
              {
                conditionLabels[
                  product.condition as keyof typeof conditionLabels
                ]
              }
            </p>
          </div>
        </div>

        <div className="text-xs text-gray-500 dark:text-gray-400 mb-4">
          Publicado: {new Date(product.createdAt).toLocaleDateString("es-ES")}
        </div>

        {/* Acciones */}
        <div className="flex flex-wrap gap-2">
          <Link href={`/producto/${product.id}`}>
            <Button variant="outline" size="sm">
              <svg
                className="w-4 h-4 mr-1"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
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
              Ver
            </Button>
          </Link>

          <Button
            variant="outline"
            size="sm"
            onClick={() => onEdit(product.id)}
          >
            <svg
              className="w-4 h-4 mr-1"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
              />
            </svg>
            Editar
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => onToggleStatus(product.id, !product.sold)}
          >
            {product.sold ? (
              <>
                <svg
                  className="w-4 h-4 mr-1"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                  />
                </svg>
                Republicar
              </>
            ) : (
              <>
                <svg
                  className="w-4 h-4 mr-1"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
                Marcar Vendido
              </>
            )}
          </Button>

          <Button
            variant="destructive"
            size="sm"
            onClick={() => onDelete(product.id)}
          >
            <svg
              className="w-4 h-4 mr-1"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
              />
            </svg>
            Eliminar
          </Button>
        </div>
      </div>
    </div>
  );
}
