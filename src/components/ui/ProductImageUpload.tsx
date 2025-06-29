"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import { toast } from "react-hot-toast";
import { Button } from "@/components/ui/Button";
import { CloudinaryUploadResult } from "@/lib/cloudinary";

interface ProductImageUploadProps {
  images?: string[];
  onChange: (images: string[], publicIds: string[]) => void;
  maxImages?: number;
  disabled?: boolean;
}

export default function ProductImageUpload({
  images = [],
  onChange,
  maxImages = 5,
  disabled = false,
}: ProductImageUploadProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [previews, setPreviews] = useState<{ file: File; url: string }[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);

    if (files.length === 0) return;

    // Verificar límite total
    const totalImages = images.length + previews.length + files.length;
    if (totalImages > maxImages) {
      toast.error(`Máximo ${maxImages} imágenes permitidas`);
      return;
    }

    // Validar cada archivo
    const validFiles: { file: File; url: string }[] = [];

    for (const file of files) {
      // Validar tamaño
      if (file.size > 5 * 1024 * 1024) {
        toast.error(`${file.name}: debe ser menor a 5MB`);
        continue;
      }

      // Validar tipo
      if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
        toast.error(`${file.name}: solo se permiten JPG, PNG o WebP`);
        continue;
      }

      // Crear preview
      const url = URL.createObjectURL(file);
      validFiles.push({ file, url });
    }

    setPreviews((prev) => [...prev, ...validFiles]);

    // Limpiar input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleUpload = async () => {
    if (previews.length === 0) {
      toast.error("Selecciona imágenes primero");
      return;
    }

    setIsLoading(true);

    try {
      const uploadedImages: string[] = [];
      const uploadedPublicIds: string[] = [];

      // Subir cada imagen
      for (const preview of previews) {
        const formData = new FormData();
        formData.append("image", preview.file);
        formData.append("type", "product");

        const response = await fetch("/api/upload/image", {
          method: "POST",
          body: formData,
        });

        if (response.ok) {
          const result: CloudinaryUploadResult = await response.json();
          uploadedImages.push(result.secure_url);
          uploadedPublicIds.push(result.public_id);
        } else {
          const error = await response.json();
          toast.error(error.message || `Error subiendo ${preview.file.name}`);
        }
      }

      if (uploadedImages.length > 0) {
        // Combinar con imágenes existentes
        const allImages = [...images, ...uploadedImages];
        const allPublicIds = [...images.map(() => ""), ...uploadedPublicIds]; // TODO: manejar public_ids existentes

        onChange(allImages, allPublicIds);

        // Limpiar previews
        previews.forEach((preview) => URL.revokeObjectURL(preview.url));
        setPreviews([]);

        toast.success(
          `${uploadedImages.length} imagen(es) subida(s) exitosamente`
        );
      }
    } catch (error) {
      console.error("Error uploading images:", error);
      toast.error("Error al subir imágenes");
    } finally {
      setIsLoading(false);
    }
  };

  const removePreview = (index: number) => {
    const preview = previews[index];
    URL.revokeObjectURL(preview.url);
    setPreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const removeExistingImage = (index: number) => {
    const newImages = images.filter((_, i) => i !== index);
    const newPublicIds = Array(newImages.length).fill(""); // TODO: manejar public_ids correctamente
    onChange(newImages, newPublicIds);
  };

  const canAddMore = images.length + previews.length < maxImages;

  return (
    <div className="space-y-4">
      {/* Imágenes existentes */}
      {images.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          {images.map((image, index) => (
            <div key={`existing-${index}`} className="relative group">
              <div className="aspect-square bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden">
                <Image
                  src={image}
                  alt={`Producto ${index + 1}`}
                  width={200}
                  height={200}
                  className="w-full h-full object-cover"
                />
              </div>

              {!disabled && (
                <button
                  type="button"
                  onClick={() => removeExistingImage(index)}
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  ×
                </button>
              )}

              {index === 0 && (
                <div className="absolute bottom-2 left-2 bg-blue-500 text-white text-xs px-2 py-1 rounded">
                  Principal
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Previews de nuevas imágenes */}
      {previews.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          {previews.map((preview, index) => (
            <div key={`preview-${index}`} className="relative group">
              <div className="aspect-square bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden">
                <Image
                  src={preview.url}
                  alt={`Preview ${index + 1}`}
                  width={200}
                  height={200}
                  className="w-full h-full object-cover"
                />
              </div>

              <button
                type="button"
                onClick={() => removePreview(index)}
                disabled={isLoading}
                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm opacity-0 group-hover:opacity-100 transition-opacity"
              >
                ×
              </button>

              <div className="absolute bottom-2 left-2 bg-orange-500 text-white text-xs px-2 py-1 rounded">
                Nuevo
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Input de archivos oculto */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        onChange={handleFileSelect}
        className="hidden"
        disabled={disabled || isLoading}
      />

      {/* Controles */}
      <div className="flex flex-wrap gap-3">
        {canAddMore && !disabled && (
          <Button
            type="button"
            variant="outline"
            onClick={() => fileInputRef.current?.click()}
            disabled={isLoading}
          >
            <svg
              className="w-4 h-4 mr-2"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
              />
            </svg>
            Añadir imágenes ({images.length + previews.length}/{maxImages})
          </Button>
        )}

        {previews.length > 0 && (
          <Button type="button" onClick={handleUpload} disabled={isLoading}>
            {isLoading ? "Subiendo..." : `Subir ${previews.length} imagen(es)`}
          </Button>
        )}

        {previews.length > 0 && (
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              previews.forEach((preview) => URL.revokeObjectURL(preview.url));
              setPreviews([]);
            }}
            disabled={isLoading}
          >
            Cancelar
          </Button>
        )}
      </div>

      {/* Información */}
      <div className="text-sm text-gray-500 dark:text-gray-400">
        <p>• Formatos: JPG, PNG, WebP • Máximo: 5MB por imagen</p>
        <p>• La primera imagen será la principal del producto</p>
        <p>• Máximo {maxImages} imágenes por producto</p>
      </div>
    </div>
  );
}
