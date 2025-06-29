import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/libs/prisma";

export async function DELETE(
  request: NextRequest,
  { params }: { params: { productId: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ message: "No autorizado" }, { status: 401 });
    }

    const productId = params.productId;

    // Obtener usuario
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true },
    });

    if (!user) {
      return NextResponse.json(
        { message: "Usuario no encontrado" },
        { status: 404 }
      );
    }

    // Verificar que el favorito existe
    const favorite = await prisma.favorite.findUnique({
      where: {
        userId_productId: {
          userId: user.id,
          productId: productId,
        },
      },
    });

    if (!favorite) {
      return NextResponse.json(
        { message: "Producto no está en favoritos" },
        { status: 404 }
      );
    }

    // Eliminar de favoritos
    await prisma.favorite.delete({
      where: { id: favorite.id },
    });

    // Decrementar contador de likes del producto
    await prisma.product.update({
      where: { id: productId },
      data: { likes: { decrement: 1 } },
    });

    return NextResponse.json({
      message: "Producto eliminado de favoritos",
    });
  } catch (error) {
    console.error("Error removing favorite:", error);

    return NextResponse.json(
      { message: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
