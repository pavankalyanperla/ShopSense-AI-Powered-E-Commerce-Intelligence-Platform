import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { tap } from 'rxjs/operators';
import { 
  ProductDto, 
  CategoryDto, 
  PagedResult, 
  ProductQueryParams 
} from '../models/product.models';

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private readonly API_URL = 'http://localhost:5000/api/products';
  private readonly CATEGORIES_URL = 'http://localhost:5000/api/categories';
  private readonly WISHLIST_URL = 'http://localhost:5000/api/wishlist';

  private wishlistSubject = new BehaviorSubject<Set<string>>(new Set());
  public wishlist$ = this.wishlistSubject.asObservable();

  constructor(private http: HttpClient) {
    this.loadWishlist();
  }

  // Product APIs
  getProducts(query?: ProductQueryParams): Observable<PagedResult<ProductDto>> {
    let params = new HttpParams();
    
    if (query) {
      if (query.search) params = params.set('search', query.search);
      if (query.categoryId) params = params.set('categoryId', query.categoryId);
      if (query.minPrice !== undefined) params = params.set('minPrice', query.minPrice.toString());
      if (query.maxPrice !== undefined) params = params.set('maxPrice', query.maxPrice.toString());
      if (query.minRating !== undefined) params = params.set('minRating', query.minRating.toString());
      if (query.inStock !== undefined) params = params.set('inStock', query.inStock.toString());
      if (query.sortBy) params = params.set('sortBy', query.sortBy);
      if (query.sortDesc !== undefined) params = params.set('sortDesc', query.sortDesc.toString());
      if (query.page !== undefined) params = params.set('page', query.page.toString());
      if (query.pageSize !== undefined) params = params.set('pageSize', query.pageSize.toString());
    }

    return this.http.get<PagedResult<ProductDto>>(this.API_URL, { params });
  }

  getFeaturedProducts(count: number = 8): Observable<ProductDto[]> {
    return this.http.get<ProductDto[]>(`${this.API_URL}/featured?count=${count}`);
  }

  getProductById(id: string): Observable<ProductDto> {
    return this.http.get<ProductDto>(`${this.API_URL}/${id}`);
  }

  getProductBySlug(slug: string): Observable<ProductDto> {
    return this.http.get<ProductDto>(`${this.API_URL}/slug/${slug}`);
  }

  // Category APIs
  getCategories(): Observable<CategoryDto[]> {
    return this.http.get<CategoryDto[]>(this.CATEGORIES_URL);
  }

  getCategoryTree(): Observable<CategoryDto[]> {
    return this.http.get<CategoryDto[]>(`${this.CATEGORIES_URL}/tree`);
  }

  getCategoryById(id: string): Observable<CategoryDto> {
    return this.http.get<CategoryDto>(`${this.CATEGORIES_URL}/${id}`);
  }

  getCategoryBySlug(slug: string): Observable<CategoryDto> {
    return this.http.get<CategoryDto>(`${this.CATEGORIES_URL}/slug/${slug}`);
  }

  // Wishlist APIs
  getWishlist(): Observable<ProductDto[]> {
    return this.http.get<ProductDto[]>(this.WISHLIST_URL).pipe(
      tap(products => {
        const wishlistIds = new Set(products.map(p => p.id));
        this.wishlistSubject.next(wishlistIds);
      })
    );
  }

  addToWishlist(productId: string): Observable<void> {
    return this.http.post<void>(`${this.WISHLIST_URL}/${productId}`, {}).pipe(
      tap(() => {
        const current = this.wishlistSubject.value;
        current.add(productId);
        this.wishlistSubject.next(new Set(current));
      })
    );
  }

  removeFromWishlist(productId: string): Observable<void> {
    return this.http.delete<void>(`${this.WISHLIST_URL}/${productId}`).pipe(
      tap(() => {
        const current = this.wishlistSubject.value;
        current.delete(productId);
        this.wishlistSubject.next(new Set(current));
      })
    );
  }

  isInWishlist(productId: string): boolean {
    return this.wishlistSubject.value.has(productId);
  }

  toggleWishlist(productId: string): Observable<void> {
    if (this.isInWishlist(productId)) {
      return this.removeFromWishlist(productId);
    } else {
      return this.addToWishlist(productId);
    }
  }

  private loadWishlist(): void {
    // Only load wishlist if user is authenticated
    const token = localStorage.getItem('shopsense_token');
    if (token) {
      this.getWishlist().subscribe({
        error: () => {
          // Silently fail if wishlist can't be loaded
          this.wishlistSubject.next(new Set());
        }
      });
    }
  }
}
