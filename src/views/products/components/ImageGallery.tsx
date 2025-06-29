"use client";

import { useState } from "react";
import Image from "next/image";

interface ImageGalleryProps {
  images: string[];
  alt: string;
}

export default function ImageGallery({ images, alt }: ImageGalleryProps) {
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [imageLoading, setImageLoading] = useState(true);
  const [imageError, setImageError] = useState(false);

  // Si no hay imágenes, mostrar placeholder
  if (!images || images.length === 0) {
    return (
      <div className="w-full">
        <div className="aspect-square bg-gray-200 dark:bg-gray-700 rounded-lg flex items-center justify-center">
          <div className="text-center">
            <svg
              className="mx-auto h-12 w-12 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
              Sin imágenes
            </p>
          </div>
        </div>
      </div>
    );
  }

  const handleImageLoad = () => {
    setImageLoading(false);
    setImageError(false);
  };

  const handleImageError = () => {
    setImageLoading(false);
    setImageError(true);
  };

  const goToPrevious = () => {
    setSelectedImageIndex((prev) =>
      prev === 0 ? images.length - 1 : prev - 1
    );
    setImageLoading(true);
  };

  const goToNext = () => {
    setSelectedImageIndex((prev) =>
      prev === images.length - 1 ? 0 : prev + 1
    );
    setImageLoading(true);
  };

  return (
    <div className="w-full">
      {/* Imagen principal */}
      <div className="relative aspect-square bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden mb-4">
        {imageLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-100 dark:bg-gray-800">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        )}

        {imageError ? (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-100 dark:bg-gray-800">
            <div className="text-center">
              <svg
                className="mx-auto h-12 w-12 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                Error al cargar imagen
              </p>
            </div>
          </div>
        ) : (
          <Image
            src={images[selectedImageIndex]}
            alt={`${alt} - Imagen ${selectedImageIndex + 1}`}
            fill
            className="object-cover"
            onLoad={handleImageLoad}
            onError={handleImageError}
            priority={selectedImageIndex === 0}
          />
        )}

        {/* Navegación - Solo mostrar si hay más de una imagen */}
        {images.length > 1 && (
          <>
            {/* Botón anterior */}
            <button
              onClick={goToPrevious}
              className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 hover:bg-opacity-75 text-white p-2 rounded-full transition-all duration-200"
              aria-label="Imagen anterior"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
            </button>

            {/* Botón siguiente */}
            <button
              onClick={goToNext}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 hover:bg-opacity-75 text-white p-2 rounded-full transition-all duration-200"
              aria-label="Imagen siguiente"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </button>

            {/* Indicador de posición */}
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-50 text-white px-3 py-1 rounded-full text-sm">
              {selectedImageIndex + 1} / {images.length}
            </div>
          </>
        )}
      </div>

      {/* Thumbnails - Solo mostrar si hay más de una imagen */}
      {images.length > 1 && (
        <div className="grid grid-cols-5 gap-2">
          {images.map((image, index) => (
            <button
              key={index}
              onClick={() => {
                setSelectedImageIndex(index);
                setImageLoading(true);
              }}
              className={`relative aspect-square rounded-lg overflow-hidden border-2 transition-all duration-200 ${
                index === selectedImageIndex
                  ? "border-blue-500 ring-2 ring-blue-200"
                  : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600"
              }`}
            >
              <Image
                src={image}
                alt={`${alt} - Miniatura ${index + 1}`}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 20vw, 10vw"
              />

              {/* Overlay para imagen seleccionada */}
              {index === selectedImageIndex && (
                <div className="absolute inset-0 bg-blue-500 bg-opacity-20"></div>
              )}
            </button>
          ))}
        </div>
      )}

      {/* Información adicional */}
      {images.length > 0 && (
        <div className="mt-4 text-center">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {images.length === 1 ? "1 imagen" : `${images.length} imágenes`}
          </p>
        </div>
      )}
    </div>
  );
}
