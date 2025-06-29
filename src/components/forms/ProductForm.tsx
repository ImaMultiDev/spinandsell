"use client";

import { useState } from "react";
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

export default function ProductForm() {
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
        toast.success("Producto creado exitosamente");
        // Reset form or redirect
        setFormData({
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

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
          Crear Nuevo Producto
        </h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Información básica */}
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
              />
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
                value={formData.publicPrice}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    publicPrice: parseFloat(e.target.value),
                  }))
                }
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                placeholder="0.00"
              />
            </div>
          </div>

          {/* Descripción */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Descripción *
            </label>
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
              placeholder="Describe el estado, características especiales, accesorios incluidos..."
            />
          </div>

          {/* Upload de imágenes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-4">
              Imágenes del Producto *
            </label>
            <ProductImageUpload
              images={formData.images}
              onChange={handleImagesChange}
              maxImages={5}
              disabled={isLoading}
            />
          </div>

          {/* Botones */}
          <div className="flex justify-end space-x-4 pt-6">
            <Button type="button" variant="outline" disabled={isLoading}>
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isLoading || formData.images.length === 0}
            >
              {isLoading ? "Creando..." : "Crear Producto"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
