import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    hasStripeSecret: !!process.env.STRIPE_SECRET_KEY,
    hasWebhookSecret: !!process.env.STRIPE_WEBHOOK_SECRET,
    hasPublishableKey: !!process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
    stripeSecretPrefix: process.env.STRIPE_SECRET_KEY?.substring(0, 10),
    webhookSecretPrefix: process.env.STRIPE_WEBHOOK_SECRET?.substring(0, 10),
  });
}
