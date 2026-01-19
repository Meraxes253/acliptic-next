import { stripe } from "./stripe"
import { db } from "@/db"; // Adjust this import to your Drizzle client setup
import { subscriptions, customers, plans }  from "@/db/schema/users"; 
import { eq, and } from "drizzle-orm"

// Create subscription in Stripe and database
export async function createSubscription(userId: string, priceId: string, paymentMethodId?: string) {
  // Get customer
  const customer = await db.select().from(customers).where(eq(customers.userId, userId)).limit(1)

  if (!customer[0]) {
    throw new Error("Customer not found")
  }

  // Create subscription in Stripe
  const subscription = await stripe.subscriptions.create({
    customer: customer[0].stripeCustomerId,
    items: [{ price: priceId }],
    payment_behavior: "default_incomplete",
    payment_settings: { save_default_payment_method: "on_subscription" },
    expand: ["latest_invoice.payment_intent"],
    ...(paymentMethodId && { default_payment_method: paymentMethodId }),
  })

  // Save subscription to database
  const [newSubscription] = await db
    .insert(subscriptions)
    .values({
      userId: userId,
      stripeCustomerId: customer[0].stripeCustomerId,
      stripeSubscriptionId: subscription.id,
      priceId: priceId,
      is_active: subscription.status === 'active' || subscription.status === 'trialing',
      currentPeriodStart: new Date((subscription as any).current_period_start * 1000),
      currentPeriodEnd: new Date((subscription as any).current_period_end * 1000),
    })
    .returning()

  return { subscription, dbSubscription: newSubscription }
}

// Update subscription status from webhook
export async function updateSubscriptionStatus(
  stripeSubscriptionId: string,
  status: string,
  currentPeriodStart?: number,
  currentPeriodEnd?: number,
) {
  const updateData: any = {
    is_active: status === 'active' || status === 'trialing',
    updatedAt: new Date(),
  }

  if (currentPeriodStart) {
    updateData.currentPeriodStart = new Date(currentPeriodStart * 1000)
  }

  if (currentPeriodEnd) {
    updateData.currentPeriodEnd = new Date(currentPeriodEnd * 1000)
  }

  const [updatedSubscription] = await db
    .update(subscriptions)
    .set(updateData)
    .where(eq(subscriptions.stripeSubscriptionId, stripeSubscriptionId))
    .returning()

  return updatedSubscription
}

// Cancel subscription
export async function cancelSubscription(userId: string, immediately = false) {
  const userSubscription = await db
    .select()
    .from(subscriptions)
    .where(and(eq(subscriptions.userId, userId), eq(subscriptions.is_active, true)))
    .limit(1)

  if (!userSubscription[0]) {
    throw new Error("No active subscription found")
  }

  // Cancel in Stripe
  const canceledSubscription = immediately
    ? await stripe.subscriptions.cancel(userSubscription[0].stripeSubscriptionId)
    : await stripe.subscriptions.update(userSubscription[0].stripeSubscriptionId, {
        cancel_at_period_end: true,
      })

  // Update in database
  await updateSubscriptionStatus(
    userSubscription[0].stripeSubscriptionId,
    canceledSubscription.status,
    (canceledSubscription as any).current_period_start,
    (canceledSubscription as any).current_period_end,
  )

  return canceledSubscription
}

// Get subscription with plan details
export async function getSubscriptionWithPlan(userId: string) {
  const result = await db
    .select({
      subscription: subscriptions,
      plan: plans,
      customer: customers,
    })
    .from(subscriptions)
    .innerJoin(plans, eq(subscriptions.priceId, plans.id))
    .innerJoin(customers, eq(subscriptions.stripeCustomerId, customers.stripeCustomerId))
    .where(eq(subscriptions.userId, userId))
    .limit(1)

  return result[0] || null
}
