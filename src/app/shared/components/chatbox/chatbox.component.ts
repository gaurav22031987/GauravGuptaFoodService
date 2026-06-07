import { Component, inject, ViewChild, ElementRef, AfterViewChecked, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { RestaurantService } from '../../../core/services/restaurant.service';
import { CartService } from '../../../core/services/cart.service';

interface ChatMessage {
  from: 'user' | 'bot';
  text?: string;
  html?: string;
  time: Date;
  chips?: string[];
  items?: ItemCard[];
  restaurants?: RestaurantCard[];
  isTyping?: boolean;
}

interface ItemCard {
  id: string; name: string; price: number; veg: boolean; restaurantId: string; restaurantName: string;
}

interface RestaurantCard {
  id: string; name: string; cuisine: string; rating: number; time: number;
}

@Component({
  selector: 'app-chatbox',
  standalone: true,
  imports: [CommonModule, FormsModule, MatIconModule, MatButtonModule, MatSnackBarModule],
  template: `
    <!-- Floating Button -->
    <button class="chat-fab" (click)="toggleChat()" [class.open]="isOpen">
      <mat-icon>{{ isOpen ? 'close' : 'chat' }}</mat-icon>
      @if (!isOpen && unread > 0) {
        <span class="fab-badge">{{ unread }}</span>
      }
    </button>

    <!-- Chat Panel -->
    @if (isOpen) {
      <div class="chat-panel">
        <!-- Header -->
        <div class="chat-header">
          <div class="chat-header-info">
            <div class="bot-avatar">👑</div>
            <div>
              <div class="bot-name">Kitchen King Bot</div>
              <div class="bot-status"><span class="dot"></span> Online</div>
            </div>
          </div>
          <div class="header-actions">
            <button class="icon-btn" (click)="clearChat()" title="Clear chat">
              <mat-icon>refresh</mat-icon>
            </button>
            <button class="icon-btn" (click)="toggleChat()">
              <mat-icon>close</mat-icon>
            </button>
          </div>
        </div>

        <!-- Messages -->
        <div class="chat-messages" #scrollContainer>
          @for (msg of messages; track $index) {
            <div class="msg-row" [class.user-row]="msg.from === 'user'">
              @if (msg.from === 'bot') {
                <div class="bot-icon">👑</div>
              }
              <div class="msg-bubble" [class.user-bubble]="msg.from === 'user'" [class.bot-bubble]="msg.from === 'bot'">
                @if (msg.isTyping) {
                  <div class="typing-dots"><span></span><span></span><span></span></div>
                } @else {
                  @if (msg.text) {
                    <span [innerHTML]="msg.text"></span>
                  }
                  <!-- Restaurant cards -->
                  @if (msg.restaurants?.length) {
                    <div class="card-list">
                      @for (r of msg.restaurants; track r.id) {
                        <div class="mini-card" (click)="handleRestaurantClick(r)">
                          <div class="mini-card-name">{{ r.name }}</div>
                          <div class="mini-card-meta">{{ r.cuisine }} • ⭐ {{ r.rating }} • 🕐 {{ r.time }} min</div>
                          <div class="mini-card-action">View Menu →</div>
                        </div>
                      }
                    </div>
                  }
                  <!-- Item cards -->
                  @if (msg.items?.length) {
                    <div class="card-list">
                      @for (item of msg.items; track item.id) {
                        <div class="item-card">
                          <div class="item-card-left">
                            <span class="veg-dot" [class.nonveg]="!item.veg">●</span>
                            <div>
                              <div class="item-name">{{ item.name }}</div>
                              <div class="item-from">{{ item.restaurantName }}</div>
                            </div>
                          </div>
                          <div class="item-card-right">
                            <div class="item-price">₹{{ item.price }}</div>
                            <button class="add-btn" (click)="addToCartFromChat(item)">+ Add</button>
                          </div>
                        </div>
                      }
                    </div>
                  }
                  <!-- Quick reply chips -->
                  @if (msg.chips?.length) {
                    <div class="chips-row">
                      @for (chip of msg.chips; track chip) {
                        <button class="chip" (click)="sendChip(chip)">{{ chip }}</button>
                      }
                    </div>
                  }
                }
              </div>
            </div>
          }
        </div>

        <!-- Input -->
        <div class="chat-input-row">
          <input class="chat-input" [(ngModel)]="userInput" placeholder="Type a message..."
            (keydown.enter)="sendMessage()" maxlength="200" />
          <button class="send-btn" (click)="sendMessage()" [disabled]="!userInput.trim()">
            <mat-icon>send</mat-icon>
          </button>
        </div>
      </div>
    }
  `,
  styles: [`
    /* FAB */
    .chat-fab { position: fixed; bottom: 28px; right: 28px; z-index: 1000; width: 56px; height: 56px; border-radius: 50%; background: #e23744; color: white; border: none; cursor: pointer; box-shadow: 0 4px 16px rgba(226,55,68,0.4); display: flex; align-items: center; justify-content: center; transition: all 0.3s; }
    .chat-fab:hover { transform: scale(1.08); box-shadow: 0 6px 24px rgba(226,55,68,0.5); }
    .chat-fab.open { background: #c0392b; }
    .fab-badge { position: absolute; top: -4px; right: -4px; background: #ff9800; color: white; font-size: 11px; font-weight: 700; width: 20px; height: 20px; border-radius: 50%; display: flex; align-items: center; justify-content: center; }

    /* Panel */
    .chat-panel { position: fixed; bottom: 96px; right: 28px; z-index: 999; width: 370px; height: 560px; background: white; border-radius: 20px; box-shadow: 0 8px 40px rgba(0,0,0,0.18); display: flex; flex-direction: column; overflow: hidden; animation: slideUp 0.25s ease; }
    @keyframes slideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }

    /* Header */
    .chat-header { background: linear-gradient(135deg, #e23744, #c0392b); color: white; padding: 14px 16px; display: flex; align-items: center; justify-content: space-between; flex-shrink: 0; }
    .chat-header-info { display: flex; align-items: center; gap: 10px; }
    .bot-avatar { width: 38px; height: 38px; background: rgba(255,255,255,0.2); border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 20px; }
    .bot-name { font-size: 15px; font-weight: 700; }
    .bot-status { font-size: 11px; opacity: 0.9; display: flex; align-items: center; gap: 4px; }
    .dot { width: 7px; height: 7px; background: #4caf50; border-radius: 50%; display: inline-block; }
    .header-actions { display: flex; gap: 4px; }
    .icon-btn { background: none; border: none; color: white; cursor: pointer; padding: 4px; border-radius: 50%; display: flex; align-items: center; justify-content: center; opacity: 0.8; transition: opacity 0.2s; }
    .icon-btn:hover { opacity: 1; background: rgba(255,255,255,0.15); }

    /* Messages */
    .chat-messages { flex: 1; overflow-y: auto; padding: 14px 12px; display: flex; flex-direction: column; gap: 10px; background: #f7f7f8; }
    .msg-row { display: flex; align-items: flex-start; gap: 8px; }
    .user-row { flex-direction: row-reverse; }
    .bot-icon { width: 28px; height: 28px; background: #fff0f0; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 14px; flex-shrink: 0; margin-top: 2px; }
    .msg-bubble { max-width: 82%; padding: 10px 13px; border-radius: 16px; font-size: 13.5px; line-height: 1.5; }
    .bot-bubble { background: white; color: #3d4152; border-radius: 4px 16px 16px 16px; box-shadow: 0 1px 4px rgba(0,0,0,0.07); }
    .user-bubble { background: #e23744; color: white; border-radius: 16px 4px 16px 16px; }

    /* Typing */
    .typing-dots { display: flex; gap: 4px; align-items: center; padding: 4px 0; }
    .typing-dots span { width: 7px; height: 7px; background: #bbb; border-radius: 50%; animation: bounce 1.2s infinite; }
    .typing-dots span:nth-child(2) { animation-delay: 0.2s; }
    .typing-dots span:nth-child(3) { animation-delay: 0.4s; }
    @keyframes bounce { 0%,60%,100% { transform: translateY(0); } 30% { transform: translateY(-6px); } }

    /* Cards */
    .card-list { display: flex; flex-direction: column; gap: 8px; margin-top: 8px; }
    .mini-card { background: #fff8f8; border: 1px solid #fde0e2; border-radius: 10px; padding: 10px 12px; cursor: pointer; transition: all 0.2s; }
    .mini-card:hover { border-color: #e23744; background: #fff0f1; }
    .mini-card-name { font-weight: 700; font-size: 13px; color: #3d4152; }
    .mini-card-meta { font-size: 11px; color: #686b78; margin-top: 2px; }
    .mini-card-action { font-size: 11px; color: #e23744; font-weight: 600; margin-top: 4px; }
    .item-card { display: flex; align-items: center; justify-content: space-between; background: #fafafa; border: 1px solid #eee; border-radius: 10px; padding: 8px 10px; gap: 8px; }
    .item-card-left { display: flex; align-items: center; gap: 8px; flex: 1; min-width: 0; }
    .veg-dot { color: #2e7d32; font-size: 14px; flex-shrink: 0; }
    .veg-dot.nonveg { color: #c62828; }
    .item-name { font-size: 12px; font-weight: 600; color: #3d4152; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .item-from { font-size: 10px; color: #9e9e9e; }
    .item-card-right { display: flex; flex-direction: column; align-items: flex-end; gap: 4px; flex-shrink: 0; }
    .item-price { font-size: 12px; font-weight: 700; color: #3d4152; }
    .add-btn { background: #e23744; color: white; border: none; border-radius: 6px; padding: 4px 10px; font-size: 11px; font-weight: 700; cursor: pointer; transition: background 0.2s; }
    .add-btn:hover { background: #c0392b; }

    /* Chips */
    .chips-row { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 8px; }
    .chip { background: #fff0f1; border: 1px solid #fcd4d7; color: #e23744; border-radius: 20px; padding: 4px 12px; font-size: 12px; font-weight: 600; cursor: pointer; transition: all 0.2s; white-space: nowrap; }
    .chip:hover { background: #e23744; color: white; border-color: #e23744; }

    /* Input */
    .chat-input-row { display: flex; align-items: center; gap: 8px; padding: 10px 12px; background: white; border-top: 1px solid #f0f0f0; flex-shrink: 0; }
    .chat-input { flex: 1; border: 1.5px solid #e0e0e0; border-radius: 24px; padding: 9px 16px; font-size: 13px; outline: none; transition: border-color 0.2s; font-family: inherit; }
    .chat-input:focus { border-color: #e23744; }
    .send-btn { background: #e23744; color: white; border: none; border-radius: 50%; width: 38px; height: 38px; display: flex; align-items: center; justify-content: center; cursor: pointer; transition: background 0.2s; flex-shrink: 0; }
    .send-btn:hover:not(:disabled) { background: #c0392b; }
    .send-btn:disabled { background: #ccc; cursor: default; }

    @media(max-width: 480px) { .chat-panel { width: calc(100vw - 24px); right: 12px; bottom: 80px; height: 70vh; } .chat-fab { bottom: 16px; right: 16px; } }
  `]
})
export class ChatboxComponent implements OnInit, AfterViewChecked {
  @ViewChild('scrollContainer') private scrollContainer!: ElementRef<HTMLDivElement>;

  private restaurantService = inject(RestaurantService);
  private cartService = inject(CartService);
  private router = inject(Router);
  private snackBar = inject(MatSnackBar);

  isOpen = false;
  unread = 1;
  userInput = '';
  messages: ChatMessage[] = [];
  private shouldScroll = false;

  private allItems = this.buildAllItems();
  private allRestaurants = this.restaurantService.getAll();

  ngOnInit() {
    this.pushBot(
      '👋 Hi! I\'m your <strong>Kitchen King Food</strong> assistant!<br>I can help you search restaurants, browse menus, add items to cart, and place orders.',
      ['🍔 Burgers', '🍕 Pizza', '🍜 Biryani', '🍣 Sushi', '🥗 Healthy', 'All Restaurants']
    );
  }

  ngAfterViewChecked() {
    if (this.shouldScroll) {
      this.scrollToBottom();
      this.shouldScroll = false;
    }
  }

  toggleChat() {
    this.isOpen = !this.isOpen;
    if (this.isOpen) { this.unread = 0; this.shouldScroll = true; }
  }

  clearChat() {
    this.messages = [];
    this.ngOnInit();
  }

  sendChip(chip: string) {
    this.userInput = chip;
    this.sendMessage();
  }

  sendMessage() {
    const text = this.userInput.trim();
    if (!text) return;
    this.pushUser(text);
    this.userInput = '';
    this.handleIntent(text.toLowerCase());
  }

  private handleIntent(input: string) {
    this.showTyping().then(() => {

      // Greetings
      if (/^(hi|hello|hey|hii|helo|namaste|good\s*(morning|evening|afternoon))/.test(input)) {
        this.pushBot('👋 Hello! What would you like to order today?',
          ['🍔 Burgers', '🍕 Pizza', '🍜 Biryani', '🍣 Sushi', 'All Restaurants', '🛒 My Cart']);
        return;
      }

      // Help
      if (/help|what can you|commands/.test(input)) {
        this.pushBot(`I can help you with:<br>
          🔍 <strong>Search</strong> – "show pizza restaurants"<br>
          🍽️ <strong>Menu</strong> – "menu of Burger King"<br>
          ➕ <strong>Order</strong> – "add Whopper to cart"<br>
          🛒 <strong>Cart</strong> – "show my cart"<br>
          💳 <strong>Checkout</strong> – "checkout" or "place order"<br>
          📍 <strong>Track</strong> – "track my order"`,
          ['🍔 Burgers', '🍕 Pizza', '🛒 My Cart', 'Checkout']);
        return;
      }

      // Cart view
      if (/cart|my order|what.*(in|did) i (order|add)|basket/.test(input)) {
        this.showCart(); return;
      }

      // Checkout / place order
      if (/checkout|place order|pay|payment|buy|confirm order/.test(input)) {
        const cart = this.cartService.cartSubject.value;
        if (!cart.items.length) {
          this.pushBot('🛒 Your cart is empty! Add some items first.', ['🍔 Burgers', '🍕 Pizza', '🍜 Biryani']);
        } else {
          this.pushBot('💳 Taking you to checkout...<br>You can pay via <strong>Card, UPI, Net Banking</strong>.');
          setTimeout(() => this.router.navigate(['/checkout']), 1200);
        }
        return;
      }

      // Track order
      if (/track|order status|where.*order|delivery status/.test(input)) {
        this.pushBot('📍 Redirecting to order tracking...');
        setTimeout(() => this.router.navigate(['/restaurants']), 1000);
        return;
      }

      // Clear / remove cart
      if (/clear cart|empty cart|remove all|cancel order/.test(input)) {
        this.cartService.clearCart();
        this.pushBot('🗑️ Cart cleared! Ready for a fresh order.', ['🍔 Burgers', '🍕 Pizza', '🍜 Biryani']);
        return;
      }

      // All restaurants
      if (/all restaurant|show restaurant|list restaurant|browse|explore/.test(input)) {
        this.showRestaurants(this.allRestaurants); return;
      }

      // Veg only
      if (/veg(etarian)?(\s*only)?|pure veg/.test(input)) {
        const veg = this.allRestaurants.filter(r => r.isVeg);
        this.pushBot(`🥗 Found <strong>${veg.length} vegetarian</strong> restaurants:`);
        this.showRestaurants(veg); return;
      }

      // Add item to cart — "add X", "order X", "i want X"
      const addMatch = input.match(/(?:add|order|i want|get me|give me)\s+(.+)/);
      if (addMatch) {
        const query = addMatch[1].replace(/to cart|please|for me/gi, '').trim();
        const found = this.searchItems(query);
        if (found.length) {
          if (found.length === 1) {
            this.addToCartFromChat(found[0]);
          } else {
            this.pushBot(`Found <strong>${found.length} items</strong> matching "<strong>${query}</strong>":`,
              undefined, found.slice(0, 5));
          }
        } else {
          this.pushBot(`😕 Couldn't find "<strong>${query}</strong>". Try a different name.`,
            ['🍔 Burgers', '🍕 Pizza', '🍜 Biryani', '🍣 Sushi']);
        }
        return;
      }

      // Menu of restaurant — "menu of Pizza Palace" / "Pizza Palace menu"
      const menuMatch = input.match(/menu(?:\s+of\s+|\s+from\s+|\s+at\s+)(.+)|(.+)\s+menu/);
      if (menuMatch) {
        const rName = (menuMatch[1] || menuMatch[2]).trim();
        const restaurant = this.allRestaurants.find(r => r.name.toLowerCase().includes(rName));
        if (restaurant) {
          const items = this.buildAllItems().filter(i => i.restaurantId === restaurant.id);
          this.pushBot(`🍽️ <strong>${restaurant.name}</strong> menu:`, undefined, items.slice(0, 6));
        } else {
          this.pushBot(`Couldn't find a restaurant named "<strong>${rName}</strong>".`, ['All Restaurants']);
        }
        return;
      }

      // Cuisine / food search
      const cuisineMap: Record<string, string[]> = {
        'burger': ['r1'], 'pizza': ['r2'], 'italian': ['r2'],
        'biryani': ['r3'], 'indian': ['r3'], 'spicy': ['r3'],
        'healthy': ['r4'], 'vegan': ['r4'], 'salad': ['r4'],
        'sushi': ['r5'], 'japanese': ['r5'],
        'dosa': ['r6'], 'south indian': ['r6'], 'idli': ['r6'],
        'chinese': ['r7'], 'noodles': ['r7'], 'momos': ['r7'],
        'cake': ['r8'], 'dessert': ['r8'], 'bakery': ['r8'], 'sweet': ['r8'],
      };
      for (const [keyword, ids] of Object.entries(cuisineMap)) {
        if (input.includes(keyword)) {
          const matched = this.allRestaurants.filter(r => ids.includes(r.id));
          const items = this.allItems.filter(i => ids.includes(i.restaurantId));
          this.pushBot(`🔍 Results for <strong>"${keyword}"</strong>:`);
          if (matched.length) this.addRestaurantCards(matched);
          if (items.length) {
            setTimeout(() => {
              this.pushBot('Popular items:', undefined, items.slice(0, 4));
            }, 300);
          }
          return;
        }
      }

      // Price based
      if (/cheap|budget|affordable|under (\d+)/.test(input)) {
        const priceMatch = input.match(/under (\d+)/);
        const limit = priceMatch ? parseInt(priceMatch[1]) : 200;
        const items = this.allItems.filter(i => i.price <= limit).sort((a, b) => a.price - b.price);
        if (items.length) {
          this.pushBot(`💰 Items under <strong>₹${limit}</strong>:`, undefined, items.slice(0, 5));
        } else {
          this.pushBot(`No items found under ₹${limit}. Try a higher budget.`);
        }
        return;
      }

      // Bestseller / popular / recommended
      if (/bestseller|popular|recommended|best|top|trending/.test(input)) {
        const items = this.allItems.filter(i => (i as any).bestseller).slice(0, 5);
        this.pushBot('⭐ Our <strong>bestsellers</strong>:', undefined, items.length ? items : this.allItems.slice(0, 5));
        return;
      }

      // Generic search — try matching restaurant name or item name
      const rMatch = this.allRestaurants.filter(r => r.name.toLowerCase().includes(input) || r.cuisine.some(c => c.toLowerCase().includes(input)));
      if (rMatch.length) { this.showRestaurants(rMatch); return; }

      const iMatch = this.searchItems(input);
      if (iMatch.length) {
        this.pushBot(`Found <strong>${iMatch.length} items</strong> matching "<strong>${input}</strong>":`,
          undefined, iMatch.slice(0, 5));
        return;
      }

      // Fallback
      this.pushBot(`🤔 I didn't quite get that. Try asking me:<br>
        • "Show pizza restaurants"<br>
        • "Add Masala Dosa to cart"<br>
        • "Show my cart"<br>
        • "Checkout"`,
        ['🍔 Burgers', '🍕 Pizza', '🍜 Biryani', 'All Restaurants', '🛒 My Cart']);
    });
  }

  private showCart() {
    const cart = this.cartService.cartSubject.value;
    if (!cart.items.length) {
      this.pushBot('🛒 Your cart is empty. Let me help you order!', ['🍔 Burgers', '🍕 Pizza', '🍜 Biryani']);
      return;
    }
    const sub = this.cartService.getSubtotal();
    const delivery = sub > 500 ? 0 : 30;
    const tax = Math.round(sub * 0.05);
    const total = sub + delivery + tax;
    let html = '🛒 <strong>Your Cart:</strong><br>';
    cart.items.forEach(ci => {
      html += `• ${ci.item.name} × ${ci.quantity} — <strong>₹${ci.item.price * ci.quantity}</strong><br>`;
    });
    html += `<br>Subtotal: ₹${sub} | Delivery: ${delivery === 0 ? 'FREE' : '₹' + delivery} | Tax: ₹${tax}<br><strong>Total: ₹${total}</strong>`;
    this.pushBot(html, ['➕ Add More', 'Checkout', '🗑️ Clear Cart']);
  }

  private showRestaurants(list: typeof this.allRestaurants) {
    if (!list.length) { this.pushBot('No restaurants found.', ['All Restaurants']); return; }
    this.pushBot(`Found <strong>${list.length}</strong> restaurant${list.length > 1 ? 's' : ''}:`, undefined, undefined,
      list.slice(0, 5).map(r => ({ id: r.id, name: r.name, cuisine: r.cuisine.join(', '), rating: r.rating, time: r.deliveryTime })));
  }

  private addRestaurantCards(list: typeof this.allRestaurants) {
    const last = this.messages[this.messages.length - 1];
    if (last && last.from === 'bot') {
      last.restaurants = list.slice(0, 4).map(r => ({ id: r.id, name: r.name, cuisine: r.cuisine.join(', '), rating: r.rating, time: r.deliveryTime }));
    }
  }

  handleRestaurantClick(r: RestaurantCard) {
    this.pushUser(`Show menu of ${r.name}`);
    this.showTyping().then(() => {
      const items = this.allItems.filter(i => i.restaurantId === r.id);
      this.pushBot(`🍽️ <strong>${r.name}</strong> menu:`, undefined, items.slice(0, 6));
    });
  }

  addToCartFromChat(item: ItemCard) {
    const restaurant = this.restaurantService.getById(item.restaurantId);
    const menu = this.restaurantService.getMenu(item.restaurantId);
    let menuItem = null;
    for (const cat of menu) {
      menuItem = cat.items.find(i => i.id === item.id) || menuItem;
    }
    if (!menuItem || !restaurant) return;
    this.cartService.addItem(menuItem);
    this.snackBar.open(`✅ ${item.name} added to cart!`, '', { duration: 2000, panelClass: 'snack-success' });
    this.pushBot(`✅ <strong>${item.name}</strong> (₹${item.price}) added to your cart!`, ['🛒 My Cart', 'Checkout', '➕ Add More']);
  }

  private searchItems(query: string): ItemCard[] {
    return this.allItems.filter(i =>
      i.name.toLowerCase().includes(query) ||
      i.restaurantName.toLowerCase().includes(query)
    );
  }

  private buildAllItems(): (ItemCard & { bestseller?: boolean })[] {
    const items: (ItemCard & { bestseller?: boolean })[] = [];
    for (const r of this.restaurantService.getAll()) {
      for (const cat of this.restaurantService.getMenu(r.id)) {
        for (const item of cat.items) {
          items.push({ id: item.id, name: item.name, price: item.price, veg: item.isVeg, restaurantId: r.id, restaurantName: r.name, bestseller: item.isBestseller });
        }
      }
    }
    return items;
  }

  private pushUser(text: string) {
    this.messages.push({ from: 'user', text, time: new Date() });
    this.shouldScroll = true;
    if (!this.isOpen) this.unread++;
  }

  private pushBot(text: string, chips?: string[], items?: ItemCard[], restaurants?: RestaurantCard[]) {
    this.messages.push({ from: 'bot', text, chips, items, restaurants, time: new Date() });
    this.shouldScroll = true;
    if (!this.isOpen) this.unread++;
  }

  private showTyping(): Promise<void> {
    const typing: ChatMessage = { from: 'bot', isTyping: true, time: new Date() };
    this.messages.push(typing);
    this.shouldScroll = true;
    return new Promise(resolve => setTimeout(() => {
      const idx = this.messages.indexOf(typing);
      if (idx !== -1) this.messages.splice(idx, 1);
      resolve();
    }, 800));
  }

  private scrollToBottom() {
    try { this.scrollContainer.nativeElement.scrollTop = this.scrollContainer.nativeElement.scrollHeight; } catch {}
  }
}
