import { Injectable } from '@angular/core';
import { Restaurant } from '../models/restaurant.model';
import { MenuCategory, MenuItem } from '../models/menu-item.model';

@Injectable({ providedIn: 'root' })
export class RestaurantService {
  private restaurants: Restaurant[] = [
    { id: 'r1', name: "Burger King", cuisine: ['Burgers','Fast Food','Beverages'], rating: 4.2, totalRatings: 3200, deliveryTime: 25, deliveryFee: 30, minOrder: 100, image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600&q=80', logo: 'https://images.unsplash.com/photo-1571091718767-18b5b1457add?w=100&q=80', address: '12, MG Road, Bangalore', isVeg: false, offer: '20% OFF up to ₹100', tags: ['Burgers','Wraps'], priceForTwo: 400 },
    { id: 'r2', name: "Pizza Palace", cuisine: ['Pizza','Italian','Pasta'], rating: 4.4, totalRatings: 5100, deliveryTime: 35, deliveryFee: 0, minOrder: 200, image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=600&q=80', logo: 'https://images.unsplash.com/photo-1534308983496-4fabb1a015ee?w=100&q=80', address: '44, Indiranagar, Bangalore', isVeg: false, offer: 'Free delivery', tags: ['Pizza','Pasta','Desserts'], priceForTwo: 600 },
    { id: 'r3', name: "Spice Garden", cuisine: ['Indian','Biryani','Curry'], rating: 4.6, totalRatings: 8800, deliveryTime: 40, deliveryFee: 20, minOrder: 150, image: 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=600&q=80', logo: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=100&q=80', address: '7, Koramangala, Bangalore', isVeg: false, offer: '₹100 OFF on ₹499', tags: ['Biryani','North Indian','Kebabs'], priceForTwo: 500 },
    { id: 'r4', name: "Green Bowl", cuisine: ['Healthy','Salads','Vegan'], rating: 4.3, totalRatings: 2100, deliveryTime: 20, deliveryFee: 25, minOrder: 200, image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=600&q=80', logo: 'https://images.unsplash.com/photo-1540914124281-342587941389?w=100&q=80', address: '3, HSR Layout, Bangalore', isVeg: true, offer: undefined, tags: ['Salads','Wraps','Smoothies'], priceForTwo: 450 },
    { id: 'r5', name: "Sushi House", cuisine: ['Japanese','Sushi','Asian'], rating: 4.5, totalRatings: 3900, deliveryTime: 45, deliveryFee: 50, minOrder: 300, image: 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=600&q=80', logo: 'https://images.unsplash.com/photo-1563245372-f21724e3856d?w=100&q=80', address: '9, Whitefield, Bangalore', isVeg: false, offer: '15% OFF', tags: ['Sushi','Ramen','Sashimi'], priceForTwo: 900 },
    { id: 'r6', name: "Dosa Corner", cuisine: ['South Indian','Dosa','Idli'], rating: 4.7, totalRatings: 11200, deliveryTime: 20, deliveryFee: 0, minOrder: 80, image: 'https://images.unsplash.com/photo-1630383249896-424e482df921?w=600&q=80', logo: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=100&q=80', address: '2, BTM Layout, Bangalore', isVeg: true, offer: 'Free delivery', tags: ['Dosa','Idli','Uttapam'], priceForTwo: 200 },
    { id: 'r7', name: "The Chinese Wok", cuisine: ['Chinese','Noodles','Momos'], rating: 4.1, totalRatings: 4300, deliveryTime: 30, deliveryFee: 30, minOrder: 150, image: 'https://images.unsplash.com/photo-1563245372-f21724e3856d?w=600&q=80', logo: 'https://images.unsplash.com/photo-1569050467447-ce54b3bbc37d?w=100&q=80', address: '18, Electronic City, Bangalore', isVeg: false, offer: undefined, tags: ['Noodles','Fried Rice','Momos'], priceForTwo: 350 },
    { id: 'r8', name: "Cake & Bake", cuisine: ['Bakery','Desserts','Cakes'], rating: 4.4, totalRatings: 1800, deliveryTime: 30, deliveryFee: 40, minOrder: 200, image: 'https://images.unsplash.com/photo-1551024601-bec78aea704b?w=600&q=80', logo: 'https://images.unsplash.com/photo-1464349095431-e9a21285b5f3?w=100&q=80', address: '5, Jayanagar, Bangalore', isVeg: true, offer: '10% OFF', tags: ['Cakes','Pastries','Cookies'], priceForTwo: 500 },
  ];

  private menuData: Record<string, MenuCategory[]> = {
    'r1': [
      { name: 'Burgers', items: [
        { id: 'i1', restaurantId: 'r1', name: 'Whopper', description: 'Flame-grilled beef patty with tomatoes, lettuce, mayo', price: 249, image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=300&q=80', category: 'Burgers', isVeg: false, isBestseller: true, rating: 4.5 },
        { id: 'i2', restaurantId: 'r1', name: 'Crispy Chicken Burger', description: 'Crispy fried chicken with coleslaw and special sauce', price: 199, image: 'https://images.unsplash.com/photo-1606755962773-d324e0a13086?w=300&q=80', category: 'Burgers', isVeg: false, rating: 4.3 },
        { id: 'i3', restaurantId: 'r1', name: 'Veg Royale', description: 'Crispy veggie patty with fresh veggies', price: 149, image: 'https://images.unsplash.com/photo-1550547660-d9450f859349?w=300&q=80', category: 'Burgers', isVeg: true, rating: 4.1 },
      ]},
      { name: 'Sides', items: [
        { id: 'i4', restaurantId: 'r1', name: 'French Fries (Large)', description: 'Golden crispy fries with ketchup', price: 99, image: 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=300&q=80', category: 'Sides', isVeg: true, isBestseller: true, rating: 4.6 },
        { id: 'i5', restaurantId: 'r1', name: 'Onion Rings', description: 'Crispy battered onion rings', price: 89, image: 'https://images.unsplash.com/photo-1639024471283-03518883512d?w=300&q=80', category: 'Sides', isVeg: true, rating: 4.2 },
      ]},
      { name: 'Beverages', items: [
        { id: 'i6', restaurantId: 'r1', name: 'Coca Cola (L)', description: 'Chilled Coca-Cola 500ml', price: 69, image: 'https://images.unsplash.com/photo-1554866585-cd94860890b7?w=300&q=80', category: 'Beverages', isVeg: true, rating: 4.0 },
        { id: 'i7', restaurantId: 'r1', name: 'Thick Shake (Chocolate)', description: 'Rich chocolate milkshake', price: 129, image: 'https://images.unsplash.com/photo-1572490122747-3968b75cc699?w=300&q=80', category: 'Beverages', isVeg: true, rating: 4.4 },
      ]}
    ],
    'r2': [
      { name: 'Pizzas', items: [
        { id: 'p1', restaurantId: 'r2', name: 'Margherita', description: 'Classic tomato sauce, mozzarella, fresh basil', price: 299, image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=300&q=80', category: 'Pizzas', isVeg: true, isBestseller: true, rating: 4.5 },
        { id: 'p2', restaurantId: 'r2', name: 'Pepperoni Feast', description: 'Loaded with pepperoni and extra cheese', price: 449, image: 'https://images.unsplash.com/photo-1628840042765-356cda07504e?w=300&q=80', category: 'Pizzas', isVeg: false, rating: 4.7 },
        { id: 'p3', restaurantId: 'r2', name: 'BBQ Chicken', description: 'BBQ sauce, grilled chicken, caramelized onions', price: 499, image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=300&q=80', category: 'Pizzas', isVeg: false, rating: 4.4 },
      ]},
      { name: 'Pasta', items: [
        { id: 'p4', restaurantId: 'r2', name: 'Spaghetti Bolognese', description: 'Slow-cooked meat sauce with spaghetti', price: 349, image: 'https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?w=300&q=80', category: 'Pasta', isVeg: false, rating: 4.3 },
        { id: 'p5', restaurantId: 'r2', name: 'Penne Arrabiata', description: 'Spicy tomato sauce, garlic, chillies', price: 299, image: 'https://images.unsplash.com/photo-1563379926898-05f4575a45d8?w=300&q=80', category: 'Pasta', isVeg: true, isBestseller: true, rating: 4.5 },
      ]}
    ],
    'r3': [
      { name: 'Biryani', items: [
        { id: 'b1', restaurantId: 'r3', name: 'Chicken Dum Biryani', description: 'Slow-cooked basmati rice with tender chicken', price: 349, image: 'https://images.unsplash.com/photo-1563379926898-05f4575a45d8?w=300&q=80', category: 'Biryani', isVeg: false, isBestseller: true, rating: 4.8 },
        { id: 'b2', restaurantId: 'r3', name: 'Mutton Biryani', description: 'Aromatic biryani with succulent mutton pieces', price: 449, image: 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=300&q=80', category: 'Biryani', isVeg: false, rating: 4.6 },
        { id: 'b3', restaurantId: 'r3', name: 'Veg Biryani', description: 'Fragrant rice with seasonal vegetables', price: 249, image: 'https://images.unsplash.com/photo-1589302168068-964664d93dc0?w=300&q=80', category: 'Biryani', isVeg: true, rating: 4.3 },
      ]},
      { name: 'Starters', items: [
        { id: 'b4', restaurantId: 'r3', name: 'Chicken Tikka', description: 'Tandoor-grilled chicken marinated in spices', price: 299, image: 'https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?w=300&q=80', category: 'Starters', isVeg: false, isBestseller: true, rating: 4.7 },
        { id: 'b5', restaurantId: 'r3', name: 'Paneer Tikka', description: 'Chargrilled cottage cheese with mint chutney', price: 249, image: 'https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?w=300&q=80', category: 'Starters', isVeg: true, rating: 4.5 },
      ]}
    ],
    'r4': [
      { name: 'Salads', items: [
        { id: 'g1', restaurantId: 'r4', name: 'Caesar Salad', description: 'Romaine, croutons, parmesan, Caesar dressing', price: 249, image: 'https://images.unsplash.com/photo-1546793665-c74683f339c1?w=300&q=80', category: 'Salads', isVeg: true, isBestseller: true, rating: 4.4 },
        { id: 'g2', restaurantId: 'r4', name: 'Quinoa Bowl', description: 'Quinoa, roasted veggies, tahini dressing', price: 349, image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=300&q=80', category: 'Salads', isVeg: true, rating: 4.5 },
      ]}
    ],
    'r5': [
      { name: 'Sushi Rolls', items: [
        { id: 's1', restaurantId: 'r5', name: 'California Roll (8 pcs)', description: 'Crab, avocado, cucumber, sesame seeds', price: 499, image: 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=300&q=80', category: 'Sushi Rolls', isVeg: false, isBestseller: true, rating: 4.7 },
        { id: 's2', restaurantId: 'r5', name: 'Spicy Tuna Roll', description: 'Fresh tuna, spicy mayo, cucumber', price: 599, image: 'https://images.unsplash.com/photo-1617196034183-421b4040ed20?w=300&q=80', category: 'Sushi Rolls', isVeg: false, rating: 4.6 },
        { id: 's3', restaurantId: 'r5', name: 'Veggie Roll (6 pcs)', description: 'Avocado, cucumber, carrots, pickled radish', price: 399, image: 'https://images.unsplash.com/photo-1581871872483-30c58ef55e1e?w=300&q=80', category: 'Sushi Rolls', isVeg: true, rating: 4.3 },
      ]}
    ],
    'r6': [
      { name: 'Dosas', items: [
        { id: 'd1', restaurantId: 'r6', name: 'Masala Dosa', description: 'Crispy dosa with spiced potato filling', price: 89, image: 'https://images.unsplash.com/photo-1630383249896-424e482df921?w=300&q=80', category: 'Dosas', isVeg: true, isBestseller: true, rating: 4.8 },
        { id: 'd2', restaurantId: 'r6', name: 'Ghee Roast Dosa', description: 'Crispy dosa roasted in ghee', price: 99, image: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=300&q=80', category: 'Dosas', isVeg: true, rating: 4.6 },
        { id: 'd3', restaurantId: 'r6', name: 'Rava Dosa', description: 'Crispy semolina dosa with coconut chutney', price: 79, image: 'https://images.unsplash.com/photo-1610192244261-3f33de3f55e4?w=300&q=80', category: 'Dosas', isVeg: true, rating: 4.5 },
      ]},
      { name: 'Idli & Others', items: [
        { id: 'd4', restaurantId: 'r6', name: 'Idli (4 pcs)', description: 'Soft steamed rice cakes with sambar and chutney', price: 69, image: 'https://images.unsplash.com/photo-1626200419199-391ae4be7a41?w=300&q=80', category: 'Idli & Others', isVeg: true, isBestseller: true, rating: 4.7 },
        { id: 'd5', restaurantId: 'r6', name: 'Medu Vada (2 pcs)', description: 'Crispy lentil fritters with sambar', price: 59, image: 'https://images.unsplash.com/photo-1569050467447-ce54b3bbc37d?w=300&q=80', category: 'Idli & Others', isVeg: true, rating: 4.4 },
      ]}
    ],
    'r7': [
      { name: 'Noodles & Rice', items: [
        { id: 'c1', restaurantId: 'r7', name: 'Hakka Noodles', description: 'Stir-fried noodles with vegetables and soy', price: 179, image: 'https://images.unsplash.com/photo-1569050467447-ce54b3bbc37d?w=300&q=80', category: 'Noodles & Rice', isVeg: false, isBestseller: true, rating: 4.2 },
        { id: 'c2', restaurantId: 'r7', name: 'Veg Fried Rice', description: 'Wok-tossed rice with veggies and egg', price: 159, image: 'https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=300&q=80', category: 'Noodles & Rice', isVeg: true, rating: 4.1 },
      ]},
      { name: 'Momos', items: [
        { id: 'c3', restaurantId: 'r7', name: 'Chicken Momos (8 pcs)', description: 'Steamed chicken dumplings with red chilli sauce', price: 169, image: 'https://images.unsplash.com/photo-1496116218417-1a781b1c416c?w=300&q=80', category: 'Momos', isVeg: false, isBestseller: true, rating: 4.5 },
        { id: 'c4', restaurantId: 'r7', name: 'Veg Momos (8 pcs)', description: 'Steamed vegetable dumplings', price: 139, image: 'https://images.unsplash.com/photo-1569050467447-ce54b3bbc37d?w=300&q=80', category: 'Momos', isVeg: true, rating: 4.3 },
      ]}
    ],
    'r8': [
      { name: 'Cakes', items: [
        { id: 'k1', restaurantId: 'r8', name: 'Chocolate Truffle Cake', description: 'Rich chocolate ganache layered cake (500g)', price: 599, image: 'https://images.unsplash.com/photo-1551024601-bec78aea704b?w=300&q=80', category: 'Cakes', isVeg: true, isBestseller: true, rating: 4.8 },
        { id: 'k2', restaurantId: 'r8', name: 'Red Velvet Cake', description: 'Moist red velvet with cream cheese frosting (500g)', price: 649, image: 'https://images.unsplash.com/photo-1586985289688-ca3cf47d3e6e?w=300&q=80', category: 'Cakes', isVeg: true, rating: 4.7 },
      ]},
      { name: 'Pastries', items: [
        { id: 'k3', restaurantId: 'r8', name: 'Blueberry Cheesecake', description: 'New York style cheesecake with blueberry compote', price: 299, image: 'https://images.unsplash.com/photo-1464349095431-e9a21285b5f3?w=300&q=80', category: 'Pastries', isVeg: true, rating: 4.6 },
        { id: 'k4', restaurantId: 'r8', name: 'Croissant (2 pcs)', description: 'Buttery flaky croissants, freshly baked', price: 149, image: 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=300&q=80', category: 'Pastries', isVeg: true, rating: 4.4 },
      ]}
    ],
  };

  getAll(): Restaurant[] { return this.restaurants; }

  getById(id: string): Restaurant | undefined {
    return this.restaurants.find(r => r.id === id);
  }

  search(query: string): Restaurant[] {
    const q = query.toLowerCase();
    return this.restaurants.filter(r =>
      r.name.toLowerCase().includes(q) ||
      r.cuisine.some(c => c.toLowerCase().includes(q)) ||
      r.tags.some(t => t.toLowerCase().includes(q))
    );
  }

  filter(options: { cuisine?: string; rating?: number; vegOnly?: boolean; sortBy?: string }): Restaurant[] {
    let list = [...this.restaurants];
    if (options.vegOnly) list = list.filter(r => r.isVeg);
    if (options.cuisine) list = list.filter(r => r.cuisine.some(c => c.toLowerCase().includes(options.cuisine!.toLowerCase())));
    if (options.rating) list = list.filter(r => r.rating >= options.rating!);
    if (options.sortBy === 'rating') list.sort((a, b) => b.rating - a.rating);
    else if (options.sortBy === 'delivery') list.sort((a, b) => a.deliveryTime - b.deliveryTime);
    else if (options.sortBy === 'price') list.sort((a, b) => a.priceForTwo - b.priceForTwo);
    return list;
  }

  getMenu(restaurantId: string): MenuCategory[] {
    return this.menuData[restaurantId] || [];
  }

  getFeatured(): Restaurant[] {
    return this.restaurants.filter(r => r.rating >= 4.4).slice(0, 4);
  }
}
