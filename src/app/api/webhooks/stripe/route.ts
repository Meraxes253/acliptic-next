import { type NextRequest, NextResponse } from "next/server"
import { headers } from "next/headers"
import type Stripe from "stripe"
import { stripe, STRIPE_CONFIG } from "@/lib/stripe"
import { db } from "@/db"
import { subscriptions, invoices, customers, users, plans } from "@/db/schema/users"
import { eq } from "drizzle-orm"

// Disable body parser for webhooks - Stripe needs raw body
export const runtime = 'nodejs'

export async function POST(req: NextRequest) {
  console.log('[Webhook] POST request received')

  try {
    const body = await req.text()
    const headersList = await headers()
    const signature = headersList.get("stripe-signature")

    console.log('[Webhook] Signature present:', !!signature)

    if (!signature) {
      console.error("No Stripe signature found")
      return NextResponse.json({ error: "No signature" }, { status: 400 })
    }

    // Verify webhook secret exists
    if (!STRIPE_CONFIG.webhookSecret) {
      console.error("STRIPE_WEBHOOK_SECRET is not configured")
      return NextResponse.json({ error: "Webhook secret not configured" }, { status: 500 })
    }

    console.log('[Webhook] Constructing event...')
    const event = stripe.webhooks.constructEvent(body, signature, STRIPE_CONFIG.webhookSecret)
    console.log(`[Webhook] Received event: ${event.type}`)

    switch (event.type) {
      case "customer.created":
        const customer = event.data.object as Stripe.Customer
        console.log(`[Webhook] Customer created: ${customer.id}`)
        break

      case "customer.updated":
        const updatedCustomer = event.data.object as Stripe.Customer
        console.log(`[Webhook] Customer updated: ${updatedCustomer.id}`)
        break

      case "customer.subscription.created":
        let subscription = event.data.object as Stripe.Subscription
        console.log(`[Webhook] Subscription created: ${subscription.id}`)

        console.log('[Webhook] Customer id of subscription created: ', subscription.customer)

        try {
          //console.log(`[Webhook] Full subscription object:`, JSON.stringify(subscription, null, 2))

          const subscriptionItem = subscription.items.data[0]
          const currentPeriodStart = subscriptionItem?.current_period_start
            ? new Date(subscriptionItem.current_period_start * 1000)
            : null
          const currentPeriodEnd = subscriptionItem?.current_period_end
            ? new Date(subscriptionItem.current_period_end * 1000)
            : null

          console.log(`[Webhook] Period dates from subscription item:`, {
            start: currentPeriodStart,
            end: currentPeriodEnd,
          })

          console.log('metadata : ',subscription.metadata)
          const userId = subscription.metadata?.userId || (subscription.customer as string)

          // FIRST check if any subscription record associated with this userId exists
          const user_record = await db.select({
            userId : subscriptions.userId
          }).from(subscriptions)
          .where(eq(subscriptions.userId, userId))

          // if record exists just update it
          if (user_record.length > 0 && user_record[0].userId){
              console.log('Subscription record already exists updating it')

             await db.update(subscriptions) // Specify the table to update
              .set({ 
                stripeSubscriptionId: subscription.id, 
                is_active: subscription.status === "active" ? true : false,
                priceId: subscription.items.data[0]?.price.id || "",
                total_seconds_processed : 0,
                currentPeriodStart: currentPeriodStart,
                currentPeriodEnd: currentPeriodEnd
              
              }) // Set the new values for the columns
              .where(eq(subscriptions.userId, userId));

          } 
          // Otherwise create a new record
          else {

            console.log('Subscription record doesnt exist creating new record')

            await db.insert(subscriptions).values({
              userId: userId,
              stripeSubscriptionId: subscription.id,
              stripeCustomerId: subscription.customer as string,
              is_active: subscription.status === "active" ? true : false,
              priceId: subscription.items.data[0]?.price.id || "",
              currentPeriodStart,
              currentPeriodEnd,
              total_seconds_processed : 0
            })

        }

          console.log(`[Webhook] Subscription saved to database with dates: ${subscription.id}`)
        } catch (error) {
          console.error("Error creating subscription:", error)
        }
        break

      case "checkout.session.completed":
        const session = event.data.object as Stripe.Checkout.Session
        console.log(`[Webhook] Checkout session completed: ${session.id} - NOT provisioning access here`)

        if (session.metadata?.userId) {
          console.log(`[Webhook] Checkout completed for user: ${session.metadata.userId}`)
        }
        break

      case "invoice.paid":

        const paidInvoice = event.data.object as Stripe.Invoice
          console.log(`[Webhook] Invoice paid: ${paidInvoice.id} - PROVISIONING ACCESS`)
  
          //console.log(`[Webhook] Full paid invoice object:`, JSON.stringify(paidInvoice, null, 2))
        break

      // NOTE : DONT FORGET TO HANDLE invoice payment failed , DOES that trigger  customer.subscription.deleted ? in that case no need to deal with it seperately
      case "customer.subscription.deleted":
        subscription = event.data.object as Stripe.Subscription
        console.log(`[Webhook] Subscription deleted: ${subscription.id}`)

        // Get the user ID from the subscription before deactivating
        const deletedSubRecord = await db.select()
          .from(subscriptions)
          .where(eq(subscriptions.stripeSubscriptionId, subscription.id))
          .limit(1)

        const deletedUserId = deletedSubRecord[0]?.userId

        // Set subscription to inactive
        await db.update(subscriptions)
          .set({
            is_active: false,
            priceId: "",
            total_seconds_processed: 0,
            currentPeriodStart: null,
            currentPeriodEnd: null,
            updatedAt: new Date(),
          })
          .where(eq(subscriptions.stripeSubscriptionId, subscription.id));

        // Create a free subscription for the user so they still have access to free tier
        if (deletedUserId) {
          try {
            // Get the FREE plan
            const freePlan = await db.select()
              .from(plans)
              .where(eq(plans.name, 'FREE'))
              .limit(1)

            if (freePlan[0]) {
              const currentDate = new Date()
              const oneYearLater = new Date()
              oneYearLater.setFullYear(currentDate.getFullYear() + 1)

              // Update the existing subscription record to free tier instead of creating a new one
              await db.update(subscriptions)
                .set({
                  stripeSubscriptionId: `free_${deletedUserId}_${Date.now()}`,
                  stripeCustomerId: subscription.customer as string,
                  is_active: true,
                  priceId: freePlan[0].id,
                  currentPeriodStart: currentDate,
                  currentPeriodEnd: oneYearLater,
                  total_seconds_processed: 0,
                  updatedAt: new Date(),
                })
                .where(eq(subscriptions.userId, deletedUserId))

              console.log(`[Webhook] User ${deletedUserId} moved to free tier after subscription deletion`)
            }
          } catch (freeSubError) {
            console.error(`[Webhook] Error creating free subscription for user ${deletedUserId}:`, freeSubError)
          }
        }
        break

      case "customer.subscription.updated":
        subscription = event.data.object as Stripe.Subscription
        console.log(`[Webhook] Subscription updated: ${subscription.id}`)

        // check if user cancelled subscription and its set to cancel at end of current subscription period
        if (subscription.cancel_at_period_end) {
          console.log('[Webhook] User cancelled subscription - will cancel at end of current period')
          // Don't deactivate yet, just log. The subscription.deleted event will handle actual cancellation
        }
        // The user has either upgraded / downgraded their subscription so update subscription record
        else {
              // fetch the start and end dates for the subscription period from its object
              const subscriptionItem = subscription.items.data[0]
              const currentPeriodStart = subscriptionItem?.current_period_start
                ? new Date(subscriptionItem.current_period_start * 1000)
                : null
              const currentPeriodEnd = subscriptionItem?.current_period_end
                ? new Date(subscriptionItem.current_period_end * 1000)
                : null

              console.log(`[Webhook] Updating subscription to plan: ${subscription.items.data[0]?.price.id}`)

              await db.update(subscriptions)
              .set({
                stripeCustomerId: subscription.customer as string,
                is_active: subscription.status === "active" ? true : false,
                priceId: subscription.items.data[0]?.price.id || "",
                currentPeriodStart,
                currentPeriodEnd,
                updatedAt: new Date(),
              })
              .where(eq(subscriptions.stripeSubscriptionId, subscription.id));
        }
        break

      // Handle subscription schedule events for downgrades
      case "subscription_schedule.completed":
        const completedSchedule = event.data.object as Stripe.SubscriptionSchedule
        console.log(`[Webhook] Subscription schedule completed: ${completedSchedule.id}`)
        // The subscription has been updated automatically by Stripe, subscription.updated event handles DB update
        break

      case "subscription_schedule.updated":
        const updatedSchedule = event.data.object as Stripe.SubscriptionSchedule
        console.log(`[Webhook] Subscription schedule updated: ${updatedSchedule.id}`)
        // Log for debugging - actual plan change will be reflected in subscription.updated
        break

      case "subscription_schedule.canceled":
        const canceledSchedule = event.data.object as Stripe.SubscriptionSchedule
        console.log(`[Webhook] Subscription schedule canceled: ${canceledSchedule.id}`)
        break

      default:
        console.log(`[Webhook] Unhandled event type: ${event.type}`)
    }

    console.log(`[Webhook] Successfully processed: ${event.type}`)
    return NextResponse.json({ received: true }, { status: 200 })
  } catch (error: any) {
    console.error(`[Webhook] Error processing webhook:`, error)
    console.error(`[Webhook] Error details:`, error?.message, error?.stack)
    // Return 200 even on error so Stripe doesn't retry
    return NextResponse.json({ error: "Webhook processing failed", message: error?.message }, { status: 200 })
  }
}
