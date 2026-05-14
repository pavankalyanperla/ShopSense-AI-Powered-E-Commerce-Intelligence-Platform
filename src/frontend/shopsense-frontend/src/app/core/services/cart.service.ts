import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  CartDto,
  AddToCartRequest,
  Order,
  CheckoutRequest,
  Address,
  CreateAddressRequest,
  Coupon,
  CouponValidationRequest,
  CouponValidationResult,
  ReturnRequest
} from '../models/order.models';

@Injectable({
  providedIn: 'root'
})
export class CartService {
  private apiUrl = `${environment.apiGatewayUrl}/api/v1`;
  
  // Signal for cart count
  cartCount = signal<number>(0);

  constructor(private http: HttpClient) {
    this.loadCartCount();
  }

  // Cart APIs
  getCart(): Observable<CartDto> {
    return this.http.get<CartDto>(`${this.apiUrl}/cart`).pipe(
      tap(cart => this.cartCount.set(cart.totalItems))
    );
  }

  addToCart(request: AddToCartRequest): Observable<CartDto> {
    return this.http.post<CartDto>(`${this.apiUrl}/cart`, request).pipe(
      tap(cart => this.cartCount.set(cart.totalItems))
    );
  }

  updateCartItem(cartItemId: string, quantity: number): Observable<CartDto> {
    return this.http.put<CartDto>(`${this.apiUrl}/cart/${cartItemId}`, quantity).pipe(
      tap(cart => this.cartCount.set(cart.totalItems))
    );
  }

  removeFromCart(cartItemId: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/cart/${cartItemId}`).pipe(
      tap(() => this.loadCartCount())
    );
  }

  clearCart(): Observable<any> {
    return this.http.delete(`${this.apiUrl}/cart`).pipe(
      tap(() => this.cartCount.set(0))
    );
  }

  private loadCartCount(): void {
    this.getCart().subscribe({
      next: (cart) => this.cartCount.set(cart.totalItems),
      error: () => this.cartCount.set(0)
    });
  }

  // Order APIs
  checkout(request: CheckoutRequest): Observable<Order> {
    return this.http.post<Order>(`${this.apiUrl}/orders/checkout`, request).pipe(
      tap(() => this.cartCount.set(0))
    );
  }

  getMyOrders(): Observable<Order[]> {
    return this.http.get<Order[]>(`${this.apiUrl}/orders`);
  }

  getOrderById(orderId: string): Observable<Order> {
    return this.http.get<Order>(`${this.apiUrl}/orders/${orderId}`);
  }

  getOrderByNumber(orderNumber: string): Observable<Order> {
    return this.http.get<Order>(`${this.apiUrl}/orders/number/${orderNumber}`);
  }

  cancelOrder(orderId: string): Observable<Order> {
    return this.http.post<Order>(`${this.apiUrl}/orders/${orderId}/cancel`, {});
  }

  requestReturn(orderId: string, request: ReturnRequest): Observable<Order> {
    return this.http.post<Order>(`${this.apiUrl}/orders/${orderId}/return`, request);
  }

  // Address APIs
  getAddresses(): Observable<Address[]> {
    return this.http.get<Address[]>(`${this.apiUrl}/address`);
  }

  getAddressById(addressId: string): Observable<Address> {
    return this.http.get<Address>(`${this.apiUrl}/address/${addressId}`);
  }

  createAddress(request: CreateAddressRequest): Observable<Address> {
    return this.http.post<Address>(`${this.apiUrl}/address`, request);
  }

  updateAddress(addressId: string, request: CreateAddressRequest): Observable<Address> {
    return this.http.put<Address>(`${this.apiUrl}/address/${addressId}`, request);
  }

  deleteAddress(addressId: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/address/${addressId}`);
  }

  setDefaultAddress(addressId: string): Observable<Address> {
    return this.http.put<Address>(`${this.apiUrl}/address/${addressId}/set-default`, {});
  }

  // Coupon APIs
  getActiveCoupons(): Observable<Coupon[]> {
    return this.http.get<Coupon[]>(`${this.apiUrl}/coupons`);
  }

  getCouponByCode(code: string): Observable<Coupon> {
    return this.http.get<Coupon>(`${this.apiUrl}/coupons/${code}`);
  }

  validateCoupon(request: CouponValidationRequest): Observable<CouponValidationResult> {
    return this.http.post<CouponValidationResult>(`${this.apiUrl}/coupons/validate`, request);
  }
}
