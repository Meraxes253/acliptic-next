import { auth } from "@/auth"
import { type NextRequest, NextResponse } from "next/server"
import twitch from "twitch-m3u8"
import { db } from "@/db"
import { socialMediaHandle, users } from "@/db/schema/users"
import { eq } from "drizzle-orm"

// Define types for better TypeScript support
interface StreamInfo {
  url: string
  quality: string
  resolution: string
}

interface StreamData {
  url: string
  quality: string
  resolution: string
}

interface UserPresets {
  captions?: boolean | string
}

interface UserWithPresets {
  id: string
  username?: string
  presets?: UserPresets | null
}

// Helper function to get 480p stream URL or closest available
async function get_m3u8_twitch_live(channelName: string): Promise<StreamInfo> {
  try {
    const streamResponse = await twitch.getStream(channelName)

    let streams: StreamData[]
    if (Array.isArray(streamResponse)) {
      streams = streamResponse
    } else {
      streams = [streamResponse as StreamData]
    }

    if (streams.length === 0) {
      throw new Error("Streamer is not live")
    }

    let streamUrl = null
    let targetStream = streams.find(
      (stream) =>
        stream.quality?.includes("480p") || stream.resolution === "854x480" || stream.resolution === "852x480",
    )

    if (!targetStream) {
      const sortedStreams = streams
        .filter((stream) => stream.resolution)
        .map((stream) => {
          const height = Number.parseInt(stream.resolution.split("x")[1])
          return { ...stream, height }
        })
        .sort((a, b) => a.height - b.height)

      targetStream = sortedStreams.find((stream) => stream.height <= 720) || sortedStreams[0]
    }

    if (targetStream) {
      streamUrl = targetStream.url
    } else {
      streamUrl = streams[0].url
    }

    return {
      url: streamUrl,
      quality: targetStream ? targetStream.quality : streams[0].quality,
      resolution: targetStream ? targetStream.resolution : streams[0].resolution,
    }
  } catch (error: any) {
    throw new Error(`Failed to get Twitch stream URL: ${error.message}`)
  }
}

export async function POST(req: NextRequest) {
  try {
    const { auto_upload, stream_id, twitch_username } = await req.json()

    const session = await auth()
    console.log(`auto_upload :${auto_upload}`)
    console.log(`stream_id :${stream_id}`)
    console.log(`twitch_username :${twitch_username}`)

    const user_id = session?.user?.id || ""

    if (!user_id) {
      return NextResponse.json(
        {
          success: false,
          message: `User not authenticated!`,
        },
        { status: 401 },
      )
    }

    const result = await db.select().from(users).where(eq(users.id, user_id))

    if (!result.length) {
      return NextResponse.json(
        {
          success: false,
          message: `User not found in database!`,
        },
        { status: 404 },
      )
    }

    const platforms: string[] = []
    if (auto_upload) {
      const platformResult = await db
        .select({ platform_id: socialMediaHandle.platform_id })
        .from(socialMediaHandle)
        .where(eq(socialMediaHandle.user_id, user_id))

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

    console.log("platforms after updating:")
    console.log(platforms)

    const user = result[0] as UserWithPresets
    const username = user?.username
    const captions = user?.presets?.captions || false

    if (!username) {
      return NextResponse.json(
        {
          success: false,
          message: `Username not set for user!`,
        },
        { status: 400 },
      )
    }

    let streamData: StreamInfo
    try {
      streamData = await get_m3u8_twitch_live(twitch_username)
      console.log(`Found stream for ${twitch_username}:`, streamData)
    } catch (streamError: any) {
      return NextResponse.json(
        {
          success: false,
          message: streamError.message,
        },
        { status: 400 },
      )
    }

    if (streamData) {
      // Fix 1: Add proper timeout and error handling
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 30000) // 30 second timeout

      try {
        console.log(`Making request to: ${process.env.PY_BACKEND_URL}/${user_id}/twitch/plugin/launch`)

        const response = await fetch(`${process.env.PY_BACKEND_URL}/${user_id}/twitch/plugin/launch`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${process.env.PY_BACKEND_JWT_SECRET}`,
            // Fix 2: Add ngrok-skip-browser-warning header
            "ngrok-skip-browser-warning": "true",
            // Fix 3: Add user-agent header
            "User-Agent": "NextJS-App/1.0",
          },
          body: JSON.stringify({
            streamer_id: user_id,
            stream_id: stream_id,
            streamer_name: twitch_username,
            captions: captions,
            auto_upload: {
              platforms: platforms,
            },
            streamData: {
              twitch_username: twitch_username,
              url: streamData?.url,
              quality: streamData?.quality,
              resolution: streamData?.resolution,
            },
          }),
          // Fix 4: Add abort signal for timeout
          signal: controller.signal,
        })

        clearTimeout(timeoutId)

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }

        const responseData = await response.json()
        console.log("Backend response:", responseData)
      } catch (fetchError: any) {
        clearTimeout(timeoutId)
        console.error("Fetch error details:", {
          message: fetchError.message,
          name: fetchError.name,
          cause: fetchError.cause,
          stack: fetchError.stack,
        })

        // More specific error handling
        if (fetchError.name === "AbortError") {
          return NextResponse.json(
            {
              success: false,
              message: "Request timed out after 30 seconds",
            },
            { status: 408 },
          )
        }

        if (fetchError.code === "UND_ERR_CONNECT_TIMEOUT") {
          return NextResponse.json(
            {
              success: false,
              message: "Connection timeout - check if Python backend is running and ngrok tunnel is active",
            },
            { status: 503 },
          )
        }

        throw fetchError // Re-throw if it's not a timeout error
      }
    }

    return NextResponse.json(
      {
        success: true,
        message: `Started monitoring for streamer ${username}`,
      },
      { status: 200 },
    )
  } catch (error: any) {
    console.error("Error launching plugin:", error)
    return NextResponse.json(
      {
        error: "Failed to launch plugin",
        details: error.message,
      },
      { status: 500 },
    )
  }
}
