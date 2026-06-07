import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [RouterLink, MatIconModule],
  template: `
    <footer class="footer">
      <div class="container footer-inner">
        <div class="footer-brand">
          <span class="brand-icon">🍔</span>
          <span class="brand-text">FoodRush</span>
          <p>Delivering happiness to your doorstep</p>
        </div>
        <div class="footer-links">
          <h4>Quick Links</h4>
          <a routerLink="/home">Home</a>
          <a routerLink="/restaurants">Restaurants</a>
          <a routerLink="/login">Login</a>
          <a routerLink="/register">Sign Up</a>
        </div>
        <div class="footer-contact">
          <h4>Contact</h4>
          <p><mat-icon>email</mat-icon> Gaurav22031987&#64;gmail.com</p>
          <p><mat-icon>phone</mat-icon> 9636556474</p>
        </div>
      </div>
      <div class="footer-bottom">
        <p>© 2024 FoodRush. All rights reserved. Built with Angular 18 + Stripe.</p>
      </div>
    </footer>
  `,
  styles: [`
    .footer { background: #1c1c1c; color: #ccc; margin-top: 60px; }
    .footer-inner { display: grid; grid-template-columns: 2fr 1fr 1fr; gap: 40px; padding: 48px 20px 32px; }
    .footer-brand .brand-icon { font-size: 26px; }
    .footer-brand .brand-text { font-size: 20px; font-weight: 700; color: #e23744; margin-left: 8px; }
    .footer-brand p { margin-top: 8px; font-size: 13px; color: #888; line-height: 1.5; }
    .footer-links, .footer-contact { display: flex; flex-direction: column; gap: 10px; }
    .footer-links h4, .footer-contact h4 { color: #fff; font-size: 14px; margin-bottom: 4px; }
    .footer-links a { color: #aaa; font-size: 13px; text-decoration: none; transition: color 0.2s; }
    .footer-links a:hover { color: #e23744; }
    .footer-contact p { display: flex; align-items: center; gap: 6px; font-size: 13px; color: #aaa; }
    .footer-contact mat-icon { font-size: 16px; height: 16px; width: 16px; }
    .footer-bottom { border-top: 1px solid #333; text-align: center; padding: 16px 20px; font-size: 12px; color: #666; line-height: 1.6; }

    @media(max-width: 768px) {
      .footer-inner { grid-template-columns: 1fr; gap: 28px; padding: 36px 20px 24px; }
      .footer-brand .brand-text { font-size: 18px; }
    }
    @media(max-width: 480px) {
      .footer-inner { padding: 28px 16px 20px; }
      .footer-bottom { font-size: 11px; }
    }
  `]
})
export class FooterComponent {}
