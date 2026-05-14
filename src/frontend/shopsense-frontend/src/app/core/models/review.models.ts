export interface ReviewDto {
  id: string;
  productId: string;
  productName: string;
  productSlug: string;
  userId: string;
  userName: string;
  rating: number;
  title: string;
  comment: string;
  sentimentLabel?: string;
  sentimentScore?: number;
  isVerifiedPurchase: boolean;
  sellerReply?: string;
  sellerReplyDate?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateReviewRequest {
  productId: string;
  rating: number;
  title: string;
  comment: string;
}
