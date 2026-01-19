import { type NextRequest, NextResponse } from "next/server"
import { stripe } from "@/lib/stripe"
import { auth } from "@/auth"
import { db } from "@/db"
import { subscriptions, plans } from "@/db/schema/users"
import { eq, and } from "drizzle-orm"
import type Stripe from "stripe"

export async function POST(req: NextRequest) {
  try {
    const session = await auth()
    const userId = session?.user?.id || ""

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { newPriceId } = await req.json()

    if (!newPriceId) {
      return NextResponse.json({ error: "New price ID is required" }, { status: 400 })
    }

    console.log(`[ChangePlan] User ${userId} requesting change to plan: ${newPriceId}`)

    // Get user's current active subscription
    const currentSubscription = await db
      .select()
      .from(subscriptions)
      .where(
        and(
          eq(subscriptions.userId, userId),
          eq(subscriptions.is_active, true)
        )
      )
      .limit(1)

    if (!currentSubscription[0]) {
      return NextResponse.json({ error: "No active subscription found" }, { status: 404 })
    }

    const subscription = currentSubscription[0]

    // Check if this is a free subscription (needs to go through checkout instead)
    if (subscription.stripeSubscriptionId.startsWith('free_')) {
      return NextResponse.json({
        error: "Cannot change plan from free tier. Please use checkout to subscribe.",
        code: "FREE_TIER_UPGRADE"
      }, { status: 400 })
    }

    // Get current plan and new plan details for comparison
    const [currentPlan, newPlan] = await Promise.all([
      db.select().from(plans).where(eq(plans.id, subscription.priceId)).limit(1),
      db.select().from(plans).where(eq(plans.id, newPriceId)).limit(1)
    ])

    if (!currentPlan[0]) {
      return NextResponse.json({ error: "Current plan not found" }, { status: 404 })
    }

    if (!newPlan[0]) {
      return NextResponse.json({ error: "New plan not found" }, { status: 404 })
    }

    // Check if trying to switch to same plan
    if (currentPlan[0].id === newPlan[0].id) {
      return NextResponse.json({ error: "Already on this plan" }, { status: 400 })
    }

    // Determine if this is an upgrade or downgrade based on price
    const isUpgrade = newPlan[0].amount > currentPlan[0].amount
    const isDowngradeToFree = newPlan[0].name === 'FREE' || newPlan[0].amount === 0

    console.log(`[ChangePlan] ${isUpgrade ? 'UPGRADE' : 'DOWNGRADE'} from ${currentPlan[0].name} ($${currentPlan[0].amount/100}) to ${newPlan[0].name} ($${newPlan[0].amount/100})`)

    // Get the Stripe subscription to find the subscription item ID
    const stripeSubscription = await stripe.subscriptions.retrieve(subscription.stripeSubscriptionId) as Stripe.Subscription
    const subscriptionItemId = stripeSubscription.items.data[0]?.id

    if (!subscriptionItemId) {
      return NextResponse.json({ error: "Subscription item not found" }, { status: 500 })
    }

    // Handle downgrade to FREE plan - cancel at period end
    if (isDowngradeToFree) {
      console.log(`[ChangePlan] Downgrading to FREE - cancelling at period end`)

      const cancelledSubscription = await stripe.subscriptions.update(subscription.stripeSubscriptionId, {
        cancel_at_period_end: true,
      }) as Stripe.Subscription

      // Update database to reflect pending cancellation
      await db.update(subscriptions)
        .set({
          updatedAt: new Date(),
        })
        .where(eq(subscriptions.id, subscription.id))

      return NextResponse.json({
        success: true,
        message: "Your subscription will be cancelled at the end of the current billing period. You will then be moved to the free plan.",
        effectiveDate: new Date((cancelledSubscription as any).current_period_end * 1000).toISOString(),
        type: "downgrade_to_free"
      })
    }

    if (isUpgrade) {
      // UPGRADE: Apply immediately with proration
      console.log(`[ChangePlan] Processing immediate upgrade with proration`)

      const updatedSubscription = await stripe.subscriptions.update(subscription.stripeSubscriptionId, {
        items: [{
          id: subscriptionItemId,
          price: newPriceId,
        }],
        proration_behavior: 'create_prorations', // Charge prorated amount immediately
      }) as Stripe.Subscription

      // Update our database - use subscription level dates
      await db.update(subscriptions)
        .set({
          priceId: newPriceId,
          currentPeriodStart: new Date((updatedSubscription as any).current_period_start * 1000),
          currentPeriodEnd: new Date((updatedSubscription as any).current_period_end * 1000),
          updatedAt: new Date(),
        })
        .where(eq(subscriptions.id, subscription.id))

      return NextResponse.json({
        success: true,
        message: "Your plan has been upgraded successfully! The prorated amount has been charged.",
        effectiveDate: new Date().toISOString(),
        type: "upgrade"
      })

    } else {
      // DOWNGRADE: Schedule change for end of billing period using Stripe Subscription Schedules
      console.log(`[ChangePlan] Processing downgrade - scheduling for end of period`)

      // First, check if there's an existing schedule
      let schedule
      if (stripeSubscription.schedule) {
        // Update existing schedule
        schedule = await stripe.subscriptionSchedules.retrieve(stripeSubscription.schedule as string)

        // Release the existing schedule and create a new one
        await stripe.subscriptionSchedules.release(schedule.id)
      }

      // Create a subscription schedule from the current subscription
      schedule = await stripe.subscriptionSchedules.create({
        from_subscription: subscription.stripeSubscriptionId,
      })

      // Update the schedule to change plan at end of current period
      const currentPhaseStart = (stripeSubscription as any).current_period_start as number
      const currentPhaseEnd = (stripeSubscription as any).current_period_end as number

      await stripe.subscriptionSchedules.update(schedule.id, {
        phases: [
          {
            items: [{ price: currentPlan[0].id, quantity: 1 }],
            start_date: currentPhaseStart,
            end_date: currentPhaseEnd,
          },
          {
            items: [{ price: newPriceId, quantity: 1 }],
            start_date: currentPhaseEnd,
          },
        ],
      })

      return NextResponse.json({
        success: true,
        message: `Your plan will be changed to ${newPlan[0].name} at the end of your current billing period.`,
        effectiveDate: new Date(currentPhaseEnd * 1000).toISOString(),
        type: "downgrade"
      })
    }

  } catch (error: any) {
    console.error("[ChangePlan] Error:", error)
    return NextResponse.json({
      error: "Failed to change plan",
      details: error.message
    }, { status: 500 })
  }
}
