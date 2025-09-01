import { type NextRequest, NextResponse } from "next/server"
import { stripe } from "@/lib/stripe"

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const sessionId = searchParams.get("session_id")

    if (!sessionId) {
      return NextResponse.json({ error: "Session ID is required" }, { status: 400 })
    }

    // Retrieve the checkout session
    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ["line_items", "subscription", "customer"],
    })

    return NextResponse.json({
      session: {
        id: session.id,
        status: session.status,
        customer_email: session.customer_details?.email,
        amount_total: session.amount_total,
        currency: session.currency,
        subscription: session.subscription,
        metadata: session.metadata,
      },
    })
  } catch (error: any) {
    console.error("Session retrieval error:", error)
    return NextResponse.json({ error: "Failed to retrieve session", details: error.message }, { status: 500 })
  }
}
