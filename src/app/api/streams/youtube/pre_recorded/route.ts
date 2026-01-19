// app/api/youtube-videos/route.ts
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/db";
import { and, count, eq, gte, lte, sql } from "drizzle-orm";
import { plans, stream, subscriptions, users } from "@/db/schema/users";

// Define response types for better type safety
interface YouTubeVideoData {
    id: string;
    title: string;
    description: string;
    thumbnail_url: string;
    published_at: string;
    duration: string;
    view_count: string;
    like_count: string;
    channel_title: string;
    channel_id: string;
}

interface VideoResponseData {
    isValid: boolean;
    videoData: YouTubeVideoData | null;
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

// YouTube API credentials
const YOUTUBE_API_KEY = 'AIzaSyDyuySRLYCZEbWg9VUPNJvou2ZJNPSnEpU'

// Input schema validation for YouTube videos
const CreateYouTubeVideoStreamRequestSchema = z.object({
    user_id: z
        .string({
            required_error: "User ID is required",
            invalid_type_error: "User ID must be a string",
        })
        .trim()
        .uuid("User ID must be a valid UUID"),
    video_url: z
        .string({
            required_error: "YouTube video URL is required",
            invalid_type_error: "YouTube video URL must be a string",
        })
        .trim()
        .url("Must be a valid URL")
        .refine(
            (url) => 
                url.includes("youtube.com/watch") || 
                url.includes("youtu.be/") ||
                url.includes("youtube.com/embed/") ||
                url.includes("youtube.com/v/"),
            "Must be a valid YouTube video URL"
        ),
    auto_upload: z.boolean().default(false),
});

// Infer the type from the schema for type safety
type CreateYouTubeVideoStreamRequest = z.infer<typeof CreateYouTubeVideoStreamRequestSchema>;

// Extract video ID from various YouTube URL formats
function extractYouTubeVideoId(url: string): string | null {
    try {
        const urlObj = new URL(url);
        
        // Handle different YouTube URL formats
        if (urlObj.hostname === 'youtu.be') {
            // https://youtu.be/VIDEO_ID
            return urlObj.pathname.slice(1);
        }
        
        if (urlObj.hostname.includes('youtube.com')) {
            // https://www.youtube.com/watch?v=VIDEO_ID
            if (urlObj.pathname === '/watch') {
                return urlObj.searchParams.get('v');
            }
            
            // https://www.youtube.com/embed/VIDEO_ID
            if (urlObj.pathname.startsWith('/embed/')) {
                return urlObj.pathname.split('/embed/')[1];
            }
            
            // https://www.youtube.com/v/VIDEO_ID
            if (urlObj.pathname.startsWith('/v/')) {
                return urlObj.pathname.split('/v/')[1];
            }
        }
        
        return null;
    } catch (error) {
        console.error('Error parsing YouTube URL:', error);
        return null;
    }
}

// Convert ISO 8601 duration to human readable format
function parseDuration(duration: string): string {
    const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
    if (!match) return '0:00';
    
    const hours = parseInt(match[1] || '0');
    const minutes = parseInt(match[2] || '0');
    const seconds = parseInt(match[3] || '0');
    
    if (hours > 0) {
        return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    } else {
        return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    }
}

// Fetch YouTube video data by video ID
async function fetchYouTubeVideoData(
    videoId: string,
    maxRetries = 3
): Promise<VideoResponseData> {
    if (!YOUTUBE_API_KEY) {
        throw new Error("YouTube API key not configured");
    }

    let lastError: Error | null = null;
    let retryCount = 0;

    while (retryCount < maxRetries) {
        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 10000);

            // Get video data from YouTube Data API v3
            const response = await fetch(
                `https://www.googleapis.com/youtube/v3/videos?id=${videoId}&part=snippet,contentDetails,statistics&key=${YOUTUBE_API_KEY}`,
                {
                    signal: controller.signal,
                }
            );

            clearTimeout(timeoutId);

            if (!response.ok) {
                throw new Error(
                    `Failed to fetch YouTube video data: ${response.status} ${response.statusText}`
                );
            }

            const data = await response.json();

            // Check if video exists and is accessible
            if (!data.items || data.items.length === 0) {
                return {
                    isValid: false,
                    videoData: null,
                };
            }

            const video = data.items[0];
            const snippet = video.snippet;
            const contentDetails = video.contentDetails;
            const statistics = video.statistics;

            // Get the highest quality thumbnail available
            const thumbnails = snippet.thumbnails;
            const thumbnailUrl = thumbnails.maxres?.url || 
                                thumbnails.high?.url || 
                                thumbnails.medium?.url || 
                                thumbnails.default?.url || 
                                null;

            return {
                isValid: true,
                videoData: {
                    id: video.id,
                    title: snippet.title,
                    description: snippet.description,
                    thumbnail_url: thumbnailUrl,
                    published_at: snippet.publishedAt,
                    duration: parseDuration(contentDetails.duration),
                    view_count: statistics.viewCount || '0',
                    like_count: statistics.likeCount || '0',
                    channel_title: snippet.channelTitle,
                    channel_id: snippet.channelId,
                },
            };

        } catch (error) {
            lastError = error as Error;
            console.warn(
                `YouTube video data fetch attempt ${retryCount + 1} failed:`,
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

    console.error("All retry attempts failed for YouTube video data");
    throw lastError;
}

export async function POST(req: NextRequest): Promise<NextResponse> {
    try {
        const body = await req.json();
        const validatedData = CreateYouTubeVideoStreamRequestSchema.parse(body);

        const { user_id, video_url, auto_upload } = validatedData;

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
        const videoId = extractYouTubeVideoId(video_url);
        if (!videoId) {
            return NextResponse.json(
                {
                    confirmation: "fail",
                    error: "Invalid YouTube URL",
                    message: "Could not extract video ID from the provided YouTube URL",
                },
                { status: 400 }
            );
        }


        // Step 1: Fetch YouTube video data
        const { isValid, videoData } = await fetchYouTubeVideoData(videoId);

        // Return early if video is not valid/found
        if (!isValid || !videoData) {
            return NextResponse.json(
                {
                    confirmation: "fail",
                    error: "Video not found",
                    message: "The specified YouTube video could not be found, is private, or is not accessible",
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

        // Step 2: Create the stream record for the YouTube video
        const streamRecord: StreamRecord = {
            user_id,
            stream_title: videoData.title,
            stream_link: video_url,
            stream_start: new Date(videoData.published_at),
            auto_upload: auto_upload || false,
            thumbnail_url: videoData.thumbnail_url,
            source: 'youtube',
            is_live: false, // This is false for pre-recorded videos
            active : true
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
                    error: "Failed to create YouTube video stream record",
                    message: "No data returned after insertion",
                },
                { status: 500 }
            );
        }

        return NextResponse.json({
            confirmation: "success",
            message: "YouTube video stream created successfully",
            data: {
                ...insertedStream[0],
                video_info: {
                    duration: videoData.duration,
                    view_count: videoData.view_count,
                    like_count: videoData.like_count,
                    channel_title: videoData.channel_title,
                    channel_id: videoData.channel_id,
                    description: videoData.description.length > 200 
                        ? videoData.description.substring(0, 200) + '...'
                        : videoData.description,
                },
                video_status: {
                    isValid: true,
                    isLive: false,
                    message: "YouTube video processed successfully",
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
