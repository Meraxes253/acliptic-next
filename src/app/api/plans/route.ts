import { NextResponse } from "next/server";
import { db } from "@/db";
import { plans } from "@/db/schema/users";
import { eq } from "drizzle-orm";

export async function GET() {
  try {
    const availablePlans = await db
      .select()
      .from(plans)
      .where(eq(plans.active, true))
      .orderBy(plans.amount);

    return NextResponse.json(availablePlans);
  } catch (error) {
    console.error("Error fetching plans:", error);

    // Return default plans if database query fails
    const defaultPlans = [
      {
        id: "free",
        name: "Free Plan",
        description: "Perfect for getting started",
        amount: 0,
        currency: "usd",
        interval: "month",
        max_active_streams: 1,
        max_streams: 3,
        max_total_seconds_processed: 300,
        features: [
          "1 Active Stream",
          "3 Total Streams",
          "5 Minutes Processing",
          "Basic Support"
        ]
      },
      {
        id: "pro_monthly",
        name: "Pro Plan",
        description: "For content creators",
        amount: 1999,
        currency: "usd",
        interval: "month",
        max_active_streams: 5,
        max_streams: 50,
        max_total_seconds_processed: 36000,
        features: [
          "5 Active Streams",
          "50 Total Streams",
          "10 Hours Processing",
          "Priority Support",
          "Advanced Analytics",
          "Custom Branding"
        ]
      }
    ];

    return NextResponse.json(defaultPlans);
  }
}