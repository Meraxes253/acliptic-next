"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import Navigation from "@/components/afterNav"
import PluginDialog from "@/components/Studio/pluginDialog"
import PresetDialog from "@/components/Studio/PresetDialog"
import { LoadingScreen, SkeletonLoader } from "@/components/LoadingSkeletonScreen"
import { toast, Toaster } from "sonner"

// Type definitions
interface ClipCount {
  count: number
}

interface Stream {
  stream_id: string
  user_id: string
  stream_title: string
  stream_link?: string
  stream_start: string
  stream_end?: string
  auto_upload: boolean
  created_at?: string
  updated_at?: string
  thumbnail_url: string | null
  clipCount: ClipCount[] | number | null
}

interface ApiResponse {
  confirmation: string
  data: Stream[]
}

interface Podcast {
  streamId: string
  index: number
  title: string
  thumbnail: string
  streamTime: string
  clipCount: number
  autoUploaded: boolean
}

// URL type enum for better type safety
enum URLType {
  YOUTUBE_VIDEO = "youtube_video",
  TWITCH_LIVE = "twitch_live",
  TWITCH_VOD = "twitch_vod",
  INVALID = "invalid",
}

// Helper function to format stream time
function formatStreamTime(streamDate: Date): string {
  const now = new Date()
  const diffInHours = Math.floor((now.getTime() - streamDate.getTime()) / (1000 * 60 * 60))

  if (diffInHours < 1) {
    return "streamed just now"
  } else if (diffInHours === 1) {
    return "streamed an hour ago"
  } else if (diffInHours < 24) {
    return `streamed ${diffInHours} hours ago`
  } else {
    const days = Math.floor(diffInHours / 24)
    return `streamed ${days} ${days === 1 ? "day" : "days"} ago`
  }
}

// Helper function to extract clip count from various data types
function extractClipCount(clipCount: ClipCount[] | number | null | undefined): number {
  // Handle null or undefined
  if (!clipCount) {
    return 0
  }

  // Handle if it's already a number
  if (typeof clipCount === "number") {
    return clipCount
  }

  // Handle if it's an array
  if (Array.isArray(clipCount)) {
    if (clipCount.length === 0) {
      return 0
    }
    // Sum all counts in the array
    return clipCount.reduce((total, item) => total + (item?.count || 0), 0)
  }

  // Fallback
  return 0
}

function validateAndParseURL(url: string): { type: URLType; data: any } {
  const trimmedUrl = url.trim()

  // YouTube video pattern: https://www.youtube.com/watch?v=VIDEO_ID
  const youtubePattern = /^https:\/\/www\.youtube\.com\/watch\?v=([a-zA-Z0-9_-]+)/
  const youtubeMatch = trimmedUrl.match(youtubePattern)

  if (youtubeMatch) {
    return {
      type: URLType.YOUTUBE_VIDEO,
      data: {
        videoId: youtubeMatch[1],
        url: trimmedUrl,
      },
    }
  }

  // Twitch live stream pattern: https://www.twitch.tv/USERNAME
  const twitchLivePattern = /^https:\/\/www\.twitch\.tv\/([a-zA-Z0-9_]+)$/
  const twitchLiveMatch = trimmedUrl.match(twitchLivePattern)

  if (twitchLiveMatch) {
    return {
      type: URLType.TWITCH_LIVE,
      data: {
        username: twitchLiveMatch[1],
        url: trimmedUrl,
      },
    }
  }

  // Twitch VOD pattern: https://www.twitch.tv/videos/VIDEO_ID
  const twitchVodPattern = /^https:\/\/www\.twitch\.tv\/videos\/(\d+)/
  const twitchVodMatch = trimmedUrl.match(twitchVodPattern)

  if (twitchVodMatch) {
    return {
      type: URLType.TWITCH_VOD,
      data: {
        videoId: twitchVodMatch[1],
        url: trimmedUrl,
      },
    }
  }

  return {
    type: URLType.INVALID,
    data: null,
  }
}

// Skeleton Components
const StreamCardSkeleton = () => (
  <div className="w-full rounded-md p-4 flex flex-col">
    <div className="mb-4">
      <SkeletonLoader className="w-32 h-8 rounded-md" />
    </div>
    <div className="w-full aspect-video relative rounded-md overflow-hidden">
      <SkeletonLoader className="w-full h-full" />
    </div>
    <div className="mt-6 flex flex-col gap-2">
      <SkeletonLoader className="w-3/4 h-6 rounded" />
      <SkeletonLoader className="w-1/2 h-4 rounded" />
    </div>
  </div>
)

const StreamsLoadingSkeleton = () => (
  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-7 mx-auto max-w-[1400px] mt-8 md:mt-12 mb-12 px-4">
    {[...Array(4)].map((_, index) => (
      <StreamCardSkeleton key={index} />
    ))}
  </div>
)

interface StudioPageProps {
  user_id: string
  twitch_username: string
  youtube_channel_id: string
}

// Custom fetcher for POST requests used by plugin state
const postFetcher = (url: string, user_id: string) => {
  return fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ user_id }),
  })
    .then((res) => {
      if (!res.ok) {
        const error = new Error("Failed to fetch plugin state via POST")
        throw error
      }
      return res.json()
    })
    .then((response) => {
      if (response && typeof response.data !== "undefined") {
        return response.data
      }
      console.warn("Response structure might be different than expected:", response)
      return response
    })
    .catch((error) => {
      console.error("Error in postFetcher:", error)
      throw error
    })
}

export default function StudioPage({ user_id, twitch_username, youtube_channel_id }: StudioPageProps) {
  const router = useRouter()
  const [podcasts, setPodcasts] = useState<Podcast[]>([])
  const [pluginState, setPluginState] = useState<{ plugin_active: boolean } | null>(null)

  const [inputUrl, setInputUrl] = useState<string>("")
  const [isProcessing, setIsProcessing] = useState<boolean>(false)

  // Replace useSWR with manual state management
  const [streamsData, setStreamsData] = useState<ApiResponse | null>(null)
  const [streamsError, setStreamsError] = useState<Error | null>(null)
  const [streamsLoading, setStreamsLoading] = useState<boolean>(false)

  // ActionButtons state
  const [isPluginDialogOpen, setIsPluginDialogOpen] = useState(false)
  const [isPresetDialogOpen, setIsPresetDialogOpen] = useState(false)

  // Fetch streams data once on mount
  useEffect(() => {
    if (!user_id) return

    const fetchStreamsData = async () => {
      setStreamsLoading(true)
      setStreamsError(null)
      try {
        const response = await fetch(`/api/streamers/${user_id}/streams`)
        if (!response.ok) {
          throw new Error("Failed to fetch streams data")
        }
        const data = await response.json()
        setStreamsData(data)
      } catch (error) {
        setStreamsError(error as Error)
        toast.error("Failed to load streams", {
          description: "Please try refreshing the page",
          duration: 4000,
        })
      } finally {
        setStreamsLoading(false)
      }
    }

    fetchStreamsData()
  }, [user_id])

  // Fetch plugin state manually
  const fetchPluginState = async () => {
    try {
      const response = await postFetcher("/api/user/plugin_state", user_id)
      setPluginState(response)
    } catch (error) {
      console.error("Error fetching plugin state:", error)
    }
  }

  const handleStartClipping = async () => {
    if (!inputUrl.trim()) {
      toast.error("Please enter a URL", {
        description: "URL field cannot be empty",
        duration: 3000,
      })
      return
    }

    const progressToastId = toast.loading("Starting clipping process...", {
      description: "Please wait while we process your request",
    })

    setIsProcessing(true)

    try {
      const { type, data } = validateAndParseURL(inputUrl)

      console.log("type:", type)
      console.log("data", data)

      switch (type) {
        case URLType.YOUTUBE_VIDEO:
          console.log("pre recorded YT video")
          await handleYouTubeVideo(data.videoId, data.url)
          break

        case URLType.TWITCH_LIVE:
          console.log("twitch live")
          await handlePluginButtonClickTwitchLive(data.username, data.url)
          break

        case URLType.TWITCH_VOD:
          console.log("twitch VOD")
          await handleTwitchVOD(data.videoId, data.url)
          break

        case URLType.INVALID:
        default:
          toast.dismiss(progressToastId)
          toast.error("Invalid URL format", {
            description: "Please enter a valid YouTube video, Twitch live stream, or Twitch VOD URL",
            duration: 4000,
          })
          return
      }

      toast.dismiss(progressToastId)
      // Clear input on successful submission
      setInputUrl("")
    } catch (error) {
      console.error("Error in handleStartClipping:", error)
      toast.dismiss(progressToastId)
      toast.error("An unexpected error occurred", {
        description: "Please try again or check your internet connection",
        duration: 4000,
      })
    } finally {
      setIsProcessing(false)
    }
  }

  const handlePluginButtonClickTwitchLive = async (twitchUsername: string, inputUrl: string) => {
    try {
      // Call the API to create a stream record
      const response1 = await fetch("/api/streams/twitch/live", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          user_id: user_id,
          twitch_username: twitchUsername, // Use parsed username from URL
          auto_upload: true,
        }),
      })

      const responseData1 = await response1.json()
      console.log("res 1: ", responseData1)

      if (!response1.ok || responseData1.confirmation !== "success") {
        throw new Error(responseData1.message || "Failed to create stream record")
      }

      const stream_id = responseData1.data.stream_id

      // Call the API to launch plugin
      const response2 = await fetch("/api/launch-plugin/twitch/live", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          auto_upload: true,
          stream_id: stream_id,
          twitch_username: twitchUsername,
        }),
      })

      const responseData2 = await response2.json()
      console.log(responseData2)

      if (!response2.ok) {
        throw new Error(responseData2.message || "Failed to launch clipping plugin")
      }

      // Show success toast when both API calls complete successfully
      toast.success("Twitch live clipping started successfully!", {
        description: `Started clipping for ${twitchUsername}`,
        duration: 4000,
      })

      window.location.reload()
    } catch (error) {
      const err = error as Error
      console.error("Error starting Twitch live process:", err)
      toast.error("Failed to start Twitch live clipping", {
        description: err.message || "Please try again or check your connection",
        duration: 4000,
      })
      throw error // Re-throw to be caught by handleStartClipping
    }
  }

  const handleYouTubeVideo = async (videoId: string, inputUrl: string) => {
    try {
      // TODO: Implement YouTube video clipping API calls
      console.log("YouTube video handler called with:", { videoId, inputUrl })

      const response1 = await fetch("/api/streams/youtube/pre_recorded", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          user_id: user_id,
          video_url: inputUrl, // Use parsed username from URL
          auto_upload: true,
        }),
      })

      const responseData1 = await response1.json()
      console.log("res 1: ", responseData1)

      if (!response1.ok || responseData1.confirmation !== "success") {
        throw new Error(responseData1.message || "Failed to create stream record")
      }

      const stream_id = responseData1.data.stream_id

      // Call the API to launch plugin
      const response2 = await fetch("/api/launch-plugin/youtube/pre_recorded", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          video_url: inputUrl,
          auto_upload: true,
          stream_id: stream_id,
        }),
      })

      const responseData2 = await response2.json()
      console.log(responseData2)

      if (!response2.ok) {
        throw new Error(responseData2.message || "Failed to launch clipping plugin")
      }

      toast.success("YouTube video clipping started!", {
        description: `Processing video: ${videoId}`,
        duration: 4000,
      })

      window.location.reload()
    } catch (error) {
      const err = error as Error
      console.error("Error starting YouTube video process:", err)
      toast.error("Failed to start YouTube video clipping", {
        description: err.message || "Please try again or check your connection",
        duration: 4000,
      })
      throw error // Re-throw to be caught by handleStartClipping
    }
  }

  const handleTwitchVOD = async (videoId: string, inputUrl: string) => {
    try {
      // TODO: Implement Twitch VOD clipping API calls
      console.log("Twitch VOD handler called with:", { videoId, inputUrl })

      const response1 = await fetch("/api/streams/twitch/pre_recorded", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          user_id: user_id,
          twitch_url: inputUrl, // Use parsed username from URL
          auto_upload: true,
        }),
      })

      const responseData1 = await response1.json()
      console.log("res 1: ", responseData1)

      if (!response1.ok || responseData1.confirmation !== "success") {
        throw new Error(responseData1.message || "Failed to create stream record")
      }

      const stream_id = responseData1.data.stream_id

      // Call the API to launch plugin
      const response2 = await fetch("/api/launch-plugin/twitch/pre_recorded", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          twitch_url: inputUrl,
          auto_upload: true,
          stream_id: stream_id,
        }),
      })

      const responseData2 = await response2.json()
      console.log(responseData2)

      if (!response2.ok) {
        throw new Error(responseData2.message || "Failed to launch clipping plugin")
      }

      toast.success("Twitch VOD clipping started!", {
        description: `Processing VOD: ${videoId}`,
        duration: 4000,
      })

      window.location.reload()
    } catch (error) {
      const err = error as Error
      console.error("Error starting Twitch VOD process:", err)
      toast.error("Failed to start Twitch VOD clipping", {
        description: err.message || "Please try again or check your connection",
        duration: 4000,
      })
      throw error // Re-throw to be caught by handleStartClipping
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleStartClipping()
    }
  }

  // Process streams data when it changes
  useEffect(() => {
    if (streamsData?.data) {
      const streams = streamsData.data

      // Transform streams data to podcasts format
      const formattedPodcasts: Podcast[] = streams.map((stream: Stream, index: number) => ({
        streamId: stream.stream_id,
        index: index + 1,
        title: stream.stream_title || "Untitled Stream",
        thumbnail: stream.thumbnail_url || "/podcast-thumbnail.png",
        streamTime: formatStreamTime(new Date(stream?.created_at || "")),
        clipCount: extractClipCount(stream.clipCount), // Fixed: Now handles all data types
        autoUploaded: stream.auto_upload || false,
      }))

      setPodcasts(formattedPodcasts)
    }
  }, [streamsData])

  // Fetch plugin state on component mount
  useEffect(() => {
    if (user_id) {
      fetchPluginState()
    }
  }, [user_id])

  // Show loading state while initializing
  if (streamsLoading && !user_id) {
    return <LoadingScreen />
  }

  return (
    <div>
      <Navigation />
      <Toaster position="top-right" />

      <div className="mt-2 w-full max-w-[1400px] mx-auto px-4">
        <div className="w-full h-[250px] rounded-md overflow-hidden relative">
          <Image
            src="/newDash2.png"
            alt="Studio background"
            fill
            className="object-cover rounded-md z-0"
            priority={true}
          />
          <div className="w-full h-full flex flex-col justify-between relative z-10">
            <div className="flex-1 p-8 flex items-start">
              <h1 className="text-3xl sm:text-5xl text-black" style={{ letterSpacing: "-0.04em", lineHeight: "92.7%" }}>
                What are you streaming <br /> today?
              </h1>
            </div>
            <div className="w-full px-8 pb-8 flex justify-between items-end">
              <div className="flex-1"></div>
              <div className="flex justify-end w-full max-w-[1400px]">
                <div className="flex flex-col sm:flex-row justify-between w-full max-w-[1400px] gap-4">
                  <div className="flex justify-start flex-1">
                    <div className="flex flex-col sm:flex-row gap-2 w-full sm:max-w-[500px]">
                      <Input
                        type="url"
                        placeholder="Enter YouTube video, Twitch live, or Twitch VOD URL..."
                        value={inputUrl}
                        onChange={(e) => setInputUrl(e.target.value)}
                        onKeyPress={handleKeyPress}
                        className="h-[42px] rounded-[12px] border-2 border-gray-300 focus:border-emerald-500 transition-colors duration-200 bg-white"
                        disabled={isProcessing}
                      />
                      <Button
                        className="h-[42px] w-full sm:w-[140px] rounded-[12px] flex justify-center items-center transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 border-2 hover:text-white bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 border-emerald-500 text-white shadow-emerald-500/30"
                        variant="ghost"
                        onClick={handleStartClipping}
                        disabled={isProcessing}
                      >
                        <div className="flex items-center gap-2">
                          {isProcessing ? (
                            <>
                              <div className="w-2 h-2 bg-emerald-300 rounded-full animate-pulse"></div>
                              <p className="text-[14px] font-semibold tracking-wide">PROCESSING...</p>
                            </>
                          ) : (
                            <>
                              <div className="w-2 h-2 bg-emerald-300 rounded-full"></div>
                              <p className="text-[14px] font-semibold tracking-wide">START CLIPPING</p>
                            </>
                          )}
                        </div>
                      </Button>
                    </div>
                  </div>
                  <div className="flex justify-end">
                    <Button
                      className="h-[42px] w-full sm:w-[140px] rounded-[12px] flex justify-center items-center bg-gradient-to-r from-gray-800 to-gray-900 hover:from-gray-700 hover:to-gray-800 border-2 border-gray-600 text-white hover:text-white transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 shadow-gray-500/20"
                      variant="ghost"
                      onClick={() => setIsPresetDialogOpen(true)}
                    >
                      <div className="flex items-center gap-2">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4"
                          />
                        </svg>
                        <p className="text-[14px] font-semibold tracking-wide">PRESETS</p>
                      </div>
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {streamsLoading ? (
        <StreamsLoadingSkeleton />
      ) : streamsError ? (
        <div className="text-center py-10 hel-font">Failed to load streams. Please try again.</div>
      ) : podcasts.length === 0 ? (
        <div className="text-center py-10 hel-font">No streams found. Start streaming to see your content here!</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-7 mx-auto max-w-[1400px] mt-8 md:mt-12 mb-12 px-4">
          {podcasts.map((podcast: Podcast, podcastIndex: number) => (
            <Link
              key={podcastIndex}
              href={{
                pathname: `/Studio/stream/${podcast.streamId}/clips`,
              }}
              className="block w-full"
            >
              <div className="w-full rounded-md p-4 flex flex-col">
                {podcast.autoUploaded && (
                  <div className="mb-4">
                    <Label className="inline-block bg-black text-white px-6 py-3 dark:bg-gray-800 rounded hel-font">
                      Auto Uploaded
                    </Label>
                  </div>
                )}
                <div className="w-full aspect-video relative rounded-md overflow-hidden">
                  <Image
                    src={podcast.thumbnail || "/placeholder.svg"}
                    alt="Podcast thumbnail"
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="mt-6 flex flex-col gap-2">
                  <h2 className="text-lg md:text-2xl truncate">{podcast.title}</h2>
                  <p className="text-gray-600 text-base hel-font flex items-center gap-2">
                    <span>{podcast.streamTime}</span>
                    <span>•</span>
                    <span>{podcast.clipCount} clips</span>
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* Dialog components */}
      <PluginDialog
        user_id={user_id}
        twitch_username={twitch_username}
        youtube_channel_id={youtube_channel_id}
        isOpen={isPluginDialogOpen}
        onOpenChange={setIsPluginDialogOpen}
      />
      <PresetDialog user_id={user_id} isOpen={isPresetDialogOpen} onOpenChange={setIsPresetDialogOpen} />
    </div>
  )
}
