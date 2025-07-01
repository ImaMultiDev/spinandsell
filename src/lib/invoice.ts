import { Transaction, InvoiceData } from "@/types";

// Interfaz para información de la empresa
interface CompanyInfo {
  name: string;
  address: string;
  taxId: string;
  email: string;
  phone: string;
  website: string;
}

// Configuración de la empresa
const COMPANY_INFO: CompanyInfo = {
  name: "SpinAndSell S.L.",
  address: "Calle Principal 123, 28001 Madrid, España",
  taxId: "B12345678",
  email: "facturacion@spinandsell.com",
  phone: "+34 900 123 456",
  website: "https://spinandsell.vercel.app",
};

// Generar número de factura único
export const generateInvoiceNumber = (transactionId: string): string => {
  const year = new Date().getFullYear();
  const shortId = transactionId.slice(-8).toUpperCase();
  return `INV-${year}-${shortId}`;
};

// Calcular IVA (21% para España)
export const calculateTax = (amount: number): number => {
  return Math.round(amount * 0.21);
};

// Generar datos de factura
export const generateInvoiceData = (
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
): InvoiceData => {
  const { product, seller, buyer } = transaction;

  // Calcular importes
  const subtotal = transaction.amount - (transaction.taxAmount || 0);
  const taxAmount = transaction.taxAmount || calculateTax(subtotal);

  return {
    transaction: {
      ...transaction,
      invoiceNumber: generateInvoiceNumber(transaction.id),
      taxAmount,
    },
    product,
    seller,
    buyer,
    companyInfo: COMPANY_INFO,
  };
};

// Generar HTML de factura
export const generateInvoiceHTML = (invoiceData: InvoiceData): string => {
  const { transaction, product, seller, buyer, companyInfo } = invoiceData;

  const subtotal = transaction.amount - (transaction.taxAmount || 0);
  const platformFeeFormatted = (transaction.platformFee / 100).toFixed(2);
  const subtotalFormatted = (subtotal / 100).toFixed(2);
  const taxFormatted = ((transaction.taxAmount || 0) / 100).toFixed(2);
  const totalFormatted = (transaction.amount / 100).toFixed(2);

  return `
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Factura ${transaction.invoiceNumber}</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 0; padding: 20px; color: #333; }
        .invoice { max-width: 800px; margin: 0 auto; background: white; }
        .header { display: flex; justify-content: space-between; align-items: start; margin-bottom: 30px; }
        .logo { font-size: 24px; font-weight: bold; color: #10B981; }
        .invoice-info { text-align: right; }
        .section { margin-bottom: 30px; }
        .section h3 { color: #10B981; border-bottom: 2px solid #10B981; padding-bottom: 5px; }
        .details-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 30px; }
        .item-table { width: 100%; border-collapse: collapse; margin-top: 20px; }
        .item-table th, .item-table td { padding: 12px; text-align: left; border-bottom: 1px solid #ddd; }
        .item-table th { background-color: #f8f9fa; font-weight: bold; }
        .totals { margin-top: 30px; }
        .totals table { width: 100%; max-width: 400px; margin-left: auto; }
        .totals td { padding: 8px; }
        .totals .total-row { font-weight: bold; font-size: 18px; background-color: #f8f9fa; }
        .footer { margin-top: 50px; padding-top: 20px; border-top: 1px solid #ddd; font-size: 12px; color: #666; }
        @media print { body { margin: 0; } }
    </style>
</head>
<body>
    <div class="invoice">
        <!-- Header -->
        <div class="header">
            <div>
                <div class="logo">🚴 ${companyInfo.name}</div>
                <p>${companyInfo.address}</p>
                <p>CIF: ${companyInfo.taxId}</p>
                <p>Email: ${companyInfo.email}</p>
                <p>Teléfono: ${companyInfo.phone}</p>
            </div>
            <div class="invoice-info">
                <h2>FACTURA</h2>
                <p><strong>Número:</strong> ${transaction.invoiceNumber}</p>
                <p><strong>Fecha:</strong> ${transaction.createdAt.toLocaleDateString("es-ES")}</p>
                <p><strong>ID Transacción:</strong> ${transaction.stripeSessionId}</p>
            </div>
        </div>

        <!-- Detalles cliente y vendedor -->
        <div class="details-grid">
            <div class="section">
                <h3>Datos del Comprador</h3>
                <p><strong>${buyer.name || "Cliente"}</strong></p>
                <p>${buyer.email}</p>
            </div>
            <div class="section">
                <h3>Datos del Vendedor</h3>
                <p><strong>${seller.name || "Vendedor"}</strong></p>
                <p>${seller.email}</p>
            </div>
        </div>

        <!-- Detalles del producto -->
        <div class="section">
            <h3>Detalles del Producto</h3>
            <table class="item-table">
                <thead>
                    <tr>
                        <th>Descripción</th>
                        <th>Cantidad</th>
                        <th>Precio Unitario</th>
                        <th>Total</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td>
                            <strong>${product.brand} ${product.model} (${product.year})</strong><br>
                            <small>Marketplace SpinAndSell - Comisión de servicio</small>
                        </td>
                        <td>1</td>
                        <td>€${subtotalFormatted}</td>
                        <td>€${subtotalFormatted}</td>
                    </tr>
                </tbody>
            </table>
        </div>

        <!-- Totales -->
        <div class="totals">
            <table>
                <tr>
                    <td>Subtotal:</td>
                    <td style="text-align: right;">€${subtotalFormatted}</td>
                </tr>
                <tr>
                    <td>IVA (21%):</td>
                    <td style="text-align: right;">€${taxFormatted}</td>
                </tr>
                <tr>
                    <td>Comisión plataforma:</td>
                    <td style="text-align: right;">€${platformFeeFormatted}</td>
                </tr>
                <tr class="total-row">
                    <td>TOTAL:</td>
                    <td style="text-align: right;">€${totalFormatted}</td>
                </tr>
            </table>
        </div>

        <!-- Información adicional -->
        <div class="section">
            <h3>Información de Pago</h3>
            <p><strong>Método:</strong> Tarjeta de crédito/débito (Stripe)</p>
            <p><strong>Estado:</strong> Pagado ✅</p>
            <p><strong>Fecha de pago:</strong> ${transaction.completedAt?.toLocaleDateString("es-ES") || transaction.createdAt.toLocaleDateString("es-ES")}</p>
        </div>

        <!-- Footer -->
        <div class="footer">
            <p>Esta factura se ha generado automáticamente por el sistema SpinAndSell.</p>
            <p>Para cualquier consulta, contacta con nosotros en ${companyInfo.email}</p>
            <p>Sitio web: ${companyInfo.website}</p>
        </div>
    </div>
</body>
</html>
  `;
};

// Generar PDF de factura (requiere una librería como puppeteer o html-pdf)
export const generateInvoicePDF = async (
  invoiceData: InvoiceData
): Promise<Buffer> => {
  // Para implementar en el futuro con puppeteer o similar
  // Por ahora, devolver el HTML como buffer
  const html = generateInvoiceHTML(invoiceData);
  return Buffer.from(html, "utf-8");
};

// Subir factura a Cloudinary o storage
export const uploadInvoiceToStorage = async (
  invoiceBuffer: Buffer,
  invoiceNumber: string
): Promise<string> => {
  // Implementar subida a Cloudinary o similar
  // Por ahora, simular URL
  return `https://invoices.spinandsell.com/${invoiceNumber}.pdf`;
};
