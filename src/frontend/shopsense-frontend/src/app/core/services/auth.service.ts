import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, BehaviorSubject, tap, catchError, throwError } from 'rxjs';
import { 
  User, 
  RegisterRequest, 
  LoginRequest, 
  VerifyOtpRequest, 
  AuthResponse, 
  UpdateProfileRequest 
} from '../models/auth.models';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly API_URL = 'http://localhost:5000/api/v1/auth';
  private readonly USERS_URL = 'http://localhost:5000/api/v1/users';
  private readonly TOKEN_KEY = 'shopsense_token';
  private readonly REFRESH_TOKEN_KEY = 'shopsense_refresh_token';
  private readonly USER_KEY = 'shopsense_user';

  private currentUserSubject = new BehaviorSubject<User | null>(this.getUserFromStorage());
  public currentUser$ = this.currentUserSubject.asObservable();

  // Signal for reactive components
  public currentUserSignal = signal<User | null>(this.getUserFromStorage());

  constructor(
    private http: HttpClient,
    private router: Router
  ) {}

  register(request: RegisterRequest): Observable<{ message: string; user: User }> {
    return this.http.post<{ message: string; user: User }>(`${this.API_URL}/register`, request);
  }

  verifyOtp(request: VerifyOtpRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.API_URL}/verify-otp`, request).pipe(
      tap(response => this.handleAuthResponse(response))
    );
  }

  login(request: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.API_URL}/login`, request).pipe(
      tap(response => this.handleAuthResponse(response))
    );
  }

  googleAuth(idToken: string): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.API_URL}/google`, { idToken }).pipe(
      tap(response => this.handleAuthResponse(response))
    );
  }

  refreshToken(): Observable<AuthResponse> {
    const refreshToken = this.getRefreshToken();
    if (!refreshToken) {
      return throwError(() => new Error('No refresh token available'));
    }

    return this.http.post<AuthResponse>(`${this.API_URL}/refresh`, { refreshToken }).pipe(
      tap(response => this.handleAuthResponse(response)),
      catchError(error => {
        this.logout();
        return throwError(() => error);
      })
    );
  }

  logout(): Observable<any> {
    const token = this.getToken();
    if (token) {
      return this.http.post(`${this.API_URL}/logout`, {}).pipe(
        tap(() => this.clearAuthData())
      );
    } else {
      this.clearAuthData();
      return new Observable(observer => {
        observer.next(null);
        observer.complete();
      });
    }
  }

  getCurrentUser(): Observable<User> {
    return this.http.get<User>(`${this.USERS_URL}/me`);
  }

  updateProfile(request: UpdateProfileRequest): Observable<User> {
    return this.http.put<User>(`${this.USERS_URL}/me`, request).pipe(
      tap(user => {
        this.setUser(user);
      })
    );
  }

  private handleAuthResponse(response: AuthResponse): void {
    localStorage.setItem(this.TOKEN_KEY, response.token);
    localStorage.setItem(this.REFRESH_TOKEN_KEY, response.refreshToken);
    this.setUser(response.user);
  }

  private setUser(user: User): void {
    localStorage.setItem(this.USER_KEY, JSON.stringify(user));
    this.currentUserSubject.next(user);
    this.currentUserSignal.set(user);
  }

  private clearAuthData(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.REFRESH_TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
    this.currentUserSubject.next(null);
    this.currentUserSignal.set(null);
    this.router.navigate(['/auth/login']);
  }

  private getUserFromStorage(): User | null {
    const userJson = localStorage.getItem(this.USER_KEY);
    return userJson ? JSON.parse(userJson) : null;
  }

  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  getRefreshToken(): string | null {
    return localStorage.getItem(this.REFRESH_TOKEN_KEY);
  }

  isAuthenticated(): boolean {
    const token = this.getToken();
    if (!token) return false;

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const expiry = payload.exp * 1000;
      return Date.now() < expiry;
    } catch {
      return false;
    }
  }

  hasRole(role: string): boolean {
    const user = this.currentUserSubject.value;
    return user?.role === role;
  }

  hasAnyRole(roles: string[]): boolean {
    const user = this.currentUserSubject.value;
    return user ? roles.includes(user.role) : false;
  }
}
