import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { stripe } from "@/lib/stripe";
import { prisma } from "@/libs/prisma";
import Stripe from "stripe";

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

export async function POST(request: NextRequest) {
  if (!webhookSecret) {
    console.error("STRIPE_WEBHOOK_SECRET not found");
    return NextResponse.json(
      { error: "Webhook secret not configured" },
      { status: 500 }
    );
  }

  const body = await request.text();
  const headersList = await headers();
  const signature = headersList.get("stripe-signature");

  if (!signature) {
    console.error("No Stripe signature found");
    return NextResponse.json({ error: "No signature found" }, { status: 400 });
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (error) {
    console.error("Webhook signature verification failed:", error);
    return NextResponse.json(
      { error: "Webhook signature verification failed" },
      { status: 400 }
    );
  }

  try {
    switch (event.type) {
      case "checkout.session.completed":
        await handleCheckoutSessionCompleted(
          event.data.object as Stripe.Checkout.Session
        );
        break;

      case "payment_intent.succeeded":
        await handlePaymentIntentSucceeded(
          event.data.object as Stripe.PaymentIntent
        );
        break;

      case "payment_intent.payment_failed":
        await handlePaymentIntentFailed(
          event.data.object as Stripe.PaymentIntent
        );
        break;

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Error processing webhook:", error);
    return NextResponse.json(
      { error: "Webhook processing failed" },
      { status: 500 }
    );
  }
}

async function handleCheckoutSessionCompleted(
  session: Stripe.Checkout.Session
) {
  console.log("Processing checkout.session.completed:", session.id);

  const { productId, sellerId, buyerId /*, platformFee */ } =
    session.metadata || {};

  if (!productId || !sellerId || !buyerId) {
    console.error(
      "Missing required metadata in checkout session:",
      session.metadata
    );
    return;
  }

  try {
    // Actualizar producto como vendido y pagado
    await prisma.product.update({
      where: { id: productId },
      data: {
        sold: true,
        paid: true,
        buyerId: buyerId,
        exitDate: new Date(),
        deliveryDate: new Date(), // En un marketplace real, esto sería cuando se entregue
      },
    });

    // TODO: Crear registro de transacción cuando se implemente el modelo Transaction
    // await prisma.transaction.create({
    //   data: {
    //     stripeSessionId: session.id,
    //     productId: productId,
    //     sellerId: sellerId,
    //     buyerId: buyerId,
    //     amount: session.amount_total || 0,
    //     platformFee: parseInt(platformFee || "0"),
    //     currency: session.currency || "eur",
    //     status: "completed",
    //   },
    // });

    console.log(`Product ${productId} marked as sold and paid`);

    // TODO: Enviar emails de confirmación a comprador y vendedor
    // TODO: Crear conversación automática entre comprador y vendedor
  } catch (error: unknown) {
    console.error("Error updating product after successful payment:", error);
    throw error;
  }
}

async function handlePaymentIntentSucceeded(
  paymentIntent: Stripe.PaymentIntent
) {
  console.log("Payment succeeded:", paymentIntent.id);
  // Aquí podrías agregar lógica adicional si es necesario
}

async function handlePaymentIntentFailed(paymentIntent: Stripe.PaymentIntent) {
  console.log("Payment failed:", paymentIntent.id);

  // Buscar sesión relacionada para obtener productId
  try {
    const sessions = await stripe.checkout.sessions.list({
      payment_intent: paymentIntent.id,
      limit: 1,
    });

    if (sessions.data.length > 0) {
      const session = sessions.data[0];
      const { productId } = session.metadata || {};

      if (productId) {
        // Log del fallo para análisis
        console.log(`Payment failed for product ${productId}`);

        // TODO: Notificar al comprador sobre el fallo del pago
        // TODO: Enviar email de notificación
      }
    }
  } catch (error) {
    console.error("Error handling payment failure:", error);
  }
}
