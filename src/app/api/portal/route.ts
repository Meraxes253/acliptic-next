import { type NextRequest, NextResponse } from "next/server"
import { stripe } from "@/lib/stripe"
import { getCustomerByUserId } from "@/lib/subscription-helpers"
import { auth } from "@/auth";

export async function POST(req: NextRequest) {
  try {

    const { returnUrl } = await req.json()

    const session = await auth();
  
    const userId = session?.user?.id || "";

    if (!userId) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 })
    }

    console.log(`[Portal] Creating portal session for user: ${userId}`)

    // Get customer from database
    const customer = await getCustomerByUserId(userId)

    if (!customer) {
      console.log(`[Portal] Customer not found for user: ${userId}`)
      return NextResponse.json({ error: "Customer not found. Please contact support." }, { status: 404 })
    }

    console.log(`[Portal] Found customer: ${customer.stripeCustomerId}`)

    // Create billing portal session
    const portalSession = await stripe.billingPortal.sessions.create({
      customer: customer.stripeCustomerId,
      return_url: returnUrl || `${process.env.NEXT_PUBLIC_SITE_URL}/dashboard`,
    })

    console.log(`[Portal] Created portal session: ${portalSession.id}`)

    return NextResponse.json({
      url: portalSession.url,
    })
  } catch (error: any) {
    console.error("Portal session error:", error)
    return NextResponse.json({ error: "Failed to create portal session", details: error.message }, { status: 500 })
  }
}
