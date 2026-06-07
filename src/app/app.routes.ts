import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: '/home', pathMatch: 'full' },
  {
    path: 'home',
    loadComponent: () => import('./features/home/home.component').then(m => m.HomeComponent)
  },
  {
    path: 'login',
    loadComponent: () => import('./features/auth/login/login.component').then(m => m.LoginComponent)
  },
  {
    path: 'register',
    loadComponent: () => import('./features/auth/register/register.component').then(m => m.RegisterComponent)
  },
  {
    path: 'restaurants',
    loadComponent: () => import('./features/restaurants/restaurants.component').then(m => m.RestaurantsComponent)
  },
  {
    path: 'restaurant/:id',
    loadComponent: () => import('./features/restaurant-detail/restaurant-detail.component').then(m => m.RestaurantDetailComponent)
  },
  {
    path: 'cart',
    loadComponent: () => import('./features/cart/cart.component').then(m => m.CartComponent),
    canActivate: [authGuard]
  },
  {
    path: 'checkout',
    loadComponent: () => import('./features/checkout/checkout.component').then(m => m.CheckoutComponent),
    canActivate: [authGuard]
  },
  {
    path: 'order/:id',
    loadComponent: () => import('./features/order-tracking/order-tracking.component').then(m => m.OrderTrackingComponent),
    canActivate: [authGuard]
  },
  {
    path: '**',
    loadComponent: () => import('./features/not-found/not-found.component').then(m => m.NotFoundComponent)
  }
];
