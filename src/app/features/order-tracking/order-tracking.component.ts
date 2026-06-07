import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatStepperModule } from '@angular/material/stepper';
import { MatDividerModule } from '@angular/material/divider';
import { DatePipe } from '@angular/common';
import { Subscription } from 'rxjs';
import { OrderService } from '../../core/services/order.service';
import { Order, OrderStatus } from '../../core/models/order.model';

@Component({
  selector: 'app-order-tracking',
  standalone: true,
  imports: [RouterLink, MatIconModule, MatButtonModule, MatStepperModule, MatDividerModule, DatePipe],
  template: `
    @if (order) {
      <div class="page container">
        <!-- Status header -->
        <div class="status-header" [class]="'status-' + order.status">
          <div class="status-icon">{{ statusEmoji }}</div>
          <div>
            <h1>{{ statusTitle }}</h1>
            <p>{{ statusSubtitle }}</p>
          </div>
        </div>

        <div class="tracking-layout">
          <!-- Timeline -->
          <div class="timeline-card">
            <h2>Order Status</h2>
            <div class="timeline">
              @for (step of steps; track step.status) {
                <div class="timeline-step" [class.done]="isStepDone(step.status)" [class.current]="order.status === step.status">
                  <div class="step-icon-wrap">
                    <div class="step-icon">
                      @if (isStepDone(step.status)) { <mat-icon>check_circle</mat-icon> }
                      @else if (order.status === step.status) { <div class="pulse-dot"></div> }
                      @else { <div class="empty-dot"></div> }
                    </div>
                    @if (!$last) { <div class="step-line"></div> }
                  </div>
                  <div class="step-content">
                    <span class="step-label">{{ step.label }}</span>
                    <span class="step-desc">{{ step.desc }}</span>
                  </div>
                </div>
              }
            </div>
            <div class="eta-banner">
              <mat-icon>access_time</mat-icon>
              Estimated delivery by {{ order.estimatedDelivery | date:'h:mm a' }}
            </div>
          </div>

          <!-- Order Details -->
          <div class="order-details-card">
            <h2>Order Details</h2>
            <div class="order-meta">
              <span class="order-id">#{{ order.id }}</span>
              <span class="order-time">{{ order.placedAt | date:'d MMM, h:mm a' }}</span>
            </div>
            <mat-divider></mat-divider>
            <div class="restaurant-info">
              <mat-icon>restaurant</mat-icon> {{ order.restaurantName }}
            </div>
            @for (ci of order.items; track ci.item.id) {
              <div class="order-item">
                <span>{{ ci.item.name }} × {{ ci.quantity }}</span>
                <span>₹{{ ci.item.price * ci.quantity }}</span>
              </div>
            }
            <mat-divider></mat-divider>
            <div class="price-row"><span>Subtotal</span><span>₹{{ order.subtotal }}</span></div>
            <div class="price-row"><span>Delivery</span><span>{{ order.deliveryFee === 0 ? 'FREE' : '₹' + order.deliveryFee }}</span></div>
            <div class="price-row"><span>Taxes</span><span>₹{{ order.taxes }}</span></div>
            <div class="price-row total-row"><strong>Total Paid</strong><strong>₹{{ order.total }}</strong></div>
            <mat-divider></mat-divider>
            <div class="delivery-address">
              <mat-icon>location_on</mat-icon>
              <div>
                <strong>{{ order.address.name }}</strong><br/>
                {{ order.address.street }}, {{ order.address.city }}, {{ order.address.state }} - {{ order.address.pincode }}
              </div>
            </div>
            <div class="payment-info">
              <mat-icon>credit_card</mat-icon>
              Paid via {{ order.paymentMethod }} • ID: {{ order.paymentId?.slice(-12) }}
            </div>
            <a routerLink="/restaurants" mat-raised-button class="reorder-btn">
              Order Again <mat-icon>replay</mat-icon>
            </a>
          </div>
        </div>
      </div>
    } @else {
      <div class="not-found">Order not found. <a routerLink="/home">Go Home</a></div>
    }
  `,
  styles: [`
    .page { padding: 32px 20px 60px; }
    .status-header { display: flex; align-items: center; gap: 16px; padding: 24px; border-radius: 12px; margin-bottom: 28px; }
    .status-placed { background: #e3f2fd; }
    .status-confirmed { background: #e8f5e9; }
    .status-preparing { background: #fff3e0; }
    .status-out_for_delivery { background: #fce4ec; }
    .status-delivered { background: #e8f5e9; }
    .status-icon { font-size: 48px; }
    .status-header h1 { font-size: 22px; font-weight: 700; margin-bottom: 4px; }
    .status-header p { color: #686b78; font-size: 14px; }

    .tracking-layout { display: grid; grid-template-columns: 1fr 360px; gap: 24px; }
    .timeline-card, .order-details-card { background: white; border-radius: 12px; padding: 24px; box-shadow: 0 2px 8px rgba(0,0,0,0.06); }
    .timeline-card h2, .order-details-card h2 { font-size: 18px; font-weight: 700; margin-bottom: 20px; }

    .timeline { display: flex; flex-direction: column; gap: 0; }
    .timeline-step { display: flex; gap: 16px; }
    .step-icon-wrap { display: flex; flex-direction: column; align-items: center; }
    .step-icon { width: 32px; height: 32px; display: flex; align-items: center; justify-content: center; }
    .step-icon mat-icon { color: #3d9b35; font-size: 28px; }
    .step-line { width: 2px; flex: 1; min-height: 32px; background: #e0e0e0; margin: 2px 0; }
    .timeline-step.done .step-line { background: #3d9b35; }
    .pulse-dot { width: 18px; height: 18px; background: #e23744; border-radius: 50%; animation: pulse 1.2s ease-in-out infinite; }
    @keyframes pulse { 0%, 100% { transform: scale(1); opacity: 1; } 50% { transform: scale(1.3); opacity: 0.7; } }
    .empty-dot { width: 18px; height: 18px; border: 2px solid #ddd; border-radius: 50%; }
    .step-content { padding: 4px 0 24px; }
    .step-label { display: block; font-weight: 600; font-size: 14px; color: #3d4152; }
    .timeline-step.done .step-label { color: #3d9b35; }
    .timeline-step.current .step-label { color: #e23744; }
    .step-desc { font-size: 12px; color: #686b78; }
    .eta-banner { display: flex; align-items: center; gap: 8px; background: #f8f8f8; padding: 12px 16px; border-radius: 8px; font-size: 14px; font-weight: 500; margin-top: 8px; }

    .order-meta { display: flex; justify-content: space-between; margin-bottom: 12px; }
    .order-id { font-weight: 600; font-size: 13px; color: #e23744; }
    .order-time { font-size: 13px; color: #686b78; }
    .restaurant-info { display: flex; align-items: center; gap: 6px; padding: 12px 0; font-weight: 600; color: #3d4152; }
    .order-item { display: flex; justify-content: space-between; padding: 6px 0; font-size: 13px; color: #686b78; }
    .price-row { display: flex; justify-content: space-between; padding: 7px 0; font-size: 14px; }
    .total-row { font-size: 15px; }
    .delivery-address { display: flex; gap: 10px; padding: 12px 0; font-size: 13px; color: #686b78; line-height: 1.5; }
    .delivery-address strong { color: #3d4152; }
    .payment-info { display: flex; align-items: center; gap: 6px; font-size: 13px; color: #686b78; padding-bottom: 12px; }
    .reorder-btn { width: 100%; background: #e23744 !important; color: white !important; border-radius: 8px !important; height: 44px; display: flex !important; align-items: center; justify-content: center; gap: 4px; margin-top: 8px; }
    .not-found { text-align: center; padding: 80px; }
    @media(max-width: 768px) { .tracking-layout { grid-template-columns: 1fr; } }
  `]
})
export class OrderTrackingComponent implements OnInit, OnDestroy {
  private route = inject(ActivatedRoute);
  private orderService = inject(OrderService);
  private sub!: Subscription;

  order: Order | undefined;
  steps = [
    { status: 'placed' as OrderStatus, label: 'Order Placed', desc: 'Your order has been received' },
    { status: 'confirmed' as OrderStatus, label: 'Order Confirmed', desc: 'Restaurant confirmed your order' },
    { status: 'preparing' as OrderStatus, label: 'Being Prepared', desc: 'Chef is preparing your food' },
    { status: 'out_for_delivery' as OrderStatus, label: 'Out for Delivery', desc: 'Rider is on the way' },
    { status: 'delivered' as OrderStatus, label: 'Delivered', desc: 'Enjoy your meal!' },
  ];

  get statusEmoji() {
    const map: Record<OrderStatus, string> = { placed: '📋', confirmed: '✅', preparing: '👨‍🍳', out_for_delivery: '🛵', delivered: '🎉' };
    return map[this.order?.status || 'placed'];
  }
  get statusTitle() {
    const map: Record<OrderStatus, string> = { placed: 'Order Placed!', confirmed: 'Order Confirmed!', preparing: 'Being Prepared', out_for_delivery: 'Out for Delivery!', delivered: 'Delivered!' };
    return map[this.order?.status || 'placed'];
  }
  get statusSubtitle() {
    const map: Record<OrderStatus, string> = { placed: 'Waiting for restaurant confirmation', confirmed: 'Your food will be ready soon', preparing: 'The chef is cooking your order', out_for_delivery: 'Your rider is heading your way', delivered: 'We hope you enjoyed your meal!' };
    return map[this.order?.status || 'placed'];
  }

  statusOrder: OrderStatus[] = ['placed', 'confirmed', 'preparing', 'out_for_delivery', 'delivered'];

  isStepDone(status: OrderStatus): boolean {
    if (!this.order) return false;
    return this.statusOrder.indexOf(status) < this.statusOrder.indexOf(this.order.status);
  }

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id')!;
    this.order = this.orderService.getOrderById(id);
    this.sub = this.orderService.orders$.subscribe(() => {
      this.order = this.orderService.getOrderById(id);
    });
  }

  ngOnDestroy() { this.sub?.unsubscribe(); }
}
