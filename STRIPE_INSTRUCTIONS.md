# Stripe Integration Instructions

This document explains the setup required for the Stripe integration (User Subscriptions, Ad Subscriptions, and Order Payments with Connect accounts).

## 1. Stripe Account Setup
You will need a Stripe account with the following features enabled:
- **Stripe Connect**: Required for the laundry platform to transfer funds to Operators.
- **Stripe Checkout**: Used for creating payment links.
- **Webhooks**: Required to synchronize the database with Stripe events.

## 2. Environment Variables
Ensure the following keys are added to your `.env` file:
```env
STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
# Frontend Success/Cancel URLs
FRONTEND_URL=http://localhost:3000 
# For Premium Subscription (User)
STRIPE_PREMIUM_PRICE_ID=price_...
```

## 3. Product & Price IDs
You need to create products in your Stripe Dashboard for:
1. **Premium Subscription (User)**: Create a "Premium Subscription" product, set as Recurring (Monthly/Yearly) and copy the **Price ID** to `STRIPE_PREMIUM_PRICE_ID`.
2. **Ad Plans (Operator)**: For each `AdSubscriptionPlan` in your DB, you should create a corresponding Price in Stripe.

## 4. Stripe Connect (for Operators)
Operators must connect their Stripe accounts to receive payments.
- When an operator goes to their dashboard, they will click "Connect Stripe".
- The backend will call `createConnectAccount` and `generateAccountOnboardingLink`.
- The operator will be redirected to Stripe to fill in their details.
- Store the returned `stripeAccountId` in the `Operator` table.

## 5. Webhook Configuration
- Go to **Developers -> Webhooks** in Stripe Dashboard.
- Add an endpoint: `https://your-api-url.com/webhook`.
- Select the following events:
    - `checkout.session.completed` (Crucial for all payments)
    - `customer.subscription.updated`
    - `customer.subscription.deleted`
- Copy the **Signing Secret** to `STRIPE_WEBHOOK_SECRET`.

## 6. Business Logic Notes
- **Order Payments**: 
    - The platform takes a `platformFee`.
    - Remaining `operatorAmount` is sent to the operator's Connect account.
- **Wallets**: 
    - `AdminWallet` increments for every platform fee.
    - `OperatorWallet` increments for every order revenue.
    - Transactions are recorded in `AdminWalletTransaction` and `OperatorWalletTransaction`.
- **User Subscription**: Mark `isSubscribed: true` in the `User` table upon successful payment.
