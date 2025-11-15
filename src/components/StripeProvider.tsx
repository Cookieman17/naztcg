import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { ReactNode } from 'react';

// Get Stripe publishable key from environment variables or fallback to hardcoded for GitHub Pages
const stripePublishableKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || 'pk_test_51SIDIjRoG7xSUrCv18CpHZcxk96otfp9TFJSA85YeteNbWTGZoZ8va3vLkNXVLgEpqpj8gHLEvgWSALf9nQXlDGU00rMBWa8nE';
const stripePromise = loadStripe(stripePublishableKey);

interface StripeProviderProps {
  children: ReactNode;
}

const StripeProvider = ({ children }: StripeProviderProps) => {
  // Show info about Stripe key source
  if (import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY) {
    console.log('✅ STRIPE: Using environment variable key');
  } else {
    console.log('✅ STRIPE: Using hardcoded publishable key for GitHub Pages');
  }

  return (
    <Elements stripe={stripePromise}>
      {children}
    </Elements>
  );
};

export default StripeProvider;