import { ProductCondition, ProductCategory } from "@prisma/client";

export interface Product {
  id: string;
  brand: string;
  model: string;
  year: number;
  condition: ProductCondition;
  category: ProductCategory;
  description: string;
  images: string[]; // Array of Cloudinary URLs
  imagePublicIds: string[]; // Array of Cloudinary public_ids
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

// Messaging Types
export interface MessageUser {
  id: string;
  name: string | null;
  email: string;
  image: string | null;
}

export interface MessageProduct {
  id: string;
  brand: string;
  model: string;
  publicPrice: number;
  sold: boolean;
}

export interface Message {
  id: string;
  content: string;
  senderId: string;
  readAt: Date | null;
  createdAt: Date;
  sender: MessageUser;
}

export interface Conversation {
  id: string;
  otherParticipant: MessageUser;
  product: MessageProduct | null;
  lastMessage: Message | null;
  lastMessageAt: Date | null;
  createdAt: Date;
}

export interface ConversationWithMessages
  extends Omit<Conversation, "lastMessage"> {
  messages: Message[];
}

// Transaction Types
export type TransactionStatus =
  | "PENDING"
  | "COMPLETED"
  | "FAILED"
  | "CANCELLED"
  | "REFUNDED";

export interface Transaction {
  id: string;
  stripeSessionId: string;
  stripePaymentIntentId?: string | null;
  productId: string;
  sellerId: string;
  buyerId: string;
  amount: number; // En centavos
  platformFee: number; // En centavos
  currency: string;
  status: TransactionStatus;
  invoiceNumber?: string | null;
  invoiceUrl?: string | null;
  taxAmount?: number | null; // IVA en centavos
  metadata?: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
  completedAt?: Date | null;

  // Relations (opcional)
  product?: Product;
  seller?: User;
  buyer?: User;
}

export interface InvoiceData {
  transaction: Transaction;
  product: Product;
  seller: User;
  buyer: User;
  companyInfo: {
    name: string;
    address: string;
    taxId: string;
    email: string;
    phone: string;
    website: string;
  };
}
