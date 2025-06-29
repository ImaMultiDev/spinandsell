import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/libs/prisma";
import { stripe, calculatePlatformFee, STRIPE_CONFIG } from "@/lib/stripe";

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ message: "No autorizado" }, { status: 401 });
    }

    const { productId } = await request.json();

    if (!productId) {
      return NextResponse.json(
        { message: "ID del producto requerido" },
        { status: 400 }
      );
    }

    // Obtener producto y vendedor
    const product = await prisma.product.findUnique({
      where: { id: productId },
      include: {
        seller: {
          select: {
            id: true,
            name: true,
            email: true,
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

    if (product.sold) {
      return NextResponse.json(
        { message: "Este producto ya ha sido vendido" },
        { status: 400 }
      );
    }

    // Verificar que no sea el propio vendedor
    const buyer = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true },
    });

    if (!buyer) {
      return NextResponse.json(
        { message: "Usuario no encontrado" },
        { status: 404 }
      );
    }

    if (product.sellerId === buyer.id) {
      return NextResponse.json(
        { message: "No puedes comprar tu propio producto" },
        { status: 400 }
      );
    }

    // Convertir precio a centavos
    const amountInCents = Math.round(product.publicPrice * 100);

    // Calcular comisión de la plataforma
    const platformFee = calculatePlatformFee(amountInCents);

    // URL base para redirecciones
    const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";

    try {
      // Crear sesión de checkout de Stripe
      const checkoutSession = await stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        line_items: [
          {
            price_data: {
              currency: STRIPE_CONFIG.currency,
              product_data: {
                name: `${product.brand} ${product.model} (${product.year})`,
                description: product.description,
                images: product.images.slice(0, 8), // Stripe permite max 8 imágenes
              },
              unit_amount: amountInCents,
            },
            quantity: 1,
          },
        ],
        mode: "payment",
        success_url: `${baseUrl}/checkout/success?session_id={CHECKOUT_SESSION_ID}&product_id=${productId}`,
        cancel_url: `${baseUrl}/producto/${productId}?checkout=cancelled`,
        metadata: {
          productId: productId,
          sellerId: product.sellerId || "",
          buyerId: buyer.id,
          platformFee: platformFee.toString(),
        },
        // TODO: Implementar Stripe Connect para transferir dinero al vendedor
        // application_fee_amount: platformFee,
        // transfer_data: {
        //   destination: product.seller.stripeAccountId,
        // },
      });

      return NextResponse.json({
        checkoutUrl: checkoutSession.url,
        sessionId: checkoutSession.id,
      });
    } catch (stripeError) {
      console.error("Error creating Stripe checkout session:", stripeError);
      return NextResponse.json(
        { message: "Error al crear la sesión de pago" },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Error in checkout API:", error);
    return NextResponse.json(
      { message: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
