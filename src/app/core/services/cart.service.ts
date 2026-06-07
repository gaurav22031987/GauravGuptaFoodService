import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Cart, CartItem } from '../models/cart.model';
import { MenuItem } from '../models/menu-item.model';
import { RestaurantService } from './restaurant.service';

@Injectable({ providedIn: 'root' })
export class CartService {
  cartSubject = new BehaviorSubject<Cart>({ restaurantId: null, restaurantName: '', items: [] });
  cart$ = this.cartSubject.asObservable();

  constructor(private restaurantService: RestaurantService) {
    const saved = localStorage.getItem('zomato_cart');
    if (saved) this.cartSubject.next(JSON.parse(saved));
  }

  private save(cart: Cart) {
    localStorage.setItem('zomato_cart', JSON.stringify(cart));
    this.cartSubject.next(cart);
  }

  addItem(item: MenuItem): { conflict: boolean } {
    const current = this.cartSubject.value;
    if (current.restaurantId && current.restaurantId !== item.restaurantId) {
      return { conflict: true };
    }
    const restaurant = this.restaurantService.getById(item.restaurantId);
    const items = [...current.items];
    const idx = items.findIndex(ci => ci.item.id === item.id);
    if (idx >= 0) {
      items[idx] = { ...items[idx], quantity: items[idx].quantity + 1 };
    } else {
      items.push({ item, quantity: 1 });
    }
    this.save({ restaurantId: item.restaurantId, restaurantName: restaurant?.name || '', items });
    return { conflict: false };
  }

  removeItem(itemId: string) {
    const current = this.cartSubject.value;
    const items = current.items
      .map(ci => ci.item.id === itemId ? { ...ci, quantity: ci.quantity - 1 } : ci)
      .filter(ci => ci.quantity > 0);
    if (items.length === 0) {
      this.save({ restaurantId: null, restaurantName: '', items: [] });
    } else {
      this.save({ ...current, items });
    }
  }

  deleteItem(itemId: string) {
    const current = this.cartSubject.value;
    const items = current.items.filter(ci => ci.item.id !== itemId);
    if (items.length === 0) {
      this.save({ restaurantId: null, restaurantName: '', items: [] });
    } else {
      this.save({ ...current, items });
    }
  }

  clearCart() {
    localStorage.removeItem('zomato_cart');
    this.cartSubject.next({ restaurantId: null, restaurantName: '', items: [] });
  }

  replaceCart(item: MenuItem) {
    const restaurant = this.restaurantService.getById(item.restaurantId);
    this.save({ restaurantId: item.restaurantId, restaurantName: restaurant?.name || '', items: [{ item, quantity: 1 }] });
  }

  getItemQuantity(itemId: string): number {
    return this.cartSubject.value.items.find(ci => ci.item.id === itemId)?.quantity || 0;
  }

  getSubtotal(): number {
    return this.cartSubject.value.items.reduce((sum, ci) => sum + ci.item.price * ci.quantity, 0);
  }

  getTotalItems(): number {
    return this.cartSubject.value.items.reduce((sum, ci) => sum + ci.quantity, 0);
  }
}
