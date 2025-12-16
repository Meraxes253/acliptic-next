import { db } from "@/db"
import { subscriptions, customers, plans, users } from "@/db/schema/users"
import { eq, and } from "drizzle-orm"

// Get user's current subscription with proper joins
export async function getUserSubscription(userId: string) {
  const result = await db
  .select({
    subscription: {
      stripeSubscriptionId: subscriptions.stripeSubscriptionId,
      is_active: subscriptions.is_active,
      currentPeriodStart: subscriptions.currentPeriodStart,
      currentPeriodEnd: subscriptions.currentPeriodEnd,
    },
    plan: {
      id: plans.id,
      name: plans.name,
      amount: plans.amount,
      currency: plans.currency,
      interval: plans.interval,
    },
    usage: {
      total_seconds_processed: subscriptions.total_seconds_processed,
      max_total_seconds_processed: plans.max_total_seconds_processed,
      max_active_streams: plans.max_active_streams,
      max_streams: plans.max_streams,
    },
    users: {
      email: users.email,
      name: users.name,
    },
  })
  .from(subscriptions)
  .innerJoin(plans, eq(subscriptions.priceId, plans.id))
  .innerJoin(users, eq(subscriptions.userId, users.id))
  .where(and(eq(subscriptions.userId, userId), eq(subscriptions.is_active, true)))
    .limit(1)


  return result[0] || null
}

// Get customer by user ID
export async function getCustomerByUserId(userId: string) {
  const result = await db.select().from(users).where(eq(users.id, userId)).limit(1)

  return result[0] || null
}

// Get or create customer
export async function getOrCreateCustomer(userId: string, email: string, name?: string) {
  // First try to find existing customer
  const existingCustomer = await getCustomerByUserId(userId)

  if (existingCustomer) {
    return existingCustomer
  }

  // If no customer exists, return null - customer should be created via Stripe webhook
  return null
}

// Check if user has active subscription
export async function hasActiveSubscription(userId: string): Promise<boolean> {
  const subscription = await getUserSubscription(userId)
  return subscription !== null && subscription.subscription.status === "active"
}

// Get all available plans
export async function getAvailablePlans() {
  return await db.select().from(plans).where(eq(plans.active, true))
}

// Create free subscription for new user (no Stripe involvement)
export async function createFreeSubscription(userId: string) {
  try {
    // Get the FREE plan from database
    const freePlan = await db
      .select()
      .from(plans)
      .where(eq(plans.name, 'FREE'))
      .limit(1)

    if (!freePlan || freePlan.length === 0) {
      throw new Error('FREE plan not found in database. Please create it first.')
    }

    // Create subscription record for free tier
    const currentDate = new Date()
    const oneYearLater = new Date()
    oneYearLater.setFullYear(currentDate.getFullYear() + 1)

    const result = await db.insert(subscriptions).values({
      userId: userId,
      stripeSubscriptionId: `free_${userId}_${Date.now()}`, // Unique ID for free subscriptions
      stripeCustomerId: '', // No Stripe customer for free tier
      is_active: true,
      priceId: freePlan[0].id,
      currentPeriodStart: currentDate,
      currentPeriodEnd: oneYearLater,
      total_seconds_processed: 0,
    }).returning()

    console.log(`[Subscription] Created free subscription for user ${userId}`)
    return result[0]
  } catch (error) {
    console.error('Error creating free subscription:', error)
    throw error
  }
}

// Ensure user has a subscription (create free if none exists)
export async function ensureUserHasSubscription(userId: string) {
  const subscription = await getUserSubscription(userId)

  if (!subscription) {
    console.log(`[Subscription] User ${userId} has no subscription, creating free tier`)
    return await createFreeSubscription(userId)
  }

  return subscription
}

// Get FREE plan from database
export async function getFreePlan() {
  const result = await db
    .select()
    .from(plans)
    .where(eq(plans.name, 'FREE'))
    .limit(1)

  return result[0] || null
}
