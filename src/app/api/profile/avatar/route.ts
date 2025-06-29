import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { writeFile, unlink } from "fs/promises";
import { join } from "path";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/libs/prisma";

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
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        { message: "El archivo debe ser menor a 5MB" },
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
      select: { id: true, image: true },
    });

    if (!user) {
      return NextResponse.json(
        { message: "Usuario no encontrado" },
        { status: 404 }
      );
    }

    // Generar nombre único para el archivo
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const timestamp = Date.now();
    const extension = file.name.split(".").pop();
    const filename = `avatar-${user.id}-${timestamp}.${extension}`;

    // Crear directorio si no existe
    const uploadsDir = join(process.cwd(), "public", "uploads", "avatars");

    try {
      const fs = await import("fs");
      if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir, { recursive: true });
      }
    } catch {
      // Si falla la creación del directorio, continuar
    }

    // Guardar archivo
    const filepath = join(uploadsDir, filename);
    await writeFile(filepath, buffer);

    // Eliminar avatar anterior si existe
    if (user.image && user.image.includes("/uploads/avatars/")) {
      try {
        const oldFilename = user.image.split("/").pop();
        if (oldFilename) {
          const oldFilepath = join(uploadsDir, oldFilename);
          await unlink(oldFilepath);
        }
      } catch {
        // Si falla la eliminación, continuar
      }
    }

    // Actualizar usuario con nueva imagen
    const imageUrl = `/uploads/avatars/${filename}`;
    await prisma.user.update({
      where: { email: session.user.email },
      data: { image: imageUrl },
    });

    return NextResponse.json({
      imageUrl,
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
      select: { image: true },
    });

    if (!user) {
      return NextResponse.json(
        { message: "Usuario no encontrado" },
        { status: 404 }
      );
    }

    // Eliminar archivo si existe
    if (user.image && user.image.includes("/uploads/avatars/")) {
      try {
        const filename = user.image.split("/").pop();
        if (filename) {
          const filepath = join(
            process.cwd(),
            "public",
            "uploads",
            "avatars",
            filename
          );
          await unlink(filepath);
        }
      } catch {
        // Si falla la eliminación, continuar
      }
    }

    // Actualizar usuario sin imagen
    await prisma.user.update({
      where: { email: session.user.email },
      data: { image: null },
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
