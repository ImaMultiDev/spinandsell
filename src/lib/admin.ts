// Configuración del administrador
export const ADMIN_CONFIG = {
  // Email del administrador (fácil de cambiar cuando tengas dominio propio)
  email: "spinandsell@gmail.com",
  // Nombre para mostrar en productos oficiales
  displayName: "Spin&Sell",
  // Configuración visual
  branding: {
    badgeText: "Spin&Sell Oficial",
    badgeColor: "bg-gradient-to-r from-yellow-400 to-yellow-600",
    borderColor: "border-yellow-400",
    textColor: "text-yellow-600",
    icon: "⭐",
  },
} as const;

/**
 * Verifica si un email pertenece al administrador
 */
export function isAdminUser(email: string | null | undefined): boolean {
  if (!email) return false;
  return email.toLowerCase() === ADMIN_CONFIG.email.toLowerCase();
}

/**
 * Verifica si un producto pertenece al administrador
 */
export function isAdminProduct(
  sellerEmail: string | null | undefined
): boolean {
  return isAdminUser(sellerEmail);
}

/**
 * Obtiene las clases CSS para productos del admin
 */
export function getAdminProductStyles() {
  return {
    cardBorder: `ring-2 ring-yellow-400 ring-opacity-60 border-yellow-400`,
    badgeClasses: `${ADMIN_CONFIG.branding.badgeColor} text-white`,
    iconClasses: "text-yellow-500",
    labelClasses: ADMIN_CONFIG.branding.textColor,
  };
}

/**
 * Obtiene la información de branding del admin
 */
export function getAdminBranding() {
  return ADMIN_CONFIG.branding;
}
