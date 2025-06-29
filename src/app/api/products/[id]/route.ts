import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/libs/prisma";

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ message: "No autorizado" }, { status: 401 });
    }

    const { id: productId } = await params;

    // Verificar que el producto existe y pertenece al usuario
    const product = await prisma.product.findUnique({
      where: { id: productId },
      include: { seller: true },
    });

    if (!product) {
      return NextResponse.json(
        { message: "Producto no encontrado" },
        { status: 404 }
      );
    }

    if (product.seller?.email !== session.user.email) {
      return NextResponse.json(
        { message: "No tienes permisos para eliminar este producto" },
        { status: 403 }
      );
    }

    // Eliminar producto
    await prisma.product.delete({
      where: { id: productId },
    });

    return NextResponse.json({
      message: "Producto eliminado exitosamente",
    });
  } catch (error) {
    console.error("Error deleting product:", error);

    return NextResponse.json(
      { message: "Error interno del servidor" },
      { status: 500 }
    );
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: productId } = await params;

    // Obtener producto con detalles
    const product = await prisma.product.findUnique({
      where: { id: productId },
      include: {
        seller: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
            phone: true,
            location: true,
            createdAt: true,
          },
        },
      },
    });

    if (!product) {
      return NextResponse.json(
        { message: "Producto no encontrado" },
        { status: 404 }
      );
    }

    // Incrementar contador de visualizaciones
    await prisma.product.update({
      where: { id: productId },
      data: { views: { increment: 1 } },
    });

    return NextResponse.json(product);
  } catch (error) {
    console.error("Error getting product:", error);

    return NextResponse.json(
      { message: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
