import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/db";
import { users } from "@/db/schema/users";
import { eq } from "drizzle-orm";

export async function GET() {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const user_id = session.user.id;

    const result = await db.select().from(users).where(eq(users.id, user_id));

    if (result.length === 0) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    const userData = {
      id: result[0].id || "",
      email: result[0].email || "",
      username: result[0].username || "",
      phone_number: result[0].phone_number || "",
      image: result[0].image || "",
      youtube_channel_id: result[0].youtube_channel_id || undefined,
      presets: (result[0].presets && Object.keys(result[0].presets).length > 0)
        ? result[0].presets as Record<string, unknown>
        : undefined,
      onBoardingCompleted: result[0].onBoardingCompleted || undefined,
      plugin_active: result[0].plugin_active || undefined,
    };

    return NextResponse.json({ user: userData });
  } catch (error) {
    console.error("Error fetching user data:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
