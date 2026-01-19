import NextAuth from "next-auth"
import { DrizzleAdapter } from "@auth/drizzle-adapter"
import { db } from "./db"
import Twitch from "next-auth/providers/twitch"
import Google from "next-auth/providers/google"
import CredentialsProvider from "next-auth/providers/credentials"
import { compare } from "@/lib/password"
import { eq } from "drizzle-orm"
import { users } from "./db/schema/users"
import { signInSchema } from "./lib/zod"

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: DrizzleAdapter(db),
  providers: [
    Twitch({
      clientId: process.env.TWITCH_CLIENT_ID,
      clientSecret: process.env.TWITCH_CLIENT_SECRET,
    }),
    Google,

    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },

      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Email and password are required.")
        }

        const { email, password } = await signInSchema.parseAsync(credentials)

        // GET USER OBJECT IF EXISTS
        const response = await db.select().from(users).where(eq(users.email, email))
        const user = response[0]

        // CHECK IF USER OR PASSWORD EXISTS , IF NO PASSWORD MEANS SIGNED IN WITH OAUTH
        if (response.length < 1 || !user.password) {
          throw new Error(`Invalid email or password`)
        }

        if (!user?.password) {
          throw new Error("Password not found for user");
        }

        const passwordCorrect = await compare(password, user.password);

        if (!passwordCorrect) {
          throw new Error("Invalid email or password")
        }

        return { id: user.id, email: user.email }
      },
    }),
  ],
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async session({ session, token }) {
      // Add the user ID from the token to the session
      if (token?.sub && session.user) {
        session.user.id = token.sub;
      }
      return session;
    },
    async jwt({ token, user }) {
      // If user object is available (during sign in), add any custom properties
      if (user) {
        token.id = user.id;
      }
      return token;
    },
  },
})
