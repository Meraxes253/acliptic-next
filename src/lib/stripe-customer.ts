import { stripe } from "./stripe"
import { db } from "@/db"; // Adjust this import to your Drizzle client setup
import { users, customers } from "@/db/schema/users"; // Import your schema

import { sql, eq } from "drizzle-orm"
 
// Create or retrieve Stripe customer
export async function createOrRetrieveCustomer(userId: string) {
  try {

    const result  =  await db.select({
      stripeCustomerId: users.stripeCustomerId,
      email : users.email,
      name : users.name
    }).from(users).where(eq(users.id, userId))


    if (result[0].stripeCustomerId ) {
        console.log('stripe customer id already exists')
        return result[0]
    }

    let email = result[0].email
    let name = result[0].name

    // Create customer in Stripe
    const stripeCustomer = await stripe.customers.create({
      email: email || undefined,
      name: name || undefined,
      metadata: {
        userId: userId,
      },
    })

    console.log('stripe customer id DOES NOT already exist')

    console.log('stripe customer creation response : ', stripeCustomer)


    // Update customer in our database to store stripe ID
    const newCustomer = await db.update(users)
            .set({ stripeCustomerId: stripeCustomer.id })
            .where(eq(users.id, userId)).
            returning();

    return newCustomer[0]
  } catch (error) {
    console.error("Customer updation error:", error)
    throw error
  }
}


// Get customer by user ID
export async function getCustomerByUserId(userId: string) {
  const result = await db.select().from(customers).where(eq(customers.userId, userId)).limit(1)

  return result[0] || null
}

// Update customer in Stripe and database
export async function updateCustomer(userId: string, updates: { email?: string; name?: string }) {
  const customer = await getCustomerByUserId(userId)

  if (!customer) {
    throw new Error("Customer not found")
  }

  // Update in Stripe
  await stripe.customers.update(customer.stripeCustomerId, {
    email: updates.email,
    name: updates.name,
  })

  // Update in database
  const [updatedCustomer] = await db
    .update(customers)
    .set({
      email: updates.email || customer.email,
      name: updates.name || customer.name,
      updatedAt: new Date(),
    })
    .where(eq(customers.id, customer.id))
    .returning()

  return updatedCustomer
}
