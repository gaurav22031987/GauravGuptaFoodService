import { Component, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { AsyncPipe } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { CartService } from '../../core/services/cart.service';
import { CartItem } from '../../core/models/cart.model';
import { map } from 'rxjs/operators';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [RouterLink, AsyncPipe, MatButtonModule, MatIconModule, MatDividerModule],
  template: `
    <div class="page container">
      <h1 class="page-title">Your Cart</h1>
      @if ((cart$ | async)?.items?.length) {
        <div class="cart-layout">
          <!-- Items -->
          <div class="cart-items">
            <div class="restaurant-name-bar">
              <mat-icon>restaurant</mat-icon> {{ (cart$ | async)?.restaurantName }}
            </div>
            @for (ci of (cart$ | async)?.items || []; track ci.item.id) {
              <div class="cart-item">
                <div class="item-info">
                  <span class="veg-dot" [class.non-veg]="!ci.item.isVeg"></span>
                  <div>
                    <p class="item-name">{{ ci.item.name }}</p>
                    <p class="item-price">₹{{ ci.item.price }}</p>
                  </div>
                </div>
                <div class="item-actions">
                  <div class="qty-control">
                    <button class="qty-btn" (click)="remove(ci.item.id)">−</button>
                    <span class="qty-value">{{ ci.quantity }}</span>
                    <button class="qty-btn" (click)="add(ci)">+</button>
                  </div>
                  <span class="item-total">₹{{ ci.item.price * ci.quantity }}</span>
                  <button mat-icon-button class="delete-btn" (click)="deleteItem(ci.item.id)">
                    <mat-icon>delete_outline</mat-icon>
                  </button>
                </div>
              </div>
            }
            <div class="add-more">
              <a [routerLink]="['/restaurant', (cart$ | async)?.restaurantId]" mat-button color="warn">
                <mat-icon>add</mat-icon> Add more items
              </a>
              <button mat-button color="warn" (click)="clearCart()">
                <mat-icon>delete_sweep</mat-icon> Clear cart
              </button>
            </div>
          </div>

          <!-- Summary -->
          <div class="order-summary">
            <h2>Order Summary</h2>
            <mat-divider></mat-divider>
            <div class="summary-row"><span>Subtotal</span><span>₹{{ subtotal$ | async }}</span></div>
            <div class="summary-row"><span>Delivery fee</span>
              <span>{{ (subtotal$ | async)! > 500 ? 'FREE' : '₹30' }}</span>
            </div>
            <div class="summary-row"><span>Taxes (5%)</span><span>₹{{ taxes$ | async }}</span></div>
            <mat-divider></mat-divider>
            <div class="summary-row total-row"><span>Total</span><span>₹{{ total$ | async }}</span></div>
            @if ((subtotal$ | async)! > 500) {
              <div class="savings">
                <mat-icon>local_offer</mat-icon> You saved ₹30 on delivery!
              </div>
            }
            <button mat-raised-button class="checkout-btn" (click)="checkout()">
              Proceed to Checkout <mat-icon>arrow_forward</mat-icon>
            </button>
            <div class="payment-icons">
              <mat-icon>lock</mat-icon> Secured by Stripe • Safe & Encrypted
            </div>
          </div>
        </div>
      } @else {
        <div class="empty-cart">
          <span class="empty-emoji">🛒</span>
          <h2>Your cart is empty</h2>
          <p>Add items from a restaurant to get started</p>
          <a routerLink="/restaurants" mat-raised-button class="browse-btn">Browse Restaurants</a>
        </div>
      }
    </div>
  `,
  styles: [`
    .page { padding: 28px 20px 80px; }
    .page-title { font-size: 26px; font-weight: 700; margin-bottom: 24px; }
    .cart-layout { display: grid; grid-template-columns: 1fr 340px; gap: 20px; align-items: start; }
    .cart-items { background: white; border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.06); overflow: hidden; }
    .restaurant-name-bar { display: flex; align-items: center; gap: 8px; padding: 14px 16px; background: #f8f8f8; font-weight: 600; font-size: 14px; border-bottom: 1px solid #eee; }
    .cart-item { display: flex; align-items: center; justify-content: space-between; padding: 14px 16px; border-bottom: 1px solid #f5f5f5; gap: 10px; flex-wrap: wrap; }
    .item-info { display: flex; align-items: flex-start; gap: 10px; flex: 1; min-width: 120px; }
    .veg-dot { width: 14px; height: 14px; border: 2px solid #3d9b35; border-radius: 2px; display: inline-block; flex-shrink: 0; margin-top: 3px; position: relative; }
    .veg-dot::after { content: ''; position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); width: 6px; height: 6px; background: #3d9b35; border-radius: 50%; }
    .veg-dot.non-veg { border-color: #e23744; }
    .veg-dot.non-veg::after { background: #e23744; }
    .item-name { font-size: 14px; font-weight: 600; margin-bottom: 2px; }
    .item-price { font-size: 12px; color: #686b78; }
    .item-actions { display: flex; align-items: center; gap: 10px; flex-shrink: 0; }
    .qty-control { display: flex; align-items: center; background: #e23744; border-radius: 8px; overflow: hidden; }
    .qty-btn { background: transparent; border: none; color: white; font-size: 18px; padding: 4px 10px; cursor: pointer; font-family: Poppins; }
    .qty-value { color: white; font-weight: 700; font-size: 14px; min-width: 20px; text-align: center; }
    .item-total { font-weight: 600; font-size: 14px; min-width: 44px; text-align: right; }
    .delete-btn { color: #ccc !important; }
    .add-more { display: flex; justify-content: space-between; padding: 10px 16px; flex-wrap: wrap; gap: 8px; }

    .order-summary { background: white; border-radius: 12px; padding: 20px; box-shadow: 0 2px 8px rgba(0,0,0,0.06); position: sticky; top: 80px; }
    .order-summary h2 { font-size: 17px; font-weight: 700; margin-bottom: 14px; }
    .summary-row { display: flex; justify-content: space-between; padding: 9px 0; font-size: 14px; color: #3d4152; }
    .total-row { font-size: 16px; font-weight: 700; }
    .savings { display: flex; align-items: center; gap: 4px; color: #3d9b35; font-size: 13px; font-weight: 500; background: #f0fff0; padding: 8px 12px; border-radius: 8px; margin: 8px 0; }
    .checkout-btn { width: 100%; height: 48px; background: #e23744 !important; color: white !important; border-radius: 8px !important; font-size: 15px !important; font-weight: 600 !important; margin-top: 16px; display: flex !important; align-items: center; justify-content: center; gap: 4px; }
    .payment-icons { display: flex; align-items: center; gap: 6px; justify-content: center; font-size: 12px; color: #888; margin-top: 12px; }

    .empty-cart { text-align: center; padding: 60px 20px; display: flex; flex-direction: column; align-items: center; gap: 12px; }
    .empty-emoji { font-size: 56px; }
    .empty-cart h2 { font-size: 20px; font-weight: 700; }
    .empty-cart p { color: #686b78; font-size: 14px; }
    .browse-btn { background: #e23744 !important; color: white !important; border-radius: 8px !important; margin-top: 8px; }

    @media(max-width: 768px) {
      .page { padding: 20px 16px 80px; }
      .page-title { font-size: 22px; margin-bottom: 18px; }
      .cart-layout { grid-template-columns: 1fr; }
      .order-summary { position: static; }
      .cart-item { padding: 12px 14px; }
    }
    @media(max-width: 480px) {
      .item-total { min-width: 36px; }
    }
  `]
})
export class CartComponent {
  private cartService = inject(CartService);
  private router = inject(Router);

  cart$ = this.cartService.cart$;
  subtotal$ = this.cart$.pipe(map(() => this.cartService.getSubtotal()));
  taxes$ = this.subtotal$.pipe(map(s => Math.round(s * 0.05)));
  total$ = this.subtotal$.pipe(map(s => s + (s > 500 ? 0 : 30) + Math.round(s * 0.05)));

  add(ci: CartItem) { this.cartService.addItem(ci.item); }
  remove(id: string) { this.cartService.removeItem(id); }
  deleteItem(id: string) { this.cartService.deleteItem(id); }
  clearCart() { if (confirm('Clear entire cart?')) this.cartService.clearCart(); }
  checkout() { this.router.navigate(['/checkout']); }
}
