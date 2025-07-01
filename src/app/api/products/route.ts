/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/libs/prisma";
import { deleteImage } from "@/lib/cloudinary";
import { Prisma } from "@prisma/client";

// GET - Obtener todos los productos públicos
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");
    const condition = searchParams.get("condition");
    const brand = searchParams.get("brand");
    const minPrice = searchParams.get("minPrice");
    const maxPrice = searchParams.get("maxPrice");
    const search = searchParams.get("search");
    const sortBy = searchParams.get("sortBy") || "newest";
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "12");

    // Construir filtros
    const where: Prisma.ProductWhereInput = {
      sold: false, // Solo productos disponibles
    };

    if (category) {
      where.category = category as any;
    }

    if (condition) {
      where.condition = condition as any;
    }

    if (brand) {
      where.brand = {
        contains: brand,
        mode: "insensitive",
      };
    }

    if (minPrice || maxPrice) {
      where.publicPrice = {};
      if (minPrice) where.publicPrice.gte = parseFloat(minPrice);
      if (maxPrice) where.publicPrice.lte = parseFloat(maxPrice);
    }

    if (search) {
      where.OR = [
        {
          brand: {
            contains: search,
            mode: "insensitive",
          },
        },
        {
          model: {
            contains: search,
            mode: "insensitive",
          },
        },
        {
          description: {
            contains: search,
            mode: "insensitive",
          },
        },
      ];
    }

    // Construir ordenamiento
    const orderBy: Prisma.ProductOrderByWithRelationInput = {};
    switch (sortBy) {
      case "newest":
        orderBy.createdAt = "desc";
        break;
      case "oldest":
        orderBy.createdAt = "asc";
        break;
      case "price-asc":
        orderBy.publicPrice = "asc";
        break;
      case "price-desc":
        orderBy.publicPrice = "desc";
        break;
      case "popular":
        orderBy.likes = "desc";
        break;
      case "views":
        orderBy.views = "desc";
        break;
      default:
        orderBy.createdAt = "desc";
    }

    // Calcular paginación
    const skip = (page - 1) * limit;

    // Obtener productos
    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        orderBy,
        skip,
        take: limit,
        include: {
          seller: {
            select: {
              id: true,
              name: true,
              email: true,
              image: true,
              location: true,
            },
          },
        },
      }),
      prisma.product.count({ where }),
    ]);

    return NextResponse.json({
      products,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
        hasMore: page * limit < total,
      },
    });
  } catch (error) {
    console.error("Error getting products:", error);
    return NextResponse.json(
      { message: "Error interno del servidor" },
      { status: 500 }
    );
  }
}

// POST - Crear nuevo producto
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ message: "No autorizado" }, { status: 401 });
    }

    const body = await request.json();
    const {
      brand,
      model,
      year,
      condition,
      category,
      description,
      publicPrice,
      location,
      images,
      imagePublicIds,
    } = body;

    // Validaciones
    if (
      !brand ||
      !model ||
      !year ||
      !condition ||
      !category ||
      !description ||
      !publicPrice
    ) {
      return NextResponse.json(
        { message: "Todos los campos obligatorios son requeridos" },
        { status: 400 }
      );
    }

    if (!images || images.length === 0) {
      return NextResponse.json(
        { message: "Debes subir al menos una imagen del producto" },
        { status: 400 }
      );
    }

    if (images.length > 5) {
      return NextResponse.json(
        { message: "Máximo 5 imágenes por producto" },
        { status: 400 }
      );
    }

    if (publicPrice <= 0) {
      return NextResponse.json(
        { message: "El precio debe ser mayor a 0" },
        { status: 400 }
      );
    }

    if (year < 1990 || year > new Date().getFullYear() + 1) {
      return NextResponse.json({ message: "Año inválido" }, { status: 400 });
    }

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

    // Verificar límite de productos activos por usuario (máximo 5)
    const activeProductsCount = await prisma.product.count({
      where: {
        sellerId: user.id,
        sold: false, // Solo productos no vendidos
      },
    });

    if (activeProductsCount >= 5) {
      return NextResponse.json(
        {
          message:
            "Has alcanzado el límite máximo de 5 productos activos. Vende o elimina algunos productos antes de publicar uno nuevo.",
          limit: true,
        },
        { status: 400 }
      );
    }

    // Crear producto
    const product = await prisma.product.create({
      data: {
        brand: brand.trim(),
        model: model.trim(),
        year: parseInt(year),
        condition,
        category,
        description: description.trim(),
        publicPrice: parseFloat(publicPrice),
        location: location?.trim(),
        images: images,
        imagePublicIds: imagePublicIds || [],
        sellerId: user.id,
        entryDate: new Date(),
      },
      include: {
        seller: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
            location: true,
          },
        },
      },
    });

    return NextResponse.json(
      {
        message: "Producto creado exitosamente",
        product,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating product:", error);

    // Si hubo error y se subieron imágenes, intentar eliminarlas
    try {
      const { imagePublicIds } = await request.json();
      if (imagePublicIds && Array.isArray(imagePublicIds)) {
        for (const publicId of imagePublicIds) {
          await deleteImage(publicId);
        }
      }
    } catch (cleanupError) {
      console.error("Error cleaning up images:", cleanupError);
    }

    return NextResponse.json(
      { message: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
