import { NextResponse } from "next/server"
import { hash } from "@/lib/password"
import { db } from "@/db"
import { users } from "@/db/schema/users"
import { eq } from "drizzle-orm"
import { createFreeSubscription } from "@/lib/subscription-helpers"

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json()

    // Validate input
    if (!email || !password) {
      return NextResponse.json({ message: "Missing required fields" }, { status: 400 })
    }

    // Check if user already exists
    const response = await db.select().from(users).where(eq(users.email, email));

    // If response contains a record means user exists
    if (response.length > 0) {
      return NextResponse.json({ message: "User with this email already exists" }, { status: 409 })
    }

    // Hash the password
    const hashedPassword = await hash(password)

    // Create the user
    const newUser = await db.insert(users).values({
      email,
      password: hashedPassword,
    }).returning()

    if (!newUser || newUser.length === 0) {
      return NextResponse.json({ message: "Failed to create user" }, { status: 500 })
    }

    // Automatically create free subscription for new user
    try {
      await createFreeSubscription(newUser[0].id)
      console.log(`[Registration] Created free subscription for new user ${newUser[0].id}`)
    } catch (subscriptionError) {
      console.error("Error creating free subscription:", subscriptionError)
      // Don't fail registration if subscription creation fails
      // User can still use the app, and we can retry subscription creation later
    }

    return NextResponse.json({
      message: "User created successfully",
      userId: newUser[0].id
    }, { status: 201 })
  } catch (error) {
    console.error("Error creating user:", error)
    return NextResponse.json({ message: "Something went wrong" }, { status: 500 })
  }
}

