export interface User {
  id: string;
  fullName: string;
  email: string;
  role: 'Customer' | 'Seller' | 'Admin';
  isEmailVerified: boolean;
  profilePicture?: string;
}

export interface RegisterRequest {
  fullName: string;
  email: string;
  password: string;
  role: 'Customer' | 'Seller';
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface VerifyOtpRequest {
  email: string;
  code: string;
}

export interface AuthResponse {
  token: string;
  refreshToken: string;
  user: User;
}

export interface UpdateProfileRequest {
  fullName?: string;
  profilePicture?: string;
}
