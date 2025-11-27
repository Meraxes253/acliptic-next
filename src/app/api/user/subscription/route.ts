import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { getUserSubscription } from "@/lib/subscription-helpers";

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    const userId = session?.user?.id;

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const subscription = await getUserSubscription(userId);

    if (!subscription) {
      // Return free plan data if no subscription
      return NextResponse.json({
        plan: {
          name: "Free Plan",
          amount: 0,
          currency: "usd",
          interval: "month"
        },
        subscription: {
          is_active: false,
          currentPeriodStart: null,
          currentPeriodEnd: null,
          stripeSubscriptionId: null
        },
        usage: {
          total_seconds_processed: 0,
          max_total_seconds_processed: 300, // 5 minutes for free
          max_active_streams: 1,
          max_streams: 3
        }
      });
    }

    // Return actual subscription data
    return NextResponse.json(subscription);
  } catch (error) {
    console.error("Error fetching subscription:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}