import { auth } from "@/auth";
import Navigation from "@/components/afterNav";
import StudioPage from "@/components/Studio/StudioPage";
import { db } from "@/db";
import { users } from "@/db/schema/users";
import { eq } from "drizzle-orm";

export default async function Studio() {

  const session = await auth();
  const user_id = session?.user?.id || "" 
 
  let user = null;

  if (session?.user) {
    const result = await db.select().from(users).where(eq(users.id, user_id));
    if (result.length > 0) {
      user = {
        id: result[0].id || "",
        email: result[0].email || "",
        username: result[0].username || "",
        phone_number: result[0].phone_number || "",
        image: result[0].image || "",
        youtube_channel_id: result[0].youtube_channel_id || undefined,
        presets: (result[0].presets && Object.keys(result[0].presets).length > 0) ? result[0].presets as Record<string, unknown> : undefined,
        onBoardingCompleted: result[0].onBoardingCompleted || undefined,
        plugin_active: result[0].plugin_active || undefined,
      };
    } else {
      user = {
        id: "",
        email: "",
        username: "",
        phone_number: "",
        image: "",
      };
    }
  } else {
    user = {
      id: "",
      email: "",
      username: "",
      phone_number: "",
      image: "",
    };
  }

  
  return (
    <>
    <Navigation user={user} />
    <StudioPage user_id={user_id} twitch_username={user.username} youtube_channel_id={user.youtube_channel_id || ""}/>
    </>
  )
}