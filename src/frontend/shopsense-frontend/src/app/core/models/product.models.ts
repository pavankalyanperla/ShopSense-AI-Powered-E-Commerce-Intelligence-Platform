export interface ProductDto {
  id: string;
  name: string;
  slug: string;
  description: string;
  brand: string;
  categoryId: string;
  categoryName: string;
  sellerId: string;
  sellerName: string;
  basePrice: number;
  discountedPrice?: number;
  discountPercent: number;
  stockQuantity: number;
  isActive: boolean;
  isFeatured: boolean;
  averageRating: number;
  reviewCount: number;
  sentimentLabel?: string;
  sentimentScore?: number;
  primaryImageUrl: string;
  images: ProductImageDto[];
  variants: ProductVariantDto[];
  specifications: ProductSpecDto[];
  createdAt: string;
}

export interface ProductImageDto {
  id: string;
  imageUrl: string;
  isPrimary: boolean;
  displayOrder: number;
}

export interface ProductVariantDto {
  id: string;
  variantType: string;
  variantValue: string;
  additionalPrice: number;
  stock: number;
}

export interface ProductSpecDto {
  key: string;
  value: string;
}

export interface CategoryDto {
  id: string;
  name: string;
  slug: string;
  description?: string;
  imageUrl?: string;
  parentCategoryId?: string;
  displayOrder: number;
  subCategories: CategoryDto[];
}

export interface PagedResult<T> {
  items: T[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface ProductQueryParams {
  search?: string;
  categoryId?: string;
  minPrice?: number;
  maxPrice?: number;
  minRating?: number;
  inStock?: boolean;
  sortBy?: string;
  sortDesc?: boolean;
  page?: number;
  pageSize?: number;
}
