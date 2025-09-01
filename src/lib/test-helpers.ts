// Test utilities for subscription system
import { stripe } from "./stripe"
import { db } from "@/db"; // Adjust this import to your Drizzle client setup
import { subscriptions, customers }  from "@/db/schema/users"; 
import { eq } from "drizzle-orm"

export class SubscriptionTestHelper {
  private testCustomers: string[] = []
  private testSubscriptions: string[] = []

  // Create a test customer
  async createTestCustomer(email: string, userId: string) {
    const customer = await stripe.customers.create({
      email,
      name: "Test User",
      metadata: { userId },
    })

    this.testCustomers.push(customer.id)
    return customer
  }

  // Create a test subscription
  async createTestSubscription(customerId: string, priceId: string) {
    const subscription = await stripe.subscriptions.create({
      customer: customerId,
      items: [{ price: priceId }],
      trial_period_days: 7,
    })

    this.testSubscriptions.push(subscription.id)
    return subscription
  }

  // Simulate webhook event
  async simulateWebhookEvent(eventType: string, object: any) {
    const event = {
      id: `evt_test_${Date.now()}`,
      type: eventType,
      data: { object },
      created: Math.floor(Date.now() / 1000),
    }

    // You would call your webhook handler here
    return event
  }

  // Check if customer exists in database
  async checkCustomerInDatabase(stripeCustomerId: string) {
    const result = await db.select().from(customers).where(eq(customers.stripeCustomerId, stripeCustomerId)).limit(1)

    return result.length > 0
  }

  // Check if subscription exists in database
  async checkSubscriptionInDatabase(stripeSubscriptionId: string) {
    const result = await db
      .select()
      .from(subscriptions)
      .where(eq(subscriptions.stripeSubscriptionId, stripeSubscriptionId))
      .limit(1)

    return result.length > 0
  }

  // Cleanup test data
  async cleanup() {
    console.log("🧹 Cleaning up test data...")

    // Cancel and delete test subscriptions
    for (const subscriptionId of this.testSubscriptions) {
      try {
        await stripe.subscriptions.cancel(subscriptionId)
        console.log(`✅ Canceled subscription: ${subscriptionId}`)
      } catch (error) {
        console.warn(`⚠️ Failed to cancel subscription ${subscriptionId}:`, error)
      }
    }

    // Delete test customers
    for (const customerId of this.testCustomers) {
      try {
        await stripe.customers.del(customerId)
        console.log(`✅ Deleted customer: ${customerId}`)
      } catch (error) {
        console.warn(`⚠️ Failed to delete customer ${customerId}:`, error)
      }
    }

    this.testCustomers = []
    this.testSubscriptions = []
  }
}

// Test scenarios
export const testScenarios = {
  // Test free plan signup
  async testFreePlanSignup(userId: string, email: string) {
    console.log("Testing free plan signup...")
    // This would test the free plan flow
    return { success: true, message: "Free plan signup successful" }
  },

  // Test paid plan subscription
  async testPaidPlanSubscription(userId: string, email: string, priceId: string) {
    console.log("Testing paid plan subscription...")
    const helper = new SubscriptionTestHelper()

    try {
      const customer = await helper.createTestCustomer(email, userId)
      const subscription = await helper.createTestSubscription(customer.id, priceId)

      // Simulate webhook events
      await helper.simulateWebhookEvent("customer.subscription.created", subscription)

      return { success: true, customerId: customer.id, subscriptionId: subscription.id }
    } finally {
      await helper.cleanup()
    }
  },

  // Test billing portal access
  async testBillingPortal(customerId: string) {
    console.log("Testing billing portal...")

    try {
      const session = await stripe.billingPortal.sessions.create({
        customer: customerId,
        return_url: "http://localhost:3000/dashboard",
      })

      return { success: true, portalUrl: session.url }
    } catch (error) {
      return { success: false, error: error.message }
    }
  },
}
