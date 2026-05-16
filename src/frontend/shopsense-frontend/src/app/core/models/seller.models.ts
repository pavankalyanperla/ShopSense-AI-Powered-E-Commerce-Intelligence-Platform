export interface SellerDto {
  id: string;
  userId: string;
  businessName: string;
  email: string;
  phoneNumber: string;
  status: 'Pending' | 'Approved' | 'Rejected' | 'Suspended';
  totalEarnings: number;
  createdAt: Date;
  approvedAt?: Date;
  rejectionReason?: string;
  suspensionReason?: string;
  kycDocument?: KycDocumentDto;
}

export interface KycDocumentDto {
  id: string;
  sellerId: string;
  aadhaarNumber: string;
  panNumber: string;
  gstNumber: string;
  bankAccountNumber: string;
  ifscCode: string;
  aadhaarStatus: string;
  panStatus: string;
  gstStatus: string;
  bankStatus: string;
  submittedAt: Date;
}

export interface EarningsDto {
  totalEarnings: number;
  pendingPayout: number;
  thisMonthEarnings: number;
  transactions: TransactionDto[];
}

export interface TransactionDto {
  id: string;
  productName: string;
  quantity: number;
  grossAmount: number;
  commissionAmount: number;
  netAmount: number;
  payoutStatus: 'Pending' | 'Processing' | 'Paid';
  periodMonth: string;
}

export interface RegisterSellerRequest {
  businessName: string;
  phoneNumber: string;
}

export interface SubmitKycRequest {
  aadhaarNumber: string;
  panNumber: string;
  gstNumber: string;
  bankAccountNumber: string;
  ifscCode: string;
}

export interface ListingCoachRequest {
  productName: string;
  description: string;
  imageCount: number;
  specificationCount: number;
  basePrice: number;
  categoryId: string;
}

export interface ListingCoachResponse {
  overallScore: number;
  titleScore: number;
  descriptionScore: number;
  imageScore: number;
  specificationScore: number;
  priceScore: number;
  improvements: string[];
  seoKeywords: string[];
}
