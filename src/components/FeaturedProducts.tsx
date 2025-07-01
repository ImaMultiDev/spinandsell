"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Product } from "@/types";
import { PRODUCT_CATEGORIES, PRODUCT_CONDITIONS } from "@/types";

export default function FeaturedProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFeaturedProducts = async () => {
      try {
        const response = await fetch("/api/products?sortBy=popular&limit=4");
        if (response.ok) {
          const data = await response.json();
          setProducts(data.products);
        }
      } catch (error) {
        console.error("Error fetching featured products:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchFeaturedProducts();
  }, []);

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="bg-white rounded-lg border overflow-hidden animate-pulse"
          >
            <div className="h-48 bg-gray-200"></div>
            <div className="p-4">
              <div className="h-4 bg-gray-200 rounded mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-6 bg-gray-200 rounded w-1/4"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">No hay productos destacados disponibles</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {products.map((product) => (
        <Link
          key={product.id}
          href={`/producto/${product.id}`}
          className="bg-white rounded-lg border hover:shadow-lg transition-shadow overflow-hidden group"
        >
          <div className="relative h-48">
            {product.images && product.images.length > 0 ? (
              <Image
                src={product.images[0]}
                alt={`${product.brand} ${product.model}`}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-300"
              />
            ) : (
              <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                <svg
                  className="w-12 h-12 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
              </div>
            )}

            {/* Badge de estado */}
            <div className="absolute top-2 right-2">
              <span className="bg-green-500 text-white px-2 py-1 rounded text-xs">
                {PRODUCT_CONDITIONS[
                  product.condition as keyof typeof PRODUCT_CONDITIONS
                ]?.split(" - ")[0] || "Estado A"}
              </span>
            </div>

            {/* Badge de popularidad */}
            <div className="absolute top-2 left-2">
              <span className="bg-yellow-500 text-white px-2 py-1 rounded text-xs font-medium">
                ⭐ Destacado
              </span>
            </div>
          </div>

          <div className="p-4">
            <h3 className="font-semibold mb-2 text-gray-900 group-hover:text-green-600 transition-colors">
              {product.brand} {product.model} ({product.year})
            </h3>

            <p className="text-sm text-gray-600 mb-2">
              {
                PRODUCT_CATEGORIES[
                  product.category as keyof typeof PRODUCT_CATEGORIES
                ]
              }
            </p>

            <div className="flex justify-between items-center">
              <div className="text-2xl font-bold text-green-600">
                €{product.publicPrice.toLocaleString()}
              </div>

              <div className="flex items-center space-x-2 text-xs text-gray-500">
                <span className="flex items-center">👁️ {product.views}</span>
                <span className="flex items-center">❤️ {product.likes}</span>
              </div>
            </div>

            {product.location && (
              <p className="text-xs text-gray-500 mt-2">
                📍 {product.location}
              </p>
            )}
          </div>
        </Link>
      ))}
    </div>
  );
}
