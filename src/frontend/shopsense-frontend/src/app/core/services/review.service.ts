import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ReviewDto, CreateReviewRequest } from '../models/review.models';

@Injectable({
  providedIn: 'root'
})
export class ReviewService {
  private readonly API_URL = 'http://localhost:5000/api/reviews';

  constructor(private http: HttpClient) {}

  getMyReviews(): Observable<ReviewDto[]> {
    return this.http.get<ReviewDto[]>(`${this.API_URL}/my-reviews`);
  }

  getProductReviews(productId: string): Observable<ReviewDto[]> {
    return this.http.get<ReviewDto[]>(`${this.API_URL}/product/${productId}`);
  }

  createReview(request: CreateReviewRequest): Observable<ReviewDto> {
    return this.http.post<ReviewDto>(this.API_URL, request);
  }

  updateReview(reviewId: string, request: CreateReviewRequest): Observable<ReviewDto> {
    return this.http.put<ReviewDto>(`${this.API_URL}/${reviewId}`, request);
  }

  deleteReview(reviewId: string): Observable<void> {
    return this.http.delete<void>(`${this.API_URL}/${reviewId}`);
  }
}
