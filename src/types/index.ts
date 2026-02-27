import { Request } from 'express';
import { UserRole } from '@prisma/client';

export interface AuthRequest extends Request {
  user?: {
    id: string;
    phone: string;
    role: UserRole;
  };
  file?: Express.Multer.File;
}

export interface LoginRequest {
  phone: string;
  password: string;
}

export interface RegisterRequest {
  phone: string;
  password: string;
  name: string;
  email?: string;
  role?: UserRole;
}

export interface CreateProductRequest {
  name: string;
  description: string;
  image?: string; // Base64 encoded image (after compression)
  imageWidth?: number;
  imageHeight?: number;
  imageMimeType?: string;
  imageSize?: number;
  price: number;
  categoryId: string;
  unitId: string;
  offerId?: string; // Reference to Offer
  available?: boolean;
  discountPercentage?: number;
  discountPrice?: number;
  isFeatured?: boolean;
  displayOrder?: number; // Position/order of the product
  tags?: string[];
}

export interface CreateCategoryRequest {
  name: string;
  description?: string;
}

export interface CreateUnitRequest {
  name: string;
  symbol?: string;
  description?: string;
}

export interface CreateOfferRequest {
  title: string;
  description?: string;
  discountPercentage?: number;
  discountPrice?: number;
  validFrom?: string;
  validUntil?: string;
}

export interface CreateOrderRequest {
  addressId: string;
  items: {
    productId: string;
    quantity: number;
  }[];
  paymentMethod: 'COD' | 'CARD' | 'UPI';
  notes?: string;
  fcmToken?: string;
}

export interface GuestOrderRequest {
  phone: string;
  name?: string;
  addressId?: string;
  address?: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
  };
  items: {
    productId: string;
    quantity: number;
  }[];
  paymentMethod: 'COD' | 'CARD' | 'UPI';
  notes?: string;
  fcmToken?: string;
}

export interface UpdateOrderStatusRequest {
  status: 'PLACED' | 'CONFIRMED' | 'PROCESSING' | 'PREPARED' | 'OUT_FOR_DELIVERY' | 'DELIVERED' | 'CANCELLED';
}

export interface CreateAddressRequest {
  label: string;
  street: string;
  city: string;
  state: string;
  zipCode: string;
  latitude?: number;
  longitude?: number;
  isDefault?: boolean;
}

export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
}
