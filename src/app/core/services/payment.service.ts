import { Injectable } from '@angular/core';
import { loadStripe, Stripe, StripeElements, StripePaymentElement } from '@stripe/stripe-js';

// Replace with your actual Stripe publishable key
const STRIPE_PK = 'pk_test_51234567890abcdefghijklmnopqrstuvwxyz';

@Injectable({ providedIn: 'root' })
export class PaymentService {
  private stripe: Stripe | null = null;
  private elements: StripeElements | null = null;
  private paymentElement: StripePaymentElement | null = null;

  async initStripe(): Promise<Stripe | null> {
    if (!this.stripe) {
      this.stripe = await loadStripe(STRIPE_PK);
    }
    return this.stripe;
  }

  async mountPaymentElement(amount: number, currency: string = 'inr'): Promise<{ elements: StripeElements | null; error?: string }> {
    try {
      const stripe = await this.initStripe();
      if (!stripe) return { elements: null, error: 'Stripe failed to load' };

      // In production, create PaymentIntent on the backend and use its client_secret
      // For demo purposes, we use a fake client_secret structure
      const clientSecret = `pi_demo_${Date.now()}_secret_demo`;

      this.elements = stripe.elements({
        clientSecret,
        appearance: {
          theme: 'stripe',
          variables: {
            colorPrimary: '#e23744',
            colorBackground: '#ffffff',
            colorText: '#3d4152',
            borderRadius: '8px',
            fontFamily: 'Poppins, sans-serif',
          }
        }
      });

      return { elements: this.elements };
    } catch (err) {
      return { elements: null, error: 'Failed to initialize payment' };
    }
  }

  async confirmPayment(elements: StripeElements, returnUrl: string): Promise<{ success: boolean; paymentId?: string; error?: string }> {
    if (!this.stripe) return { success: false, error: 'Stripe not initialized' };

    try {
      // In a real app, confirmPayment would submit to Stripe
      // For demo, we simulate a successful payment
      await new Promise(resolve => setTimeout(resolve, 2000));
      return { success: true, paymentId: 'pi_demo_' + Date.now() };
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Payment failed';
      return { success: false, error: message };
    }
  }

  getStripe(): Stripe | null { return this.stripe; }
}
