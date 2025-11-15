import React, { useState } from "react";
import { loadStripe } from "@stripe/stripe-js";
import {
  Elements,
  CardElement,
  useStripe,
  useElements
} from "@stripe/react-stripe-js";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, CreditCard, Shield, CheckCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

// Initialize Stripe with fallback for demo
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || '');

interface PaymentFormProps {
  amount: number;
  currency?: string;
  metadata: {
    tier: string;
    cardCount: number;
    customerName: string;
    customerEmail: string;
    diamondSleeve?: boolean;
  };
  onSuccess: (paymentIntentId: string) => void;
  onCancel: () => void;
}

const PaymentForm: React.FC<PaymentFormProps> = ({ 
  amount, 
  currency = 'gbp', 
  metadata, 
  onSuccess, 
  onCancel 
}) => {
  const stripe = useStripe();
  const elements = useElements();
  const { toast } = useToast();
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [stripeReady, setStripeReady] = useState(false);

  // Debug Stripe loading
  React.useEffect(() => {
    if (stripe && elements) {
      setStripeReady(true);
      console.log('Stripe loaded successfully');
    }
  }, [stripe, elements]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!stripe || !elements) {
      setPaymentError('Payment system not properly configured. Please contact support.');
      return;
    }

    // Check if Stripe key is configured
    if (!import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY) {
      setPaymentError('Payment system is currently unavailable. Please contact support.');
      return;
    }

    setIsProcessing(true);
    setPaymentError(null);

    const cardElement = elements.getElement(CardElement);

    if (!cardElement) {
      setPaymentError("Card element not found");
      setIsProcessing(false);
      return;
    }

    try {
      // Check if payment server is available
      const serverUrl = import.meta.env.VITE_PAYMENT_SERVER_URL || 'http://localhost:3001';
      
      // Create payment intent on your server
      const response = await fetch(`${serverUrl}/create-payment-intent`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount,
          currency,
          metadata
        }),
      });

      if (!response.ok) {
        throw new Error('Payment server unavailable');
      }

      const { clientSecret, paymentIntentId } = await response.json();

      // Confirm the payment with Stripe
      const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: cardElement,
          billing_details: {
            name: metadata.customerName,
            email: metadata.customerEmail,
          },
        },
      });

      if (error) {
        setPaymentError(error.message || 'An error occurred processing your payment');
      } else if (paymentIntent?.status === 'succeeded') {
        setPaymentSuccess(true);
        toast({
          title: "Payment Successful!",
          description: "Your card grading order has been confirmed. We'll send shipping instructions shortly.",
        });
        onSuccess(paymentIntentId);
      }
    } catch (error) {
      console.error('Payment error:', error);
      if (error instanceof Error && error.message.includes('server')) {
        setPaymentError('Payment processing is currently unavailable. Please contact support at support@nazgrading.com');
      } else {
        setPaymentError('Failed to process payment. Please try again or contact support.');
      }
    }

    setIsProcessing(false);
  };

  const cardElementOptions = {
    style: {
      base: {
        fontSize: '16px',
        color: '#ffffff',
        fontFamily: '"Inter", "system-ui", sans-serif',
        fontSmoothing: 'antialiased',
        '::placeholder': {
          color: '#9ca3af',
        },
        ':focus': {
          color: '#ffffff',
        },
        ':hover': {
          color: '#ffffff',
        },
      },
      invalid: {
        color: '#ef4444',
        iconColor: '#ef4444',
      },
      complete: {
        color: '#10b981',
        iconColor: '#10b981',
      },
    },
    hidePostalCode: false,
  };

  if (paymentSuccess) {
    return (
      <Card className="p-8 text-center">
        <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
        <h3 className="text-2xl font-bold mb-2">Payment Successful!</h3>
        <p className="text-muted-foreground mb-6">
          Your order has been confirmed. We'll send you shipping instructions and tracking information via email.
        </p>
        <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4">
          <p className="text-sm text-green-400">
            <strong>Order Total:</strong> £{amount.toFixed(2)}<br/>
            <strong>Service:</strong> {metadata.tier} ({metadata.cardCount} cards)<br/>
            <strong>Customer:</strong> {metadata.customerName}
          </p>
        </div>
      </Card>
    );
  }

  if (!stripe || !elements) {
    return (
      <Card className="p-8 text-center">
        <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-accent" />
        <p className="text-muted-foreground">Loading payment form...</p>
        <p className="text-xs text-muted-foreground mt-2">
          If this takes too long, please refresh the page
        </p>
      </Card>
    );
  }

  return (
    <Card className="p-8">
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-4">
          <CreditCard className="w-6 h-6 text-primary" />
          <h3 className="text-xl font-semibold">Secure Payment</h3>
          <Shield className="w-5 h-5 text-green-500" />
        </div>
        
        <div className="bg-muted/30 border border-border rounded-lg p-4 mb-6">
          <div className="flex justify-between items-center mb-2">
            <span className="font-medium text-foreground">Order Summary</span>
            <span className="text-xl font-bold text-accent">£{amount.toFixed(2)}</span>
          </div>
          <div className="text-sm text-muted-foreground">
            {metadata.tier} grading • {metadata.cardCount} cards
            {metadata.diamondSleeve && " • Diamond Sleeve"}
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium mb-3 text-foreground">
            Card Information
          </label>
          <div className="border border-border rounded-md p-4 bg-card hover:bg-muted/10 focus-within:ring-2 focus-within:ring-accent/20 focus-within:border-accent/50 transition-all duration-200 min-h-[44px] flex items-center">
            <div className="w-full">
              <CardElement options={cardElementOptions} />
            </div>
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            Enter your card number, expiry date, and CVC
          </p>
        </div>

        {paymentError && (
          <Alert variant="destructive">
            <AlertDescription>{paymentError}</AlertDescription>
          </Alert>
        )}

        <div className="flex gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            className="flex-1"
            disabled={isProcessing}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="premium"
            className="flex-1"
            disabled={!stripe || isProcessing}
          >
            {isProcessing ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Processing...
              </>
            ) : (
              `Pay £${amount.toFixed(2)}`
            )}
          </Button>
        </div>
      </form>

      <div className="mt-6 text-xs text-muted-foreground text-center">
        <p>🔒 Your payment information is encrypted and secure</p>
        <p>Powered by Stripe • PCI DSS Compliant</p>
      </div>
    </Card>
  );
};

interface StripePaymentWrapperProps extends PaymentFormProps {}

const StripePaymentWrapper: React.FC<StripePaymentWrapperProps> = (props) => {
  // If no Stripe key is configured, show a message instead of trying to load Stripe
  if (!import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY) {
    return (
      <Card className="p-8 text-center">
        <CreditCard className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-xl font-semibold mb-2">Payment System Setup Required</h3>
        <p className="text-muted-foreground mb-4">
          Payment processing is currently being configured. 
        </p>
        <p className="text-sm text-muted-foreground">
          Please contact us at <strong>support@nazgrading.com</strong> to complete your order.
        </p>
        <Button variant="outline" onClick={props.onCancel} className="mt-4">
          Back to Form
        </Button>
      </Card>
    );
  }

  return (
    <Elements stripe={stripePromise}>
      <PaymentForm {...props} />
    </Elements>
  );
};

export default StripePaymentWrapper;