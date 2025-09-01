// app/api/videos/route.ts
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/db";
import { and, count, eq, gte, lte, sql } from "drizzle-orm";
import { plans, stream, subscriptions, users } from "@/db/schema/users";
import axios from "axios";

// Define response types for better type safety
interface TwitchTokenResponse {
    access_token: string;
    expires_in: number;
}

interface TwitchVideoData {
    id: string;
    title: string;
    thumbnail_url: string;
    created_at: string;
    duration: string;
    view_count: number;
    language: string;
    type: string;
    url: string;
}

interface VideoResponseData {
    isValid: boolean;
    videoData: TwitchVideoData | null;
}

interface StreamRecord {
    id?: string;
    user_id: string;
    stream_title: string;
    stream_link: string;
    stream_start: Date;
    auto_upload: boolean;
    thumbnail_url: string | null;
    source: string;
    is_live: boolean;
    active : boolean;
}

// Twitch API credentials
const TWITCH_CLIENT_ID = process.env.TWITCH_CLIENT_ID;
const TWITCH_CLIENT_SECRET = process.env.TWITCH_CLIENT_SECRET;

// Auth token caching
let authToken: string | null = null;
let tokenExpiry: number | null = null;

// Input schema validation for pre-recorded videos
const CreateVideoStreamRequestSchema = z.object({
    user_id: z
        .string({
            required_error: "User ID is required",
            invalid_type_error: "User ID must be a string",
        })
        .trim()
        .uuid("User ID must be a valid UUID"),
    twitch_url: z
        .string({
            required_error: "Twitch video URL is required",
            invalid_type_error: "Twitch video URL must be a string",
        })
        .trim()
        .url("Must be a valid URL")
        .refine(
            (url) => url.includes("twitch.tv/videos/"),
            "Must be a valid Twitch video URL (e.g., https://www.twitch.tv/videos/123456)"
        ),
    auto_upload: z.boolean().default(false),
});

// Infer the type from the schema for type safety
type CreateVideoStreamRequest = z.infer<typeof CreateVideoStreamRequestSchema>;

// Extract video ID from Twitch URL
function extractVideoId(twitchUrl: string): string | null {
    try {
        const url = new URL(twitchUrl);
        const pathParts = url.pathname.split('/');
        const videosIndex = pathParts.indexOf('videos');
        
        if (videosIndex !== -1 && pathParts[videosIndex + 1]) {
            return pathParts[videosIndex + 1];
        }
        
        return null;
    } catch (error) {
        console.error('Error parsing Twitch URL:', error);
        return null;
    }
}

// Get Twitch auth token with retry logic
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
                null,
                {
                    timeout: 15000,
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

// Fetch Twitch video data by video ID
async function fetchTwitchVideoData(
    videoId: string,
    maxRetries = 3
): Promise<VideoResponseData> {
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
            const timeoutId = setTimeout(() => controller.abort(), 10000);

            // Get video data by video ID
            const videoResponse = await fetch(
                `https://api.twitch.tv/helix/videos?id=${videoId}`,
                {
                    headers: {
                        "Client-ID": TWITCH_CLIENT_ID,
                        Authorization: `Bearer ${token}`,
                    },
                    signal: controller.signal,
                }
            );

            clearTimeout(timeoutId);

            if (!videoResponse.ok) {
                throw new Error(
                    `Failed to fetch Twitch video data: ${videoResponse.status} ${videoResponse.statusText}`
                );
            }

            const videoData = await videoResponse.json();

            // Check if video exists
            if (!videoData.data || videoData.data.length === 0) {
                return {
                    isValid: false,
                    videoData: null,
                };
            }

            const video = videoData.data[0];

            // Format thumbnail URL (replace template variables)
            const thumbnailUrl = video.thumbnail_url
                .replace("%{width}", "640")
                .replace("%{height}", "360");

            return {
                isValid: true,
                videoData: {
                    id: video.id,
                    title: video.title,
                    thumbnail_url: thumbnailUrl,
                    created_at: video.created_at,
                    duration: video.duration,
                    view_count: video.view_count,
                    language: video.language,
                    type: video.type,
                    url: video.url,
                },
            };
        } catch (error) {
            lastError = error as Error;
            console.warn(
                `Twitch video data fetch attempt ${retryCount + 1} failed:`,
                error
            );
            retryCount++;

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

    console.error("All retry attempts failed for Twitch video data");
    throw lastError;
}

export async function POST(req: NextRequest): Promise<NextResponse> {
    try {
        const body = await req.json();
        const validatedData = CreateVideoStreamRequestSchema.parse(body);

        const { user_id, twitch_url, auto_upload } = validatedData;

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


        // ===  END OF USAGE LIMIT CHECKING ====================

        // Extract video ID from URL
        const videoId = extractVideoId(twitch_url);
        if (!videoId) {
            return NextResponse.json(
                {
                    confirmation: "fail",
                    error: "Invalid Twitch URL",
                    message: "Could not extract video ID from the provided Twitch URL",
                },
                { status: 400 }
            );
        }

       
        // Step 1: Fetch Twitch video data
        const { isValid, videoData } = await fetchTwitchVideoData(videoId);

        // Return early if video is not valid/found
        if (!isValid || !videoData) {
            return NextResponse.json(
                {
                    confirmation: "fail",
                    error: "Video not found",
                    message: "The specified Twitch video could not be found or is not accessible",
                    data: {
                        video_status: {
                            isValid: false,
                            message: "Video not found or not accessible",
                        },
                    },
                },
                { status: 404 }
            );
        }

        // Step 2: Create the stream record for the pre-recorded video
        const streamRecord: StreamRecord = {
            user_id,
            stream_title: videoData.title,
            stream_link: twitch_url,
            stream_start: new Date(videoData.created_at),
            auto_upload: auto_upload || false,
            thumbnail_url: videoData.thumbnail_url,
            source: 'twitch',
            is_live: false, // This is false for pre-recorded videos
            active: true
        };

        // Insert into database
        const insertedStream = await db
            .insert(stream)
            .values(streamRecord)
            .returning();

        if (!insertedStream || insertedStream.length === 0) {
            return NextResponse.json(
                {
                    confirmation: "fail",
                    error: "Failed to create video stream record",
                    message: "No data returned after insertion",
                },
                { status: 500 }
            );
        }

        return NextResponse.json({
            confirmation: "success",
            message: "Pre-recorded video stream created successfully",
            data: {
                ...insertedStream[0],
                video_info: {
                    duration: videoData.duration,
                    view_count: videoData.view_count,
                    language: videoData.language,
                    type: videoData.type,
                },
                video_status: {
                    isValid: true,
                    isLive: false,
                    message: "Pre-recorded video processed successfully",
                },
            },
        });

    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json(
                {
                    confirmation: "fail",
                    error: "Validation error",
                    message: "Invalid input data",
                    details: error.errors,
                },
                { status: 400 }
            );
        }

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