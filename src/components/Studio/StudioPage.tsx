"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation";
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import PluginDialog from "@/components/Studio/pluginDialog"
import PresetDialog from "@/components/Studio/PresetDialog"
import { LoadingScreen, SkeletonLoader } from "@/components/LoadingSkeletonScreen"
import { toast, Toaster } from "sonner"
import { Settings, Search, ArrowUp } from "lucide-react"

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
  clipCount: ClipCount[] | number | string | null
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
function extractClipCount(clipCount: ClipCount[] | number | string | null | undefined): number {
  if (clipCount === null || clipCount === undefined) {
    return 0
  }

  if (typeof clipCount === "number") {
    return clipCount
  }

  // Handle string type (PostgreSQL bigint comes as string)
  if (typeof clipCount === "string") {
    return parseInt(clipCount, 10) || 0
  }

  if (Array.isArray(clipCount)) {
    if (clipCount.length === 0) {
      return 0
    }
    return clipCount.reduce((total, item) => total + (item?.count || 0), 0)
  }

  return 0
}

function validateAndParseURL(url: string): { type: URLType; data: any } {
  const trimmedUrl = url.trim()

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
  <div className="relative w-full rounded-2xl overflow-hidden bg-black shadow-lg border border-gray-600">
    {/* Image Container */}
    <div className="aspect-video w-full relative">
      <SkeletonLoader className="w-full h-full" />

      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent"></div>

      {/* Top Labels */}
      <div className="absolute top-3 left-3 flex flex-wrap gap-2">
        <SkeletonLoader className="w-16 h-6 rounded-full" />
        <SkeletonLoader className="w-24 h-6 rounded-full" />
      </div>

      {/* Bottom Content */}
      <div className="absolute bottom-0 left-0 right-0 p-4">
        <SkeletonLoader className="w-3/4 h-5 rounded mb-2" />
        <SkeletonLoader className="w-1/2 h-4 rounded" />
      </div>
    </div>
  </div>
)

interface StudioPageProps {
  user_id: string
  twitch_username: string
  youtube_channel_id: string
}

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

  const [streamsData, setStreamsData] = useState<ApiResponse | null>(null)
  const [streamsError, setStreamsError] = useState<Error | null>(null)
  const [streamsLoading, setStreamsLoading] = useState<boolean>(false)

  const [isPluginDialogOpen, setIsPluginDialogOpen] = useState(false)
  const [isPresetDialogOpen, setIsPresetDialogOpen] = useState(false)
  const [isPresetRequired, setIsPresetRequired] = useState(false)
  const [hasPresets, setHasPresets] = useState<boolean | null>(null) // null = not checked yet
  const [pendingLaunchAction, setPendingLaunchAction] = useState<(() => void) | null>(null)

  // Library pagination and filtering
  const [searchTerm, setSearchTerm] = useState('')
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('')
  const [sortBy, setSortBy] = useState('date')
  const [sortOrder, setSortOrder] = useState('desc')
  const [offset, setOffset] = useState(0)
  const [hasMore, setHasMore] = useState(true)
  const [totalStreams, setTotalStreams] = useState(0)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const STREAMS_PER_PAGE = 10

  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm)
    }, 300) // 300ms delay

    return () => clearTimeout(timer)
  }, [searchTerm])

  // Fetch paginated streams with filters
  const fetchStreamsData = async (isLoadMore = false) => {
    if (!user_id) return

    setStreamsLoading(true)
    if (!isLoadMore) {
      setIsRefreshing(true)
    }
    setStreamsError(null)

    try {
      const params = new URLSearchParams({
        limit: STREAMS_PER_PAGE.toString(),
        offset: (isLoadMore ? offset : 0).toString(),
        search: debouncedSearchTerm,
        sortBy: sortBy,
        sortOrder: sortOrder
      })

      const response = await fetch(`/api/streamers/${user_id}/streams?${params}`)
      if (!response.ok) {
        throw new Error("Failed to fetch streams data")
      }
      const data = await response.json()

      // Add minimum delay for skeleton visibility (only when not loading more)
      if (!isLoadMore) {
        await new Promise(resolve => setTimeout(resolve, 300))
      }

      if (isLoadMore) {
        // Append new streams to existing ones
        setStreamsData(prev => ({
          ...data,
          data: [...(prev?.data || []), ...data.data]
        }))
      } else {
        // Replace streams data
        setStreamsData(data)
      }

      setHasMore(data.pagination?.hasMore || false)
      setTotalStreams(data.pagination?.total || 0)
    } catch (error) {
      setStreamsError(error as Error)
      toast.error("Failed to load streams", {
        description: "Please try refreshing the page",
        duration: 4000,
      })
    } finally {
      setStreamsLoading(false)
      setIsRefreshing(false)
    }
  }

  // Initial fetch on mount and when filters change
  useEffect(() => {
    setOffset(0)
    fetchStreamsData(false)
  }, [user_id, debouncedSearchTerm, sortBy, sortOrder])

  // Handle load more
  const handleLoadMore = () => {
    const newOffset = offset + STREAMS_PER_PAGE
    setOffset(newOffset)
    fetchStreamsData(true)
  }

  const fetchPluginState = async () => {
    try {
      const response = await postFetcher("/api/user/plugin_state", user_id)
      setPluginState(response)
    } catch (error) {
      console.error("Error fetching plugin state:", error)
    }
  }

  // Check if user has configured presets
  const checkUserPresets = async () => {
    try {
      const response = await fetch("/api/user/getPresets", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          user_id: user_id,
        }),
      })

      if (!response.ok) {
        setHasPresets(false)
        return false
      }

      const result = await response.json()
      const userPresets = result.data

      // Check if user has any presets configured (specifically check for captions)
      const presetsExist = userPresets && Object.keys(userPresets).length > 0 && userPresets.captions !== undefined
      setHasPresets(presetsExist)
      return presetsExist
    } catch (error) {
      console.error("Error checking user presets:", error)
      setHasPresets(false)
      return false
    }
  }

  // Wrapper to check presets before launching
  const checkPresetsBeforeLaunch = async (launchAction: () => void) => {
    const presetsConfigured = await checkUserPresets()

    if (!presetsConfigured) {
      // Show preset dialog and store the pending action
      setPendingLaunchAction(() => launchAction)
      setIsPresetRequired(true)
      setIsPresetDialogOpen(true)
      toast.info("Please configure your presets first", {
        description: "You can use default presets or customize your own",
        duration: 4000,
      })
    } else {
      // Execute the launch action immediately
      launchAction()
    }
  }

  // Callback when presets are configured
  const handlePresetsConfigured = () => {
    setHasPresets(true)
    setIsPresetRequired(false)

    // Execute pending launch action if exists
    if (pendingLaunchAction) {
      toast.success("Presets configured! Launching plugin...", {
        duration: 2000,
      })
      pendingLaunchAction()
      setPendingLaunchAction(null)
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

    // Check presets before launching
    await checkPresetsBeforeLaunch(async () => {
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
    })
  }

  const handlePluginButtonClickTwitchLive = async (twitchUsername: string, inputUrl: string) => {
    try {
      const response1 = await fetch("/api/streams/twitch/live", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          user_id: user_id,
          twitch_username: twitchUsername,
          auto_upload: true,
        }),
      })

      const responseData1 = await response1.json()
      console.log("res 1: ", responseData1)

      if (!response1.ok || responseData1.confirmation !== "success") {
        throw new Error(responseData1.message || "Failed to create stream record")
      }

      const stream_id = responseData1.data.stream_id

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
      throw error
    }
  }

  const handleYouTubeVideo = async (videoId: string, inputUrl: string) => {
    try {
      console.log("YouTube video handler called with:", { videoId, inputUrl })

      const response1 = await fetch("/api/streams/youtube/pre_recorded", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          user_id: user_id,
          video_url: inputUrl,
          auto_upload: true,
        }),
      })

      const responseData1 = await response1.json()
      console.log("res 1: ", responseData1)

      if (!response1.ok || responseData1.confirmation !== "success") {
        throw new Error(responseData1.message || "Failed to create stream record")
      }

      const stream_id = responseData1.data.stream_id

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
      throw error
    }
  }

  const handleTwitchVOD = async (videoId: string, inputUrl: string) => {
    try {
      console.log("Twitch VOD handler called with:", { videoId, inputUrl })

      const response1 = await fetch("/api/streams/twitch/pre_recorded", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          user_id: user_id,
          twitch_url: inputUrl,
          auto_upload: true,
        }),
      })

      const responseData1 = await response1.json()
      console.log("res 1: ", responseData1)

      if (!response1.ok || responseData1.confirmation !== "success") {
        throw new Error(responseData1.message || "Failed to create stream record")
      }

      const stream_id = responseData1.data.stream_id

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
      throw error
    }
  }

  const handleYouTubeLiveMonitor = async (channelId: string) => {
    const progressToastId = toast.loading("Starting YouTube live monitoring...", {
      description: "Please wait while we start monitoring your channel",
    })

    setIsProcessing(true)

    try {
      const response1 = await fetch("/api/streams/youtube/live", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          user_id: user_id,
          youtube_channel_id: channelId,
          auto_upload: true,
        }),
      })

      const responseData1 = await response1.json()
      console.log("res 1: ", responseData1)

      if (!response1.ok || responseData1.confirmation !== "success") {
        throw new Error(responseData1.message || "Failed to create stream record")
      }

      const stream_id = responseData1.data.stream_id

      const response2 = await fetch("/api/launch-plugin/youtube/live", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          auto_upload: true,
          stream_id: stream_id,
          youtube_channel_id: channelId,
        }),
      })

      const responseData2 = await response2.json()
      console.log(responseData2)

      if (!response2.ok) {
        throw new Error(responseData2.message || "Failed to launch clipping plugin")
      }

      toast.dismiss(progressToastId)
      toast.success("YouTube live monitoring started successfully!", {
        description: `Monitoring channel: ${channelId}`,
        duration: 4000,
      })

      window.location.reload()
    } catch (error) {
      const err = error as Error
      console.error("Error starting YouTube live monitoring:", err)
      toast.dismiss(progressToastId)
      toast.error("Failed to start YouTube live monitoring", {
        description: err.message || "Please try again or check your connection",
        duration: 4000,
      })
      setIsProcessing(false)
      throw error
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

      const formattedPodcasts: Podcast[] = streams.map((stream: Stream, index: number) => ({
        streamId: stream.stream_id,
        index: index + 1,
        title: stream.stream_title || "Untitled Stream",
        thumbnail: stream.thumbnail_url || "/podcast-thumbnail.png",
        streamTime: formatStreamTime(new Date(stream?.created_at || "")),
        clipCount: extractClipCount(stream.clipCount),
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

  if (!user_id) {
    return <LoadingScreen />
  }

  return (
    <div>
      <Toaster position="top-right" />

      <div className="mt-8 md:mt-16 w-full max-w-[1400px] mx-auto flex flex-col items-center px-4 relative">
        <h1 className="text-6xl sm:text-7xl md:text-8xl lg:text-9xl xl:text-[182px] text-black dark:text-white denton-condensed leading-none ">
          Start Clipping
        </h1>
        <div className="w-full rounded-2xl md:rounded-3xl overflow-hidden relative gradient-silver -mt-2 sm:-mt-3 md:-mt-4 lg:-mt-5 xl:-mt-7 z-10" style={{ maxWidth: '897px', height: 'auto' }}>
          <div className="w-full h-full flex flex-col relative z-10 px-4 py-3 sm:px-6 sm:py-4 md:px-8 md:py-6 justify-between gap-3 md:gap-0" style={{ minHeight: '100px' }}>

                {/* Input field with edit icon */}
                <div className="flex items-center gap-3">
                  <input
                    type="text"
                    value={inputUrl}
                    onChange={(e) => setInputUrl(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Drop the link to the video or drag the video or upload it"
                    className="flex-1 bg-transparent border-none outline-none text-black placeholder-black/60 text-sm md:text-base px-2"
                    disabled={isProcessing}
                  />
                </div>

                {/* Bottom row with category buttons and launch button */}
                <div className="flex items-center justify-between gap-2">
                  <div className="flex gap-2 md:gap-3 items-center flex-wrap">
                    <button
                      onClick={() => setIsPresetDialogOpen(true)}
                      className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-transparent border border-black/60 backdrop-blur-sm text-black hover:bg-white/20 transition-colors flex items-center justify-center shrink-0"
                      aria-label="Open presets"
                    >
                      <Settings className="w-4 h-4 md:w-5 md:h-5" />
                    </button>
                    {twitch_username && (
                      <button
                        onClick={() => checkPresetsBeforeLaunch(() => handlePluginButtonClickTwitchLive(twitch_username, `https://www.twitch.tv/${twitch_username}`))}
                        className="px-3 py-1.5 md:px-6 md:py-2 rounded-full bg-transparent border border-black/60 backdrop-blur-sm text-black text-xs md:text-sm font-medium hover:bg-[#8956FB] hover:border-[#8956FB] hover:text-white transition-colors whitespace-nowrap shrink-0"
                        disabled={isProcessing}
                      >
                        <span className="hidden sm:inline">Monitor: {twitch_username}</span>
                        <span className="sm:hidden">{twitch_username}</span>
                      </button>
                    )}
                    {youtube_channel_id && (
                      <button
                        onClick={() => checkPresetsBeforeLaunch(() => handleYouTubeLiveMonitor(youtube_channel_id))}
                        className="px-3 py-1.5 md:px-6 md:py-2 rounded-full bg-transparent border border-black/60 backdrop-blur-sm text-black text-xs md:text-sm font-medium hover:bg-[#FF0000] hover:border-[#FF0000] hover:text-white transition-colors whitespace-nowrap shrink-0"
                        disabled={isProcessing}
                      >
                        <span className="hidden sm:inline">Monitor: {youtube_channel_id}</span>
                        <span className="sm:hidden">{youtube_channel_id}</span>
                      </button>
                    )}
                  </div>

                  <Button
                    className="px-3 py-1.5 md:px-8 md:py-2.5 rounded-full bg-white text-gray-900 font-semibold hover:bg-gray-100 transition-colors shrink-0 flex items-center justify-center"
                    onClick={handleStartClipping}
                    disabled={isProcessing}
                  >
                    {isProcessing ? (
                      <span className="text-xs md:text-sm">Processing...</span>
                    ) : (
                      <>
                        <span className="hidden md:inline text-sm">Launch</span>
                        <ArrowUp className="w-4 h-4 md:hidden" />
                      </>
                    )}
                  </Button>
                </div>
          </div>
        </div>
      </div>

      {/* Full Library Section */}
      <div className="w-full max-w-[1400px] mx-auto px-4 md:px-6 mt-8 md:mt-12 lg:mt-16 mb-12">
        {/* Header with title, search, and sort */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 md:mb-8">
          <h2 className="text-4xl md:text-5xl lg:text-6xl denton-condensed leading-none">
            Library
          </h2>

          <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
            {/* Search Bar */}
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-black" />
              <Input
                type="text"
                placeholder="Search streams..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 h-10 md:h-11 gradient-silver border border-black text-black rounded-lg dark:placeholder-black"
              />
            </div>

            {/* Sort Dropdown */}
            <Select value={`${sortBy}-${sortOrder}`} onValueChange={(value) => {
              const [newSortBy, newSortOrder] = value.split('-')
              setSortBy(newSortBy)
              setSortOrder(newSortOrder)
            }}>
              <SelectTrigger className="w-full sm:w-48 h-10 md:h-11 gradient-silver border border-black rounded-lg focus:ring-0 dark:text-black ">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent className="gradient-silver">
                <SelectItem value="date-desc">Newest First</SelectItem>
                <SelectItem value="date-asc">Oldest First</SelectItem>
                <SelectItem value="title-asc">Title (A-Z)</SelectItem>
                <SelectItem value="title-desc">Title (Z-A)</SelectItem>
                <SelectItem value="clipCount-desc">Most Clips</SelectItem>
                <SelectItem value="clipCount-asc">Least Clips</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Error state */}
        {streamsError ? (
          <div className="text-center py-12 md:py-16">
            <p className="text-gray-600 text-base md:text-lg">Failed to load streams. Please try again.</p>
          </div>
        ) : isRefreshing ? (
          /* Skeleton loading state when refreshing (filter/search change) */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {[...Array(6)].map((_, index) => (
              <StreamCardSkeleton key={index} />
            ))}
          </div>
        ) : podcasts.length === 0 ? (
          <div className="text-center py-12 md:py-16">
            <p className="text-gray-600 text-base md:text-lg">No streams found. Start streaming to see your content here!</p>
          </div>
        ) : (
          <>
            {/* Streams Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 transition-opacity duration-200">
              {podcasts.map((podcast: Podcast) => (
                <Link
                  key={podcast.streamId}
                  href={`/Studio/stream/${podcast.streamId}/clips`}
                  className="group block"
                >
                  <div className="relative rounded-2xl overflow-hidden bg-black shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02] border border-gray-600">
                    {/* Image Container */}
                    <div className="aspect-video w-full relative">
                      <Image
                        src={podcast.thumbnail || "/placeholder.svg"}
                        alt={podcast.title}
                        fill
                        className="object-cover"
                      />
                      {/* Gradient Overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent"></div>

                      {/* Top Labels */}
                      <div className="absolute top-3 left-3 flex flex-wrap gap-2">
                        <span className="bg-black/80 backdrop-blur-sm text-white text-xs px-2.5 py-1.5 rounded-full font-medium border border-gray-600">
                          {podcast.clipCount} clips
                        </span>
                        {podcast.autoUploaded && (
                          <span className="bg-emerald-600 text-white text-xs px-2.5 py-1.5 rounded-full font-medium">
                            Auto Uploaded
                          </span>
                        )}
                      </div>

                      {/* Bottom Content */}
                      <div className="absolute bottom-0 left-0 right-0 p-4">
                        <h3 className="text-white text-base font-semibold mb-1 line-clamp-2">
                          {podcast.title}
                        </h3>
                        <p className="text-gray-400 text-sm">
                          {podcast.streamTime}
                        </p>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            {/* Load More Button */}
            {hasMore && (
              <div className="flex justify-center mt-6 md:mt-8">
                <Button
                  onClick={handleLoadMore}
                  disabled={streamsLoading}
                  className="px-6 py-2 md:px-8 md:py-3 bg-gray-900 text-white rounded-full hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {streamsLoading ? 'Loading...' : `Load More (${podcasts.length} of ${totalStreams})`}
                </Button>
              </div>
            )}
          </>
        )}
      </div>

      <PluginDialog
        user_id={user_id}
        twitch_username={twitch_username}
        youtube_channel_id={youtube_channel_id}
        isOpen={isPluginDialogOpen}
        onOpenChange={setIsPluginDialogOpen}
      />
      <PresetDialog
        user_id={user_id}
        isOpen={isPresetDialogOpen}
        onOpenChange={(open) => {
          setIsPresetDialogOpen(open)
          if (!open) {
            setIsPresetRequired(false)
          }
        }}
        isRequired={isPresetRequired}
        onPresetsConfigured={handlePresetsConfigured}
      />

      <style jsx>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  )
}