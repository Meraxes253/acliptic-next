import { type NextRequest, NextResponse } from "next/server"
import { stripe, STRIPE_CONFIG } from "@/lib/stripe"
import { createOrRetrieveCustomer } from "@/lib/stripe-customer"
import { auth } from "@/auth"

export async function POST(req: NextRequest) {
  try {

    const auth_session = await auth()

    const userId = auth_session?.user?.id || ""

    const { priceId, successUrl, cancelUrl } = await req.json()

    if (!priceId || !userId ) {
      return Response.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Create or retrieve customer
    const customer = await createOrRetrieveCustomer(userId)

    console.log('response from createOrRetrieveCustomer : ', customer)

    const defaultSuccessUrl = `${process.env.NEXT_PUBLIC_SITE_URL}/checkout/success?session_id={CHECKOUT_SESSION_ID}`
    const defaultCancelUrl = `${process.env.NEXT_PUBLIC_SITE_URL}/pricing`

    const session = await stripe.checkout.sessions.create({
      customer: customer.stripeCustomerId,
      payment_method_types: ["card"],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: "subscription",
      success_url: successUrl || defaultSuccessUrl,
      cancel_url: cancelUrl || defaultCancelUrl,
      metadata: {
        userId: userId,
      },
      subscription_data: {
        metadata: {
          userId: userId,
        },
      },
    })

    return Response.json({ sessionId: session.id, url: session.url })
  } catch (error) {
    console.error("Checkout error:", error)
    return Response.json({ error: "Internal server error" }, { status: 500 })
  }
}

