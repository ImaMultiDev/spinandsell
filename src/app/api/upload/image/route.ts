import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { uploadImage } from "@/lib/cloudinary";

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ message: "No autorizado" }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get("image") as File;
    const type = formData.get("type") as string;

    if (!file) {
      return NextResponse.json(
        { message: "No se encontró archivo" },
        { status: 400 }
      );
    }

    if (!type || !["avatar", "product"].includes(type)) {
      return NextResponse.json(
        { message: "Tipo de imagen no válido" },
        { status: 400 }
      );
    }

    // Validaciones según el tipo
    const maxSize = type === "avatar" ? 2 * 1024 * 1024 : 5 * 1024 * 1024;
    const maxSizeText = type === "avatar" ? "2MB" : "5MB";

    if (file.size > maxSize) {
      return NextResponse.json(
        { message: `El archivo debe ser menor a ${maxSizeText}` },
        { status: 400 }
      );
    }

    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      return NextResponse.json(
        { message: "Solo se permiten archivos JPG, PNG o WebP" },
        { status: 400 }
      );
    }

    // Convertir archivo a base64 para Cloudinary
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const base64String = `data:${file.type};base64,${buffer.toString("base64")}`;

    // Generar public_id único
    const timestamp = Date.now();
    const randomId = Math.random().toString(36).substring(2);
    const publicId = `${type}-${timestamp}-${randomId}`;

    // Subir a Cloudinary
    const cloudinaryResult = await uploadImage(
      base64String,
      type as "avatar" | "product",
      publicId
    );

    return NextResponse.json(cloudinaryResult);
  } catch (error) {
    console.error("Error uploading image:", error);
    return NextResponse.json(
      { message: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
