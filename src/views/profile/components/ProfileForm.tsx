"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { toast } from "react-hot-toast";
import { Button } from "@/components/ui/Button";
import { profileSchema, type ProfileFormData } from "@/lib/validations/profile";

export default function ProfileForm() {
  const { data: session, update } = useSession();
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [formData, setFormData] = useState<ProfileFormData>({
    name: "",
    email: "",
    phone: "",
    bio: "",
    location: "",
  });
  const [errors, setErrors] = useState<Partial<ProfileFormData>>({});

  // Cargar datos del usuario cuando la sesión esté disponible
  useEffect(() => {
    const loadUserData = async () => {
      if (session?.user?.email) {
        try {
          const response = await fetch("/api/profile");
          if (response.ok) {
            const userData = await response.json();
            setFormData({
              name: userData.name || "",
              email: userData.email || "",
              phone: userData.phone || "",
              bio: userData.bio || "",
              location: userData.location || "",
            });
          } else {
            // Si falla la carga, usar datos de la sesión
            setFormData({
              name: session.user.name || "",
              email: session.user.email || "",
              phone: "",
              bio: "",
              location: "",
            });
          }
        } catch {
          // Si hay error, usar datos de la sesión
          setFormData({
            name: session.user.name || "",
            email: session.user.email || "",
            phone: "",
            bio: "",
            location: "",
          });
        } finally {
          setIsLoadingData(false);
        }
      }
    };

    loadUserData();
  }, [session]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrors({});

    try {
      // Validar datos
      const validatedData = profileSchema.parse(formData);

      // Actualizar perfil
      const response = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(validatedData),
      });

      if (response.ok) {
        const updatedUser = await response.json();

        // Actualizar sesión
        await update({
          name: updatedUser.name,
          email: updatedUser.email,
        });

        toast.success("Perfil actualizado exitosamente");
      } else {
        const error = await response.json();
        toast.error(error.message || "Error al actualizar perfil");
      }
    } catch (error) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      if ((error as any).errors) {
        // Errores de validación de Zod
        const fieldErrors: Partial<ProfileFormData> = {};
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (error as any).errors.forEach((err: any) => {
          if (err.path[0]) {
            fieldErrors[err.path[0] as keyof ProfileFormData] = err.message;
          }
        });
        setErrors(fieldErrors);
      } else {
        toast.error("Error al actualizar perfil");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Limpiar error del campo cuando el usuario empiece a escribir
    if (errors[name as keyof ProfileFormData]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  if (isLoadingData) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
          Información Personal
        </h2>
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
          <span className="ml-3 text-gray-600 dark:text-gray-400">
            Cargando información...
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
      <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
        Información Personal
      </h2>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Nombre */}
          <div>
            <label
              htmlFor="name"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
            >
              Nombre completo *
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 dark:bg-gray-700 dark:text-white ${
                errors.name
                  ? "border-red-500 focus:border-red-500"
                  : "border-gray-300 dark:border-gray-600 focus:border-green-500"
              }`}
              placeholder="Tu nombre completo"
            />
            {errors.name && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                {errors.name}
              </p>
            )}
          </div>

          {/* Email */}
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
            >
              Correo electrónico *
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 dark:bg-gray-700 dark:text-white ${
                errors.email
                  ? "border-red-500 focus:border-red-500"
                  : "border-gray-300 dark:border-gray-600 focus:border-green-500"
              }`}
              placeholder="tu@email.com"
            />
            {errors.email && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                {errors.email}
              </p>
            )}
          </div>

          {/* Teléfono */}
          <div>
            <label
              htmlFor="phone"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
            >
              Teléfono
            </label>
            <input
              type="tel"
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 dark:bg-gray-700 dark:text-white"
              placeholder="+34 123 456 789"
            />
          </div>

          {/* Ubicación */}
          <div>
            <label
              htmlFor="location"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
            >
              Ubicación
            </label>
            <input
              type="text"
              id="location"
              name="location"
              value={formData.location}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 dark:bg-gray-700 dark:text-white"
              placeholder="Madrid, España"
            />
          </div>
        </div>

        {/* Biografía */}
        <div>
          <label
            htmlFor="bio"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
          >
            Biografía
          </label>
          <textarea
            id="bio"
            name="bio"
            rows={4}
            value={formData.bio}
            onChange={handleChange}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 dark:bg-gray-700 dark:text-white ${
              errors.bio
                ? "border-red-500 focus:border-red-500"
                : "border-gray-300 dark:border-gray-600 focus:border-green-500"
            }`}
            placeholder="Cuéntanos un poco sobre ti..."
          />
          {errors.bio && (
            <p className="mt-1 text-sm text-red-600 dark:text-red-400">
              {errors.bio}
            </p>
          )}
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            {formData.bio?.length || 0}/500 caracteres
          </p>
        </div>

        {/* Botón de guardar */}
        <div className="flex justify-end">
          <Button type="submit" disabled={isLoading} className="px-6 py-2">
            {isLoading ? "Guardando..." : "Guardar cambios"}
          </Button>
        </div>
      </form>
    </div>
  );
}
