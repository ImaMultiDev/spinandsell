"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import { Button } from "@/components/ui/Button";
import ProductImageUpload from "@/components/ui/ProductImageUpload";

interface ProductFormData {
  brand: string;
  model: string;
  year: number;
  condition: "A" | "B" | "C";
  category: string;
  description: string;
  publicPrice: number;
  location?: string;
  images: string[];
  imagePublicIds: string[];
}

const categories = [
  { value: "ROAD_BIKE", label: "Bicicleta de Carretera" },
  { value: "MOUNTAIN_BIKE", label: "Bicicleta de Montaña" },
  { value: "ELECTRIC_BIKE", label: "Bicicleta Eléctrica" },
  { value: "SPINNING_BIKE", label: "Bicicleta de Spinning" },
  { value: "ELECTRIC_SCOOTER", label: "Patinete Eléctrico" },
];

const conditions = [
  {
    value: "A",
    label: "Como Nuevo",
    description: "Excelente estado, muy poco uso",
  },
  {
    value: "B",
    label: "Buen Estado",
    description: "Uso normal, pequeños detalles",
  },
  {
    value: "C",
    label: "Estado Aceptable",
    description: "Uso evidente, funciona bien",
  },
];

export default function ProductForm() {
  const router = useRouter();
  const [formData, setFormData] = useState<ProductFormData>({
    brand: "",
    model: "",
    year: new Date().getFullYear(),
    condition: "A",
    category: "",
    description: "",
    publicPrice: 0,
    location: "",
    images: [],
    imagePublicIds: [],
  });

  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.images.length === 0) {
      toast.error("Debes añadir al menos una imagen del producto");
      return;
    }

    if (!formData.category) {
      toast.error("Selecciona una categoría");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch("/api/products", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        await response.json();

        toast.success("¡Producto publicado exitosamente!");

        // Redirigir a "mis productos" después de 1 segundo
        setTimeout(() => {
          router.push("/mis-productos");
        }, 1500);
      } else {
        const error = await response.json();
        toast.error(error.message || "Error al crear producto");
      }
    } catch (error) {
      console.error("Error creating product:", error);
      toast.error("Error al crear producto");
    } finally {
      setIsLoading(false);
    }
  };

  const handleImagesChange = (images: string[], publicIds: string[]) => {
    setFormData((prev) => ({
      ...prev,
      images,
      imagePublicIds: publicIds,
    }));
  };

  const handleCancel = () => {
    router.push("/productos");
  };

  return (
    <div className="p-6">
      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Información básica */}
        <div>
          <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
            Información del Producto
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Marca *
              </label>
              <input
                type="text"
                required
                value={formData.brand}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, brand: e.target.value }))
                }
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                placeholder="Ej: Trek, Giant, Xiaomi..."
                disabled={isLoading}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Modelo *
              </label>
              <input
                type="text"
                required
                value={formData.model}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, model: e.target.value }))
                }
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                placeholder="Ej: Domane SL5, Mi Scooter Pro..."
                disabled={isLoading}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Categoría *
              </label>
              <select
                required
                value={formData.category}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, category: e.target.value }))
                }
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                disabled={isLoading}
              >
                <option value="">Selecciona una categoría</option>
                {categories.map((category) => (
                  <option key={category.value} value={category.value}>
                    {category.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Año *
              </label>
              <input
                type="number"
                required
                min="1990"
                max={new Date().getFullYear() + 1}
                value={formData.year}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    year: parseInt(e.target.value),
                  }))
                }
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                disabled={isLoading}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Precio (€) *
              </label>
              <input
                type="number"
                required
                min="0"
                step="0.01"
                value={formData.publicPrice || ""}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    publicPrice: parseFloat(e.target.value) || 0,
                  }))
                }
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                placeholder="0.00"
                disabled={isLoading}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Ubicación (opcional)
              </label>
              <input
                type="text"
                value={formData.location || ""}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, location: e.target.value }))
                }
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                placeholder="Ej: Madrid, Barcelona..."
                disabled={isLoading}
              />
            </div>
          </div>
        </div>

        {/* Estado del producto */}
        <div>
          <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
            Estado del Producto
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {conditions.map((condition) => (
              <label
                key={condition.value}
                className={`relative flex cursor-pointer rounded-lg border p-4 focus:outline-none ${
                  formData.condition === condition.value
                    ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                    : "border-gray-300 dark:border-gray-600"
                } ${isLoading ? "opacity-50 cursor-not-allowed" : ""}`}
              >
                <input
                  type="radio"
                  name="condition"
                  value={condition.value}
                  checked={formData.condition === condition.value}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      condition: e.target.value as "A" | "B" | "C",
                    }))
                  }
                  className="sr-only"
                  disabled={isLoading}
                />
                <div className="flex w-full items-center justify-between">
                  <div className="flex items-center">
                    <div className="text-sm">
                      <p className="font-medium text-gray-900 dark:text-white">
                        {condition.label}
                      </p>
                      <div className="text-gray-500 dark:text-gray-400">
                        <p className="sm:inline">{condition.description}</p>
                      </div>
                    </div>
                  </div>
                  {formData.condition === condition.value && (
                    <svg
                      className="h-5 w-5 text-blue-600"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                  )}
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* Descripción */}
        <div>
          <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
            Descripción Detallada
          </h2>
          <div>
            <textarea
              required
              rows={4}
              value={formData.description}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  description: e.target.value,
                }))
              }
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
              placeholder="Describe el estado, características especiales, accesorios incluidos, historial de uso, etc."
              disabled={isLoading}
            />
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
              Una descripción detallada ayuda a los compradores a tomar la
              decisión.
            </p>
          </div>
        </div>

        {/* Upload de imágenes */}
        <div>
          <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
            Imágenes del Producto *
          </h2>
          <ProductImageUpload
            images={formData.images}
            onChange={handleImagesChange}
            maxImages={5}
            disabled={isLoading}
          />
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
            Añade hasta 5 imágenes. La primera imagen será la principal que se
            muestre en los listados.
          </p>
        </div>

        {/* Botones */}
        <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200 dark:border-gray-700">
          <Button
            type="button"
            variant="outline"
            disabled={isLoading}
            onClick={handleCancel}
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            disabled={
              isLoading || formData.images.length === 0 || !formData.category
            }
          >
            {isLoading ? (
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
                Publicando...
              </>
            ) : (
              "Publicar Producto"
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
