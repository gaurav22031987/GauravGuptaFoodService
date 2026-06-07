import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';
import { MatChipsModule } from '@angular/material/chips';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialogModule } from '@angular/material/dialog';
import { AsyncPipe, DecimalPipe } from '@angular/common';
import { RestaurantService } from '../../core/services/restaurant.service';
import { CartService } from '../../core/services/cart.service';
import { AuthService } from '../../core/services/auth.service';
import { Restaurant } from '../../core/models/restaurant.model';
import { MenuCategory, MenuItem } from '../../core/models/menu-item.model';

@Component({
  selector: 'app-restaurant-detail',
  standalone: true,
  imports: [MatButtonModule, MatIconModule, MatTabsModule, MatChipsModule, MatSnackBarModule, MatDialogModule, AsyncPipe, DecimalPipe],
  template: `
    @if (restaurant) {
      <!-- Hero Banner -->
      <div class="hero-banner" [style.background-image]="'url(' + restaurant.image + ')'">
        <div class="hero-overlay">
          <div class="container hero-content">
            <div class="restaurant-info">
              <h1>{{ restaurant.name }}</h1>
              <p class="cuisine-tags">{{ restaurant.cuisine.join(' • ') }}</p>
              <div class="meta-row">
                <span class="rating-pill"><mat-icon>star</mat-icon> {{ restaurant.rating }} ({{ restaurant.totalRatings | number }}+ ratings)</span>
                <span class="meta-chip"><mat-icon>schedule</mat-icon> {{ restaurant.deliveryTime }} mins</span>
                <span class="meta-chip"><mat-icon>delivery_dining</mat-icon> {{ restaurant.deliveryFee === 0 ? 'Free delivery' : '₹' + restaurant.deliveryFee + ' delivery' }}</span>
              </div>
              <div class="address-row"><mat-icon>location_on</mat-icon> {{ restaurant.address }}</div>
            </div>
          </div>
        </div>
      </div>

      <div class="content-area container">
        <!-- Category nav -->
        <div class="category-nav">
          @for (cat of menu; track cat.name) {
            <button class="cat-btn" [class.active]="activeCategory === cat.name" (click)="scrollToCategory(cat.name)">
              {{ cat.name }}
            </button>
          }
        </div>

        <!-- Menu -->
        <div class="menu-section">
          @for (cat of menu; track cat.name) {
            <div class="menu-category" [id]="'cat-' + cat.name">
              <h2 class="cat-title">{{ cat.name }} <span class="item-count">({{ cat.items.length }})</span></h2>
              @for (item of cat.items; track item.id) {
                <div class="menu-item">
                  <div class="item-left">
                    <div class="item-badges">
                      <span class="veg-indicator" [class.non-veg]="!item.isVeg">
                        <span class="dot"></span>
                      </span>
                      @if (item.isBestseller) { <span class="bestseller-tag">⭐ Bestseller</span> }
                    </div>
                    <h3 class="item-name">{{ item.name }}</h3>
                    <p class="item-price">₹{{ item.price }}</p>
                    <p class="item-desc">{{ item.description }}</p>
                  </div>
                  <div class="item-right">
                    <img [src]="item.image" [alt]="item.name" class="item-img" loading="lazy" />
                    <div class="add-btn-wrap">
                      @if (getQuantity(item.id) === 0) {
                        <button class="add-btn" (click)="addToCart(item)">ADD</button>
                      } @else {
                        <div class="qty-control">
                          <button class="qty-btn" (click)="removeFromCart(item.id)">−</button>
                          <span class="qty-value">{{ getQuantity(item.id) }}</span>
                          <button class="qty-btn" (click)="addToCart(item)">+</button>
                        </div>
                      }
                    </div>
                  </div>
                </div>
              }
            </div>
          }
        </div>
      </div>

      <!-- Floating Cart Bar -->
      @if ((cartItems$ | async)?.items?.length) {
        <div class="cart-bar">
          <div class="cart-bar-inner container">
            <span>{{ (cartItems$ | async)?.items?.length }} item(s) • ₹{{ cartSubtotal }}</span>
            <button class="view-cart-btn" (click)="goToCart()">View Cart <mat-icon>arrow_forward</mat-icon></button>
          </div>
        </div>
      }
    } @else {
      <div class="not-found">Restaurant not found.</div>
    }
  `,
  styles: [`
    .hero-banner { height: 280px; background-size: cover; background-position: center; position: relative; }
    .hero-overlay { position: absolute; inset: 0; background: linear-gradient(to top, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.3) 60%, transparent 100%); }
    .hero-content { position: absolute; bottom: 0; left: 50%; transform: translateX(-50%); width: 100%; padding: 24px 20px; }
    .restaurant-info h1 { font-size: 30px; font-weight: 700; color: white; margin-bottom: 6px; }
    .cuisine-tags { color: #ddd; font-size: 14px; margin-bottom: 10px; }
    .meta-row { display: flex; gap: 12px; flex-wrap: wrap; margin-bottom: 8px; }
    .rating-pill { display: flex; align-items: center; gap: 4px; background: #3d9b35; color: white; padding: 4px 12px; border-radius: 20px; font-size: 13px; font-weight: 600; }
    .meta-chip { display: flex; align-items: center; gap: 4px; background: rgba(255,255,255,0.15); color: white; padding: 4px 12px; border-radius: 20px; font-size: 13px; backdrop-filter: blur(4px); }
    .meta-chip mat-icon, .rating-pill mat-icon { font-size: 15px; height: 15px; width: 15px; }
    .address-row { display: flex; align-items: center; gap: 4px; color: #ccc; font-size: 13px; }
    .address-row mat-icon { font-size: 15px; height: 15px; width: 15px; }

    .content-area { display: grid; grid-template-columns: 200px 1fr; gap: 24px; padding: 24px 20px 100px; }
    .category-nav { position: sticky; top: 80px; height: fit-content; display: flex; flex-direction: column; gap: 4px; background: white; border-radius: 12px; padding: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.06); }
    .cat-btn { text-align: left; padding: 10px 14px; border: none; background: transparent; border-radius: 8px; font-size: 13px; font-family: Poppins; cursor: pointer; color: #686b78; font-weight: 500; transition: all 0.2s; }
    .cat-btn:hover { background: #fff5f5; color: #e23744; }
    .cat-btn.active { background: #fff5f5; color: #e23744; font-weight: 600; border-left: 3px solid #e23744; }

    .menu-section { display: flex; flex-direction: column; gap: 0; }
    .menu-category { margin-bottom: 32px; }
    .cat-title { font-size: 20px; font-weight: 700; margin-bottom: 16px; padding-bottom: 12px; border-bottom: 1px solid #f0f0f0; }
    .item-count { font-size: 14px; font-weight: 400; color: #888; }
    .menu-item { display: flex; justify-content: space-between; gap: 16px; padding: 16px 0; border-bottom: 1px solid #f8f8f8; }
    .item-left { flex: 1; }
    .item-badges { display: flex; align-items: center; gap: 8px; margin-bottom: 6px; }
    .veg-indicator { width: 16px; height: 16px; border: 2px solid #3d9b35; border-radius: 2px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
    .veg-indicator.non-veg { border-color: #e23744; }
    .veg-indicator .dot { width: 8px; height: 8px; background: #3d9b35; border-radius: 50%; }
    .veg-indicator.non-veg .dot { background: #e23744; }
    .bestseller-tag { font-size: 11px; color: #e67e22; font-weight: 600; background: #fff3e0; padding: 2px 8px; border-radius: 4px; }
    .item-name { font-size: 15px; font-weight: 600; margin-bottom: 4px; }
    .item-price { font-size: 15px; font-weight: 600; color: #3d4152; margin-bottom: 6px; }
    .item-desc { font-size: 13px; color: #93959f; line-height: 1.4; }
    .item-right { display: flex; flex-direction: column; align-items: center; gap: 8px; }
    .item-img { width: 110px; height: 90px; border-radius: 10px; object-fit: cover; flex-shrink: 0; }
    .add-btn { background: white; border: 1.5px solid #e23744; color: #e23744; font-weight: 700; font-size: 14px; font-family: Poppins; padding: 6px 20px; border-radius: 8px; cursor: pointer; letter-spacing: 1px; transition: all 0.2s; }
    .add-btn:hover { background: #e23744; color: white; }
    .qty-control { display: flex; align-items: center; gap: 0; background: #e23744; border-radius: 8px; overflow: hidden; }
    .qty-btn { background: transparent; border: none; color: white; font-size: 18px; padding: 4px 10px; cursor: pointer; font-family: Poppins; }
    .qty-value { color: white; font-weight: 700; font-size: 14px; min-width: 20px; text-align: center; }

    .cart-bar { position: fixed; bottom: 0; left: 0; right: 0; z-index: 200; }
    .cart-bar-inner { background: #3d4152; color: white; padding: 14px 20px; display: flex; align-items: center; justify-content: space-between; border-radius: 12px 12px 0 0; font-size: 14px; font-weight: 500; }
    .view-cart-btn { display: flex; align-items: center; gap: 4px; background: #e23744; border: none; color: white; font-weight: 700; font-size: 14px; padding: 8px 20px; border-radius: 8px; cursor: pointer; font-family: Poppins; }
    .not-found { text-align: center; padding: 80px 20px; color: #686b78; }
    @media(max-width: 768px) { .content-area { grid-template-columns: 1fr; } .category-nav { display: none; } }
  `]
})
export class RestaurantDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private restaurantService = inject(RestaurantService);
  private cartService = inject(CartService);
  private auth = inject(AuthService);
  private snackBar = inject(MatSnackBar);

  restaurant: Restaurant | undefined;
  menu: MenuCategory[] = [];
  activeCategory = '';
  cartItems$ = this.cartService.cart$;
  cartSubtotal = 0;

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id')!;
    this.restaurant = this.restaurantService.getById(id);
    this.menu = this.restaurantService.getMenu(id);
    if (this.menu.length) this.activeCategory = this.menu[0].name;
    this.cartService.cart$.subscribe(() => {
      this.cartSubtotal = this.cartService.getSubtotal();
    });
  }

  scrollToCategory(name: string) {
    this.activeCategory = name;
    const el = document.getElementById('cat-' + name);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  getQuantity(itemId: string): number {
    return this.cartService.getItemQuantity(itemId);
  }

  addToCart(item: MenuItem) {
    if (!this.auth.isLoggedIn()) {
      this.snackBar.open('Please login to add items', 'Login', { duration: 3000 })
        .onAction().subscribe(() => this.router.navigate(['/login']));
      return;
    }
    const result = this.cartService.addItem(item);
    if (result.conflict) {
      if (confirm('Your cart has items from another restaurant. Start a new cart?')) {
        this.cartService.replaceCart(item);
        this.snackBar.open('Added to cart!', '', { duration: 1500 });
      }
    } else {
      this.snackBar.open('Added to cart!', '', { duration: 1000 });
    }
  }

  removeFromCart(itemId: string) { this.cartService.removeItem(itemId); }

  goToCart() { this.router.navigate(['/cart']); }
}
