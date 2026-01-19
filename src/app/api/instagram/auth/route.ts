import { NextResponse } from "next/server";

const INSTAGRAM_BUSINESS_AUTH_URL = "https://www.instagram.com/oauth/authorize";

export async function GET(request: Request) {
	const url = new URL(request.url);
	const redirectTo = url.searchParams.get("redirect") || "/Studio?openProfileModal=true&activeTab=integrations";

	// Encode the redirect URL in state parameter
	const state = Buffer.from(JSON.stringify({ redirectTo })).toString("base64");

	const params = new URLSearchParams({
		enable_fb_login: "0",
		force_authentication: "1",
		client_id: process.env.INSTAGRAM_APP_ID!,
		redirect_uri: process.env.INSTAGRAM_REDIRECT_URI!,
		response_type: "code",
		scope: "instagram_business_basic,instagram_business_manage_messages,instagram_business_manage_comments,instagram_business_content_publish,instagram_business_manage_insights",
		state: state,
	});

	return NextResponse.redirect(
		`${INSTAGRAM_BUSINESS_AUTH_URL}?${params.toString()}`
	);
}
