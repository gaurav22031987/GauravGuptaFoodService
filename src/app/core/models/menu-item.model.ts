export interface MenuItem {
  id: string;
  restaurantId: string;
  name: string;
  description: string;
  price: number;
  image: string;
  category: string;
  isVeg: boolean;
  isBestseller?: boolean;
  isSpicy?: boolean;
  rating?: number;
}

export interface MenuCategory {
  name: string;
  items: MenuItem[];
}
