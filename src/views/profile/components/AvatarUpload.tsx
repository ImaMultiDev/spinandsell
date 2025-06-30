"use client";

import { useState, useRef } from "react";
import { useSession } from "next-auth/react";
import Image from "next/image";
import { toast } from "react-hot-toast";
import { Button } from "@/components/ui/Button";

export default function AvatarUpload() {
  const { data: session, update } = useSession();
  const [isLoading, setIsLoading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validaciones
    if (file.size > 2 * 1024 * 1024) {
      toast.error("El archivo debe ser menor a 2MB");
      return;
    }

    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      toast.error("Solo se permiten archivos JPG, PNG o WebP");
      return;
    }

    // Crear preview
    const reader = new FileReader();
    reader.onload = () => {
      setPreviewUrl(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleUpload = async () => {
    if (!fileInputRef.current?.files?.[0]) {
      toast.error("Selecciona un archivo primero");
      return;
    }

    setIsLoading(true);

    try {
      const file = fileInputRef.current.files[0];
      const formData = new FormData();
      formData.append("avatar", file);

      const response = await fetch("/api/profile/avatar", {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        await response.json();

        // Actualizar sesión con nueva imagen (forzar refresh completo)
        await update();

        // Recargar la página para asegurar que se actualice el avatar en todos lados
        window.location.reload();

        toast.success("Avatar actualizado exitosamente");
      } else {
        const error = await response.json();
        toast.error(error.message || "Error al subir avatar");
      }
    } catch {
      toast.error("Error al subir avatar");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveAvatar = async () => {
    setIsLoading(true);

    try {
      const response = await fetch("/api/profile/avatar", {
        method: "DELETE",
      });

      if (response.ok) {
        // Actualizar sesión sin imagen
        await update({ image: null });
        toast.success("Avatar eliminado exitosamente");
      } else {
        const error = await response.json();
        toast.error(error.message || "Error al eliminar avatar");
      }
    } catch {
      toast.error("Error al eliminar avatar");
    } finally {
      setIsLoading(false);
    }
  };

  const cancelPreview = () => {
    setPreviewUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const currentAvatar = previewUrl || session?.user?.image;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
      <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
        Foto de Perfil
      </h2>

      <div className="flex flex-col items-center space-y-6">
        {/* Avatar actual */}
        <div className="relative">
          <div className="w-32 h-32 rounded-full overflow-hidden bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
            {currentAvatar ? (
              <Image
                src={currentAvatar}
                alt="Avatar"
                width={128}
                height={128}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="text-4xl font-bold text-gray-400 dark:text-gray-500">
                {session?.user?.name?.charAt(0).toUpperCase() || "U"}
              </div>
            )}
          </div>

          {/* Indicador de preview */}
          {previewUrl && (
            <div className="absolute -top-2 -right-2 bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs">
              !
            </div>
          )}
        </div>

        {/* Input de archivo oculto */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          className="hidden"
        />

        {/* Acciones */}
        <div className="flex flex-col sm:flex-row gap-3">
          {!previewUrl ? (
            <>
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
                Subir nueva foto
              </Button>

              {session?.user?.image && (
                <Button
                  type="button"
                  variant="destructive"
                  onClick={handleRemoveAvatar}
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
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                    />
                  </svg>
                  Eliminar foto
                </Button>
              )}
            </>
          ) : (
            <>
              <Button type="button" onClick={handleUpload} disabled={isLoading}>
                {isLoading ? "Subiendo..." : "Confirmar cambio"}
              </Button>

              <Button
                type="button"
                variant="outline"
                onClick={cancelPreview}
                disabled={isLoading}
              >
                Cancelar
              </Button>
            </>
          )}
        </div>

        {/* Información sobre restricciones */}
        <div className="text-center">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Formatos soportados: JPG, PNG, WebP
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Tamaño máximo: 2MB • Optimización automática
          </p>
        </div>
      </div>
    </div>
  );
}
