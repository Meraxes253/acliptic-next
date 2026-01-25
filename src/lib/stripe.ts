import Stripe from "stripe"



// Initialize Stripe with your secret key
const stripeSecretKey = process.env.STRIPE_SECRET_KEY;

if (!stripeSecretKey) {
  // console.error("STRIPE_SECRET_KEY environment variable is not set. Using test key for development.");
}

export const stripe = new Stripe(stripeSecretKey || "sk_test_default", {
  apiVersion: "2025-08-27.basil",
  typescript: true,
})

// Stripe configuration
export const STRIPE_CONFIG = {
  // Your Stripe publishable key for client-side
  publishableKey: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!,

  // Webhook endpoint secret for verifying webhooks
  webhookSecret: process.env.STRIPE_WEBHOOK_SECRET!,

  // Your domain for redirects
  domain: process.env.NODE_ENV === "production" ? process.env.NEXT_PUBLIC_DOMAIN! : "http://localhost:3000",
}

// Plan configurations matching your database
export const STRIPE_PLANS = {
  FREE: "free",
  BASIC: "basic_monthly", // Replace with your actual Stripe Price ID
  PRO: "pro_monthly", // Replace with your actual Stripe Price ID
} as const

// Helper to format currency
export function formatCurrency(amount: number, currency = "usd"): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency.toUpperCase(),
  }).format(amount / 100)
}

// Helper to get plan display name
export function getPlanDisplayName(planId: string): string {
  switch (planId) {
    case STRIPE_PLANS.FREE:
      return "Free Plan"
    case STRIPE_PLANS.BASIC:
      return "Basic Plan"
    case STRIPE_PLANS.PRO:
      return "Pro Plan"
    default:
      return "Unknown Plan"
  }
}
