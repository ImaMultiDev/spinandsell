import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import bcrypt from "bcryptjs";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/libs/prisma";
import { passwordSchema } from "@/lib/validations/profile";

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ message: "No autorizado" }, { status: 401 });
    }

    const body = await request.json();

    // Validar datos
    const validatedData = passwordSchema.parse(body);

    // Obtener usuario actual
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { password: true },
    });

    if (!user || !user.password) {
      return NextResponse.json(
        {
          message: "No se puede cambiar la contraseña de una cuenta OAuth",
          field: "currentPassword",
        },
        { status: 400 }
      );
    }

    // Verificar contraseña actual
    const isValidPassword = await bcrypt.compare(
      validatedData.currentPassword,
      user.password
    );

    if (!isValidPassword) {
      return NextResponse.json(
        {
          message: "Contraseña actual incorrecta",
          field: "currentPassword",
        },
        { status: 400 }
      );
    }

    // Hash de la nueva contraseña
    const hashedPassword = await bcrypt.hash(validatedData.newPassword, 12);

    // Actualizar contraseña
    await prisma.user.update({
      where: { email: session.user.email },
      data: { password: hashedPassword },
    });

    return NextResponse.json({
      message: "Contraseña actualizada exitosamente",
    });
  } catch (error) {
    console.error("Error updating password:", error);

    return NextResponse.json(
      { message: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
