import { useState } from "react";
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

// Initialize Stripe (Replace with your publishable key)
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || 'pk_test_...');

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

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!stripe || !elements) {
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
      // Create payment intent on your server
      const response = await fetch('http://localhost:3001/create-payment-intent', {
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
      setPaymentError('Failed to process payment. Please try again.');
      console.error('Payment error:', error);
    }

    setIsProcessing(false);
  };

  const cardElementOptions = {
    style: {
      base: {
        fontSize: '16px',
        color: '#424770',
        '::placeholder': {
          color: '#aab7c4',
        },
      },
    },
  };

  if (paymentSuccess) {
    return (
      <Card className="p-8 text-center">
        <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
        <h3 className="text-2xl font-bold mb-2">Payment Successful!</h3>
        <p className="text-muted-foreground mb-6">
          Your order has been confirmed. We'll send you shipping instructions and tracking information via email.
        </p>
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <p className="text-sm text-green-800">
            <strong>Order Total:</strong> £{amount.toFixed(2)}<br/>
            <strong>Service:</strong> {metadata.tier} ({metadata.cardCount} cards)<br/>
            <strong>Customer:</strong> {metadata.customerName}
          </p>
        </div>
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
        
        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <div className="flex justify-between items-center mb-2">
            <span className="font-medium">Order Summary</span>
            <span className="text-xl font-bold">£{amount.toFixed(2)}</span>
          </div>
          <div className="text-sm text-muted-foreground">
            {metadata.tier} grading • {metadata.cardCount} cards
            {metadata.diamondSleeve && " • Diamond Sleeve"}
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium mb-3">
            Card Information
          </label>
          <div className="border border-gray-300 rounded-md p-3 bg-white">
            <CardElement options={cardElementOptions} />
          </div>
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
  return (
    <Elements stripe={stripePromise}>
      <PaymentForm {...props} />
    </Elements>
  );
};

export default StripePaymentWrapper;