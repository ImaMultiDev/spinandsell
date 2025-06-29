import { v2 as cloudinary } from "cloudinary";

// Configurar Cloudinary
cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export { cloudinary };

// Tipos para los uploads
export interface CloudinaryUploadResult {
  public_id: string;
  secure_url: string;
  width: number;
  height: number;
  bytes: number;
  format: string;
}

// Configuraciones predefinidas para diferentes tipos de imágenes
export const uploadConfigs = {
  avatar: {
    folder: `${process.env.CLOUDINARY_FOLDER}/avatars`,
    transformation: [
      { width: 200, height: 200, crop: "fill", gravity: "face" },
      { quality: "auto:good", fetch_format: "auto" },
    ],
    allowed_formats: ["jpg", "png", "webp"],
    max_bytes: 2000000, // 2MB
  },
  product: {
    folder: `${process.env.CLOUDINARY_FOLDER}/products`,
    transformation: [
      { width: 800, height: 600, crop: "limit" },
      { quality: "auto:good", fetch_format: "auto" },
    ],
    allowed_formats: ["jpg", "png", "webp"],
    max_bytes: 5000000, // 5MB
  },
};

// Función para subir archivo
export async function uploadImage(
  file: File | Buffer | string,
  type: keyof typeof uploadConfigs,
  publicId?: string
): Promise<CloudinaryUploadResult> {
  const config = uploadConfigs[type];

  try {
    const result = await cloudinary.uploader.upload(file as string, {
      folder: config.folder,
      public_id: publicId,
      transformation: config.transformation,
      allowed_formats: config.allowed_formats,
      max_bytes: config.max_bytes,
      overwrite: true,
      invalidate: true,
    });

    return {
      public_id: result.public_id,
      secure_url: result.secure_url,
      width: result.width,
      height: result.height,
      bytes: result.bytes,
      format: result.format,
    };
  } catch (error) {
    console.error("Error uploading to Cloudinary:", error);
    throw new Error("Error al subir la imagen");
  }
}

// Función para eliminar imagen
export async function deleteImage(publicId: string): Promise<void> {
  try {
    await cloudinary.uploader.destroy(publicId);
  } catch (error) {
    console.error("Error deleting from Cloudinary:", error);
    throw new Error("Error al eliminar la imagen");
  }
}

// Función para generar URLs optimizadas
export function getOptimizedImageUrl(
  publicId: string,
  width?: number,
  height?: number,
  quality?: string
): string {
  if (!publicId) return "";

  const transformations = [];

  if (width || height) {
    transformations.push(`w_${width || "auto"},h_${height || "auto"},c_fill`);
  }

  if (quality) {
    transformations.push(`q_${quality}`);
  } else {
    transformations.push("q_auto:good");
  }

  transformations.push("f_auto");

  const transformationString = transformations.join(",");

  return `https://res.cloudinary.com/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload/${transformationString}/${publicId}`;
}
