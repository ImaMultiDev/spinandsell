import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/libs/prisma";
import { uploadImage, deleteImage } from "@/lib/cloudinary";

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ message: "No autorizado" }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get("avatar") as File;

    if (!file) {
      return NextResponse.json(
        { message: "No se encontró archivo" },
        { status: 400 }
      );
    }

    // Validaciones
    if (file.size > 2 * 1024 * 1024) {
      return NextResponse.json(
        { message: "El archivo debe ser menor a 2MB" },
        { status: 400 }
      );
    }

    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      return NextResponse.json(
        { message: "Solo se permiten archivos JPG, PNG o WebP" },
        { status: 400 }
      );
    }

    // Obtener usuario actual
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true, image: true, avatarPublicId: true },
    });

    if (!user) {
      return NextResponse.json(
        { message: "Usuario no encontrado" },
        { status: 404 }
      );
    }

    // Convertir archivo a base64 para Cloudinary
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const base64String = `data:${file.type};base64,${buffer.toString("base64")}`;

    // Eliminar avatar anterior de Cloudinary si existe
    if (user.avatarPublicId) {
      try {
        await deleteImage(user.avatarPublicId);
      } catch (error) {
        console.error("Error deleting old avatar:", error);
        // Continuar aunque falle la eliminación
      }
    }

    // Subir nueva imagen a Cloudinary
    const publicId = `user-${user.id}-${Date.now()}`;
    const cloudinaryResult = await uploadImage(
      base64String,
      "avatar",
      publicId
    );

    // Actualizar usuario con nueva imagen
    await prisma.user.update({
      where: { email: session.user.email },
      data: {
        image: cloudinaryResult.secure_url,
        avatarPublicId: cloudinaryResult.public_id,
      },
    });

    return NextResponse.json({
      imageUrl: cloudinaryResult.secure_url,
      message: "Avatar actualizado exitosamente",
    });
  } catch (error) {
    console.error("Error uploading avatar:", error);

    return NextResponse.json(
      { message: "Error interno del servidor" },
      { status: 500 }
    );
  }
}

export async function DELETE() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ message: "No autorizado" }, { status: 401 });
    }

    // Obtener usuario actual
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { avatarPublicId: true },
    });

    if (!user) {
      return NextResponse.json(
        { message: "Usuario no encontrado" },
        { status: 404 }
      );
    }

    // Eliminar imagen de Cloudinary si existe
    if (user.avatarPublicId) {
      try {
        await deleteImage(user.avatarPublicId);
      } catch (error) {
        console.error("Error deleting avatar from Cloudinary:", error);
        // Continuar aunque falle la eliminación
      }
    }

    // Actualizar usuario sin imagen
    await prisma.user.update({
      where: { email: session.user.email },
      data: {
        image: null,
        avatarPublicId: null,
      },
    });

    return NextResponse.json({
      message: "Avatar eliminado exitosamente",
    });
  } catch (error) {
    console.error("Error deleting avatar:", error);

    return NextResponse.json(
      { message: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
