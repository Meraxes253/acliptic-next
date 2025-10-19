"use client"

import type React from "react"

import { useEffect, useState, useRef } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
// import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
// import { Input } from "@/components/ui/input"
import Navigation from "@/components/afterNav"
import PluginDialog from "@/components/Studio/pluginDialog"
import PresetDialog from "@/components/Studio/PresetDialog"
import { LoadingScreen, SkeletonLoader } from "@/components/LoadingSkeletonScreen"
import { toast, Toaster } from "sonner"
import { ChevronRight, Video, Edit, Settings } from "lucide-react"

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
  if (!clipCount) {
    return 0
  }

  if (typeof clipCount === "number") {
    return clipCount
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
  <div className="flex-shrink-0 w-[280px] md:w-[360px] lg:w-[400px] rounded-md p-4 flex flex-col">
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
  <div className="flex gap-4 md:gap-6 overflow-x-auto scrollbar-hide mx-auto max-w-[1400px] mt-8 md:mt-12 mb-12 px-6">
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

  // Carousel drag functionality
  const carouselRef = useRef<HTMLDivElement>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [startX, setStartX] = useState(0)
  const [scrollLeft, setScrollLeft] = useState(0)

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

  // Drag handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    if (!carouselRef.current) return
    setIsDragging(true)
    setStartX(e.pageX - carouselRef.current.offsetLeft)
    setScrollLeft(carouselRef.current.scrollLeft)
    if (carouselRef.current) {
      carouselRef.current.style.cursor = 'grabbing'
    }
  }

  const handleMouseUp = () => {
    setIsDragging(false)
    if (carouselRef.current) {
      carouselRef.current.style.cursor = 'grab'
    }
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !carouselRef.current) return
    e.preventDefault()
    const x = e.pageX - carouselRef.current.offsetLeft
    const walk = (x - startX) * 2
    carouselRef.current.scrollLeft = scrollLeft - walk
  }

  const handleMouseLeave = () => {
    if (isDragging) {
      setIsDragging(false)
      if (carouselRef.current) {
        carouselRef.current.style.cursor = 'grab'
      }
    }
  }

  // Create infinite loop by tripling the array
  const infinitePodcasts = podcasts.length > 0 ? [...podcasts, ...podcasts, ...podcasts] : []

  // Handle infinite scroll
  useEffect(() => {
    const carousel = carouselRef.current
    if (!carousel || podcasts.length === 0) return

    const handleScroll = () => {
      const maxScroll = carousel.scrollWidth - carousel.clientWidth
      const currentScroll = carousel.scrollLeft

      if (currentScroll >= maxScroll - 10) {
        carousel.scrollLeft = maxScroll / 3
      } else if (currentScroll <= 10) {
        carousel.scrollLeft = maxScroll / 3
      }
    }

    carousel.addEventListener('scroll', handleScroll)
    carousel.scrollLeft = carousel.scrollWidth / 3

    return () => carousel.removeEventListener('scroll', handleScroll)
  }, [podcasts])

  const handleScrollRight = () => {
    if (carouselRef.current) {
      carouselRef.current.scrollBy({ left: 400, behavior: 'smooth' })
    }
  }

  if (streamsLoading && !user_id) {
    return <LoadingScreen />
  }

  return (
    <div>
      <Toaster position="top-right" />

      <div className="mt-6 w-full max-w-[1400px] mx-auto flex flex-col items-center">
        <h1 className="text-[182px] text-black denton-condensed leading-none">
          Start Clipping
        </h1>
        <div className="w-full rounded-3xl overflow-hidden relative gradient-silver" style={{ maxWidth: '897px', height: '129px' }}> 
          <div className="w-full h-full flex flex-col relative z-10 px-8 py-6 justify-between">
                                          
                {/* Input field with edit icon */}
                <div className="flex items-center gap-3">
                  <input
                    type="text"
                    value={inputUrl}
                    onChange={(e) => setInputUrl(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Drop the link to the video or drag the video or upload it"
                    className="flex-1 bg-transparent border-none outline-none text-white placeholder-white/60 text-base px-2"
                    disabled={isProcessing}
                  />
                </div>

                {/* Bottom row with category buttons and launch button */}
                <div className="flex items-center justify-between">
                  <div className="flex gap-3 items-center">
                    <button
                      onClick={() => setIsPresetDialogOpen(true)}
                      className="w-10 h-10 rounded-full bg-transparent border border-white/60 backdrop-blur-sm text-white hover:bg-white/20 transition-colors flex items-center justify-center"
                      aria-label="Open presets"
                    >
                      <Settings className="w-5 h-5" />
                    </button>
                    {twitch_username && (
                      <button
                        onClick={() => handlePluginButtonClickTwitchLive(twitch_username, `https://www.twitch.tv/${twitch_username}`)}
                        className="px-6 py-2 rounded-full bg-transparent border border-white/60 backdrop-blur-sm text-white text-sm font-medium hover:bg-[#8956FB] hover:border-[#8956FB] transition-colors whitespace-nowrap"
                        disabled={isProcessing}
                      >
                        Monitor: {twitch_username}
                      </button>
                    )}
                    {youtube_channel_id && (
                      <button
                        onClick={() => handleYouTubeLiveMonitor(youtube_channel_id)}
                        className="px-6 py-2 rounded-full bg-transparent border border-white/60 backdrop-blur-sm text-white text-sm font-medium hover:bg-[#FF0000] hover:border-[#FF0000] transition-colors whitespace-nowrap"
                        disabled={isProcessing}
                      >
                        Monitor: {youtube_channel_id}
                      </button>
                    )}
                  </div>

                  <Button
                    className="px-8 py-2.5 rounded-full bg-white text-gray-900 text-sm font-semibold hover:bg-gray-100 transition-colors whitespace-nowrap"
                    onClick={handleStartClipping}
                    disabled={isProcessing}
                  >
                    {isProcessing ? 'Processing...' : 'Launch'}
                  </Button>
                </div>
          </div>
        </div>
      </div>

      {streamsLoading ? (
        <StreamsLoadingSkeleton />
      ) : streamsError ? (
        <div className="text-center py-10">Failed to load streams. Please try again.</div>
      ) : podcasts.length === 0 ? (
        <div className="text-center py-10">No streams found. Start streaming to see your content here!</div>
      ) : (
        <div className="w-full max-w-[1400px] mx-auto px-6 mt-12 md:mt-16 mb-12">
          <div className="flex items-end justify-between mb-6 md:mb-8 gap-4">
            <h2 className="text-4xl md:text-5xl lg:text-6xl text-gray-900 flex-shrink-0 denton-condensed leading-none">
              Recent Library
            </h2>
          </div>

          <div className="relative flex items-center gap-4">
            <div 
              ref={carouselRef}
              onMouseDown={handleMouseDown}
              onMouseUp={handleMouseUp}
              onMouseMove={handleMouseMove}
              onMouseLeave={handleMouseLeave}
              className="flex gap-4 md:gap-6 overflow-x-auto scrollbar-hide scroll-smooth pb-4 flex-1 cursor-grab select-none"
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
              {infinitePodcasts.map((podcast: Podcast, podcastIndex: number) => (
                <Link
                  key={`${podcast.streamId}-${podcastIndex}`}
                  href={{
                    pathname: `/Studio/stream/${podcast.streamId}/clips`,
                  }}
                  className="flex-shrink-0 w-[280px] md:w-[360px] lg:w-[400px] block group"
                  onDragStart={(e) => e.preventDefault()}
                >
                  <div className="relative w-full rounded-2xl overflow-hidden bg-black shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02] border border-gray-600">
                    {/* Image Container */}
                    <div className="aspect-video w-full relative">
                      <Image
                        src={podcast.thumbnail || "/placeholder.svg"}
                        alt={podcast.title}
                        fill
                        className="object-cover"
                        draggable="false"
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
                        <h3 className="text-white text-base font-semibold mb-1 line-clamp-2 group-hover:text-white transition-colors">
                          {podcast.title}
                        </h3>
                        <p className="text-gray-500 text-sm flex items-center gap-2">
                          {podcast.streamTime}
                        </p>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            <button 
              onClick={handleScrollRight}
              className="flex-shrink-0 w-12 h-12 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center transition-colors mb-20 gradient-silver"
              aria-label="Scroll right"
            >
              <ChevronRight className="w-6 h-6 text-gray-700" />
            </button>
          </div>
        </div>
      )}

      <PluginDialog
        user_id={user_id}
        twitch_username={twitch_username}
        youtube_channel_id={youtube_channel_id}
        isOpen={isPluginDialogOpen}
        onOpenChange={setIsPluginDialogOpen}
      />
      <PresetDialog user_id={user_id} isOpen={isPresetDialogOpen} onOpenChange={setIsPresetDialogOpen} />

      <style jsx>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  )
}