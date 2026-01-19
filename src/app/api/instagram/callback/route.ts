import { NextResponse } from "next/server";
import { db } from "@/db";
import { socialMediaHandle } from "@/db/schema/users";
import { eq, and } from "drizzle-orm";
import { auth } from "@/auth";
import { users } from "@/db/schema/users";

//done

export async function GET(request: Request) {
	//get the user, ask ikram
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

	// ✅ Extract Authorization Code and state from URL
	const url = new URL(request.url);
	const code = url.searchParams.get("code");
	const state = url.searchParams.get("state");

	// Parse redirect URL from state
	let redirectTo = "/Studio?openProfileModal=true&activeTab=integrations";
	if (state) {
		try {
			const stateData = JSON.parse(Buffer.from(state, "base64").toString());
			if (stateData.redirectTo) {
				redirectTo = stateData.redirectTo;
			}
		} catch (e) {
			console.error("Failed to parse state:", e);
		}
	}

	if (!code) {
		return NextResponse.json(
			{ error: "Authorization code missing" },
			{ status: 400 }
		);
	}

	console.log("before token params");
	// ✅ Exchange Code for Access Token
	const tokenParams = new URLSearchParams({
		client_id: process.env.INSTAGRAM_APP_ID!,
		client_secret: process.env.INSTAGRAM_APP_SECRET!,
		redirect_uri: process.env.INSTAGRAM_REDIRECT_URI!,
		code: code,
		grant_type: "authorization_code",
	});

	console.log("before token response");
	const tokenResponse = await fetch(
		"https://api.instagram.com/oauth/access_token",
		{
			method: "POST",
			body: tokenParams,
		}
	);
	console.log("after token response");
	if (!tokenResponse.ok) {
		const errorText = await tokenResponse.text();
		return NextResponse.json(
			{ error: `Failed to get tokens: ${errorText}` },
			{ status: 400 }
		);
	}

	const tokenData = await tokenResponse.json();
	console.log("after token data", tokenData);
	// Get long-lived access token
	const longLivedTokenParams = new URLSearchParams({
		grant_type: "ig_exchange_token",
		client_secret: process.env.INSTAGRAM_APP_SECRET!,
		access_token: tokenData.access_token,
	});
	console.log("after long lived token params");
	const longLivedTokenResponse = await fetch(
		`https://graph.instagram.com/access_token?${longLivedTokenParams}`
	);

	if (!longLivedTokenResponse.ok) {
		const errorText = await longLivedTokenResponse.text();
		return NextResponse.json(
			{ error: `Failed to get long-lived token: ${errorText}` },
			{ status: 400 }
		);
	}

	const longLivedTokenData = await longLivedTokenResponse.json();
	console.log("longLivedTokenData", longLivedTokenData);

	// Get Instagram User ID
	const accountsUrl = `https://graph.instagram.com/v22.0/me?fields=id&access_token=${longLivedTokenData.access_token}`;
	console.log("Requesting Instagram user ID with URL:", accountsUrl);

	const accountsResponse = await fetch(accountsUrl);
	const accountsData = await accountsResponse.json();
	console.log("Instagram user data:", accountsData);

	if (!accountsResponse.ok || !accountsData.id) {
		const errorText = await accountsResponse.text();
		return NextResponse.json(
			{ error: `Failed to get Instagram user ID: ${errorText}` },
			{ status: 400 }
		);
	}

	const instagramUserId = accountsData.id;
	console.log("Instagram User ID:", instagramUserId);

	// Now get the username using a separate request
	const userInfoUrl = `https://graph.instagram.com/v22.0/${instagramUserId}?fields=username&access_token=${longLivedTokenData.access_token}`;
	const userInfoResponse = await fetch(userInfoUrl);
	const userInfoData = await userInfoResponse.json();
	console.log("Instagram user info:", userInfoData);

	if (!userInfoResponse.ok || !userInfoData.username) {
		const errorText = await userInfoResponse.text();
		return NextResponse.json(
			{ error: `Failed to get Instagram username: ${errorText}` },
			{ status: 400 }
		);
	}

	// Calculate expiration timestamp
	const expirationDate = new Date();
	expirationDate.setSeconds(
		expirationDate.getSeconds() + longLivedTokenData.expires_in
	);

	// Store in Supabase with better error handling

	//need to change this to neon
	// const { error: insertError } = await supabase
	// 	.from("social_media_handle")
	// 	.upsert([
	// 		{
	// 			user_id: user.id,
	// 			platform_id: 703,
	// 			account_user_id: instagramUserId,
	// 			access_token: longLivedTokenData.access_token,
	// 			account_handle: userInfoData.username,
	// 			token_expires_at: expirationDate.toISOString(),
	// 		},
	// 	]);

	// if (insertError) {
	// 	console.error("Supabase insert error:", insertError);
	// 	return NextResponse.json(
	// 		{
	// 			error: "Failed to store tokens",
	// 			details: insertError.message || JSON.stringify(insertError),
	// 		},
	// 		{ status: 500 }
	// 	);
	// }

	//check if the instagram handle for the user exists. if so update or insert
	try {
		// First check if the record exists
		const existingHandle = await db
			.select()
			.from(socialMediaHandle)
			.where(
				and(
					eq(socialMediaHandle.user_id, user.id),
					eq(socialMediaHandle.platform_id, 703)
				)
			)
			.limit(1);

		if (existingHandle.length > 0) {
			// Update existing record
			const updatedHandle = await db
				.update(socialMediaHandle)
				.set({
					account_user_id: instagramUserId,
					access_token: longLivedTokenData.access_token,
					account_handle: userInfoData.username,
					token_expires_at: new Date(expirationDate.toISOString()),
				})
				.where(
					and(
						eq(socialMediaHandle.user_id, user.id),
						eq(socialMediaHandle.platform_id, 703)
					)
				)
				.returning();

			console.log("Updated social media handle:", updatedHandle);
		} else {
			// Insert new record
			const newHandle = await db
				.insert(socialMediaHandle)
				.values({
					user_id: user.id,
					platform_id: 703,
					account_user_id: instagramUserId,
					access_token: longLivedTokenData.access_token,
					account_handle: userInfoData.username,
					token_expires_at: new Date(expirationDate.toISOString()),
				})
				.returning();

			console.log("Created new social media handle:", newHandle);
		}

		// Rest of your success handling
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

	//redirect the user to onboarding or profile based on where they connect their account
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

		// Redirect to the original page or default
		return NextResponse.redirect(new URL(redirectTo, request.url));
	} catch (error) {
		console.error("Error checking onboarding status:", error);
		// Default to onboarding page if there's an error
		return NextResponse.redirect(
			new URL("/Signup/ProfileSetup", request.url)
		);
	}
}
