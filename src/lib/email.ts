import nodemailer from "nodemailer";
import { Transaction } from "@/types";

// Configuración del transporter de email
const createTransporter = () => {
  // En producción, usar un servicio como SendGrid, Resend, etc.
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST || "smtp.gmail.com",
    port: parseInt(process.env.SMTP_PORT || "587"),
    secure: false, // true para 465, false para otros puertos
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
};

// Plantilla base de email
const getBaseTemplate = (title: string, content: string) => `
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title}</title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #10B981; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }
        .footer { text-align: center; margin-top: 20px; font-size: 12px; color: #666; }
        .button { display: inline-block; background: #10B981; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 10px 0; }
        .product-info { background: white; padding: 20px; border-radius: 6px; margin: 20px 0; border-left: 4px solid #10B981; }
        .price { font-size: 24px; font-weight: bold; color: #10B981; }
        .transaction-details { background: #f0f0f0; padding: 15px; border-radius: 6px; margin: 15px 0; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🚴 SpinAndSell</h1>
            <p>${title}</p>
        </div>
        <div class="content">
            ${content}
        </div>
        <div class="footer">
            <p>© 2025 SpinAndSell - Marketplace de bicicletas y patinetes</p>
            <p>Si tienes alguna duda, contacta con nosotros en support@spinandsell.com</p>
        </div>
    </div>
</body>
</html>
`;

// Email de confirmación de compra para el comprador
export const sendPurchaseConfirmationToBuyer = async (
  transaction: Transaction & {
    product: {
      brand: string;
      model: string;
      year: number;
      publicPrice: number;
    };
    seller: { name: string | null; email: string };
    buyer: { name: string | null; email: string };
  }
) => {
  const { product, seller, buyer } = transaction;

  const content = `
    <h2>¡Compra realizada con éxito! 🎉</h2>
    <p>Hola ${buyer.name || "Usuario"},</p>
    <p>Tu compra se ha procesado correctamente. Aquí están los detalles:</p>
    
    <div class="product-info">
        <h3>${product.brand} ${product.model} (${product.year})</h3>
        <p class="price">€${(transaction.amount / 100).toFixed(2)}</p>
        <p><strong>ID de transacción:</strong> ${transaction.stripeSessionId}</p>
        <p><strong>Fecha:</strong> ${transaction.createdAt.toLocaleDateString("es-ES")}</p>
    </div>
    
    <h3>Vendedor</h3>
    <p><strong>Nombre:</strong> ${seller.name || "No especificado"}</p>
    <p><strong>Email:</strong> ${seller.email}</p>
    
    <h3>Próximos pasos</h3>
    <ol>
        <li>El vendedor será notificado automáticamente de tu compra</li>
        <li>Puedes contactar directamente con el vendedor a través de nuestro sistema de mensajes</li>
        <li>Coordina la entrega o recogida del producto</li>
    </ol>
    
    <a href="${process.env.NEXTAUTH_URL || process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000"}/mensajes" class="button">
        💬 Contactar Vendedor
    </a>
    
    ${transaction.invoiceUrl ? `<p><a href="${transaction.invoiceUrl}" class="button">📄 Descargar Factura</a></p>` : ""}
  `;

  const transporter = createTransporter();

  await transporter.sendMail({
    from: process.env.SMTP_FROM || `SpinAndSell <${process.env.SMTP_USER}>`,
    to: buyer.email,
    subject: `✅ Compra confirmada - ${product.brand} ${product.model}`,
    html: getBaseTemplate("Compra Confirmada", content),
  });
};

// Email de notificación de venta para el vendedor
export const sendSaleNotificationToSeller = async (
  transaction: Transaction & {
    product: {
      brand: string;
      model: string;
      year: number;
      publicPrice: number;
    };
    seller: { name: string | null; email: string };
    buyer: { name: string | null; email: string };
  }
) => {
  const { product, seller, buyer } = transaction;

  const content = `
    <h2>¡Tu producto se ha vendido! 🎉</h2>
    <p>Hola ${seller.name || "Usuario"},</p>
    <p>Te informamos que tu producto se ha vendido exitosamente:</p>
    
    <div class="product-info">
        <h3>${product.brand} ${product.model} (${product.year})</h3>
        <p class="price">€${(transaction.amount / 100).toFixed(2)}</p>
        <p><strong>Comisión de plataforma:</strong> €${(transaction.platformFee / 100).toFixed(2)}</p>
        <p><strong>Tu ganancia:</strong> €${((transaction.amount - transaction.platformFee) / 100).toFixed(2)}</p>
    </div>
    
    <h3>Comprador</h3>
    <p><strong>Nombre:</strong> ${buyer.name || "No especificado"}</p>
    <p><strong>Email:</strong> ${buyer.email}</p>
    
    <div class="transaction-details">
        <p><strong>ID de transacción:</strong> ${transaction.stripeSessionId}</p>
        <p><strong>Fecha:</strong> ${transaction.createdAt.toLocaleDateString("es-ES")}</p>
        <p><strong>Estado:</strong> Pagado ✅</p>
    </div>
    
    <h3>Próximos pasos</h3>
    <ol>
        <li>El comprador puede contactarte a través de nuestro sistema de mensajes</li>
        <li>Coordina la entrega o recogida del producto</li>
        <li>Una vez entregado, marca el producto como entregado en tu panel</li>
    </ol>
    
    <a href="${process.env.NEXTAUTH_URL || process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000"}/mensajes" class="button">
        💬 Ver Mensajes
    </a>
    
    <a href="${process.env.NEXTAUTH_URL || process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000"}/mis-productos" class="button">
        📦 Mis Productos
    </a>
  `;

  const transporter = createTransporter();

  await transporter.sendMail({
    from: process.env.SMTP_FROM || `SpinAndSell <${process.env.SMTP_USER}>`,
    to: seller.email,
    subject: `🎉 ¡Producto vendido! - ${product.brand} ${product.model}`,
    html: getBaseTemplate("Producto Vendido", content),
  });
};

// Email de fallo de pago
export const sendPaymentFailedNotification = async (
  buyerEmail: string,
  productInfo: { brand: string; model: string; year: number }
) => {
  const content = `
    <h2>⚠️ Problema con el pago</h2>
    <p>Hola,</p>
    <p>Hemos detectado un problema con el pago de tu compra:</p>
    
    <div class="product-info">
        <h3>${productInfo.brand} ${productInfo.model} (${productInfo.year})</h3>
        <p>El pago no se pudo procesar correctamente.</p>
    </div>
    
    <h3>¿Qué puedes hacer?</h3>
    <ul>
        <li>Verifica que tu tarjeta tenga fondos suficientes</li>
        <li>Comprueba que los datos de la tarjeta sean correctos</li>
        <li>Contacta con tu banco si el problema persiste</li>
        <li>Intenta realizar la compra nuevamente</li>
    </ul>
    
    <a href="${process.env.NEXTAUTH_URL || process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000"}/productos" class="button">
        🔄 Intentar de nuevo
    </a>
  `;

  const transporter = createTransporter();

  await transporter.sendMail({
    from: process.env.SMTP_FROM || `SpinAndSell <${process.env.SMTP_USER}>`,
    to: buyerEmail,
    subject: "⚠️ Problema con el pago - SpinAndSell",
    html: getBaseTemplate("Problema con el Pago", content),
  });
};

// Utilidad para verificar configuración de email
export const verifyEmailConfig = async (): Promise<boolean> => {
  try {
    const transporter = createTransporter();
    await transporter.verify();
    return true;
  } catch (error) {
    console.error("Error en configuración de email:", error);
    return false;
  }
};
