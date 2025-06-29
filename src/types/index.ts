import { ProductCondition, ProductCategory } from "@prisma/client";

export interface Product {
  id: string;
  brand: string;
  model: string;
  year: number;
  condition: ProductCondition;
  category: ProductCategory;
  description: string;
  purchasePrice?: number | null;
  netSalePrice?: number | null;
  distributionPrice?: number | null;
  publicPrice: number;
  discount?: number | null;
  location?: string | null;
  registrationDate?: Date | null;
  entryDate?: Date | null;
  exitDate?: Date | null;
  deliveryDate?: Date | null;
  tax?: number | null;
  sold: boolean;
  paid: boolean;
  views: number;
  likes: number;
  sellerId?: string | null;
  buyerId?: string | null;
  invoice?: string | null;
  logisticCompany?: string | null;
  logisticInvoice?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface User {
  id: string;
  name?: string | null;
  email?: string | null;
  emailVerified?: Date | null;
  password?: string | null;
  image?: string | null;
  role: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ProductFilter {
  category?: ProductCategory;
  condition?: ProductCondition;
  brand?: string;
  minPrice?: number;
  maxPrice?: number;
  search?: string;
}

export const PRODUCT_CATEGORIES = {
  ROAD_BIKE: "Bicicletas de Ciclismo",
  MOUNTAIN_BIKE: "Bicicletas de Montaña",
  SPINNING_BIKE: "Bicicletas de Spinning",
  ELECTRIC_BIKE: "Bicicletas Eléctricas",
  ELECTRIC_SCOOTER: "Patinetes Eléctricos",
} as const;

export const PRODUCT_CONDITIONS = {
  A: "Estado A - Excelente",
  B: "Estado B - Bueno",
  C: "Estado C - Aceptable",
} as const;
