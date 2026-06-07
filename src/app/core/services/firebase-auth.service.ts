import { Injectable, inject } from '@angular/core';
import { Router } from '@angular/router';
import { initializeApp, getApps } from 'firebase/app';
import {
  getAuth,
  signInWithPopup,
  GoogleAuthProvider,
  FacebookAuthProvider,
  signOut,
  UserCredential
} from 'firebase/auth';
import { environment } from '../../../environments/environment';
import { AuthService } from './auth.service';
import { User } from '../models/user.model';

const app = getApps().length ? getApps()[0] : initializeApp(environment.firebase);
const firebaseAuth = getAuth(app);

@Injectable({ providedIn: 'root' })
export class FirebaseAuthService {
  private authService = inject(AuthService);
  private router = inject(Router);

  async loginWithGoogle(): Promise<void> {
    const provider = new GoogleAuthProvider();
    provider.addScope('email');
    provider.addScope('profile');
    const result = await signInWithPopup(firebaseAuth, provider);
    this.handleSocialLogin(result);
  }

  async loginWithFacebook(): Promise<void> {
    const provider = new FacebookAuthProvider();
    provider.addScope('email');
    const result = await signInWithPopup(firebaseAuth, provider);
    this.handleSocialLogin(result);
  }

  private handleSocialLogin(result: UserCredential) {
    const fbUser = result.user;
    const user: User = {
      id: fbUser.uid,
      name: fbUser.displayName || 'User',
      email: fbUser.email || '',
      phone: fbUser.phoneNumber || ''
    };
    this.authService.loginWithSocial(user);
    this.router.navigate(['/home']);
  }

  async logout(): Promise<void> {
    await signOut(firebaseAuth);
  }
}
