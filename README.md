# 🍔 FoodRush — Zomato-like Food Delivery App

A full-featured food delivery application built with **Angular 18**, **Angular Material**, and **Stripe** payment integration.

---

## 🚀 Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Add your Stripe key (see Configuration below)

# 3. Run the app
ng serve
```

Open **http://localhost:4200**

---

## 🔑 Demo Login

| Email | Password |
|-------|----------|
| demo@foodrush.com | demo123 |

Or create a new account via **Sign Up**.

---

## 💳 Stripe Test Payment

Use these test card details on the Checkout page:

| Field | Value |
|-------|-------|
| Card Number | `4242 4242 4242 4242` |
| Expiry | Any future date (e.g. `12/26`) |
| CVV | Any 3 digits (e.g. `123`) |

---

## ⚙️ Stripe Configuration

1. Get your **Publishable Key** from [https://dashboard.stripe.com](https://dashboard.stripe.com)
2. Open `src/environments/environment.ts`
3. Replace the placeholder:
   ```typescript
   stripePublicKey: 'pk_test_YOUR_STRIPE_PUBLISHABLE_KEY_HERE'
   ```

For production backend integration, create a `/create-payment-intent` endpoint that returns a `client_secret`, then use it in `payment.service.ts`.

---

## 🏗️ Features

- **Home** — Hero search, category chips, featured restaurants
- **Restaurant Listing** — Grid view with filters (rating, speed, price, veg)
- **Restaurant Detail** — Menu by category, add to cart, real-time quantities
- **Cart** — Manage items, price summary, conflict detection (different restaurants)
- **Checkout** — Delivery address form + Stripe card payment (2-step flow)
- **Order Tracking** — Live status timeline with animated progress indicators
- **Auth** — Login / Register with form validation

---

## 📁 Project Structure

```
src/app/
├── core/
│   ├── models/          # TypeScript interfaces
│   ├── services/        # Auth, Cart, Restaurant, Order, Payment
│   └── guards/          # Auth guard
├── features/
│   ├── home/
│   ├── auth/            # login + register
│   ├── restaurants/
│   ├── restaurant-detail/
│   ├── cart/
│   ├── checkout/        # Stripe integration
│   ├── order-tracking/
│   └── not-found/
└── shared/
    └── components/      # Navbar, Footer
```

---

## 🛠️ Tech Stack

| Technology | Version |
|-----------|---------|
| Angular | 18.2 |
| Angular Material | 18.2 |
| Stripe.js | 4.x |
| RxJS | 7.8 |
| TypeScript | 5.4 |

---

## 📦 Build for Production

```bash
ng build --configuration production
```

Output will be in `dist/zomato-clone/`.

---

## 🔌 Backend Integration Notes

The app currently uses **localStorage** for data persistence and **simulated payment processing**. To connect a real backend:

1. **Auth**: Replace `AuthService` localStorage logic with HTTP calls to your API
2. **Payment**: Call `POST /api/create-payment-intent` → get `client_secret` → pass to `stripe.elements()`
3. **Orders**: Persist orders to a database via REST API

