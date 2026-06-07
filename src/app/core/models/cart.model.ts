import { MenuItem } from './menu-item.model';

export interface CartItem {
  item: MenuItem;
  quantity: number;
}

export interface Cart {
  restaurantId: string | null;
  restaurantName: string;
  items: CartItem[];
}
