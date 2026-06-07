import { Component, inject } from '@angular/core';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
import { FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { AuthService } from '../../../core/services/auth.service';
import { FirebaseAuthService } from '../../../core/services/firebase-auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [RouterLink, ReactiveFormsModule, MatCardModule, MatFormFieldModule, MatInputModule, MatButtonModule, MatIconModule, MatSnackBarModule],
  template: `
    <div class="auth-page">
      <mat-card class="auth-card">
        <div class="auth-header">
          <div class="auth-logo">👑</div>
          <h1>Welcome back!</h1>
          <p>Login to your Kitchen King Food account</p>
        </div>

        <!-- Social Login Buttons -->
        <div class="social-section">
          <button class="social-btn google-btn" (click)="loginGoogle()" [disabled]="socialLoading">
            <svg width="20" height="20" viewBox="0 0 48 48">
              <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
              <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
              <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
              <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
              <path fill="none" d="M0 0h48v48H0z"/>
            </svg>
            <span>{{ socialLoading === 'google' ? 'Connecting...' : 'Continue with Google' }}</span>
          </button>

          <button class="social-btn facebook-btn" (click)="loginFacebook()" [disabled]="socialLoading">
            <svg width="20" height="20" viewBox="0 0 24 24">
              <path fill="#fff" d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
            </svg>
            <span>{{ socialLoading === 'facebook' ? 'Connecting...' : 'Continue with Facebook' }}</span>
          </button>
        </div>

        @if (socialError) {
          <div class="social-error"><mat-icon>error</mat-icon> {{ socialError }}</div>
        }

        <div class="divider"><span>OR</span></div>

        <!-- Email/Password Form -->
        <form [formGroup]="form" (ngSubmit)="onSubmit()" class="auth-form">
          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Email</mat-label>
            <input matInput formControlName="email" type="email" placeholder="you@example.com" />
            <mat-icon matSuffix>email</mat-icon>
            @if (form.get('email')?.hasError('required') && form.get('email')?.touched) {
              <mat-error>Email is required</mat-error>
            }
            @if (form.get('email')?.hasError('email') && form.get('email')?.touched) {
              <mat-error>Enter a valid email</mat-error>
            }
          </mat-form-field>
          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Password</mat-label>
            <input matInput formControlName="password" [type]="showPass ? 'text' : 'password'" />
            <button mat-icon-button matSuffix type="button" (click)="showPass = !showPass">
              <mat-icon>{{ showPass ? 'visibility_off' : 'visibility' }}</mat-icon>
            </button>
            @if (form.get('password')?.hasError('required') && form.get('password')?.touched) {
              <mat-error>Password is required</mat-error>
            }
          </mat-form-field>
          @if (error) {
            <div class="error-msg"><mat-icon>error</mat-icon> {{ error }}</div>
          }
          <button mat-raised-button class="submit-btn" type="submit" [disabled]="loading">
            @if (loading) { <span>Logging in...</span> } @else { <span>Login</span> }
          </button>
          <div class="demo-hint">
            <mat-icon>info</mat-icon> Demo: <strong>demo&#64;foodrush.com</strong> / <strong>demo123</strong>
          </div>
        </form>

        <div class="auth-footer">
          Don't have an account? <a routerLink="/register">Sign Up</a>
        </div>
      </mat-card>
    </div>
  `,
  styles: [`
    .auth-page { min-height: 80vh; display: flex; align-items: center; justify-content: center; background: linear-gradient(135deg, #fff5f5 0%, #fff 100%); padding: 20px; }
    .auth-card { width: 100%; max-width: 440px; padding: 36px; border-radius: 16px !important; box-shadow: 0 8px 32px rgba(0,0,0,0.1) !important; }
    .auth-header { text-align: center; margin-bottom: 24px; }
    .auth-logo { font-size: 44px; margin-bottom: 10px; }
    .auth-header h1 { font-size: 24px; font-weight: 700; color: #3d4152; }
    .auth-header p { color: #686b78; font-size: 13px; margin-top: 4px; }

    /* Social buttons */
    .social-section { display: flex; flex-direction: column; gap: 10px; margin-bottom: 8px; }
    .social-btn { display: flex; align-items: center; justify-content: center; gap: 12px; width: 100%; height: 46px; border-radius: 10px; border: 1.5px solid #e0e0e0; background: white; font-size: 14px; font-weight: 600; cursor: pointer; transition: all 0.2s; font-family: Poppins, sans-serif; }
    .social-btn:hover:not(:disabled) { box-shadow: 0 2px 12px rgba(0,0,0,0.12); transform: translateY(-1px); }
    .social-btn:disabled { opacity: 0.6; cursor: not-allowed; }
    .google-btn { color: #3c4043; border-color: #dadce0; }
    .google-btn:hover:not(:disabled) { background: #f8f9ff; border-color: #4285F4; }
    .facebook-btn { background: #1877F2; color: white; border-color: #1877F2; }
    .facebook-btn:hover:not(:disabled) { background: #166fe5; }
    .social-error { display: flex; align-items: center; gap: 6px; color: #e23744; font-size: 12px; background: #fff5f5; padding: 8px 12px; border-radius: 8px; margin-bottom: 8px; }
    .social-error mat-icon { font-size: 16px; width: 16px; height: 16px; }

    /* Divider */
    .divider { display: flex; align-items: center; gap: 12px; margin: 16px 0 8px; color: #bbb; font-size: 12px; font-weight: 600; letter-spacing: 0.5px; }
    .divider::before, .divider::after { content: ''; flex: 1; height: 1px; background: #eee; }

    /* Form */
    .auth-form { display: flex; flex-direction: column; gap: 4px; }
    .full-width { width: 100%; }
    .error-msg { display: flex; align-items: center; gap: 6px; color: #e23744; font-size: 13px; background: #fff5f5; padding: 10px 12px; border-radius: 8px; }
    .submit-btn { width: 100%; height: 48px; background: #e23744 !important; color: white !important; border-radius: 8px !important; font-size: 15px !important; font-weight: 600 !important; margin-top: 8px; }
    .demo-hint { display: flex; align-items: center; gap: 6px; font-size: 12px; color: #888; background: #f8f8f8; padding: 10px; border-radius: 8px; margin-top: 4px; }
    .demo-hint mat-icon { font-size: 16px; width: 16px; height: 16px; }

    .auth-footer { text-align: center; margin-top: 20px; font-size: 14px; color: #686b78; }
    .auth-footer a { color: #e23744; font-weight: 600; text-decoration: none; }

    @media(max-width: 480px) {
      .auth-card { padding: 24px 20px; }
      .social-btn { font-size: 13px; }
    }
  `]
})
export class LoginComponent {
  private fb = inject(FormBuilder);
  private auth = inject(AuthService);
  private firebaseAuth = inject(FirebaseAuthService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private snackBar = inject(MatSnackBar);

  form = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', Validators.required]
  });
  showPass = false;
  loading = false;
  error = '';
  socialLoading: 'google' | 'facebook' | null = null;
  socialError = '';

  async loginGoogle() {
    this.socialLoading = 'google';
    this.socialError = '';
    try {
      await this.firebaseAuth.loginWithGoogle();
      this.snackBar.open('Welcome! Signed in with Google', '', { duration: 2500, panelClass: 'snack-success' });
    } catch (e: any) {
      this.socialError = this.getFriendlyError(e);
    } finally {
      this.socialLoading = null;
    }
  }

  async loginFacebook() {
    this.socialLoading = 'facebook';
    this.socialError = '';
    try {
      await this.firebaseAuth.loginWithFacebook();
      this.snackBar.open('Welcome! Signed in with Facebook', '', { duration: 2500, panelClass: 'snack-success' });
    } catch (e: any) {
      this.socialError = this.getFriendlyError(e);
    } finally {
      this.socialLoading = null;
    }
  }

  private getFriendlyError(e: any): string {
    const code = e?.code || '';
    if (code === 'auth/popup-closed-by-user') return 'Login cancelled. Please try again.';
    if (code === 'auth/popup-blocked') return 'Popup blocked. Please allow popups for this site.';
    if (code === 'auth/account-exists-with-different-credential') return 'Account already exists with a different login method.';
    if (code.includes('invalid-api-key') || code.includes('api-key')) return 'Firebase not configured yet. Please set up your Firebase project.';
    return 'Social login failed. Please try email/password login.';
  }

  onSubmit() {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.loading = true; this.error = '';
    const { email, password } = this.form.value;
    setTimeout(() => {
      const ok = this.auth.login(email!, password!);
      this.loading = false;
      if (ok) {
        this.snackBar.open('Welcome back!', '', { duration: 2000, panelClass: 'snack-success' });
        const returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/home';
        this.router.navigateByUrl(returnUrl);
      } else {
        this.error = 'Invalid email or password. Try demo@foodrush.com / demo123';
      }
    }, 800);
  }
}
