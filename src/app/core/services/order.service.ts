import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Order, OrderStatus, DeliveryAddress } from '../models/order.model';
import { Cart } from '../models/cart.model';

@Injectable({ providedIn: 'root' })
export class OrderService {
  private ordersSubject = new BehaviorSubject<Order[]>(this.loadOrders());
  orders$ = this.ordersSubject.asObservable();

  private loadOrders(): Order[] {
    const raw = localStorage.getItem('zomato_orders');
    if (!raw) return [];
    return JSON.parse(raw).map((o: Order) => ({
      ...o,
      placedAt: new Date(o.placedAt),
      estimatedDelivery: new Date(o.estimatedDelivery)
    }));
  }

  private save(orders: Order[]) {
    localStorage.setItem('zomato_orders', JSON.stringify(orders));
    this.ordersSubject.next(orders);
  }

  placeOrder(cart: Cart, address: DeliveryAddress, paymentId: string, userId: string): Order {
    const subtotal = cart.items.reduce((s, ci) => s + ci.item.price * ci.quantity, 0);
    const deliveryFee = subtotal > 500 ? 0 : 30;
    const taxes = Math.round(subtotal * 0.05);
    const now = new Date();
    const order: Order = {
      id: 'ORD-' + Date.now(),
      userId,
      restaurantId: cart.restaurantId!,
      restaurantName: cart.restaurantName,
      items: cart.items,
      subtotal,
      deliveryFee,
      taxes,
      total: subtotal + deliveryFee + taxes,
      status: 'placed',
      address,
      placedAt: now,
      estimatedDelivery: new Date(now.getTime() + 40 * 60000),
      paymentMethod: 'Stripe',
      paymentId
    };
    const orders = [order, ...this.ordersSubject.value];
    this.save(orders);
    this.simulateStatusUpdates(order.id);
    return order;
  }

  getOrderById(id: string): Order | undefined {
    return this.ordersSubject.value.find(o => o.id === id);
  }

  getUserOrders(userId: string): Order[] {
    return this.ordersSubject.value.filter(o => o.userId === userId);
  }

  private simulateStatusUpdates(orderId: string) {
    const steps: OrderStatus[] = ['confirmed', 'preparing', 'out_for_delivery', 'delivered'];
    const delays = [10000, 30000, 60000, 120000];
    steps.forEach((status, i) => {
      setTimeout(() => {
        const orders = this.ordersSubject.value.map(o =>
          o.id === orderId ? { ...o, status } : o
        );
        this.save(orders);
      }, delays[i]);
    });
  }
}
