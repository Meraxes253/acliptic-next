// LAUNCH PLUGIN CODE

import { auth } from '@/auth';
import { NextRequest, NextResponse } from 'next/server';
// Import the twitch-m3u8 package
import { db } from "@/db";
import { socialMediaHandle, users } from "@/db/schema/users";
import { eq } from "drizzle-orm";

// Define the user presets type
interface UserPresets {
  captions?: boolean | string
  // Add other preset properties as needed
}

// Define the user type with presets
interface UserWithPresets {
  id: string
  username?: string
  presets?: UserPresets | null
  // Add other user properties as needed
}

export async function POST(req: NextRequest) {
    
    try {

        // input parameter to determine if launch plugin for live stream or not
        const { twitch_url, auto_upload, stream_id } = await req.json()

        // Get authenticated user
        const session = await auth();

        console.log(`ID THIS BRO :${session}`);

        let user_id = session?.user?.id || "";

        if (!user_id) {
            return NextResponse.json({
                success: false,
                message: `User not authenticated!`
            }, { status: 401 });
        }

        // Get user details from database
        const result = await db.select().from(users).where(eq(users.id, user_id));
        
        if (!result.length) {
            return NextResponse.json({
                success: false,
                message: `User not found in database!`
            }, { status: 404 });
        }


        const platforms: string[] = []
        if (auto_upload) {
        // query db to get platforms with connected accounts
        const platformResult = await db
            .select({ platform_id: socialMediaHandle.platform_id })
            .from(socialMediaHandle)
            .where(eq(socialMediaHandle.user_id, user_id))

        // only if user has social media accounts connected
        if (platformResult.length > 0) {
            const id_to_platform: Record<number, string> = {
            703: "instagram",
            701: "youtube",
            }
            platformResult.forEach(({ platform_id }) => {
            const platform = id_to_platform[platform_id]
            if (platform) {
                platforms.push(platform)
            }
            })
        }
        }

        // Cast the user result to our typed interface and handle presets safely
        const user = result[0] as UserWithPresets
        const captions = user?.presets?.captions || false // Provide a default value

        // for prerecorded video
        const response = await fetch(`${process.env.PY_BACKEND_URL}/${user_id}/twitch/plugin/pre_recorded/launch`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${process.env.PY_BACKEND_JWT_SECRET}`,
            },
            body: JSON.stringify({
                "streamer_id": user_id,
                "stream_id": stream_id,
                "streamer_name": user_id,
                "captions": captions,
                "auto_upload": {
                    "platforms" : platforms
                },
                "streamData" : {
                    "url": twitch_url,
                    "quality": "480p",
                    "resolution": "480"
                }

                })
        });



        return NextResponse.json({
            success: true,
            message: `Started processing Twitch VOD`,
        }, { status: 200 });

    } catch (error: any) {
        console.error('Error launching plugin:', error);

        return NextResponse.json({ 
            error: 'Failed to launch plugin', 
            details: error.message 
        }, { status: 500 });
    }
}