import Stripe from "stripe";

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error("STRIPE_SECRET_KEY is required");
}

// Inicializar Stripe para el servidor
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2025-05-28.basil",
  typescript: true,
});

// Configuración para el cliente
export const getStripeConfig = () => {
  if (!process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY) {
    throw new Error("NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY is required");
  }

  return {
    publishableKey: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
  };
};

// Configuración de productos y precios
export const STRIPE_CONFIG = {
  currency: "eur",
  // Comisión del marketplace (5%)
  platformFeePercent: 5,
  // Mínimo de comisión (0.50€)
  minimumFeeAmount: 50, // En centavos
};

// Función para calcular la comisión
export const calculatePlatformFee = (amount: number): number => {
  const feeAmount = Math.round(
    amount * (STRIPE_CONFIG.platformFeePercent / 100)
  );
  return Math.max(feeAmount, STRIPE_CONFIG.minimumFeeAmount);
};

// Función para formatear precios
export const formatPrice = (amount: number, currency = "EUR"): string => {
  return new Intl.NumberFormat("es-ES", {
    style: "currency",
    currency,
  }).format(amount / 100);
};
