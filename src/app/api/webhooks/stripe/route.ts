import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { stripe } from "@/lib/stripe";
import { prisma } from "@/libs/prisma";
import {
  sendPurchaseConfirmationToBuyer,
  sendSaleNotificationToSeller,
} from "@/lib/email";
import {
  generateInvoiceData,
  generateInvoicePDF,
  uploadInvoiceToStorage,
} from "@/lib/invoice";
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

  const { productId, sellerId, buyerId, platformFee } = session.metadata || {};

  if (!productId || !sellerId || !buyerId) {
    console.error(
      "Missing required metadata in checkout session:",
      session.metadata
    );
    return;
  }

  try {
    // 1. Obtener datos completos del producto, vendedor y comprador
    const product = await prisma.product.findUnique({
      where: { id: productId },
      include: {
        seller: { select: { id: true, name: true, email: true } },
      },
    });

    const buyer = await prisma.user.findUnique({
      where: { id: buyerId },
      select: { id: true, name: true, email: true },
    });

    if (!product || !buyer || !product.seller) {
      console.error("Product, buyer, or seller not found");
      return;
    }

    // 2. Crear registro de transacción
    const transaction = await prisma.transaction.create({
      data: {
        stripeSessionId: session.id,
        stripePaymentIntentId: session.payment_intent as string,
        productId: productId,
        sellerId: sellerId,
        buyerId: buyerId,
        amount: session.amount_total || 0,
        platformFee: parseInt(platformFee || "0"),
        currency: session.currency || "eur",
        status: "COMPLETED",
        completedAt: new Date(),
        metadata: {
          sessionId: session.id,
          amount: session.amount_total,
          currency: session.currency,
        },
      },
    });

    // 3. Actualizar producto como vendido y pagado
    await prisma.product.update({
      where: { id: productId },
      data: {
        sold: true,
        paid: true,
        buyerId: buyerId,
        exitDate: new Date(),
      },
    });

    // 4. Generar factura
    let invoiceUrl: string | null = null;
    try {
      const invoiceData = generateInvoiceData({
        ...transaction,
        product: {
          brand: product.brand,
          model: product.model,
          year: product.year,
          publicPrice: product.publicPrice,
        },
        seller: {
          name: product.seller.name,
          email: product.seller.email!,
        },
        buyer: {
          name: buyer.name,
          email: buyer.email!,
        },
      } as Parameters<typeof generateInvoiceData>[0]);

      const invoiceBuffer = await generateInvoicePDF(invoiceData);
      invoiceUrl = await uploadInvoiceToStorage(
        invoiceBuffer,
        invoiceData.transaction.invoiceNumber!
      );

      // Actualizar transacción con datos de factura
      await prisma.transaction.update({
        where: { id: transaction.id },
        data: {
          invoiceNumber: invoiceData.transaction.invoiceNumber,
          invoiceUrl: invoiceUrl,
          taxAmount: invoiceData.transaction.taxAmount,
        },
      });
    } catch (invoiceError) {
      console.error("Error generating invoice:", invoiceError);
      // Continuar sin factura si hay error
    }

    // 5. Enviar emails de confirmación
    try {
      const transactionForEmails = {
        ...transaction,
        invoiceUrl,
        product: {
          brand: product.brand,
          model: product.model,
          year: product.year,
          publicPrice: product.publicPrice,
        },
        seller: {
          name: product.seller.name,
          email: product.seller.email!,
        },
        buyer: {
          name: buyer.name,
          email: buyer.email!,
        },
      } as Parameters<typeof sendPurchaseConfirmationToBuyer>[0];

      // Email al comprador
      await sendPurchaseConfirmationToBuyer(transactionForEmails);

      // Email al vendedor
      await sendSaleNotificationToSeller(transactionForEmails);

      console.log("Confirmation emails sent successfully");
    } catch (emailError) {
      console.error("Error sending emails:", emailError);
      // Continuar sin emails si hay error
    }

    // 6. Crear conversación automática entre comprador y vendedor
    try {
      const existingConversation = await prisma.conversation.findFirst({
        where: {
          OR: [
            {
              participant1Id: buyerId,
              participant2Id: sellerId,
              productId: productId,
            },
            {
              participant1Id: sellerId,
              participant2Id: buyerId,
              productId: productId,
            },
          ],
        },
      });

      if (!existingConversation) {
        const conversation = await prisma.conversation.create({
          data: {
            participant1Id: buyerId,
            participant2Id: sellerId,
            productId: productId,
            lastMessageAt: new Date(),
          },
        });

        // Mensaje inicial automático
        await prisma.message.create({
          data: {
            content: `¡Hola! Acabo de comprar tu ${product.brand} ${product.model}. ¿Podemos coordinar la entrega?`,
            conversationId: conversation.id,
            senderId: buyerId,
          },
        });

        console.log("Automatic conversation created");
      }
    } catch (conversationError) {
      console.error("Error creating conversation:", conversationError);
      // Continuar sin conversación si hay error
    }

    console.log(
      `Product ${productId} processed successfully - Transaction ${transaction.id}`
    );
  } catch (error: unknown) {
    console.error("Error processing checkout completion:", error);
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
