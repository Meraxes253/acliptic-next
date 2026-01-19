import { stripe } from "./stripe"

// Create products and prices in Stripe (run this once to set up your products)
export async function createStripeProducts() {
  try {
    // Create Basic Plan Product
    const basicProduct = await stripe.products.create({
      name: "Basic Plan",
      description: "Basic features with monthly billing",
      metadata: {
        plan_type: "basic",
      },
    })

    // Create Basic Plan Price
    const basicPrice = await stripe.prices.create({
      product: basicProduct.id,
      unit_amount: 999, // $9.99 in cents
      currency: "usd",
      recurring: {
        interval: "month",
        trial_period_days: 7,
      },
      metadata: {
        plan_id: "basic_monthly",
      },
    })

    // Create Pro Plan Product
    const proProduct = await stripe.products.create({
      name: "Pro Plan",
      description: "All features with monthly billing",
      metadata: {
        plan_type: "pro",
      },
    })

    // Create Pro Plan Price
    const proPrice = await stripe.prices.create({
      product: proProduct.id,
      unit_amount: 2999, // $29.99 in cents
      currency: "usd",
      recurring: {
        interval: "month",
        trial_period_days: 7,
      },
      metadata: {
        plan_id: "pro_monthly",
      },
    })

    console.log("Products created successfully!")
    console.log("Basic Price ID:", basicPrice.id)
    console.log("Pro Price ID:", proPrice.id)
    console.log("Update your database plans table with these Price IDs")

    return {
      basicPriceId: basicPrice.id,
      proPriceId: proPrice.id,
    }
  } catch (error) {
    console.error("Error creating products:", error)
    throw error
  }
}

// List all products and prices (for debugging)
export async function listStripeProducts() {
  const products = await stripe.products.list({ active: true })
  const prices = await stripe.prices.list({ active: true })

  return { products: products.data, prices: prices.data }
}
