import { Component, inject, OnInit, signal } from '@angular/core';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { FormsModule } from '@angular/forms';
import { RestaurantService } from '../../core/services/restaurant.service';
import { Restaurant } from '../../core/models/restaurant.model';

@Component({
  selector: 'app-restaurants',
  standalone: true,
  imports: [RouterLink, MatButtonModule, MatIconModule, MatChipsModule, MatInputModule, MatFormFieldModule, MatSelectModule, MatSlideToggleModule, FormsModule],
  template: `
    <div class="page container">
      <h1 class="page-title">Restaurants near you</h1>

      <!-- Filters -->
      <div class="filters-bar">
        <div class="search-wrap">
          <mat-form-field appearance="outline" class="search-field">
            <mat-label>Search restaurants</mat-label>
            <input matInput [(ngModel)]="searchQuery" (ngModelChange)="applyFilters()" />
            <mat-icon matSuffix>search</mat-icon>
          </mat-form-field>
        </div>
        <div class="filter-chips">
          @for (chip of filterChips; track chip.value) {
            <div class="filter-chip" [class.chip-active]="sortBy === chip.value" (click)="setSortBy(chip.value)">
              {{ chip.label }}
            </div>
          }
          <div class="filter-chip veg-chip" [class.chip-active]="vegOnly" (click)="vegOnly = !vegOnly; applyFilters()">
            <span class="veg-dot"></span> Pure Veg
          </div>
        </div>
      </div>

      <!-- Results info -->
      <p class="results-info">{{ filtered.length }} restaurants found</p>

      <!-- Grid -->
      <div class="restaurant-grid">
        @for (r of filtered; track r.id) {
          <a [routerLink]="['/restaurant', r.id]" class="restaurant-card">
            <div class="card-image">
              <img [src]="r.image" [alt]="r.name" loading="lazy" />
              @if (r.offer) { <div class="offer-badge">{{ r.offer }}</div> }
              @if (r.isVeg) { <div class="veg-badge">🌿 Pure Veg</div> }
            </div>
            <div class="card-body">
              <div class="card-top">
                <h3>{{ r.name }}</h3>
                <span class="rating-badge"><mat-icon>star</mat-icon> {{ r.rating }}</span>
              </div>
              <p class="cuisine">{{ r.cuisine.join(' • ') }}</p>
              <div class="card-meta">
                <span><mat-icon>schedule</mat-icon> {{ r.deliveryTime }} mins</span>
                <span><mat-icon>delivery_dining</mat-icon> {{ r.deliveryFee === 0 ? 'Free' : '₹' + r.deliveryFee }}</span>
                <span><mat-icon>currency_rupee</mat-icon> {{ r.priceForTwo }} for two</span>
              </div>
            </div>
          </a>
        }
        @empty {
          <div class="no-results">
            <span style="font-size:48px">😔</span>
            <p>No restaurants found. Try different filters.</p>
          </div>
        }
      </div>
    </div>
  `,
  styles: [`
    .page { padding: 32px 20px; }
    .page-title { font-size: 28px; font-weight: 700; margin-bottom: 24px; }
    .filters-bar { display: flex; flex-wrap: wrap; gap: 16px; align-items: flex-start; margin-bottom: 16px; }
    .search-field { width: 320px; }
    .filter-chips { display: flex; flex-wrap: wrap; gap: 8px; align-items: center; padding-top: 8px; }
    .filter-chip { padding: 8px 16px; border-radius: 20px; border: 1.5px solid #ddd; font-size: 13px; font-weight: 500; cursor: pointer; transition: all 0.2s; background: white; color: #3d4152; display: flex; align-items: center; gap: 6px; }
    .filter-chip:hover { border-color: #e23744; color: #e23744; }
    .chip-active { background: #e23744 !important; color: white !important; border-color: #e23744 !important; }
    .veg-dot { width: 10px; height: 10px; background: #3d9b35; border-radius: 50%; display: inline-block; }
    .results-info { font-size: 14px; color: #686b78; margin-bottom: 20px; }
    .restaurant-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 24px; }
    .restaurant-card { background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.06); transition: all 0.2s; text-decoration: none; color: inherit; display: block; }
    .restaurant-card:hover { transform: translateY(-4px); box-shadow: 0 8px 28px rgba(0,0,0,0.12); }
    .card-image { position: relative; height: 180px; overflow: hidden; }
    .card-image img { width: 100%; height: 100%; object-fit: cover; transition: transform 0.3s; }
    .restaurant-card:hover img { transform: scale(1.04); }
    .offer-badge { position: absolute; bottom: 10px; left: 10px; background: #e23744; color: white; font-size: 11px; font-weight: 600; padding: 4px 10px; border-radius: 20px; }
    .veg-badge { position: absolute; top: 10px; right: 10px; background: white; color: #3d9b35; font-size: 11px; font-weight: 600; padding: 4px 10px; border-radius: 20px; }
    .card-body { padding: 14px; }
    .card-top { display: flex; align-items: center; justify-content: space-between; margin-bottom: 4px; }
    .card-top h3 { font-size: 16px; font-weight: 700; }
    .rating-badge { display: flex; align-items: center; gap: 2px; background: #3d9b35; color: white; font-size: 12px; font-weight: 600; padding: 3px 8px; border-radius: 6px; }
    .rating-badge mat-icon { font-size: 13px; height: 13px; width: 13px; }
    .cuisine { font-size: 12px; color: #686b78; margin-bottom: 10px; }
    .card-meta { display: flex; gap: 12px; flex-wrap: wrap; }
    .card-meta span { display: flex; align-items: center; gap: 3px; font-size: 12px; color: #686b78; }
    .card-meta mat-icon { font-size: 14px; height: 14px; width: 14px; }
    .no-results { grid-column: 1/-1; text-align: center; padding: 60px 20px; color: #686b78; display: flex; flex-direction: column; align-items: center; gap: 12px; }
  `]
})
export class RestaurantsComponent implements OnInit {
  private restaurantService = inject(RestaurantService);
  private route = inject(ActivatedRoute);

  all: Restaurant[] = this.restaurantService.getAll();
  filtered: Restaurant[] = [...this.all];
  searchQuery = '';
  sortBy = '';
  vegOnly = false;

  filterChips = [
    { label: '⭐ Top Rated', value: 'rating' },
    { label: '⚡ Fastest Delivery', value: 'delivery' },
    { label: '💰 Price (Low)', value: 'price' },
  ];

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      if (params['q']) this.searchQuery = params['q'];
      this.applyFilters();
    });
  }

  setSortBy(value: string) {
    this.sortBy = this.sortBy === value ? '' : value;
    this.applyFilters();
  }

  applyFilters() {
    let list = this.searchQuery
      ? this.restaurantService.search(this.searchQuery)
      : this.restaurantService.getAll();
    if (this.vegOnly) list = list.filter(r => r.isVeg);
    if (this.sortBy === 'rating') list = [...list].sort((a, b) => b.rating - a.rating);
    else if (this.sortBy === 'delivery') list = [...list].sort((a, b) => a.deliveryTime - b.deliveryTime);
    else if (this.sortBy === 'price') list = [...list].sort((a, b) => a.priceForTwo - b.priceForTwo);
    this.filtered = list;
  }
}
