// import { auth } from "@/auth";
// import ProfilePage from "@/components/Profile/ProfilePage";
// import { db } from "@/db";
// import { users } from "@/db/schema/users";
// import { eq } from "drizzle-orm";

// export default async function Profile() {
//   const session = await auth();
//   const user_id = session?.user?.id || ""

//   // Initialize variables properly
//   let email = ""
//   let username = ""
//   let phone_number = ""
//   let image = ""
//   let youtube_channel_id = ""
//   if (session?.user) {
//     const result = await db.select().from(users).where(eq(users.id, user_id))
//     if (result.length > 0) {
//       email = result[0]?.email || ""
//       username = result[0]?.username || ""
//       phone_number = result[0]?.phone_number || ""
//       image = result[0]?.image || ""
//       youtube_channel_id = result[0]?.youtube_channel_id || ""
//     }
//   }
  
//   return(
  
//     <ProfilePage user_id={user_id} email={email} username={username} phone_number={phone_number} image={image} youtube_channel_id={youtube_channel_id}/>
//   )

// }