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

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [RouterLink, ReactiveFormsModule, MatCardModule, MatFormFieldModule, MatInputModule, MatButtonModule, MatIconModule, MatSnackBarModule],
  template: `
    <div class="auth-page">
      <mat-card class="auth-card">
        <div class="auth-header">
          <div class="auth-logo">🍔</div>
          <h1>Welcome back!</h1>
          <p>Login to your FoodRush account</p>
        </div>
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
    .auth-card { width: 100%; max-width: 420px; padding: 40px; border-radius: 16px !important; box-shadow: 0 8px 32px rgba(0,0,0,0.1) !important; }
    .auth-header { text-align: center; margin-bottom: 28px; }
    .auth-logo { font-size: 48px; margin-bottom: 12px; }
    .auth-header h1 { font-size: 26px; font-weight: 700; color: #3d4152; }
    .auth-header p { color: #686b78; font-size: 14px; margin-top: 4px; }
    .auth-form { display: flex; flex-direction: column; gap: 4px; }
    .full-width { width: 100%; }
    .error-msg { display: flex; align-items: center; gap: 6px; color: #e23744; font-size: 13px; background: #fff5f5; padding: 10px 12px; border-radius: 8px; }
    .submit-btn { width: 100%; height: 48px; background: #e23744 !important; color: white !important; border-radius: 8px !important; font-size: 15px !important; font-weight: 600 !important; margin-top: 8px; }
    .demo-hint { display: flex; align-items: center; gap: 6px; font-size: 12px; color: #888; background: #f8f8f8; padding: 10px; border-radius: 8px; margin-top: 4px; }
    .auth-footer { text-align: center; margin-top: 20px; font-size: 14px; color: #686b78; }
    .auth-footer a { color: #e23744; font-weight: 600; text-decoration: none; }
  `]
})
export class LoginComponent {
  private fb = inject(FormBuilder);
  private auth = inject(AuthService);
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
