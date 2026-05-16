import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  SellerDto,
  EarningsDto,
  RegisterSellerRequest,
  SubmitKycRequest,
  ListingCoachRequest,
  ListingCoachResponse
} from '../models/seller.models';

@Injectable({
  providedIn: 'root'
})
export class SellerService {
  private base = `${environment.apiGatewayUrl}/api/v1/sellers`;

  constructor(private http: HttpClient) {}

  register(request: RegisterSellerRequest): Observable<SellerDto> {
    return this.http.post<SellerDto>(`${this.base}/register`, request);
  }

  getMe(): Observable<SellerDto> {
    return this.http.get<SellerDto>(`${this.base}/me`);
  }

  submitKyc(request: SubmitKycRequest): Observable<SellerDto> {
    return this.http.post<SellerDto>(`${this.base}/kyc`, request);
  }

  getEarnings(): Observable<EarningsDto> {
    return this.http.get<EarningsDto>(`${this.base}/earnings`);
  }

  getListingCoach(request: ListingCoachRequest): Observable<ListingCoachResponse> {
    return this.http.post<ListingCoachResponse>(`${this.base}/listing-coach`, request);
  }

  // Admin methods
  getAllSellers(status?: string): Observable<SellerDto[]> {
    const query = status ? `?status=${status}` : '';
    return this.http.get<SellerDto[]>(`${this.base}/admin/all${query}`);
  }

  makeKycDecision(sellerId: string, approved: boolean, reason?: string): Observable<SellerDto> {
    return this.http.put<SellerDto>(`${this.base}/${sellerId}/kyc-decision`, {
      approved,
      reason
    });
  }

  suspendSeller(sellerId: string, reason: string): Observable<SellerDto> {
    return this.http.put<SellerDto>(`${this.base}/${sellerId}/suspend`, { reason });
  }
}
