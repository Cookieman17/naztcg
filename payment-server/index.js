require('dotenv').config();
const express = require('express');
const cors = require('cors');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'NAZ Payment Server is running' });
});

// Create payment intent for card grading service
app.post('/create-payment-intent', async (req, res) => {
  try {
    const { amount, currency = 'gbp', metadata } = req.body;

    // Create a PaymentIntent with the order amount and currency
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Stripe expects amount in pence
      currency,
      metadata: {
        service: 'card-grading',
        tier: metadata?.tier || 'standard',
        cardCount: metadata?.cardCount || '1',
        customerName: metadata?.customerName || '',
        customerEmail: metadata?.customerEmail || '',
        ...metadata
      },
      automatic_payment_methods: {
        enabled: true,
      },
    });

    res.json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id
    });
  } catch (error) {
    console.error('Error creating payment intent:', error);
    res.status(400).json({ error: error.message });
  }
});

// Webhook to handle successful payments
app.post('/webhook', express.raw({ type: 'application/json' }), (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.log(`Webhook signature verification failed.`, err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle the event
  switch (event.type) {
    case 'payment_intent.succeeded':
      const paymentIntent = event.data.object;
      console.log('Payment succeeded:', paymentIntent.id);
      // Here you would typically:
      // 1. Send confirmation email to customer
      // 2. Create order in your database
      // 3. Generate shipping labels
      // 4. Update inventory
      break;
    case 'payment_method.attached':
      console.log('Payment method attached');
      break;
    default:
      console.log(`Unhandled event type ${event.type}`);
  }

  res.json({ received: true });
});

app.listen(PORT, () => {
  console.log(`NAZ Payment Server running on port ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/health`);
});
