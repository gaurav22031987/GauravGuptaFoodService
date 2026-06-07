import { Component, inject, signal } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatBadgeModule } from '@angular/material/badge';
import { MatMenuModule } from '@angular/material/menu';
import { MatDividerModule } from '@angular/material/divider';
import { AsyncPipe } from '@angular/common';
import { map } from 'rxjs/operators';
import { AuthService } from '../../../core/services/auth.service';
import { CartService } from '../../../core/services/cart.service';
import { ChatService } from '../../../core/services/chat.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, MatToolbarModule, MatButtonModule, MatIconModule, MatBadgeModule, MatMenuModule, MatDividerModule, AsyncPipe],
  template: `
    <mat-toolbar class="navbar">
      <div class="nav-inner container">
        <a routerLink="/home" class="brand" (click)="close()">
          <span class="brand-icon">👑</span>
          <span class="brand-text">Kitchen King Food</span>
        </a>

        <!-- Desktop links -->
        <div class="nav-links">
          <a routerLink="/restaurants" routerLinkActive="active-link" mat-button>
            <mat-icon>restaurant</mat-icon> Restaurants
          </a>
          @if (auth.isLoggedIn()) {
            <a routerLink="/cart" mat-icon-button [matBadge]="(cartCount$ | async) || 0" matBadgeColor="warn"
               [matBadgeHidden]="((cartCount$ | async) || 0) === 0">
              <mat-icon>shopping_cart</mat-icon>
            </a>
            <button mat-icon-button [matMenuTriggerFor]="userMenu">
              <mat-icon>account_circle</mat-icon>
            </button>
            <mat-menu #userMenu="matMenu">
              <div class="user-name-menu">{{ auth.currentUser()?.name }}</div>
              <mat-divider></mat-divider>
              <button mat-menu-item routerLink="/restaurants"><mat-icon>restaurant</mat-icon> Browse</button>
              <button mat-menu-item routerLink="/cart"><mat-icon>shopping_cart</mat-icon> Cart</button>
              <mat-divider></mat-divider>
              <button mat-menu-item (click)="auth.logout()"><mat-icon>logout</mat-icon> Logout</button>
            </mat-menu>
          } @else {
            <a routerLink="/login" mat-stroked-button class="login-btn">Login</a>
            <a routerLink="/register" mat-raised-button class="signup-btn">Sign Up</a>
          }
        </div>

        <!-- Mobile: cart icon + hamburger -->
        <div class="mobile-actions">
          @if (auth.isLoggedIn()) {
            <a routerLink="/cart" mat-icon-button [matBadge]="(cartCount$ | async) || 0" matBadgeColor="warn"
               [matBadgeHidden]="((cartCount$ | async) || 0) === 0" (click)="close()">
              <mat-icon>shopping_cart</mat-icon>
            </a>
          }
          <button mat-icon-button (click)="mobileOpen.set(!mobileOpen())">
            <mat-icon>{{ mobileOpen() ? 'close' : 'menu' }}</mat-icon>
          </button>
        </div>
      </div>
    </mat-toolbar>

    <!-- Mobile dropdown -->
    @if (mobileOpen()) {
      <nav class="mobile-menu">
        <a routerLink="/restaurants" class="mob-link" (click)="close()">
          <mat-icon>restaurant</mat-icon> Restaurants
        </a>
        @if (auth.isLoggedIn()) {
          <a routerLink="/cart" class="mob-link" (click)="close()">
            <mat-icon>shopping_cart</mat-icon> My Cart
          </a>
          <div class="mob-user">👤 {{ auth.currentUser()?.name }}</div>
          <a class="mob-link red" (click)="auth.logout(); close()">
            <mat-icon>logout</mat-icon> Logout
          </a>
        } @else {
          <a routerLink="/login" class="mob-link" (click)="close()">
            <mat-icon>login</mat-icon> Login
          </a>
          <a routerLink="/register" class="mob-link red" (click)="close()">
            <mat-icon>person_add</mat-icon> Sign Up Free
          </a>
        }
      </nav>
    }
  `,
  styles: [`
    .navbar { background: #fff; box-shadow: 0 2px 8px rgba(0,0,0,0.08); position: sticky; top: 0; z-index: 1000; padding: 0; height: 64px; }
    .nav-inner { display: flex; align-items: center; justify-content: space-between; width: 100%; height: 64px; }
    .brand { display: flex; align-items: center; gap: 8px; text-decoration: none; flex-shrink: 0; }
    .brand-icon { font-size: 26px; }
    .brand-text { font-size: 18px; font-weight: 700; color: #e23744; letter-spacing: -0.3px; white-space: nowrap; }
    .nav-links { display: flex; align-items: center; gap: 6px; }
    .active-link { color: #e23744 !important; }
.login-btn { border-color: #e23744 !important; color: #e23744 !important; border-radius: 8px; }
    .signup-btn { background: #e23744 !important; color: white !important; border-radius: 8px; }
    .user-name-menu { padding: 12px 16px; font-weight: 600; color: #3d4152; font-size: 14px; }

    .mobile-actions { display: none; align-items: center; gap: 2px; }
    .mobile-menu { position: fixed; top: 64px; left: 0; right: 0; z-index: 999; background: #fff; box-shadow: 0 6px 20px rgba(0,0,0,0.12); display: flex; flex-direction: column; padding: 8px 0 20px; border-top: 1px solid #f0f0f0; }
    .mob-link { display: flex; align-items: center; gap: 14px; padding: 15px 24px; font-size: 15px; font-weight: 500; color: #3d4152; cursor: pointer; text-decoration: none; transition: background 0.15s; border: none; background: none; width: 100%; }
    .mob-link:hover { background: #fafafa; }
    .mob-link mat-icon { font-size: 20px; width: 20px; height: 20px; color: #686b78; }
    .mob-link.red { color: #e23744; font-weight: 600; }
    .mob-link.red mat-icon { color: #e23744; }
    .mob-user { padding: 10px 24px; font-size: 13px; color: #686b78; border-top: 1px solid #f5f5f5; border-bottom: 1px solid #f5f5f5; margin: 4px 0; }

    @media(max-width: 768px) {
      .nav-links { display: none; }
      .mobile-actions { display: flex; }
      .brand-text { font-size: 15px; }
    }
    @media(max-width: 360px) {
      .brand-icon { font-size: 20px; }
      .brand-text { font-size: 13px; }
    }
  `]
})
export class NavbarComponent {
  auth = inject(AuthService);
  private cartService = inject(CartService);
  chatService = inject(ChatService);
  mobileOpen = signal(false);

  cartCount$ = this.cartService.cart$.pipe(
    map(cart => cart.items.reduce((s, ci) => s + ci.quantity, 0))
  );

  close() { this.mobileOpen.set(false); }
}
