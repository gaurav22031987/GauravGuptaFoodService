export interface Restaurant {
  id: string;
  name: string;
  cuisine: string[];
  rating: number;
  totalRatings: number;
  deliveryTime: number;
  deliveryFee: number;
  minOrder: number;
  image: string;
  logo: string;
  address: string;
  isVeg: boolean;
  offer?: string;
  tags: string[];
  priceForTwo: number;
}
