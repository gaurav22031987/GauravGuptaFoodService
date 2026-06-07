import { Injectable, signal } from '@angular/core';
import { Router } from '@angular/router';
import { User } from '../models/user.model';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private currentUserSignal = signal<User | null>(this.loadUser());
  currentUser = this.currentUserSignal.asReadonly();

  constructor(private router: Router) {}

  private loadUser(): User | null {
    const raw = localStorage.getItem('zomato_user');
    return raw ? JSON.parse(raw) : null;
  }

  login(email: string, password: string): boolean {
    const users: (User & { password: string })[] = JSON.parse(localStorage.getItem('zomato_users') || '[]');
    const found = users.find(u => u.email === email && u.password === password);
    if (found) {
      const { password: _, ...user } = found;
      localStorage.setItem('zomato_user', JSON.stringify(user));
      this.currentUserSignal.set(user);
      return true;
    }
    // Demo login
    if (email === 'demo@foodrush.com' && password === 'demo123') {
      const demoUser: User = { id: 'demo-1', name: 'Demo User', email, phone: '9876543210' };
      localStorage.setItem('zomato_user', JSON.stringify(demoUser));
      this.currentUserSignal.set(demoUser);
      return true;
    }
    return false;
  }

  register(name: string, email: string, phone: string, password: string): boolean {
    const users: (User & { password: string })[] = JSON.parse(localStorage.getItem('zomato_users') || '[]');
    if (users.find(u => u.email === email)) return false;
    const newUser = { id: 'u-' + Date.now(), name, email, phone, password };
    users.push(newUser);
    localStorage.setItem('zomato_users', JSON.stringify(users));
    const { password: _, ...user } = newUser;
    localStorage.setItem('zomato_user', JSON.stringify(user));
    this.currentUserSignal.set(user);
    return true;
  }

  logout() {
    localStorage.removeItem('zomato_user');
    this.currentUserSignal.set(null);
    this.router.navigate(['/home']);
  }

  isLoggedIn(): boolean {
    return this.currentUserSignal() !== null;
  }
}
