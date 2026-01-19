import { NextResponse } from "next/server";
import { google } from "googleapis";

export async function GET(request: Request) {
	const url = new URL(request.url);
	const redirectTo = url.searchParams.get("redirect") || "/Studio?openProfileModal=true&activeTab=integrations";

	const oauth2Client = new google.auth.OAuth2(
		process.env.YOUTUBE_CLIENT_ID!,
		process.env.YOUTUBE_CLIENT_SECRET!,
		process.env.YOUTUBE_REDIRECT_URI!
	);

	// Encode the redirect URL in state parameter
	const state = Buffer.from(JSON.stringify({ redirectTo })).toString("base64");

	const authUrl = oauth2Client.generateAuthUrl({
		access_type: "offline",
		scope: ["https://www.googleapis.com/auth/youtube.upload", "https://www.googleapis.com/auth/youtube.readonly"],
		prompt: "consent",
		state: state,
	});

	return NextResponse.redirect(authUrl);
}
