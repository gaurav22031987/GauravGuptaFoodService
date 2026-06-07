import { Component, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FormsModule } from '@angular/forms';
import { RestaurantService } from '../../core/services/restaurant.service';
import { Restaurant } from '../../core/models/restaurant.model';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterLink, MatButtonModule, MatIconModule, MatChipsModule, MatInputModule, MatFormFieldModule, FormsModule],
  template: `
    <!-- Hero -->
    <section class="hero">
      <div class="hero-content">
        <h1>Craving something <span class="highlight">delicious?</span></h1>
        <p>Order food from the best restaurants near you</p>
        <div class="search-bar">
          <mat-icon>search</mat-icon>
          <input placeholder="Search for restaurants, cuisines..." [(ngModel)]="searchQuery" (keyup.enter)="search()" />
          <button mat-raised-button class="search-btn" (click)="search()">Search</button>
        </div>
        <div class="location-pill">
          <mat-icon>location_on</mat-icon> Bangalore, Karnataka
        </div>
      </div>
      <div class="hero-image">🍕🍔🍜🍣</div>
    </section>

    <!-- Categories -->
    <section class="categories-section container">
      <h2 class="section-title">What's on your mind?</h2>
      <div class="categories-grid">
        @for (cat of categories; track cat.name) {
          <div class="category-card" (click)="browseCategory(cat.name)" role="button">
            <span class="cat-emoji">{{ cat.emoji }}</span>
            <span class="cat-name">{{ cat.name }}</span>
          </div>
        }
      </div>
    </section>

    <!-- Featured Restaurants -->
    <section class="featured-section container">
      <div class="section-header">
        <h2 class="section-title">Top Rated Near You</h2>
        <a routerLink="/restaurants" mat-button color="warn">See All →</a>
      </div>
      <div class="restaurant-grid">
        @for (r of featured; track r.id) {
          <a [routerLink]="['/restaurant', r.id]" class="restaurant-card">
            <div class="card-image">
              <img [src]="r.image" [alt]="r.name" loading="lazy" />
              @if (r.offer) {
                <div class="offer-badge">{{ r.offer }}</div>
              }
            </div>
            <div class="card-body">
              <h3>{{ r.name }}</h3>
              <p class="cuisine">{{ r.cuisine.join(', ') }}</p>
              <div class="card-meta">
                <span class="rating"><mat-icon>star</mat-icon> {{ r.rating }}</span>
                <span class="dot">•</span>
                <span>{{ r.deliveryTime }} mins</span>
                <span class="dot">•</span>
                <span>{{ r.deliveryFee === 0 ? 'Free delivery' : '₹' + r.deliveryFee + ' delivery' }}</span>
              </div>
            </div>
          </a>
        }
      </div>
    </section>

    <!-- CTA Banner -->
    <section class="cta-banner">
      <div class="container cta-inner">
        <div>
          <h2>New to FoodRush?</h2>
          <p>Get ₹100 off on your first order • Use code FIRST100</p>
        </div>
        <a routerLink="/register" mat-raised-button class="cta-btn">Get Started</a>
      </div>
    </section>
  `,
  styles: [`
    .hero { background: linear-gradient(135deg, #e23744 0%, #c0392b 100%); color: white; padding: 60px 20px; display: flex; align-items: center; justify-content: space-between; max-width: 100%; }
    .hero-content { max-width: 600px; margin: 0 auto; flex: 1; padding: 0 20px; }
    .hero-content h1 { font-size: 42px; font-weight: 700; line-height: 1.2; margin-bottom: 12px; }
    .highlight { color: #ffe082; }
    .hero-content p { font-size: 18px; opacity: 0.9; margin-bottom: 28px; }
    .search-bar { display: flex; align-items: center; background: white; border-radius: 12px; padding: 8px 8px 8px 16px; gap: 8px; box-shadow: 0 4px 20px rgba(0,0,0,0.15); }
    .search-bar mat-icon { color: #888; }
    .search-bar input { flex: 1; border: none; outline: none; font-size: 15px; font-family: Poppins; color: #3d4152; background: transparent; }
    .search-btn { background: #e23744 !important; color: white !important; border-radius: 8px !important; }
    .location-pill { display: inline-flex; align-items: center; gap: 4px; margin-top: 16px; background: rgba(255,255,255,0.2); border-radius: 20px; padding: 6px 14px; font-size: 13px; }
    .hero-image { font-size: 80px; letter-spacing: 10px; display: none; }
    @media(min-width: 768px) { .hero-image { display: block; } }

    .categories-section { padding: 48px 20px; }
    .categories-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(100px, 1fr)); gap: 16px; }
    .category-card { display: flex; flex-direction: column; align-items: center; gap: 8px; background: white; border-radius: 12px; padding: 20px 12px; cursor: pointer; transition: all 0.2s; box-shadow: 0 2px 8px rgba(0,0,0,0.06); }
    .category-card:hover { transform: translateY(-3px); box-shadow: 0 6px 20px rgba(0,0,0,0.12); }
    .cat-emoji { font-size: 32px; }
    .cat-name { font-size: 12px; font-weight: 600; color: #3d4152; text-align: center; }

    .featured-section { padding: 0 20px 48px; }
    .section-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 20px; }
    .restaurant-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); gap: 24px; }
    .restaurant-card { background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.06); transition: all 0.2s; text-decoration: none; color: inherit; display: block; }
    .restaurant-card:hover { transform: translateY(-4px); box-shadow: 0 8px 28px rgba(0,0,0,0.12); }
    .card-image { position: relative; height: 180px; overflow: hidden; }
    .card-image img { width: 100%; height: 100%; object-fit: cover; }
    .offer-badge { position: absolute; bottom: 10px; left: 10px; background: #e23744; color: white; font-size: 11px; font-weight: 600; padding: 4px 10px; border-radius: 20px; }
    .card-body { padding: 14px; }
    .card-body h3 { font-size: 16px; font-weight: 700; margin-bottom: 4px; }
    .cuisine { font-size: 13px; color: #686b78; margin-bottom: 8px; }
    .card-meta { display: flex; align-items: center; gap: 6px; font-size: 12px; color: #686b78; }
    .rating { display: flex; align-items: center; gap: 2px; color: #3d9b35; font-weight: 600; }
    .rating mat-icon { font-size: 14px; height: 14px; width: 14px; }
    .dot { color: #ccc; }

    .cta-banner { background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%); padding: 48px 20px; margin-top: 20px; }
    .cta-inner { display: flex; align-items: center; justify-content: space-between; gap: 20px; flex-wrap: wrap; }
    .cta-inner h2 { font-size: 26px; font-weight: 700; color: white; margin-bottom: 6px; }
    .cta-inner p { color: #aaa; font-size: 14px; }
    .cta-btn { background: #e23744 !important; color: white !important; border-radius: 8px !important; padding: 12px 28px !important; font-size: 15px !important; }
  `]
})
export class HomeComponent {
  private restaurantService = inject(RestaurantService);
  private router = inject(Router);
  searchQuery = '';
  featured: Restaurant[] = this.restaurantService.getFeatured();
  categories = [
    { name: 'Biryani', emoji: '🍛' }, { name: 'Pizza', emoji: '🍕' }, { name: 'Burgers', emoji: '🍔' },
    { name: 'Sushi', emoji: '🍣' }, { name: 'Dosa', emoji: '🫓' }, { name: 'Chinese', emoji: '🍜' },
    { name: 'Healthy', emoji: '🥗' }, { name: 'Desserts', emoji: '🎂' },
  ];
  search() { this.router.navigate(['/restaurants'], { queryParams: { q: this.searchQuery } }); }
  browseCategory(name: string) { this.router.navigate(['/restaurants'], { queryParams: { cuisine: name } }); }
}
