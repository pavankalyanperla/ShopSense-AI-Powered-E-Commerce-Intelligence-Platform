import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { InputOtpModule } from 'primeng/inputotp';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    InputTextModule,
    ButtonModule,
    InputOtpModule
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

        <!-- Right Panel - Register Form -->
        <div class="ss-auth-form-panel">
          <div class="ss-auth-form-card">
            <!-- Step 1: Registration -->
            @if (step === 1) {
              <h2 class="ss-auth-title">Create account</h2>
              <p class="ss-auth-subtitle">Join ShopSense today</p>

              @if (errorMessage) {
                <div class="ss-error-box">
                  <i class="pi pi-exclamation-circle"></i>
                  <span>{{ errorMessage }}</span>
                </div>
              }

              <form [formGroup]="registerForm" (ngSubmit)="onRegister()">
                <!-- Role Selector -->
                <div class="ss-role-selector">
                  <button 
                    type="button"
                    class="ss-role-btn"
                    [class.active]="registerForm.get('role')?.value === 'Customer'"
                    (click)="registerForm.patchValue({ role: 'Customer' })"
                  >
                    <i class="pi pi-shopping-cart"></i>
                    <span>Customer</span>
                  </button>
                  <button 
                    type="button"
                    class="ss-role-btn"
                    [class.active]="registerForm.get('role')?.value === 'Seller'"
                    (click)="registerForm.patchValue({ role: 'Seller' })"
                  >
                    <i class="pi pi-shop"></i>
                    <span>Seller</span>
                  </button>
                </div>

                <div class="ss-form-field">
                  <label for="fullName">Full Name</label>
                  <input 
                    pInputText 
                    id="fullName" 
                    formControlName="fullName" 
                    placeholder="Enter your full name"
                    class="ss-input"
                    [class.ss-input-error]="registerForm.get('fullName')?.invalid && registerForm.get('fullName')?.touched"
                  />
                  @if (registerForm.get('fullName')?.invalid && registerForm.get('fullName')?.touched) {
                    <small class="ss-field-error">Full name is required (min 2 characters)</small>
                  }
                </div>

                <div class="ss-form-field">
                  <label for="email">Email</label>
                  <input 
                    pInputText 
                    id="email" 
                    formControlName="email" 
                    type="email"
                    placeholder="you@example.com"
                    class="ss-input"
                    [class.ss-input-error]="registerForm.get('email')?.invalid && registerForm.get('email')?.touched"
                  />
                  @if (registerForm.get('email')?.invalid && registerForm.get('email')?.touched) {
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
                      placeholder="Create a strong password"
                      class="ss-input"
                      [class.ss-input-error]="registerForm.get('password')?.invalid && registerForm.get('password')?.touched"
                    />
                    <button 
                      type="button"
                      class="ss-password-toggle"
                      (click)="showPassword = !showPassword"
                    >
                      <i [class]="showPassword ? 'pi pi-eye-slash' : 'pi pi-eye'"></i>
                    </button>
                  </div>
                  @if (registerForm.get('password')?.touched) {
                    <div class="ss-password-strength">
                      <div class="ss-strength-bar" [class]="getPasswordStrength()"></div>
                    </div>
                    <small class="ss-field-hint">
                      {{ getPasswordStrengthText() }}
                    </small>
                  }
                  @if (registerForm.get('password')?.invalid && registerForm.get('password')?.touched) {
                    <small class="ss-field-error">
                      Password must be at least 8 characters with uppercase, lowercase, and number
                    </small>
                  }
                </div>

                <button 
                  type="submit" 
                  class="ss-btn-submit"
                  [disabled]="registerForm.invalid || loading"
                >
                  @if (loading) {
                    <i class="pi pi-spin pi-spinner"></i>
                    <span>Creating account...</span>
                  } @else {
                    <span>Create Account</span>
                  }
                </button>

                <p class="ss-auth-footer">
                  Already have an account? 
                  <a routerLink="/auth/login" class="ss-link">Sign in</a>
                </p>
              </form>
            }

            <!-- Step 2: OTP Verification -->
            @if (step === 2) {
              <div class="ss-otp-section">
                <div class="ss-otp-icon">
                  <i class="pi pi-envelope text-5xl text-blue-500"></i>
                </div>
                <h2 class="ss-auth-title">Check your email</h2>
                <p class="ss-auth-subtitle">
                  We've sent a 6-digit code to<br/>
                  <strong>{{ getMaskedEmail() }}</strong>
                </p>

                @if (errorMessage) {
                  <div class="ss-error-box">
                    <i class="pi pi-exclamation-circle"></i>
                    <span>{{ errorMessage }}</span>
                  </div>
                }

                @if (successMessage) {
                  <div class="ss-success-box">
                    <i class="pi pi-check-circle"></i>
                    <span>{{ successMessage }}</span>
                  </div>
                }

                <form [formGroup]="otpForm" (ngSubmit)="onVerifyOtp()">
                  <div class="ss-otp-field">
                    <p-inputOtp 
                      formControlName="code" 
                      [length]="6"
                      [integerOnly]="true"
                    />
                  </div>

                  <button 
                    type="submit" 
                    class="ss-btn-submit"
                    [disabled]="otpForm.invalid || loading"
                  >
                    @if (loading) {
                      <i class="pi pi-spin pi-spinner"></i>
                      <span>Verifying...</span>
                    } @else {
                      <span>Verify OTP</span>
                    }
                  </button>

                  <p class="ss-auth-footer">
                    Didn't receive the code? 
                    <a (click)="onResendOtp()" class="ss-link">Resend</a>
                  </p>
                </form>
              </div>
            }
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

    .ss-success-box {
      background: #D1FAE5;
      border: 1px solid #10B981;
      color: #059669;
      padding: 0.875rem 1rem;
      border-radius: 10px;
      display: flex;
      align-items: center;
      gap: 0.5rem;
      margin-bottom: 1.5rem;
      font-size: 0.875rem;
    }

    /* Role Selector */
    .ss-role-selector {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 0.75rem;
      margin-bottom: 1.5rem;
    }

    .ss-role-btn {
      padding: 1rem;
      border: 2px solid var(--ss-surface-300);
      border-radius: 10px;
      background: #fff;
      cursor: pointer;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0.5rem;
      transition: all 0.2s;
      font-weight: 600;
      color: var(--ss-text-secondary);
    }

    .ss-role-btn i {
      font-size: 1.5rem;
    }

    .ss-role-btn.active {
      border-color: var(--ss-brand-blue);
      background: rgba(31, 78, 121, 0.05);
      color: var(--ss-brand-blue);
    }

    .ss-role-btn:hover {
      border-color: var(--ss-brand-blue);
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

    .ss-field-hint {
      display: block;
      color: var(--ss-text-secondary);
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

    .ss-password-strength {
      height: 4px;
      background: var(--ss-surface-200);
      border-radius: 2px;
      margin-top: 0.5rem;
      overflow: hidden;
    }

    .ss-strength-bar {
      height: 100%;
      transition: all 0.3s;
      border-radius: 2px;
    }

    .ss-strength-bar.weak {
      width: 33%;
      background: #EF4444;
    }

    .ss-strength-bar.medium {
      width: 66%;
      background: #F59E0B;
    }

    .ss-strength-bar.strong {
      width: 100%;
      background: #10B981;
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
      cursor: pointer;
    }

    .ss-link:hover {
      text-decoration: underline;
    }

    /* OTP Section */
    .ss-otp-section {
      text-align: center;
    }

    .ss-otp-icon {
      margin-bottom: 1.5rem;
    }

    .ss-otp-field {
      margin-bottom: 1.5rem;
      display: flex;
      justify-content: center;
    }

    :host ::ng-deep .p-inputotp {
      gap: 0.5rem;
    }

    :host ::ng-deep .p-inputotp-input {
      width: 3rem;
      height: 3rem;
      font-size: 1.5rem;
      text-align: center;
      border: 2px solid var(--ss-surface-300);
      border-radius: 10px;
    }

    :host ::ng-deep .p-inputotp-input:focus {
      border-color: var(--ss-brand-blue);
      box-shadow: 0 0 0 3px rgba(31, 78, 121, 0.1);
    }
  `]
})
export class RegisterComponent {
  step = 1;
  registerForm: FormGroup;
  otpForm: FormGroup;
  loading = false;
  errorMessage = '';
  successMessage = '';
  registeredEmail = '';
  showPassword = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.registerForm = this.fb.group({
      fullName: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [
        Validators.required,
        Validators.minLength(8),
        Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/)
      ]],
      role: ['Customer', Validators.required]
    });

    this.otpForm = this.fb.group({
      code: [null, [Validators.required]]
    });
  }

  getPasswordStrength(): string {
    const password = this.registerForm.get('password')?.value || '';
    if (password.length === 0) return '';
    
    let strength = 0;
    if (password.length >= 8) strength++;
    if (/[a-z]/.test(password)) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/\d/.test(password)) strength++;
    if (/[^a-zA-Z\d]/.test(password)) strength++;

    if (strength <= 2) return 'weak';
    if (strength <= 3) return 'medium';
    return 'strong';
  }

  getPasswordStrengthText(): string {
    const strength = this.getPasswordStrength();
    if (strength === 'weak') return 'Weak password';
    if (strength === 'medium') return 'Medium strength';
    if (strength === 'strong') return 'Strong password';
    return '';
  }

  getMaskedEmail(): string {
    if (!this.registeredEmail) return '';
    const [local, domain] = this.registeredEmail.split('@');
    const maskedLocal = local.charAt(0) + '***' + local.charAt(local.length - 1);
    return `${maskedLocal}@${domain}`;
  }

  onRegister(): void {
    if (this.registerForm.valid) {
      this.loading = true;
      this.errorMessage = '';

      this.authService.register(this.registerForm.value).subscribe({
        next: (response) => {
          this.loading = false;
          this.registeredEmail = this.registerForm.value.email;
          this.successMessage = response.message;
          this.step = 2;
        },
        error: (error) => {
          this.loading = false;
          this.errorMessage = error.error?.message || 'Registration failed. Please try again.';
        }
      });
    }
  }

  onVerifyOtp(): void {
    if (this.otpForm.valid) {
      this.loading = true;
      this.errorMessage = '';

      const code = this.otpForm.value.code;
      const request = {
        email: this.registeredEmail,
        code: typeof code === 'number' ? code.toString() : code
      };

      this.authService.verifyOtp(request).subscribe({
        next: () => {
          this.router.navigate(['/home']);
        },
        error: (error) => {
          this.loading = false;
          this.errorMessage = error.error?.message || 'Invalid OTP. Please try again.';
        }
      });
    }
  }

  onResendOtp(): void {
    this.loading = true;
    this.errorMessage = '';
    this.successMessage = '';

    this.authService.register(this.registerForm.value).subscribe({
      next: (response) => {
        this.loading = false;
        this.successMessage = 'OTP resent successfully!';
        this.otpForm.reset();
      },
      error: (error) => {
        this.loading = false;
        this.errorMessage = error.error?.message || 'Failed to resend OTP.';
      }
    });
  }
}
