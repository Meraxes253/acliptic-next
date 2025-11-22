import { NextResponse } from "next/server";
import { db } from "@/db";
import { socialMediaHandle } from "@/db/schema/users";
import { eq, and } from "drizzle-orm";
import { auth } from "@/auth";
import { users } from "@/db/schema/users";

//done
export async function GET(request: Request) {
	//check how to get user with ikram
	// TODO: Replace the Supabase auth with your authentication method

	// const supabase = await createClient();
	// const {
	// 	data: { user },
	// 	error,
	// } = await supabase.auth.getUser();

	// if (error || !user) {
	// 	return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	// }

	const session = await auth();
	const user = session?.user;
	if (!user) {
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	}

	// ✅ Get the Authorization Code from URL
	const url = new URL(request.url);
	const code = url.searchParams.get("code");

	if (!code) {
		return NextResponse.json(
			{ error: "Authorization code missing" },
			{ status: 400 }
		);
	}

	// ✅ Exchange Code for Access Token
	const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
		method: "POST",
		headers: { "Content-Type": "application/x-www-form-urlencoded" },
		body: new URLSearchParams({
			code,
			client_id: process.env.YOUTUBE_CLIENT_ID!,
			client_secret: process.env.YOUTUBE_CLIENT_SECRET!,
			redirect_uri: process.env.YOUTUBE_REDIRECT_URI!,
			grant_type: "authorization_code",
		}),
	});

	const tokenData = await tokenResponse.json();
	console.log(tokenData);
	if (!tokenResponse.ok) {
		return NextResponse.json(
			{ error: tokenData.error_description || "Failed to get tokens" },
			{ status: 400 }
		);
	}
	console.log("tokenData", tokenData);
	const {
		access_token,
		refresh_token,
		expires_in,
		// refresh_token_expires_in, TODO: NEED TO DEBUG THIS
	} = tokenData;

	// After getting the access token, fetch the channel info
	const channelResponse = await fetch(
		"https://youtube.googleapis.com/youtube/v3/channels?part=snippet&mine=true",
		{
			headers: {
				Authorization: `Bearer ${access_token}`,
				Accept: "application/json",
			},
		}
	);

	console.log("Channel Response Status:", channelResponse.status);

	if (!channelResponse.ok) {
		const errorText = await channelResponse.text();
		console.error("Channel Response Error:", errorText);
		return NextResponse.json(
			{ error: `Failed to get channel info: ${errorText}` },
			{ status: 400 }
		);
	}

	const channelData = await channelResponse.json();
	console.log("Channel Data:", channelData);

	if (!channelData.items || channelData.items.length === 0) {
		return NextResponse.json(
			{ error: "No channel found for this account" },
			{ status: 400 }
		);
	}

	const channelName = channelData.items[0]?.snippet?.title;
	const channelId = channelData.items[0]?.id;
	console.log("Channel Name:", channelName);
	console.log("Channel ID:", channelId);

	// ✅ Save Tokens to Supabase with channel name
	// const supabaseAdmin = await createClient();

	// const { error: insertError } = await supabaseAdmin
	// 	.from("social_media_handle")
	// 	.upsert([
	// 		{
	// 			user_id: user.id,
	// 			platform_id: 701,
	// 			account_handle: channelName,
	// 			account_user_id: channelId,
	// 			access_token,
	// 			refresh_token,
	// 			token_expires_at: new Date(
	// 				Date.now() + expires_in * 1000
	// 			).toISOString(),
	// 			// refresh_token_expires_at: new Date(
	// 			// 	Date.now() + refresh_token_expires_in * 1000
	// 			// ).toISOString(),
	// 			created_at: new Date().toISOString(),
	// 		},
	// 	]);

	// if (insertError) {
	// 	return NextResponse.json(
	// 		{ error: "Failed to store tokens" },
	// 		{ status: 500 }
	// 	);
	// }

	try {
		// Calculate token expiration time
		const expirationDate = new Date(Date.now() + expires_in * 1000);
		// Calculate refresh token expiration (7 days from now)
		const refreshTokenExpirationDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

		// First check if the record exists
		const existingHandle = await db
			.select()
			.from(socialMediaHandle)
			.where(
				and(
					eq(socialMediaHandle.user_id, user.id),
					eq(socialMediaHandle.platform_id, 701)
				)
			);

		if (existingHandle.length > 0) {
			// Update existing record
			const updatedHandle = await db
				.update(socialMediaHandle)
				.set({
					account_user_id: channelId,
					account_handle: channelName,
					access_token: access_token,
					refresh_token: refresh_token,
					token_expires_at: expirationDate,
					refresh_token_expires_at: refreshTokenExpirationDate,
				})
				.where(
					and(
						eq(socialMediaHandle.user_id, user.id),
						eq(socialMediaHandle.platform_id, 701)
					)
				)
				.returning();

			console.log("Updated YouTube social media handle:", updatedHandle);
		} else {
			// Insert new record
			const newHandle = await db
				.insert(socialMediaHandle)
				.values({
					user_id: user.id,
					platform_id: 701, // YouTube platform ID
					account_user_id: channelId,
					account_handle: channelName,
					access_token: access_token,
					refresh_token: refresh_token,
					token_expires_at: expirationDate,
					refresh_token_expires_at: refreshTokenExpirationDate,
				})
				.returning();

			console.log("Created new YouTube social media handle:", newHandle);
		}
	} catch (error) {
		console.error("Database error:", error);
		return NextResponse.json(
			{
				confirmation: "fail",
				error: "Failed to store tokens",
				message: error instanceof Error ? error.message : String(error),
			},
			{ status: 500 }
		);
	}

	// Check if user has completed onboarding
	// const onboardingComplete = user.user_metadata?.onboarding === true;

	// // If onboarding is not complete, redirect to ProfileSetup
	// if (!onboardingComplete) {
	// 	return NextResponse.redirect(
	// 		new URL("/Signup/ProfileSetup", request.url)
	// 	);
	// }

	// // Otherwise proceed with the original redirect
	// return NextResponse.redirect(new URL("/Profile", request.url));

	//neon way
	try {
		// Query the database directly
		const userResults = await db
			.select({ onBoardingCompleted: users.onBoardingCompleted })
			.from(users)
			.where(eq(users.id, user.id));

		const onBoardingCompleted = userResults[0]?.onBoardingCompleted;

		// If onboarding is not complete, redirect to ProfileSetup
		if (!onBoardingCompleted) {
			return NextResponse.redirect(
				new URL("/Signup/ProfileSetup", request.url)
			);
		}

		// Redirect to Studio with profile modal and integrations tab open
		return NextResponse.redirect(new URL("/Studio?openProfileModal=true&activeTab=integrations", request.url));
	} catch (error) {
		console.error("Error checking onboarding status:", error);
		// Default to onboarding page if there's an error
		return NextResponse.redirect(
			new URL("/Signup/ProfileSetup", request.url)
		);
	}
}
