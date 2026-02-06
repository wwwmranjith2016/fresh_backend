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
  imageUrl: string;
  price: number;
  category: string;
  unit: string;
  discountPercentage?: number;
  discountPrice?: number;
  offerTitle?: string;
  offerDescription?: string;
  offerValidFrom?: string;
  offerValidUntil?: string;
  isFeatured?: boolean;
  stockQuantity?: number;
  minOrderQuantity?: number;
  maxOrderQuantity?: number;
  tags?: string[];
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
