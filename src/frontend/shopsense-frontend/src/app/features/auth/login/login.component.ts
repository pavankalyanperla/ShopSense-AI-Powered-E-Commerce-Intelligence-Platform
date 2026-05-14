import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';
import { CardModule } from 'primeng/card';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { ButtonModule } from 'primeng/button';
import { MessageModule } from 'primeng/message';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    CardModule,
    InputTextModule,
    PasswordModule,
    ButtonModule,
    MessageModule
  ],
  template: `
    <div class="ss-auth-page">
      <div class="ss-auth-container">
        <!-- Left Panel - Brand -->
        <div class="ss-auth-brand">
          <div class="ss-brand-content">
            <div class="ss-logo-large">
              <span class="ss-logo-icon-lg">S</span>
              <span class="ss-logo-text-lg">ShopSense</span>
            </div>
            <p class="ss-brand-tagline">
              India's AI-Powered E-Commerce Platform
            </p>
            <div class="ss-brand-features">
              <div class="ss-feature-item">
                <i class="pi pi-shield"></i>
                <span>Fraud Protection with XGBoost ML</span>
              </div>
              <div class="ss-feature-item">
                <i class="pi pi-heart"></i>
                <span>Personalized Recommendations</span>
              </div>
              <div class="ss-feature-item">
                <i class="pi pi-tag"></i>
                <span>Dynamic Pricing Algorithm</span>
              </div>
              <div class="ss-feature-item">
                <i class="pi pi-truck"></i>
                <span>Free Delivery Across India</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Right Panel - Login Form -->
        <div class="ss-auth-form-panel">
          <div class="ss-auth-form-card">
            <h2 class="ss-auth-title">Welcome back</h2>
            <p class="ss-auth-subtitle">Sign in to continue shopping</p>

            @if (errorMessage) {
              <div class="ss-error-box">
                <i class="pi pi-exclamation-circle"></i>
                <span>{{ errorMessage }}</span>
              </div>
            }

            <form [formGroup]="loginForm" (ngSubmit)="onSubmit()">
              <div class="ss-form-field">
                <label for="email">Email</label>
                <input 
                  pInputText 
                  id="email" 
                  formControlName="email" 
                  type="email"
                  placeholder="you@example.com"
                  class="ss-input"
                  [class.ss-input-error]="loginForm.get('email')?.invalid && loginForm.get('email')?.touched"
                />
                @if (loginForm.get('email')?.invalid && loginForm.get('email')?.touched) {
                  <small class="ss-field-error">Valid email is required</small>
                }
              </div>

              <div class="ss-form-field">
                <label for="password">Password</label>
                <div class="ss-password-wrap">
                  <input 
                    [type]="showPassword ? 'text' : 'password'"
                    pInputText
                    id="password" 
                    formControlName="password" 
                    placeholder="Enter your password"
                    class="ss-input"
                    [class.ss-input-error]="loginForm.get('password')?.invalid && loginForm.get('password')?.touched"
                  />
                  <button 
                    type="button"
                    class="ss-password-toggle"
                    (click)="showPassword = !showPassword"
                  >
                    <i [class]="showPassword ? 'pi pi-eye-slash' : 'pi pi-eye'"></i>
                  </button>
                </div>
                @if (loginForm.get('password')?.invalid && loginForm.get('password')?.touched) {
                  <small class="ss-field-error">Password is required</small>
                }
              </div>

              <button 
                type="submit" 
                class="ss-btn-submit"
                [disabled]="loginForm.invalid || loading"
              >
                @if (loading) {
                  <i class="pi pi-spin pi-spinner"></i>
                  <span>Signing in...</span>
                } @else {
                  <span>Sign In</span>
                }
              </button>

              <div class="ss-divider">
                <span>or</span>
              </div>

              <button type="button" class="ss-btn-google">
                <img src="https://www.google.com/favicon.ico" alt="Google" width="20" height="20" />
                <span>Continue with Google</span>
              </button>

              <p class="ss-auth-footer">
                Don't have an account? 
                <a routerLink="/auth/register" class="ss-link">Create one</a>
              </p>
            </form>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .ss-auth-page {
      min-height: 100vh;
      background: var(--ss-surface-50);
      margin-top: -100px;
      padding-top: 100px;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 2rem 1rem;
    }

    .ss-auth-container {
      display: grid;
      grid-template-columns: 1fr 1fr;
      max-width: 1000px;
      width: 100%;
      background: #fff;
      border-radius: 24px;
      overflow: hidden;
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
    }

    @media (max-width: 1024px) {
      .ss-auth-container {
        grid-template-columns: 1fr;
      }
      .ss-auth-brand {
        display: none;
      }
    }

    /* Left Panel */
    .ss-auth-brand {
      background: linear-gradient(135deg, #1F4E79 0%, #2563EB 100%);
      color: #fff;
      padding: 3rem;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .ss-brand-content {
      max-width: 400px;
    }

    .ss-logo-large {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      margin-bottom: 1.5rem;
    }

    .ss-logo-icon-lg {
      width: 48px;
      height: 48px;
      background: #fff;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 800;
      color: #1F4E79;
      font-size: 1.5rem;
    }

    .ss-logo-text-lg {
      font-size: 2rem;
      font-weight: 700;
    }

    .ss-brand-tagline {
      font-size: 1.125rem;
      opacity: 0.9;
      margin-bottom: 2rem;
    }

    .ss-brand-features {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .ss-feature-item {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      font-size: 0.9375rem;
    }

    .ss-feature-item i {
      font-size: 1.25rem;
    }

    /* Right Panel */
    .ss-auth-form-panel {
      padding: 3rem;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .ss-auth-form-card {
      width: 100%;
      max-width: 400px;
    }

    .ss-auth-title {
      font-size: 2rem;
      font-weight: 700;
      color: var(--ss-text-primary);
      margin-bottom: 0.5rem;
    }

    .ss-auth-subtitle {
      font-size: 1rem;
      color: var(--ss-text-secondary);
      margin-bottom: 2rem;
    }

    .ss-error-box {
      background: #FEE2E2;
      border: 1px solid #EF4444;
      color: #DC2626;
      padding: 0.875rem 1rem;
      border-radius: 10px;
      display: flex;
      align-items: center;
      gap: 0.5rem;
      margin-bottom: 1.5rem;
      font-size: 0.875rem;
    }

    .ss-form-field {
      margin-bottom: 1.5rem;
    }

    .ss-form-field label {
      display: block;
      font-weight: 600;
      color: var(--ss-text-primary);
      margin-bottom: 0.5rem;
      font-size: 0.875rem;
    }

    .ss-input {
      width: 100%;
      padding: 0.75rem 1rem;
      border: 1.5px solid var(--ss-surface-300);
      border-radius: 10px;
      font-size: 0.9375rem;
      transition: all 0.2s;
    }

    .ss-input:focus {
      outline: none;
      border-color: var(--ss-brand-blue);
      box-shadow: 0 0 0 3px rgba(31, 78, 121, 0.1);
    }

    .ss-input-error {
      border-color: #EF4444;
    }

    .ss-field-error {
      display: block;
      color: #EF4444;
      font-size: 0.8125rem;
      margin-top: 0.375rem;
    }

    .ss-password-wrap {
      position: relative;
    }

    .ss-password-toggle {
      position: absolute;
      right: 12px;
      top: 50%;
      transform: translateY(-50%);
      background: none;
      border: none;
      color: var(--ss-text-secondary);
      cursor: pointer;
      padding: 0.5rem;
    }

    .ss-btn-submit {
      width: 100%;
      background: var(--ss-brand-blue);
      color: #fff;
      padding: 0.875rem;
      border: none;
      border-radius: 10px;
      font-weight: 600;
      font-size: 1rem;
      cursor: pointer;
      transition: all 0.2s;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
    }

    .ss-btn-submit:hover:not(:disabled) {
      background: #1a3f5f;
    }

    .ss-btn-submit:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    .ss-divider {
      display: flex;
      align-items: center;
      gap: 1rem;
      margin: 1.5rem 0;
      color: var(--ss-text-secondary);
      font-size: 0.875rem;
    }

    .ss-divider::before,
    .ss-divider::after {
      content: '';
      flex: 1;
      height: 1px;
      background: var(--ss-surface-300);
    }

    .ss-btn-google {
      width: 100%;
      background: #fff;
      color: var(--ss-text-primary);
      padding: 0.875rem;
      border: 1.5px solid var(--ss-surface-300);
      border-radius: 10px;
      font-weight: 600;
      font-size: 1rem;
      cursor: pointer;
      transition: all 0.2s;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.75rem;
    }

    .ss-btn-google:hover {
      background: var(--ss-surface-50);
    }

    .ss-auth-footer {
      text-align: center;
      margin-top: 1.5rem;
      color: var(--ss-text-secondary);
      font-size: 0.9375rem;
    }

    .ss-link {
      color: var(--ss-brand-blue);
      font-weight: 600;
      text-decoration: none;
    }

    .ss-link:hover {
      text-decoration: underline;
    }
  `]
})
export class LoginComponent {
  loginForm: FormGroup;
  loading = false;
  errorMessage = '';
  returnUrl = '/home';
  showPassword = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required]
    });

    // Get return URL from route parameters or default to '/home'
    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/home';
  }

  onSubmit(): void {
    if (this.loginForm.valid) {
      this.loading = true;
      this.errorMessage = '';

      this.authService.login(this.loginForm.value).subscribe({
        next: () => {
          this.router.navigate([this.returnUrl]);
        },
        error: (error) => {
          this.loading = false;
          this.errorMessage = error.error?.message || 'Login failed. Please try again.';
        }
      });
    }
  }
}
