import { Component, inject, OnInit, AfterViewChecked, ViewChild, ElementRef } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { MatStepper, MatStepperModule } from '@angular/material/stepper';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { AsyncPipe } from '@angular/common';
import { map } from 'rxjs/operators';
import { CartService } from '../../core/services/cart.service';
import { OrderService } from '../../core/services/order.service';
import { AuthService } from '../../core/services/auth.service';
import { DeliveryAddress } from '../../core/models/order.model';
import QRCode from 'qrcode';

type PaymentMethod = 'card' | 'upi' | 'netbanking';

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [ReactiveFormsModule, FormsModule, MatStepperModule, MatFormFieldModule, MatInputModule,
    MatButtonModule, MatIconModule, MatCardModule, MatDividerModule, MatSnackBarModule, AsyncPipe],
  template: `
    <div class="page container">
      <h1 class="page-title">Checkout</h1>
      <div class="checkout-layout">
        <div class="steps-section">
          <mat-stepper #stepper [linear]="true" orientation="vertical">
            <!-- Step 1: Address -->
            <mat-step [stepControl]="addressForm" label="Delivery Address">
              <form [formGroup]="addressForm" class="step-form">
                <div class="form-row">
                  <mat-form-field appearance="outline">
                    <mat-label>Full Name</mat-label>
                    <input matInput formControlName="name" />
                    @if (addressForm.get('name')?.invalid && addressForm.get('name')?.touched) {
                      <mat-error>Name is required</mat-error>
                    }
                  </mat-form-field>
                  <mat-form-field appearance="outline">
                    <mat-label>Phone</mat-label>
                    <input matInput formControlName="phone" type="tel" />
                    @if (addressForm.get('phone')?.invalid && addressForm.get('phone')?.touched) {
                      <mat-error>Valid 10-digit phone required</mat-error>
                    }
                  </mat-form-field>
                </div>
                <mat-form-field appearance="outline" class="full-width">
                  <mat-label>Street Address</mat-label>
                  <input matInput formControlName="street" placeholder="House/flat no., Street, Area" />
                  @if (addressForm.get('street')?.invalid && addressForm.get('street')?.touched) {
                    <mat-error>Street is required</mat-error>
                  }
                </mat-form-field>
                <div class="form-row">
                  <mat-form-field appearance="outline">
                    <mat-label>City</mat-label>
                    <input matInput formControlName="city" />
                  </mat-form-field>
                  <mat-form-field appearance="outline">
                    <mat-label>State</mat-label>
                    <input matInput formControlName="state" />
                  </mat-form-field>
                  <mat-form-field appearance="outline">
                    <mat-label>Pincode</mat-label>
                    <input matInput formControlName="pincode" />
                  </mat-form-field>
                </div>
                <button mat-raised-button class="next-btn" (click)="goToPayment()">
                  Continue to Payment <mat-icon>arrow_forward</mat-icon>
                </button>
              </form>
            </mat-step>

            <!-- Step 2: Payment -->
            <mat-step label="Payment">
              <div class="payment-section">
                <div class="secure-header">
                  <mat-icon>lock</mat-icon> 100% Secure Payment
                </div>

                <!-- Payment method tabs -->
                <div class="payment-methods">
                  <div class="payment-method" [class.active]="activeMethod === 'card'" (click)="selectMethod('card')">
                    <mat-icon>credit_card</mat-icon> Card
                  </div>
                  <div class="payment-method" [class.active]="activeMethod === 'upi'" (click)="selectMethod('upi')">
                    <span class="upi-icon">UPI</span> UPI
                  </div>
                  <div class="payment-method" [class.active]="activeMethod === 'netbanking'" (click)="selectMethod('netbanking')">
                    <mat-icon>account_balance</mat-icon> Net Banking
                  </div>
                </div>

                <!-- Card Payment -->
                @if (activeMethod === 'card') {
                  <div class="card-form">
                    <mat-form-field appearance="outline" class="full-width">
                      <mat-label>Card Number</mat-label>
                      <input matInput placeholder="4242 4242 4242 4242" maxlength="19"
                        [value]="cardNumber" (input)="formatCard($event)" />
                      <mat-icon matSuffix>credit_card</mat-icon>
                    </mat-form-field>
                    <div class="form-row">
                      <mat-form-field appearance="outline">
                        <mat-label>Expiry (MM/YY)</mat-label>
                        <input matInput placeholder="12/26" maxlength="5" />
                      </mat-form-field>
                      <mat-form-field appearance="outline">
                        <mat-label>CVV</mat-label>
                        <input matInput placeholder="123" maxlength="3" type="password" />
                      </mat-form-field>
                    </div>
                    <mat-form-field appearance="outline" class="full-width">
                      <mat-label>Name on Card</mat-label>
                      <input matInput placeholder="John Doe" />
                    </mat-form-field>
                    <div class="hint-box">
                      <mat-icon>info</mat-icon>
                      Test card: <strong>4242 4242 4242 4242</strong> | Exp: any future date | CVV: any 3 digits
                    </div>
                  </div>
                }

                <!-- UPI Payment -->
                @if (activeMethod === 'upi') {
                  <div class="upi-section">
                    <p class="upi-subtitle">Pay instantly using any UPI app</p>

                    <!-- Quick UPI App Buttons -->
                    <div class="upi-apps">
                      @for (app of upiApps; track app.id) {
                        <button class="upi-app-btn" [class.selected]="selectedUpiApp === app.id"
                            (click)="selectUpiApp(app.id)">
                          <div class="upi-app-logo">
                            @switch (app.id) {
                              @case ('gpay') {
                                <svg width="44" height="44" viewBox="0 0 44 44">
                                  <rect width="44" height="44" rx="10" fill="white" stroke="#dadce0" stroke-width="1.5"/>
                                  <text x="7" y="28" font-size="22" font-weight="900" font-family="Arial" fill="#4285F4">G</text>
                                  <text x="26" y="28" font-size="13" font-weight="700" font-family="Arial" fill="#5f6368">Pay</text>
                                </svg>
                              }
                              @case ('phonepe') {
                                <svg width="44" height="44" viewBox="0 0 44 44">
                                  <rect width="44" height="44" rx="10" fill="#5f259f"/>
                                  <text x="22" y="18" text-anchor="middle" font-size="9" font-weight="700" font-family="Arial" fill="white" letter-spacing="1">PHONE</text>
                                  <rect x="12" y="21" width="20" height="2" rx="1" fill="white" opacity="0.5"/>
                                  <text x="22" y="35" text-anchor="middle" font-size="12" font-weight="900" font-family="Arial" fill="#cbacf9">Pe</text>
                                </svg>
                              }
                              @case ('paytm') {
                                <svg width="44" height="44" viewBox="0 0 44 44">
                                  <rect width="44" height="44" rx="10" fill="#002970"/>
                                  <text x="22" y="20" text-anchor="middle" font-size="9" font-weight="900" font-family="Arial" fill="#00baf2" letter-spacing="1">PAY</text>
                                  <text x="22" y="34" text-anchor="middle" font-size="11" font-weight="900" font-family="Arial" fill="white" letter-spacing="2">TM</text>
                                </svg>
                              }
                              @case ('bhim') {
                                <svg width="44" height="44" viewBox="0 0 44 44">
                                  <rect width="44" height="44" rx="10" fill="#00005c"/>
                                  <text x="22" y="22" text-anchor="middle" font-size="10" font-weight="900" font-family="Arial" fill="#ff6600" letter-spacing="1">BHIM</text>
                                  <text x="22" y="36" text-anchor="middle" font-size="8" font-weight="600" font-family="Arial" fill="white">UPI</text>
                                </svg>
                              }
                            }
                          </div>
                          <span class="upi-app-name">{{ app.name }}</span>
                        </button>
                      }
                    </div>

                    <div class="upi-divider"><span>OR</span></div>

                    <!-- UPI ID Input -->
                    <mat-form-field appearance="outline" class="full-width">
                      <mat-label>Enter UPI ID</mat-label>
                      <input matInput [(ngModel)]="upiId" placeholder="yourname@upi"
                        (input)="validateUpiId()" />
                      <mat-icon matSuffix [style.color]="upiValid ? '#2e7d32' : '#9e9e9e'">
                        {{ upiId && upiValid ? 'check_circle' : 'account_balance_wallet' }}
                      </mat-icon>
                      @if (upiId && !upiValid) {
                        <mat-hint style="color:#e23744">Enter a valid UPI ID (e.g. name&#64;paytm)</mat-hint>
                      }
                      @if (upiId && upiValid) {
                        <mat-hint style="color:#2e7d32">Valid UPI ID</mat-hint>
                      }
                    </mat-form-field>

                    <!-- UPI Apps reference -->
                    <div class="hint-box">
                      <mat-icon>info</mat-icon>
                      Supported: <strong>&#64;paytm, &#64;oksbi, &#64;okaxis, &#64;ybl, &#64;ibl, &#64;upi, &#64;gpay, &#64;phonepe</strong>
                    </div>

                    <!-- Real UPI QR Code -->
                    <div class="qr-section">
                      <div class="qr-box">
                        <canvas #qrCanvas class="qr-canvas"></canvas>
                      </div>
                      <div class="qr-info">
                        <p class="qr-label">Scan with any UPI app</p>
                        <p class="qr-amount">₹{{ total$ | async }}</p>
                        <p class="qr-merchant">FoodRush Payments</p>
                        <p class="qr-upi">foodrush&#64;upi</p>
                      </div>
                    </div>
                  </div>
                }

                <!-- Net Banking -->
                @if (activeMethod === 'netbanking') {
                  <div class="netbanking-section">
                    <p class="upi-subtitle">Select your bank</p>
                    <div class="bank-grid">
                      @for (bank of banks; track bank.id) {
                        <button class="bank-btn" [class.selected]="selectedBank === bank.id"
                            (click)="selectedBank = bank.id">
                          <span class="bank-icon">{{ bank.icon }}</span>
                          <span>{{ bank.name }}</span>
                        </button>
                      }
                    </div>
                    <div class="hint-box">
                      <mat-icon>info</mat-icon>
                      You will be redirected to your bank's secure portal to complete payment.
                    </div>
                  </div>
                }

                @if (paymentError) {
                  <div class="error-msg"><mat-icon>error</mat-icon> {{ paymentError }}</div>
                }

                <div class="pay-btn-wrap">
                  <button mat-button matStepperPrevious class="back-btn">← Back</button>
                  <button mat-raised-button class="pay-btn" (click)="processPayment()" [disabled]="processing || !canPay()">
                    @if (processing) {
                      <span class="loading-spinner"></span>
                      {{ activeMethod === 'upi' ? 'Sending Request...' : 'Processing...' }}
                    } @else {
                      <ng-container>
                        <mat-icon>{{ activeMethod === 'upi' ? 'account_balance_wallet' : 'lock' }}</mat-icon>
                        {{ activeMethod === 'upi' ? 'Pay ₹' + (total$ | async) + ' via UPI' : 'Pay ₹' + (total$ | async) }}
                      </ng-container>
                    }
                  </button>
                </div>
              </div>
            </mat-step>
          </mat-stepper>
        </div>

        <!-- Summary Sidebar -->
        <div class="summary-sidebar">
          <mat-card class="summary-card">
            <h3>Order Summary</h3>
            <mat-divider></mat-divider>
            @for (ci of (cart$ | async)?.items || []; track ci.item.id) {
              <div class="summary-item">
                <span>{{ ci.item.name }} × {{ ci.quantity }}</span>
                <span>₹{{ ci.item.price * ci.quantity }}</span>
              </div>
            }
            <mat-divider></mat-divider>
            <div class="summary-row"><span>Subtotal</span><span>₹{{ subtotal$ | async }}</span></div>
            <div class="summary-row"><span>Delivery</span>
              <span>{{ (subtotal$ | async)! > 500 ? 'FREE' : '₹30' }}</span>
            </div>
            <div class="summary-row"><span>Taxes (5%)</span><span>₹{{ taxes$ | async }}</span></div>
            <mat-divider></mat-divider>
            <div class="summary-row total-row">
              <strong>Total</strong><strong>₹{{ total$ | async }}</strong>
            </div>
          </mat-card>

          <!-- UPI Accepted Badges -->
          @if (activeMethod === 'upi') {
            <div class="upi-badges">
              <p>Accepted UPI Apps</p>
              <div class="badges-row">
                @for (app of upiApps; track app.id) {
                  <div class="badge-dot" [title]="app.name">
                    @switch (app.id) {
                      @case ('gpay') {
                        <svg width="32" height="32" viewBox="0 0 44 44">
                          <rect width="44" height="44" rx="8" fill="white" stroke="#dadce0" stroke-width="2"/>
                          <text x="7" y="29" font-size="24" font-weight="900" font-family="Arial" fill="#4285F4">G</text>
                          <text x="27" y="29" font-size="13" font-weight="700" font-family="Arial" fill="#5f6368">Pay</text>
                        </svg>
                      }
                      @case ('phonepe') {
                        <svg width="32" height="32" viewBox="0 0 44 44">
                          <rect width="44" height="44" rx="8" fill="#5f259f"/>
                          <text x="22" y="30" text-anchor="middle" font-size="16" font-weight="900" font-family="Arial" fill="white">Pe</text>
                        </svg>
                      }
                      @case ('paytm') {
                        <svg width="32" height="32" viewBox="0 0 44 44">
                          <rect width="44" height="44" rx="8" fill="#002970"/>
                          <text x="22" y="22" text-anchor="middle" font-size="10" font-weight="900" font-family="Arial" fill="#00baf2">PAY</text>
                          <text x="22" y="36" text-anchor="middle" font-size="12" font-weight="900" font-family="Arial" fill="white">TM</text>
                        </svg>
                      }
                      @case ('bhim') {
                        <svg width="32" height="32" viewBox="0 0 44 44">
                          <rect width="44" height="44" rx="8" fill="#00005c"/>
                          <text x="22" y="27" text-anchor="middle" font-size="12" font-weight="900" font-family="Arial" fill="#ff6600">BHIM</text>
                        </svg>
                      }
                    }
                  </div>
                }
              </div>
            </div>
          }
        </div>
      </div>
    </div>
  `,
  styles: [`
    .page { padding: 32px 20px 60px; }
    .page-title { font-size: 28px; font-weight: 700; margin-bottom: 28px; }
    .checkout-layout { display: grid; grid-template-columns: 1fr 320px; gap: 24px; }
    .steps-section { background: white; border-radius: 12px; padding: 24px; box-shadow: 0 2px 8px rgba(0,0,0,0.06); }
    .step-form { padding-top: 16px; display: flex; flex-direction: column; gap: 8px; }
    .form-row { display: grid; grid-template-columns: repeat(auto-fit, minmax(140px, 1fr)); gap: 12px; }
    .full-width { width: 100%; }
    .next-btn { background: #e23744 !important; color: white !important; border-radius: 8px !important; height: 44px; display: flex; align-items: center; gap: 4px; margin-top: 4px; }

    /* Payment section */
    .payment-section { padding-top: 16px; display: flex; flex-direction: column; gap: 16px; }
    .secure-header { display: flex; align-items: center; gap: 6px; font-size: 13px; font-weight: 600; background: #f0fff4; color: #2e7d32; padding: 10px 14px; border-radius: 8px; border: 1px solid #c8e6c9; }
    .payment-methods { display: flex; gap: 10px; flex-wrap: wrap; }
    .payment-method { display: flex; align-items: center; gap: 8px; padding: 10px 16px; border: 2px solid #e0e0e0; border-radius: 8px; font-size: 13px; cursor: pointer; transition: all 0.2s; user-select: none; }
    .payment-method:hover { border-color: #e23744; }
    .payment-method.active { border-color: #e23744; color: #e23744; font-weight: 600; background: #fff5f5; }
    .upi-icon { background: #00b300; color: white; font-size: 9px; font-weight: 800; padding: 2px 5px; border-radius: 3px; letter-spacing: 0.5px; }

    /* Card form */
    .card-form { display: flex; flex-direction: column; gap: 8px; }
    .hint-box { display: flex; align-items: flex-start; gap: 6px; font-size: 12px; color: #555; background: #f0f4ff; padding: 10px 12px; border-radius: 8px; line-height: 1.5; }
    .hint-box mat-icon { font-size: 16px; width: 16px; height: 16px; margin-top: 1px; flex-shrink: 0; }

    /* UPI section */
    .upi-section { display: flex; flex-direction: column; gap: 14px; }
    .upi-subtitle { font-size: 13px; color: #686b78; margin: 0; }
    .upi-apps { display: flex; gap: 12px; flex-wrap: wrap; }
    .upi-app-btn { display: flex; flex-direction: column; align-items: center; gap: 6px; padding: 10px 12px; border: 2px solid #e0e0e0; border-radius: 12px; background: white; cursor: pointer; transition: all 0.2s; min-width: 70px; }
    .upi-app-btn:hover { border-color: #e23744; transform: translateY(-2px); box-shadow: 0 4px 12px rgba(0,0,0,0.1); }
    .upi-app-btn.selected { border-color: #e23744; background: #fff5f5; }
    .upi-app-logo { width: 44px; height: 44px; display: flex; align-items: center; justify-content: center; }
    .upi-app-name { font-size: 11px; font-weight: 600; color: #3d4152; }
    .upi-divider { display: flex; align-items: center; gap: 12px; color: #9e9e9e; font-size: 12px; font-weight: 600; }
    .upi-divider::before, .upi-divider::after { content: ''; flex: 1; height: 1px; background: #e0e0e0; }

    /* QR code section */
    .qr-section { display: flex; align-items: center; gap: 20px; background: #fafafa; border: 1px dashed #e0e0e0; border-radius: 12px; padding: 16px; }
    .qr-box { flex-shrink: 0; }
    .qr-canvas { border-radius: 8px; border: 2px solid #e0e0e0; display: block; }
    .qr-info { display: flex; flex-direction: column; gap: 2px; }
    .qr-label { font-size: 12px; color: #686b78; margin: 0; }
    .qr-amount { font-size: 22px; font-weight: 700; color: #3d4152; margin: 0; }
    .qr-merchant { font-size: 13px; font-weight: 600; color: #3d4152; margin: 0; }
    .qr-upi { font-size: 11px; color: #9e9e9e; margin: 0; }

    /* Net Banking */
    .netbanking-section { display: flex; flex-direction: column; gap: 14px; }
    .bank-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(120px, 1fr)); gap: 10px; }
    .bank-btn { display: flex; align-items: center; gap: 8px; padding: 10px 12px; border: 2px solid #e0e0e0; border-radius: 8px; background: white; cursor: pointer; font-size: 12px; font-weight: 500; transition: all 0.2s; text-align: left; }
    .bank-btn:hover { border-color: #e23744; }
    .bank-btn.selected { border-color: #e23744; background: #fff5f5; color: #e23744; font-weight: 600; }
    .bank-icon { font-size: 18px; }

    /* Pay button */
    .error-msg { display: flex; align-items: center; gap: 6px; color: #e23744; background: #fff5f5; padding: 10px 12px; border-radius: 8px; font-size: 13px; }
    .pay-btn-wrap { display: flex; align-items: center; gap: 12px; }
    .back-btn { color: #686b78 !important; }
    .pay-btn { background: #e23744 !important; color: white !important; border-radius: 8px !important; height: 48px; font-size: 15px !important; font-weight: 600 !important; padding: 0 28px !important; display: flex; align-items: center; gap: 6px; }
    .loading-spinner { width: 18px; height: 18px; border: 2px solid rgba(255,255,255,0.4); border-top-color: white; border-radius: 50%; animation: spin 0.8s linear infinite; display: inline-block; }
    @keyframes spin { to { transform: rotate(360deg); } }

    /* Sidebar */
    .summary-card { padding: 20px; border-radius: 12px !important; box-shadow: 0 2px 8px rgba(0,0,0,0.06) !important; position: sticky; top: 80px; }
    .summary-card h3 { font-size: 16px; font-weight: 700; margin-bottom: 12px; }
    .summary-item { display: flex; justify-content: space-between; padding: 6px 0; font-size: 13px; color: #686b78; }
    .summary-row { display: flex; justify-content: space-between; padding: 8px 0; font-size: 14px; }
    .total-row { font-size: 16px; }
    .upi-badges { margin-top: 12px; background: white; border-radius: 12px; padding: 14px 16px; box-shadow: 0 2px 8px rgba(0,0,0,0.06); }
    .upi-badges p { font-size: 12px; color: #686b78; margin: 0 0 10px; font-weight: 600; }
    .badges-row { display: flex; gap: 8px; flex-wrap: wrap; }
    .badge-dot { width: 32px; height: 32px; display: flex; align-items: center; justify-content: center; cursor: default; }

    @media(max-width: 768px) { .checkout-layout { grid-template-columns: 1fr; } }
  `]
})
export class CheckoutComponent implements OnInit, AfterViewChecked {
  @ViewChild('stepper') stepper!: MatStepper;
  @ViewChild('qrCanvas') qrCanvas?: ElementRef<HTMLCanvasElement>;

  private fb = inject(FormBuilder);
  cartService = inject(CartService);
  private orderService = inject(OrderService);
  private authService = inject(AuthService);
  private router = inject(Router);
  private snackBar = inject(MatSnackBar);

  cart$ = this.cartService.cart$;
  subtotal$ = this.cart$.pipe(map(() => this.cartService.getSubtotal()));
  taxes$ = this.subtotal$.pipe(map(s => Math.round(s * 0.05)));
  total$ = this.subtotal$.pipe(map(s => s + (s > 500 ? 0 : 30) + Math.round(s * 0.05)));

  processing = false;
  paymentError = '';
  cardNumber = '';
  activeMethod: PaymentMethod = 'card';
  private qrRendered = false;

  // UPI state
  upiId = '';
  upiValid = false;
  selectedUpiApp = '';
  upiApps = [
    { id: 'gpay',    name: 'Google Pay' },
    { id: 'phonepe', name: 'PhonePe'    },
    { id: 'paytm',   name: 'Paytm'      },
    { id: 'bhim',    name: 'BHIM'       },
  ];

  // Net banking state
  selectedBank = '';
  banks = [
    { id: 'sbi',    name: 'SBI',     icon: '🏛️' },
    { id: 'hdfc',   name: 'HDFC',    icon: '🏦' },
    { id: 'icici',  name: 'ICICI',   icon: '🏧' },
    { id: 'axis',   name: 'Axis',    icon: '💳' },
    { id: 'kotak',  name: 'Kotak',   icon: '🏪' },
    { id: 'yes',    name: 'Yes Bank', icon: '🏬' },
  ];

  addressForm = this.fb.group({
    name: [this.authService.currentUser()?.name || '', Validators.required],
    phone: [this.authService.currentUser()?.phone || '', [Validators.required, Validators.pattern(/^\d{10}$/)]],
    street: ['', Validators.required],
    city: ['Bangalore', Validators.required],
    state: ['Karnataka', Validators.required],
    pincode: ['560001', [Validators.required, Validators.pattern(/^\d{6}$/)]]
  });

  get currentTotal(): number {
    const sub = this.cartService.getSubtotal();
    return sub + (sub > 500 ? 0 : 30) + Math.round(sub * 0.05);
  }

  ngOnInit() {}

  ngAfterViewChecked() {
    if (this.activeMethod === 'upi' && this.qrCanvas && !this.qrRendered) {
      this.qrRendered = true;
      this.renderQrCode();
    }
  }

  private renderQrCode() {
    const upiUrl = `upi://pay?pa=foodrush@upi&pn=FoodRush+Payments&am=${this.currentTotal}&cu=INR&tn=FoodRush+Order`;
    QRCode.toCanvas(this.qrCanvas!.nativeElement, upiUrl, {
      width: 140, margin: 1,
      color: { dark: '#1a1a1a', light: '#ffffff' }
    });
  }

  goToPayment() {
    this.addressForm.markAllAsTouched();
    if (this.addressForm.valid) {
      this.stepper.next();
    }
  }

  selectMethod(method: PaymentMethod) {
    this.activeMethod = method;
    this.paymentError = '';
    this.qrRendered = false;
  }

  selectUpiApp(id: string) {
    this.selectedUpiApp = id;
    const suffixes: Record<string, string> = {
      gpay: '@oksbi', phonepe: '@ybl', paytm: '@paytm', bhim: '@upi'
    };
    if (!this.upiId || !this.upiId.includes('@')) {
      this.upiId = 'user' + suffixes[id];
      this.validateUpiId();
    }
  }

  validateUpiId() {
    this.upiValid = /^[\w.\-]{2,}@[a-z]{2,}$/.test(this.upiId.trim());
  }

  canPay(): boolean {
    if (this.activeMethod === 'upi') return !!(this.upiValid || this.selectedUpiApp);
    if (this.activeMethod === 'netbanking') return !!this.selectedBank;
    return true;
  }

  formatCard(event: Event) {
    const input = event.target as HTMLInputElement;
    const digits = input.value.replace(/\D/g, '').slice(0, 16);
    this.cardNumber = digits.replace(/(.{4})/g, '$1 ').trim();
    input.value = this.cardNumber;
  }

  async processPayment() {
    this.processing = true;
    this.paymentError = '';
    try {
      const delay = this.activeMethod === 'upi' ? 3000 : 2500;
      await new Promise(resolve => setTimeout(resolve, delay));
      const paymentId = `${this.activeMethod}_${Date.now()}`;
      const address = this.addressForm.value as DeliveryAddress;
      const cartVal = this.cartService.cartSubject.value;
      const user = this.authService.currentUser();
      const order = this.orderService.placeOrder(cartVal, address, paymentId, user?.id || 'guest');
      this.cartService.clearCart();
      const msg = this.activeMethod === 'upi'
        ? 'UPI Payment successful! Order placed!'
        : 'Payment successful! Order placed!';
      this.snackBar.open(msg, '', { duration: 3000, panelClass: 'snack-success' });
      this.router.navigate(['/order', order.id]);
    } catch {
      this.paymentError = 'Payment failed. Please try again.';
    } finally {
      this.processing = false;
    }
  }
}
