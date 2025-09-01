import { db } from "@/db"; // Adjust this import to your Drizzle client setup
import { customers, subscriptions, invoices }  from "@/db/schema/users"; 
import { eq } from "drizzle-orm"
import { createOrRetrieveCustomer } from "./stripe-customer"
import { updateSubscriptionStatus } from "./stripe-subscription"

export async function handleStripeWebhook(event: any) {
  switch (event.type) {
    case "customer.created":
      await handleCustomerCreated(event.data.object)
      break

    case "customer.updated":
      await handleCustomerUpdated(event.data.object)
      break

    case "customer.subscription.created":
      await handleSubscriptionCreated(event.data.object)
      break

    case "customer.subscription.updated":
      await handleSubscriptionUpdated(event.data.object)
      break

    case "customer.subscription.deleted":
      await handleSubscriptionDeleted(event.data.object)
      break

    case "invoice.created":
      await handleInvoiceCreated(event.data.object)
      break

    case "invoice.updated":
      await handleInvoiceUpdated(event.data.object)
      break

    case "invoice.paid":
      // CRITICAL: This is where we provision access, not on checkout.session.completed
      await handleInvoicePaid(event.data.object)
      break

    case "invoice.payment_failed":
      await handleInvoicePaymentFailed(event.data.object)
      break

    case "checkout.session.completed":
      // We log this but don't provision access here
      await handleCheckoutSessionCompleted(event.data.object)
      break

    case "customer.subscription.trial_will_end":
      await handleTrialWillEnd(event.data.object)
      break

    default:
      console.log(`[Webhook] Unhandled event type: ${event.type}`)
  }
}

// Handle customer creation
async function handleCustomerCreated(customer: any) {
  console.log(`[Webhook] Customer created: ${customer.id}`)

  // If customer has userId in metadata, link them
  if (customer.metadata?.userId) {
    try {
      await createOrRetrieveCustomer(customer.metadata.userId, customer.email, customer.name)
    } catch (error) {
      console.error("Error linking customer:", error)
    }
  }
}

// Handle customer updates
async function handleCustomerUpdated(customer: any) {
  console.log(`[Webhook] Customer updated: ${customer.id}`)

  try {
    await db
      .update(customers)
      .set({
        email: customer.email,
        name: customer.name,
        updatedAt: new Date(),
      })
      .where(eq(customers.stripeCustomerId, customer.id))
  } catch (error) {
    console.error("Error updating customer:", error)
  }
}

// Handle subscription creation
async function handleSubscriptionCreated(subscription: any) {
  console.log(`[Webhook] Subscription created: ${subscription.id}`)

  try {
    // Get customer from database
    const customer = await db
      .select()
      .from(customers)
      .where(eq(customers.stripeCustomerId, subscription.customer))
      .limit(1)

    if (!customer[0]) {
      console.error("Customer not found for subscription:", subscription.id)
      return
    }

    // Create subscription record
    await db.insert(subscriptions).values({
      userId: customer[0].userId,
      customerId: customer[0].id,
      stripeSubscriptionId: subscription.id,
      planId: subscription.items.data[0].price.id,
      status: subscription.status,
      currentPeriodStart: new Date(subscription.current_period_start * 1000),
      currentPeriodEnd: new Date(subscription.current_period_end * 1000),
      trialStart: subscription.trial_start ? new Date(subscription.trial_start * 1000) : null,
      trialEnd: subscription.trial_end ? new Date(subscription.trial_end * 1000) : null,
      cancelAtPeriodEnd: subscription.cancel_at_period_end,
      canceledAt: subscription.canceled_at ? new Date(subscription.canceled_at * 1000) : null,
    })

    console.log(`[Webhook] Subscription record created for user: ${customer[0].userId}`)
  } catch (error) {
    console.error("Error creating subscription:", error)
  }
}

// Handle subscription updates
async function handleSubscriptionUpdated(subscription: any) {
  console.log(`[Webhook] Subscription updated: ${subscription.id}`)

  try {
    await updateSubscriptionStatus(
      subscription.id,
      subscription.status,
      subscription.current_period_start,
      subscription.current_period_end,
      subscription.cancel_at_period_end,
      subscription.canceled_at,
    )
  } catch (error) {
    console.error("Error updating subscription:", error)
  }
}

// Handle subscription deletion
async function handleSubscriptionDeleted(subscription: any) {
  console.log(`[Webhook] Subscription deleted: ${subscription.id}`)

  try {
    await updateSubscriptionStatus(
      subscription.id,
      "canceled",
      subscription.current_period_start,
      subscription.current_period_end,
      false,
      subscription.canceled_at || Math.floor(Date.now() / 1000),
    )
  } catch (error) {
    console.error("Error deleting subscription:", error)
  }
}

// Handle invoice creation
async function handleInvoiceCreated(invoice: any) {
  console.log(`[Webhook] Invoice created: ${invoice.id}`)

  try {
    // Get customer from database
    const customer = await db.select().from(customers).where(eq(customers.stripeCustomerId, invoice.customer)).limit(1)

    if (!customer[0]) {
      console.error("Customer not found for invoice:", invoice.id)
      return
    }

    // Get subscription if exists
    let subscriptionRecord = null
    if (invoice.subscription) {
      const sub = await db
        .select()
        .from(subscriptions)
        .where(eq(subscriptions.stripeSubscriptionId, invoice.subscription))
        .limit(1)

      subscriptionRecord = sub[0] || null
    }

    // Create invoice record
    await db.insert(invoices).values({
      userId: customer[0].userId,
      customerId: customer[0].id,
      subscriptionId: subscriptionRecord?.id || null,
      stripeInvoiceId: invoice.id,
      stripePaymentIntentId: invoice.payment_intent,
      amountPaid: invoice.amount_paid,
      amountDue: invoice.amount_due,
      currency: invoice.currency,
      status: invoice.status,
      hostedInvoiceUrl: invoice.hosted_invoice_url,
      invoicePdf: invoice.invoice_pdf,
    })
  } catch (error) {
    console.error("Error creating invoice:", error)
  }
}

// Handle invoice updates
async function handleInvoiceUpdated(invoice: any) {
  console.log(`[Webhook] Invoice updated: ${invoice.id}`)

  try {
    await db
      .update(invoices)
      .set({
        amountPaid: invoice.amount_paid,
        amountDue: invoice.amount_due,
        status: invoice.status,
        hostedInvoiceUrl: invoice.hosted_invoice_url,
        invoicePdf: invoice.invoice_pdf,
        updatedAt: new Date(),
      })
      .where(eq(invoices.stripeInvoiceId, invoice.id))
  } catch (error) {
    console.error("Error updating invoice:", error)
  }
}

// CRITICAL: Handle invoice paid - this is where we provision access
async function handleInvoicePaid(invoice: any) {
  console.log(`[Webhook] Invoice paid: ${invoice.id} - PROVISIONING ACCESS`)

  try {
    // Update invoice status
    await db
      .update(invoices)
      .set({
        amountPaid: invoice.amount_paid,
        status: "paid",
        updatedAt: new Date(),
      })
      .where(eq(invoices.stripeInvoiceId, invoice.id))

    // Get customer and subscription info
    const customer = await db.select().from(customers).where(eq(customers.stripeCustomerId, invoice.customer)).limit(1)

    if (!customer[0]) {
      console.error("Customer not found for paid invoice:", invoice.id)
      return
    }

    // If this is a subscription invoice, ensure subscription is active
    if (invoice.subscription) {
      const subscription = await db
        .select()
        .from(subscriptions)
        .where(eq(subscriptions.stripeSubscriptionId, invoice.subscription))
        .limit(1)

      if (subscription[0]) {
        // Update subscription to active if payment succeeded
        await db
          .update(subscriptions)
          .set({
            status: "active",
            updatedAt: new Date(),
          })
          .where(eq(subscriptions.id, subscription[0].id))

        console.log(`[Webhook] ACCESS PROVISIONED for user: ${customer[0].userId}`)

        // Here you can add additional logic like:
        // - Send welcome email
        // - Update user permissions
        // - Trigger onboarding flow
        // - Update user role in your app

        await provisionUserAccess(customer[0].userId, subscription[0].planId)
      }
    }
  } catch (error) {
    console.error("Error handling paid invoice:", error)
  }
}

// Handle invoice payment failure
async function handleInvoicePaymentFailed(invoice: any) {
  console.log(`[Webhook] Invoice payment failed: ${invoice.id}`)

  try {
    // Update invoice status
    await db
      .update(invoices)
      .set({
        status: "payment_failed",
        updatedAt: new Date(),
      })
      .where(eq(invoices.stripeInvoiceId, invoice.id))

    // Get customer info for notifications
    const customer = await db.select().from(customers).where(eq(customers.stripeCustomerId, invoice.customer)).limit(1)

    if (customer[0]) {
      console.log(`[Webhook] Payment failed for user: ${customer[0].userId}`)

      // Here you can add logic like:
      // - Send payment failure email
      // - Restrict access if needed
      // - Update user status

      await handlePaymentFailure(customer[0].userId, invoice.id)
    }
  } catch (error) {
    console.error("Error handling payment failure:", error)
  }
}

// Handle checkout session completed (for logging, not access provisioning)
async function handleCheckoutSessionCompleted(session: any) {
  console.log(`[Webhook] Checkout session completed: ${session.id} - NOT provisioning access here`)

  // We don't provision access here, only log for tracking
  // Access is provisioned when invoice.paid is received

  try {
    if (session.metadata?.userId) {
      console.log(`[Webhook] Checkout completed for user: ${session.metadata.userId}`)

      // You can add analytics tracking here
      // - Track conversion
      // - Update user onboarding status
      // - Send confirmation email (but not access)
    }
  } catch (error) {
    console.error("Error handling checkout completion:", error)
  }
}

// Handle trial ending soon
async function handleTrialWillEnd(subscription: any) {
  console.log(`[Webhook] Trial will end: ${subscription.id}`)

  try {
    const customer = await db
      .select()
      .from(customers)
      .where(eq(customers.stripeCustomerId, subscription.customer))
      .limit(1)

    if (customer[0]) {
      console.log(`[Webhook] Trial ending for user: ${customer[0].userId}`)

      // Send trial ending notification
      await sendTrialEndingNotification(customer[0].userId, subscription.trial_end)
    }
  } catch (error) {
    console.error("Error handling trial ending:", error)
  }
}

// Helper function to provision user access
async function provisionUserAccess(userId: string, planId: string) {
  console.log(`[Access] Provisioning access for user ${userId} with plan ${planId}`)

  // Add your business logic here:
  // - Update user role/permissions in your app
  // - Send welcome email with access details
  // - Enable features based on plan
  // - Update user profile with subscription info

  // Example implementation:
  try {
    // You would update your users table or user permissions here
    // await updateUserPlan(userId, planId)
    // await sendWelcomeEmail(userId, planId)
    // await enablePlanFeatures(userId, planId)

    console.log(`[Access] Successfully provisioned access for user ${userId}`)
  } catch (error) {
    console.error(`[Access] Failed to provision access for user ${userId}:`, error)
    throw error
  }
}

// Helper function to handle payment failures
async function handlePaymentFailure(userId: string, invoiceId: string) {
  console.log(`[Payment] Handling payment failure for user ${userId}`)

  // Add your business logic here:
  // - Send payment failure notification
  // - Restrict access if needed
  // - Update user status

  try {
    // await sendPaymentFailureEmail(userId, invoiceId)
    // await restrictUserAccess(userId)

    console.log(`[Payment] Handled payment failure for user ${userId}`)
  } catch (error) {
    console.error(`[Payment] Failed to handle payment failure for user ${userId}:`, error)
  }
}

// Helper function to send trial ending notification
async function sendTrialEndingNotification(userId: string, trialEndTimestamp: number) {
  console.log(`[Trial] Sending trial ending notification to user ${userId}`)

  const trialEndDate = new Date(trialEndTimestamp * 1000)

  try {
    // await sendTrialEndingEmail(userId, trialEndDate)

    console.log(`[Trial] Sent trial ending notification to user ${userId}`)
  } catch (error) {
    console.error(`[Trial] Failed to send trial ending notification to user ${userId}:`, error)
  }
}
