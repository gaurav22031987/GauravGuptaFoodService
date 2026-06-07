import { Component, inject } from '@angular/core';
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

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, MatToolbarModule, MatButtonModule, MatIconModule, MatBadgeModule, MatMenuModule, MatDividerModule, AsyncPipe],
  template: `
    <mat-toolbar class="navbar">
      <div class="nav-inner container">
        <a routerLink="/home" class="brand">
          <span class="brand-icon">👑</span>
          <span class="brand-text">Kitchen King Food</span>
        </a>
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
      </div>
    </mat-toolbar>
  `,
  styles: [`
    .navbar { background: #fff; box-shadow: 0 2px 8px rgba(0,0,0,0.08); position: sticky; top: 0; z-index: 100; padding: 0; height: 64px; }
    .nav-inner { display: flex; align-items: center; justify-content: space-between; width: 100%; height: 64px; }
    .brand { display: flex; align-items: center; gap: 8px; text-decoration: none; }
    .brand-icon { font-size: 28px; }
    .brand-text { font-size: 20px; font-weight: 700; color: #e23744; letter-spacing: -0.3px; white-space: nowrap; }
    .nav-links { display: flex; align-items: center; gap: 8px; }
    .active-link { color: #e23744 !important; }
    .login-btn { border-color: #e23744 !important; color: #e23744 !important; border-radius: 8px; }
    .signup-btn { background: #e23744 !important; color: white !important; border-radius: 8px; }
    .user-name-menu { padding: 12px 16px; font-weight: 600; color: #3d4152; font-size: 14px; }
  `]
})
export class NavbarComponent {
  auth = inject(AuthService);
  private cartService = inject(CartService);
  cartCount$ = this.cartService.cart$.pipe(
    map(cart => cart.items.reduce((s, ci) => s + ci.quantity, 0))
  );
}
