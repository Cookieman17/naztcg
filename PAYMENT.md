# NAZ TCG Payment Setup Guide

## Overview

NAZ TCG now includes a complete payment processing system using Stripe. This allows customers to pay for card grading services directly through the website.

## Setup Instructions

### 1. Stripe Account Setup

1. Create a Stripe account at [https://stripe.com](https://stripe.com)
2. Get your API keys from the Stripe Dashboard → Developers → API Keys
3. For testing, use the test keys (they start with `pk_test_` and `sk_test_`)

### 2. Frontend Configuration

1. Copy `.env.example` to `.env` in the main project directory:
   ```bash
   cp .env.example .env
   ```

2. Add your Stripe publishable key to `.env`:
   ```env
   VITE_STRIPE_PUBLISHABLE_KEY=pk_test_your_actual_key_here
   VITE_API_URL=http://localhost:3001
   ```

### 3. Backend Server Setup

1. Navigate to the payment server directory:
   ```bash
   cd payment-server
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```

4. Add your Stripe keys to `payment-server/.env`:
   ```env
   STRIPE_PUBLISHABLE_KEY=pk_test_your_actual_key_here
   STRIPE_SECRET_KEY=sk_test_your_actual_key_here
   STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret_here
   PORT=3001
   ```

### 4. Running the Payment System

1. Start the payment server:
   ```bash
   cd payment-server
   npm run dev
   ```

2. Start the main application (in a separate terminal):
   ```bash
   npm run dev
   ```

3. The payment server will run on http://localhost:3001
4. The main app will run on http://localhost:8080

### 5. Testing Payments

Use these test card numbers in Stripe's test mode:

- **Successful payment:** 4242 4242 4242 4242
- **Declined payment:** 4000 0000 0000 0002
- **Requires authentication:** 4000 0025 0000 3155

Use any future expiry date, any 3-digit CVC, and any postal code.

## Features

- ✅ **Secure Payment Processing**: PCI-compliant Stripe integration
- ✅ **Multiple Service Tiers**: Standard, Express, Super Express, Diamond
- ✅ **Add-on Services**: Diamond sleeves and premium options
- ✅ **Order Management**: Payment tracking and order confirmation
- ✅ **Customer Communication**: Automated email confirmations (when configured)

## Payment Flow

1. Customer selects grading tier and fills out submission form
2. Customer clicks "Proceed to Payment"
3. Stripe payment form appears with order summary
4. Customer enters payment details
5. Payment is processed securely through Stripe
6. Order confirmation is sent via email
7. Shipping instructions are provided

## Security

- All payment data is handled by Stripe (never touches your servers)
- PCI DSS compliant payment processing
- SSL encryption for all transactions
- Secure webhook verification

## Going Live

To accept real payments:

1. Complete Stripe account verification
2. Replace test keys with live keys (start with `pk_live_` and `sk_live_`)
3. Set up webhook endpoints in Stripe Dashboard
4. Configure domain and SSL certificates
5. Test thoroughly before launching

## Support

For payment-related issues:
- Check Stripe Dashboard for transaction details
- Review server logs for error messages
- Test with Stripe's test cards first
- Contact Stripe support for payment processing issues
