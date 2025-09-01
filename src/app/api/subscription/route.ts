import { type NextRequest, NextResponse } from "next/server"
import { getUserSubscription } from "@/lib/subscription-helpers"
import { auth } from "@/auth";

export async function GET(req: NextRequest) {
  try {

    const session = await auth();

    console.log(`ID THIS BRO :${session}`);

    const userId = session?.user?.id || "";
    if (!userId) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 })
    }

    console.log(`[API] Fetching subscription for user: ${userId}`)

    const subscriptionData = await getUserSubscription(userId)

    if (!subscriptionData) {
      console.log(`[API] No subscription found for user: ${userId}`)
      return NextResponse.json({ error: "No subscription found" }, { status: 404 })
    }

    console.log(`[API] Found subscription:`, subscriptionData)

    const response = {
      subscription: {
        id: subscriptionData.subscription.stripeSubscriptionId,
        status: subscriptionData.subscription.is_active === true ? "active" : "inactive",
        currentPeriodStart: subscriptionData.subscription.currentPeriodStart?.toISOString(),
        currentPeriodEnd: subscriptionData.subscription.currentPeriodEnd?.toISOString(),
        cancelAtPeriodEnd: false, // You can add this field to your schema if needed
        trialEnd: null, // You can add this field to your schema if needed
      },
      plan: {
        id: subscriptionData.plan.id,
        name: subscriptionData.plan.name,
        amount: subscriptionData.plan.amount,
        currency: subscriptionData.plan.currency,
        interval: subscriptionData.plan.interval,
      },
      customer: {
        email: subscriptionData.users.email,
        name: subscriptionData.users.name,
      },
    }

    return NextResponse.json(response)
  } catch (error: any) {
    console.error("Subscription fetch error:", error)
    return NextResponse.json({ error: "Failed to fetch subscription", details: error.message }, { status: 500 })
  }
}
