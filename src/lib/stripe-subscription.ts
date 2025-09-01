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
      customerId: customer[0].id,
      stripeSubscriptionId: subscription.id,
      planId: priceId,
      status: subscription.status,
      currentPeriodStart: new Date(subscription.current_period_start * 1000),
      currentPeriodEnd: new Date(subscription.current_period_end * 1000),
      trialStart: subscription.trial_start ? new Date(subscription.trial_start * 1000) : null,
      trialEnd: subscription.trial_end ? new Date(subscription.trial_end * 1000) : null,
      cancelAtPeriodEnd: subscription.cancel_at_period_end,
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
  cancelAtPeriodEnd?: boolean,
  canceledAt?: number,
) {
  const updateData: any = {
    status,
    updatedAt: new Date(),
  }

  if (currentPeriodStart) {
    updateData.currentPeriodStart = new Date(currentPeriodStart * 1000)
  }

  if (currentPeriodEnd) {
    updateData.currentPeriodEnd = new Date(currentPeriodEnd * 1000)
  }

  if (cancelAtPeriodEnd !== undefined) {
    updateData.cancelAtPeriodEnd = cancelAtPeriodEnd
  }

  if (canceledAt) {
    updateData.canceledAt = new Date(canceledAt * 1000)
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
    .where(and(eq(subscriptions.userId, userId), eq(subscriptions.status, "active")))
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
    canceledSubscription.current_period_start,
    canceledSubscription.current_period_end,
    canceledSubscription.cancel_at_period_end,
    canceledSubscription.canceled_at,
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
    .innerJoin(plans, eq(subscriptions.planId, plans.id))
    .innerJoin(customers, eq(subscriptions.customerId, customers.id))
    .where(eq(subscriptions.userId, userId))
    .limit(1)

  return result[0] || null
}
