import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-not-found',
  standalone: true,
  imports: [RouterLink, MatButtonModule, MatIconModule],
  template: `
    <div class="not-found-page">
      <div class="emoji">🍽️</div>
      <h1>404</h1>
      <h2>Page Not Found</h2>
      <p>Oops! Looks like this page got eaten.</p>
      <a routerLink="/home" mat-raised-button class="home-btn">
        <mat-icon>home</mat-icon> Back to Home
      </a>
    </div>
  `,
  styles: [`
    .not-found-page { min-height: 70vh; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 12px; text-align: center; padding: 40px; }
    .emoji { font-size: 80px; }
    h1 { font-size: 72px; font-weight: 700; color: #e23744; line-height: 1; }
    h2 { font-size: 24px; font-weight: 700; }
    p { color: #686b78; font-size: 16px; }
    .home-btn { background: #e23744 !important; color: white !important; border-radius: 8px !important; margin-top: 12px; display: flex; align-items: center; gap: 4px; }
  `]
})
export class NotFoundComponent {}
