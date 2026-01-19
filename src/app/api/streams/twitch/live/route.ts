// app/api/streams/route.ts
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/db";
import { and, count, eq, gte, lte, sql } from "drizzle-orm";
import { plans, stream, subscriptions, users } from "@/db/schema/users";
 
// Define response types for better type safety
interface TwitchTokenResponse {
    access_token: string;
    expires_in: number;
}

interface TwitchStreamData {
    title: string;
    thumbnail_url: string;
    started_at: string;
}

interface StreamResponseData {
    isLive: boolean;
    streamData: TwitchStreamData | null;
}

interface StreamRecord {
    id?: string;
    user_id: string;
    stream_title: string;
    stream_link: string;
    stream_start: Date;
    auto_upload: boolean;
    thumbnail_url: string | null;
    source : string;
    is_live : boolean;
    active : boolean;
}

// Twitch API credentials
const TWITCH_CLIENT_ID = process.env.TWITCH_CLIENT_ID;
const TWITCH_CLIENT_SECRET = process.env.TWITCH_CLIENT_SECRET;

// Auth token caching
let authToken: string | null = null;
let tokenExpiry: number | null = null;

// Input schema validation
const CreateStreamRequestSchema = z.object({
    user_id: z
        .string({
            required_error: "Streamer ID is required",
            invalid_type_error: "Streamer ID must be a string",
        })
        .trim()
        .uuid("Streamer ID must be a valid UUID"),
    twitch_username: z
        .string({
            required_error: "Twitch username is required",
            invalid_type_error: "Twitch username must be a string",
        })
        .trim()
        .min(1, "Twitch username must not be empty"),
    auto_upload: z.boolean().default(false),
});

// Infer the type from the schema for type safety
type CreateStreamRequest = z.infer<typeof CreateStreamRequestSchema>;

// Install axios first: npm install axios

import axios from "axios";
import { revalidatePath } from "next/cache";

// Using Axios instead of fetch
async function getTwitchAuthToken(maxRetries = 3): Promise<string> {
    // Return cached token if still valid
    if (authToken && tokenExpiry && Date.now() < tokenExpiry) {
        return authToken;
    }

    if (!TWITCH_CLIENT_ID || !TWITCH_CLIENT_SECRET) {
        throw new Error("Twitch API credentials not configured");
    }

    let lastError: Error | null = null;
    let retryCount = 0;

    while (retryCount < maxRetries) {
        try {
            const response = await axios.post(
                `https://id.twitch.tv/oauth2/token?client_id=${TWITCH_CLIENT_ID}&client_secret=${TWITCH_CLIENT_SECRET}&grant_type=client_credentials`,
                null, // No data to send in body
                {
                    timeout: 15000, // 15 second timeout
                }
            );

            const data = response.data as TwitchTokenResponse;

            // Cache the token with 60 second safety buffer
            authToken = data.access_token;
            tokenExpiry = Date.now() + (data.expires_in - 60) * 1000;

            return authToken;
        } catch (error) {
            lastError = error as Error;
            console.warn(
                `Twitch auth attempt ${retryCount + 1} failed:`,
                error
            );
            retryCount++;

            // Add exponential backoff
            if (retryCount < maxRetries) {
                const backoffTime = Math.min(
                    1000 * Math.pow(2, retryCount),
                    8000
                );
                await new Promise((resolve) =>
                    setTimeout(resolve, backoffTime)
                );
            }
        }
    }

    console.error("All retry attempts failed for Twitch auth token");
    throw lastError;
}

// Similarly enhance fetchTwitchStreamData with retry logic
async function fetchTwitchStreamData(
    username: string,
    maxRetries = 3
): Promise<StreamResponseData> {
    let lastError: Error | null = null;
    let retryCount = 0;

    while (retryCount < maxRetries) {
        try {
            // Get auth token
            const token = await getTwitchAuthToken();

            if (!TWITCH_CLIENT_ID) {
                throw new Error("Twitch Client ID not configured");
            }

            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

            // Get stream data by username
            const streamResponse = await fetch(
                `https://api.twitch.tv/helix/streams?user_login=${username}`,
                {
                    headers: {
                        "Client-ID": TWITCH_CLIENT_ID,
                        Authorization: `Bearer ${token}`,
                    },
                    signal: controller.signal,
                }
            );

            clearTimeout(timeoutId);

            if (!streamResponse.ok) {
                throw new Error(
                    `Failed to fetch Twitch stream data: ${streamResponse.status} ${streamResponse.statusText}`
                );
            }

            const streamData = await streamResponse.json();

            // Check if stream is live
            if (!streamData.data || streamData.data.length === 0) {
                return {
                    isLive: false,
                    streamData: null,
                };
            }

            // Format thumbnail URL (replace template variables)
            const thumbnailUrl = streamData.data[0].thumbnail_url
                .replace("{width}", "640")
                .replace("{height}", "360");

            return {
                isLive: true,
                streamData: {
                    title: streamData.data[0].title,
                    thumbnail_url: thumbnailUrl,
                    started_at: streamData.data[0].started_at,
                },
            };
        } catch (error) {
            lastError = error as Error;
            console.warn(
                `Twitch stream data fetch attempt ${retryCount + 1} failed:`,
                error
            );
            retryCount++;

            // Add exponential backoff
            if (retryCount < maxRetries) {
                const backoffTime = Math.min(
                    1000 * Math.pow(2, retryCount),
                    8000
                );
                await new Promise((resolve) =>
                    setTimeout(resolve, backoffTime)
                );
            }
        }
    }

    console.error("All retry attempts failed for Twitch stream data");
    throw lastError;
}

//update this to drizzle
export async function POST(req: NextRequest): Promise<NextResponse> {
    try {
        const body = await req.json();
        const validatedData = CreateStreamRequestSchema.parse(body);

        const { user_id, twitch_username, auto_upload } = validatedData;

        // === USAGE LIMIT CHECKING ====================

        // get current active streams
        const currentActiveStreamCount = await db.select({
            count: count(),
        }).from(stream).
        where(and(eq(stream.user_id, user_id), eq(stream.active, true)))

        // get no. of streams in current subscription period
        const numStreams  = await db
            .select({ count: count() })
            .from(stream)
            .innerJoin(subscriptions, eq(stream.user_id, subscriptions.userId))
            .where(and(
            eq(stream.user_id, user_id),
            gte(stream.created_at, subscriptions.currentPeriodStart),
            lte(stream.created_at, subscriptions.currentPeriodEnd)
        ));


        // get limits based on users plan
        const limits = await db
            .select({
            maxActiveStreams: plans.max_active_streams,
            maxStreams: plans.max_streams,
            maxTotalSecondsProcessed: plans.max_total_seconds_processed,
            })
            .from(subscriptions)
            .innerJoin(plans, eq(subscriptions.priceId, plans.id))
            .where(eq(subscriptions.userId, user_id));

        
        if (currentActiveStreamCount[0]?.count > limits[0]?.maxActiveStreams!){

            return NextResponse.json(
                {
                    confirmation: "fail",
                    error: "Maximum limit reached for active streams",
                    message:
                        "The user has reached the maximum limit for active streams for their current subscription plan"
                },
                { status: 422 }
            ); // Using 422 Unprocessable Entity for this case
        }

        if (numStreams[0]?.count > limits[0]?.maxStreams! ){

            return NextResponse.json(
                {
                    confirmation: "fail",
                    error: "Maximum limit reached for created streams",
                    message:
                        "The user has reached the maximum limit for created streams for their current subscription plan"
                },
                { status: 422 }
            ); // Using 422 Unprocessable Entity for this case
        }


        // Step 1: Fetch Twitch stream data
        const { isLive, streamData } = await fetchTwitchStreamData(
            twitch_username
        );

        // Return early if stream is not live and client needs to know
        if (!isLive) {
            return NextResponse.json(
                {
                    confirmation: "fail",
                    error: "Stream not available",
                    message:
                        "The specified Twitch stream is not currently live",
                    data: {
                        stream_status: {
                            isLive: false,
                            message: "Stream is not currently live",
                        },
                    },
                },
                { status: 422 }
            ); // Using 422 Unprocessable Entity for this case
        }

        // Step 2: Create the stream record only if live
        // const supabase = await createClient();

        // Prepare stream data
        const streamRecord: StreamRecord = {
            user_id,
            stream_title: streamData?.title || `${twitch_username}'s Stream`,
            stream_link: `https://twitch.tv/${twitch_username}`,
            stream_start: streamData?.started_at
                ? new Date(streamData.started_at)
                : new Date(),
            auto_upload: auto_upload || false,
            thumbnail_url: streamData?.thumbnail_url || null,
            source: 'twitch',
            is_live: true,
            active : true,
        };

        // Insert into database
        // const { data, error: insertError } = await supabase
        // 	.from("stream")
        // 	.insert([streamRecord])
        // 	.select();

        // if (insertError) {
        // 	console.error("Error inserting stream:", insertError);
        // 	return NextResponse.json(
        // 		{
        // 			confirmation: "fail",
        // 			error: "Failed to create stream",
        // 			details: insertError.message,
        // 		},
        // 		{ status: 500 }
        // 	);
        // }

        const insertedStream = await db
            .insert(stream)
            .values(streamRecord)
            .returning();

        if (!insertedStream || insertedStream.length === 0) {
            return NextResponse.json(
                {
                    confirmation: "fail",
                    error: "Failed to create stream",
                    message: "No data returned after insertion",
                },
                { status: 500 }
            );
        }

        // revalidate /studio to show updated UI

        revalidatePath('/Studio')
        
        return NextResponse.json({
            confirmation: "success",
            message: "Live stream created successfully",
            data: {
                ...insertedStream[0],
                stream_status: {
                    isLive: true,
                    message: "Stream is currently live",
                },
            },
        });
        // Step 3: Return success with stream status and data
    } catch (error) {
        console.error("Unexpected error:", error);
        const err = error as Error;
        return NextResponse.json(
            {
                confirmation: "fail",
                error: "An unexpected error occurred",
                message: err.message,
            },
            { status: 500 }
        );
    }
}
