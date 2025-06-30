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
    const session = await getServerSession(authOptions);
    const clientIP =
      request.headers.get("x-forwarded-for") ||
      request.headers.get("x-real-ip") ||
      "unknown";

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

    // Lógica de visualizaciones mejorada - solo una vez por usuario/IP
    let shouldIncrementViews = false;

    if (session?.user?.email) {
      // Usuario autenticado
      const user = await prisma.user.findUnique({
        where: { email: session.user.email },
        select: { id: true },
      });

      if (user) {
        // Verificar si ya ha visto este producto
        const existingView = await prisma.view.findUnique({
          where: {
            userId_productId: {
              userId: user.id,
              productId: productId,
            },
          },
        });

        if (!existingView) {
          // Primera vez que ve este producto
          await prisma.view.create({
            data: {
              userId: user.id,
              productId: productId,
            },
          });
          shouldIncrementViews = true;
        }
      }
    } else {
      // Usuario anónimo - usar IP
      const existingView = await prisma.view.findUnique({
        where: {
          ipAddress_productId: {
            ipAddress: clientIP,
            productId: productId,
          },
        },
      });

      if (!existingView) {
        // Primera vez que esta IP ve este producto
        await prisma.view.create({
          data: {
            ipAddress: clientIP,
            productId: productId,
          },
        });
        shouldIncrementViews = true;
      }
    }

    // Incrementar contador solo si es una nueva visualización
    if (shouldIncrementViews) {
      await prisma.product.update({
        where: { id: productId },
        data: { views: { increment: 1 } },
      });
    }

    return NextResponse.json(product);
  } catch (error) {
    console.error("Error getting product:", error);

    return NextResponse.json(
      { message: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
