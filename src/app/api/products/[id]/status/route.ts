import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/libs/prisma";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ message: "No autorizado" }, { status: 401 });
    }

    const { id: productId } = await params;
    const { sold } = await request.json();

    if (typeof sold !== "boolean") {
      return NextResponse.json(
        { message: "Estado de venta inválido" },
        { status: 400 }
      );
    }

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
        { message: "No tienes permisos para modificar este producto" },
        { status: 403 }
      );
    }

    // Actualizar estado del producto
    const updatedProduct = await prisma.product.update({
      where: { id: productId },
      data: {
        sold,
        // Si se marca como vendido, registrar fecha de salida
        exitDate: sold ? new Date() : null,
      },
      select: {
        id: true,
        sold: true,
        exitDate: true,
      },
    });

    return NextResponse.json({
      message: sold ? "Producto marcado como vendido" : "Producto republicado",
      product: updatedProduct,
    });
  } catch (error) {
    console.error("Error updating product status:", error);

    return NextResponse.json(
      { message: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
