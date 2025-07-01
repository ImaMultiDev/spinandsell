"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { toast } from "react-hot-toast";
import { Button } from "@/components/ui/Button";

interface Product {
  id: string;
  brand: string;
  model: string;
  year: number;
  publicPrice: number;
  images: string[];
  seller: {
    name: string;
    email: string;
  };
}

export default function CheckoutSuccessView() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);

  const sessionId = searchParams.get("session_id");
  const productId = searchParams.get("product_id");

  const fetchProductInfo = useCallback(async () => {
    // Validar que productId exista y no sea undefined/null
    if (!productId || productId === "undefined" || productId === "null") {
      console.error("ProductId inválido:", productId);
      toast.error("ID de producto inválido");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(`/api/products/${productId}`);
      if (response.ok) {
        const productData = await response.json();
        setProduct(productData);
      } else {
        throw new Error("Error al cargar producto");
      }
    } catch (error) {
      console.error("Error fetching product:", error);
      toast.error("Error al cargar información del producto");
    } finally {
      setLoading(false);
    }
  }, [productId]);

  useEffect(() => {
    if (!sessionId || !productId) {
      toast.error("Información de sesión inválida");
      router.push("/productos");
      return;
    }

    fetchProductInfo();
  }, [sessionId, productId, router, fetchProductInfo]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">
            Confirmando tu compra...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
          {/* Header de éxito */}
          <div className="bg-green-600 px-6 py-8 text-center">
            <div className="flex justify-center mb-4">
              <div className="rounded-full bg-green-500 p-3">
                <svg
                  className="h-8 w-8 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">
              ¡Compra Exitosa!
            </h1>
            <p className="text-green-100">
              Tu pago se ha procesado correctamente
            </p>
          </div>

          {/* Información del producto */}
          <div className="px-6 py-8">
            {product ? (
              <div className="space-y-6">
                {/* Producto comprado */}
                <div>
                  <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                    Producto Adquirido
                  </h2>
                  <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                    <div className="flex items-center space-x-4">
                      {product.images.length > 0 && (
                        <Image
                          src={product.images[0]}
                          alt={`${product.brand} ${product.model}`}
                          width={64}
                          height={64}
                          className="h-16 w-16 object-cover rounded-lg"
                        />
                      )}
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 dark:text-white">
                          {product.brand} {product.model} ({product.year})
                        </h3>
                        <p className="text-lg font-bold text-green-600">
                          €{product.publicPrice.toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Información del vendedor */}
                <div>
                  <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                    Vendedor
                  </h2>
                  <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                    <p className="font-medium text-gray-900 dark:text-white">
                      {product.seller.name}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {product.seller.email}
                    </p>
                  </div>
                </div>

                {/* Próximos pasos */}
                <div>
                  <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                    Próximos Pasos
                  </h2>
                  <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                    <ul className="space-y-2 text-sm text-blue-800 dark:text-blue-200">
                      <li className="flex items-start">
                        <span className="font-medium mr-2">1.</span>
                        <span>
                          Hemos enviado un email de confirmación a tu bandeja de
                          entrada
                        </span>
                      </li>
                      <li className="flex items-start">
                        <span className="font-medium mr-2">2.</span>
                        <span>
                          El vendedor será notificado de la compra y se pondrá
                          en contacto contigo
                        </span>
                      </li>
                      <li className="flex items-start">
                        <span className="font-medium mr-2">3.</span>
                        <span>
                          Puedes contactar directamente con el vendedor a través
                          de nuestro sistema de mensajes
                        </span>
                      </li>
                    </ul>
                  </div>
                </div>

                {/* Información de sesión */}
                <div className="text-sm text-gray-500 dark:text-gray-400 border-t border-gray-200 dark:border-gray-700 pt-4">
                  <p>ID de transacción: {sessionId}</p>
                  <p>Fecha: {new Date().toLocaleDateString("es-ES")}</p>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500 dark:text-gray-400">
                  No se pudo cargar la información del producto
                </p>
              </div>
            )}

            {/* Botones de acción */}
            <div className="flex flex-col sm:flex-row gap-4 mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
              <Link href="/mensajes" className="flex-1">
                <Button className="w-full bg-blue-600 hover:bg-blue-700">
                  <svg
                    className="w-5 h-5 mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                    />
                  </svg>
                  Contactar Vendedor
                </Button>
              </Link>

              <Link href="/productos" className="flex-1">
                <Button variant="outline" className="w-full">
                  Seguir Comprando
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Información adicional */}
        <div className="mt-8 text-center">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            ¿Tienes algún problema con tu compra?{" "}
            <Link
              href="/contacto"
              className="text-blue-600 hover:text-blue-500"
            >
              Contacta con soporte
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
