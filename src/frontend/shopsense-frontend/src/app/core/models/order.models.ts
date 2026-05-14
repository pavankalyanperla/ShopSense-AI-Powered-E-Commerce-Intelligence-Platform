export interface CartItem {
  id: string;
  customerId: string;
  productId: string;
  productName: string;
  productImage: string;
  selectedVariant?: string;
  quantity: number;
  unitPrice: number;
  addedAt: Date;
}

export interface CartDto {
  items: CartItem[];
  totalItems: number;
  subTotal: number;
}

export interface AddToCartRequest {
  productId: string;
  quantity: number;
  selectedVariant?: string;
}

export interface Address {
  id: string;
  customerId: string;
  fullName: string;
  phoneNumber: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  pinCode: string;
  isDefault: boolean;
  createdAt: Date;
}

export interface CreateAddressRequest {
  fullName: string;
  phoneNumber: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  pinCode: string;
  isDefault: boolean;
}

export interface Coupon {
  id: string;
  code: string;
  description: string;
  discountType: 'Percentage' | 'Flat';
  discountValue: number;
  minOrderValue: number;
  maxDiscountAmount?: number;
  expiresAt: Date;
  usageLimit: number;
  usedCount: number;
  isActive: boolean;
}

export interface CouponValidationRequest {
  code: string;
  orderAmount: number;
}

export interface CouponValidationResult {
  isValid: boolean;
  discountAmount: number;
  message: string;
}

export interface CheckoutRequest {
  deliveryAddressId: string;
  paymentMethod: 'COD' | 'UPI' | 'Card' | 'NetBanking';
  couponCode?: string;
}

export interface OrderItem {
  id: string;
  orderId: string;
  productId: string;
  productName: string;
  productImage: string;
  selectedVariant?: string;
  sellerId: string;
  quantity: number;
  unitPrice: number;
  finalPrice: number;
}

export interface OrderStatusHistory {
  id: string;
  orderId: string;
  status: OrderStatus;
  remarks?: string;
  changedAt: Date;
}

export interface Order {
  id: string;
  orderNumber: string;
  customerId: string;
  customerEmail: string;
  customerName: string;
  items: OrderItem[];
  subTotal: number;
  discountAmount: number;
  deliveryCharge: number;
  totalAmount: number;
  status: OrderStatus;
  paymentMethod: string;
  paymentStatus: PaymentStatus;
  couponCode?: string;
  deliveryAddressId: string;
  deliveryAddress: Address;
  statusHistory: OrderStatusHistory[];
  createdAt: Date;
  updatedAt: Date;
}

export enum OrderStatus {
  Pending = 'Pending',
  Confirmed = 'Confirmed',
  Processing = 'Processing',
  Shipped = 'Shipped',
  OutForDelivery = 'OutForDelivery',
  Delivered = 'Delivered',
  Cancelled = 'Cancelled',
  ReturnRequested = 'ReturnRequested',
  Returned = 'Returned'
}

export enum PaymentStatus {
  Pending = 'Pending',
  Completed = 'Completed',
  Failed = 'Failed',
  Refunded = 'Refunded'
}

export interface ReturnRequest {
  reason: string;
  comments?: string;
}
