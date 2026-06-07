import { CartItem } from './cart.model';

export type OrderStatus = 'placed' | 'confirmed' | 'preparing' | 'out_for_delivery' | 'delivered';

export interface Order {
  id: string;
  userId: string;
  restaurantId: string;
  restaurantName: string;
  items: CartItem[];
  subtotal: number;
  deliveryFee: number;
  taxes: number;
  total: number;
  status: OrderStatus;
  address: DeliveryAddress;
  placedAt: Date;
  estimatedDelivery: Date;
  paymentMethod: string;
  paymentId?: string;
}

export interface DeliveryAddress {
  name: string;
  phone: string;
  street: string;
  city: string;
  state: string;
  pincode: string;
}
