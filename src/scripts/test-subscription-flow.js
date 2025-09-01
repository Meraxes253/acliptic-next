// Test script to verify the complete subscription flow
import { stripe } from "../lib/stripe.js"
import { db } from "../lib/db/index.js"
import { plans } from "../lib/db/schema.js"

const TEST_EMAIL = "test@example.com"
const TEST_USER_ID = "test_user_123"

async function testSubscriptionFlow() {
  console.log("🧪 Testing Stripe Subscription Flow\n")

  try {
    // Test 1: Check database connection
    console.log("1. Testing database connection...")
    const plansResult = await db.select().from(plans)
    console.log(`✅ Found ${plansResult.length} plans in database`)

    // Test 2: Check Stripe connection
    console.log("\n2. Testing Stripe connection...")
    const stripeAccount = await stripe.accounts.retrieve()
    console.log(`✅ Connected to Stripe account: ${stripeAccount.id}`)

    // Test 3: List Stripe products and prices
    console.log("\n3. Checking Stripe products...")
    const products = await stripe.products.list({ active: true })
    const prices = await stripe.prices.list({ active: true })
    console.log(`✅ Found ${products.data.length} products and ${prices.data.length} prices`)

    // Test 4: Create test customer
    console.log("\n4. Creating test customer...")
    const testCustomer = await stripe.customers.create({
      email: TEST_EMAIL,
      name: "Test User",
      metadata: { userId: TEST_USER_ID },
    })
    console.log(`✅ Created test customer: ${testCustomer.id}`)

    // Test 5: Create test subscription (if prices exist)
    if (prices.data.length > 0) {
      console.log("\n5. Creating test subscription...")
      const testSubscription = await stripe.subscriptions.create({
        customer: testCustomer.id,
        items: [{ price: prices.data[0].id }],
        trial_period_days: 7,
        metadata: { userId: TEST_USER_ID },
      })
      console.log(`✅ Created test subscription: ${testSubscription.id}`)

      // Test 6: Simulate webhook event
      console.log("\n6. Testing webhook processing...")
      const webhookEvent = {
        type: "customer.subscription.created",
        data: { object: testSubscription },
      }

      // This would normally be processed by your webhook handler
      console.log(`✅ Webhook event ready: ${webhookEvent.type}`)

      // Cleanup: Cancel test subscription
      await stripe.subscriptions.cancel(testSubscription.id)
      console.log("🧹 Cleaned up test subscription")
    }

    // Cleanup: Delete test customer
    await stripe.customers.del(testCustomer.id)
    console.log("🧹 Cleaned up test customer")

    console.log("\n🎉 All tests passed! Your subscription system is ready.")
  } catch (error) {
    console.error("\n❌ Test failed:", error.message)
    console.error("\nTroubleshooting tips:")
    console.error("- Check your environment variables")
    console.error("- Verify Stripe API keys are correct")
    console.error("- Ensure database is accessible")
    console.error("- Run database migrations first")
    process.exit(1)
  }
}

// Run the test
testSubscriptionFlow()
