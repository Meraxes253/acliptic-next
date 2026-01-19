'use client'

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { SkeletonLoader } from '@/components/LoadingSkeletonScreen';

interface User {
    id: string;
    email: string;
    username: string;
    phone_number: string;
    image: string;
    youtube_channel_id?: string;
    presets?: Record<string, unknown>;
    onBoardingCompleted?: boolean;
    plugin_active?: boolean;
}

interface Clip {
    clip_id: string;
    clip_title: string | null;
    transcript: string | null;
    content_critique: string | null;
    clip_link: string | null;
    virality_score: string | null;
    created_at: string;
    updated_at: string | null;
    duration?: string;
}

interface LibraryClipsPageComponentProps {
    user: User;
}

// Skeleton Components
const ClipCardSkeleton = () => (
    <div className="w-[236px]">
        {/* Video Container */}
        <div className="relative rounded-3xl overflow-hidden bg-gray-900 w-[236px] h-[431px]">
            <SkeletonLoader className="w-full h-full" />

            {/* Duration Badge */}
            <div className="absolute top-3 right-3">
                <SkeletonLoader className="w-16 h-6 rounded-full" />
            </div>

            {/* Title Overlay */}
            <div className="absolute bottom-3 left-3 right-3">
                <SkeletonLoader className="w-full h-16 rounded-2xl" />
            </div>
        </div>

        {/* Virality Score & Description */}
        <div className="mt-4 flex items-start gap-3 w-[236px]">
            <SkeletonLoader className="w-12 h-12 flex-shrink-0 rounded" />
            <div className="flex-1 pt-1 space-y-2">
                <SkeletonLoader className="h-4 w-full rounded" />
                <SkeletonLoader className="h-4 w-3/4 rounded" />
            </div>
        </div>
    </div>
);

const ClipsLoadingSkeleton = () => (
    <div className="px-4 sm:px-6 md:px-10 lg:px-16 pb-12">
        <div className="flex flex-wrap gap-12 sm:gap-16 lg:gap-20">
            {[...Array(8)].map((_, index) => (
                <ClipCardSkeleton key={index} />
            ))}
        </div>
    </div>
);

// Individual Clip Card Component
function ClipCard({ 
    clip, 
    index, 
    autoUploaded, 
    streamId, 
    streamIndex 
}: { 
    clip: Clip; 
    index: number; 
    autoUploaded: boolean; 
    streamId: string; 
    streamIndex: number;
}) {
    const viralityScore = clip.virality_score ? Math.round(Number(clip.virality_score) * 100) : 0;
    
    // const handleCardClick = () => {
    //     const absoluteUrl = clip.clip_link?.startsWith('/') 
    //         ? `${window.location.origin}${clip.clip_link}` 
    //         : clip.clip_link;
    //     window.location.href = `/Library/stream/${streamIndex}/clips/Editor?videoUrl=${encodeURIComponent(absoluteUrl || '')}&id=${streamId}&clipId=${clip.clip_id}`;
    // };

    return (
        <div
            className="cursor-pointer group"
            // onClick={handleCardClick}
        >
            {/* Video Container */}
            <div className="relative rounded-3xl overflow-hidden bg-gray-900 w-[236px] h-[431px]">
                <video
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    src={clip.clip_link || ''}
                    poster={clip.clip_link || ''}
                />
                
                {/* Duration Badge */}
                <div className="absolute top-3 right-3 gradient-silver backdrop-blur-sm text-gray-900 text-xs px-3 py-1.5 rounded-full font-medium shadow-sm">
                    <span className="text-gray-500">00:00</span> {clip.duration || '00:46'}
                </div>

                {/* Title Overlay */}
                {clip.clip_title && (
                    <div className="absolute bottom-3 left-3 right-3">
                        <div className="gradient-silver backdrop-blur-sm text-gray-900 text-sm px-4 py-3 rounded-2xl font-medium line-clamp-2 shadow-lg">
                            {clip.clip_title}
                        </div>
                    </div>
                )}
            </div>

            {/* Virality Score & Description */}
            <div className="mt-4 flex items-start gap-3 w-[236px]">
                <div className="text-5xl font-serif italic text-gray-900 dark:text-white flex-shrink-0 leading-none">
                    {viralityScore}
                </div>
                <div className="flex-1 pt-1 min-w-0">
                    <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed line-clamp-2 break-words">
                        {clip.content_critique || clip.clip_title || "Untitled Clip"}
                    </p>
                </div>
            </div>
        </div>
    );
}

export default function LibraryClipsPageComponent({ user }: LibraryClipsPageComponentProps) {
    const searchParams = useSearchParams();
    const autoUploaded = searchParams.get('autoUploaded') === 'true';
    const streamId = searchParams.get('id');
    const [clips, setClips] = useState<Clip[]>([]);
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [streamTitle, setStreamTitle] = useState("Ally Renee podcast! 🌹✨");

    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);

            try {
                const response = await fetch(`/api/streams/${streamId}/clips`);
                const data = await response.json();

                if (data.confirmation === "success" && Array.isArray(data.data) && data.data.length > 0) {
                    setClips(data.data);
                } else {
                    // Use dummy clips from public/tmp for testing when no real clips exist
                    const dummyClips: Clip[] = [
                        {
                            clip_id: "dummy-1",
                            clip_title: "What's the first thing Ally Rene notices in a guy?👀",
                            transcript: "This is an amazing gameplay moment where the player made an incredible play that turned the tide of the entire match.",
                            content_critique: "Free will: Exploring uncertainty.",
                            clip_link: "/tmp/youtube-upload-1742263969172.mp4",
                            virality_score: "0.98",
                            duration: "00:35",
                            created_at: new Date().toISOString(),
                            updated_at: null
                        },
                        {
                            clip_id: "dummy-2",
                            clip_title: "Ally Rene rates names men like to call women...😭",
                            transcript: "The streamer's reaction to this unexpected event was absolutely hilarious and genuine, creating a perfect moment for viewers.",
                            content_critique: "Free will: Exploring uncertainty.",
                            clip_link: "/tmp/youtube-upload-1742277570934.mp4",
                            virality_score: "0.82",
                            duration: "00:46",
                            created_at: new Date().toISOString(),
                            updated_at: null
                        },
                        {
                            clip_id: "dummy-3",
                            clip_title: "Ally Rene rates names men like to call women...😭",
                            transcript: "Watch as the player demonstrates incredible mechanical skill and game knowledge in this clutch situation.",
                            content_critique: "Free will: Exploring uncertainty.",
                            clip_link: "/tmp/youtube-upload-1742277603826.mp4",
                            virality_score: "0.81",
                            duration: "01:00",
                            created_at: new Date().toISOString(),
                            updated_at: null
                        },
                        {
                            clip_id: "dummy-4",
                            clip_title: "Ally Rene rates names men like to call women...😭",
                            transcript: "A heartwarming moment of interaction between the streamer and their community that shows the strong bond they've built.",
                            content_critique: "Free will: Exploring uncertainty.",
                            clip_link: "/tmp/youtube-upload-1742370571002.mp4",
                            virality_score: "0.79",
                            duration: "00:58",
                            created_at: new Date().toISOString(),
                            updated_at: null
                        },
                        {
                            clip_id: "dummy-5",
                            clip_title: "Free will: Exploring uncertainty. hsajgdhjsdhgjhdgasjhgdsahjgjhghjgh",
                            transcript: "Here the streamer breaks down advanced strategies and provides valuable tips for viewers looking to improve their gameplay.",
                            content_critique: "Free will: Exploring uncertainty.",
                            clip_link: "/tmp/youtube-upload-1742469722427.mp4",
                            virality_score: "0.98",
                            duration: "00:42",
                            created_at: new Date().toISOString(),
                            updated_at: null
                        },
                        {
                            clip_id: "dummy-6",
                            clip_title: "Free will: Exploring uncertainty.",
                            transcript: "Here the streamer breaks down advanced strategies and provides valuable tips for viewers looking to improve their gameplay.",
                            content_critique: "Free will: Exploring uncertainty.",
                            clip_link: "/tmp/youtube-upload-1742469722427.mp4",
                            virality_score: "0.82",
                            duration: "00:51",
                            created_at: new Date().toISOString(),
                            updated_at: null
                        },
                        {
                            clip_id: "dummy-7",
                            clip_title: "Free will: Exploring uncertainty. kjhdgjhgfjkdshgdfhjgkH",
                            transcript: "Here the streamer breaks down advanced strategies and provides valuable tips for viewers looking to improve their gameplay.",
                            content_critique: "Free will: Exploring uncertainty. GVKQWYFHGQWKJEGHGFEWHJKG",
                            clip_link: "/tmp/youtube-upload-1742469722427.mp4",
                            virality_score: "0.81",
                            duration: "00:38",
                            created_at: new Date().toISOString(),
                            updated_at: null
                        },
                        {
                            clip_id: "dummy-8",
                            clip_title: "Free will: Exploring uncertainty.",
                            transcript: "Here the streamer breaks down advanced strategies and provides valuable tips for viewers looking to improve their gameplay.",
                            content_critique: "Free will: Exploring uncertainty.",
                            clip_link: "/tmp/youtube-upload-1742469722427.mp4",
                            virality_score: "0.79",
                            duration: "00:45",
                            created_at: new Date().toISOString(),
                            updated_at: null
                        }
                    ];
                    setClips(dummyClips);
                }
            } catch(err) {
                console.log(err)
                setError("Internal Server Error");
            } finally {
                setIsLoading(false);
            }
        };
      
        fetchData().catch(console.error);
    }, [streamId]);
    
    return (
        <div className="w-full bg-white dark:bg-black min-h-screen">
            {isLoading ? (
                <div className="w-full">
                    {/* Header Skeleton */}
                    <div className="px-4 sm:px-6 md:px-10 lg:px-16 pt-8 pb-6">
                        <SkeletonLoader className="h-10 w-10 rounded-xl mb-6" />
                        <SkeletonLoader className="h-12 w-64 mb-2" />
                    </div>
                    {/* Clips Skeleton */}
                    <ClipsLoadingSkeleton />
                </div>
            ) : error ? (
                <div className="flex flex-col flex-1 items-center justify-center p-4 md:p-10 min-h-screen">
                    <div className="text-3xl md:text-5xl font-medium text-black dark:text-white text-center" 
                         style={{ letterSpacing: '-0.04em', lineHeight: '92.7%' }}>
                        Error loading clips. Please try again.
                    </div>
                </div>
            ) : clips && clips.length === 0 ? (
                <div className="flex flex-col min-h-screen">
                    <div className="p-4 md:p-8">
                        <Link href="/Library">
                            <Button
                                className="h-10 w-10 gradient-silver text-white hover:text-white hover:opacity-90 rounded-xl flex items-center justify-center p-0 border-0"
                            >
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    viewBox="0 0 24 24"
                                    className="w-6 h-6"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                >
                                    <path d="M15 18l-6-6 6-6" />
                                </svg>
                            </Button>
                        </Link>
                    </div>
                    <div className="flex flex-1 items-center justify-center p-4 md:p-10">
                        <div className="text-3xl md:text-5xl font-medium text-black dark:text-white text-center" 
                             style={{ letterSpacing: '-0.04em', lineHeight: '92.7%' }}>
                            No clips found for this stream.
                        </div>
                    </div>
                </div>
            ) : (
                <div className="w-full">
                    {/* Header */}
                    <div className="px-4 sm:px-6 md:px-10 lg:px-16 pt-8 pb-6">
                        <Link href="/Library">
                            <Button
                                className="h-10 w-10 gradient-silver text-white hover:text-white hover:opacity-90 rounded-xl flex items-center justify-center p-0 border-0 mb-6 transition-opacity"
                            >
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    viewBox="0 0 24 24"
                                    className="w-6 h-6"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                >
                                    <path d="M15 18l-6-6 6-6" />
                                </svg>
                            </Button>
                        </Link>
                        
                        <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-serif italic text-black dark:text-white mb-2">
                            {streamTitle}
                        </h1>
                    </div>

                    {/* Grid Layout for Clips */}
                    <div className="px-4 sm:px-6 md:px-10 lg:px-16 pb-12">
                        <div className="flex flex-wrap gap-12 sm:gap-16 lg:gap-20">
                            {clips.map((clip, index) => (
                                <div key={clip.clip_id} className="w-[236px] h-[431px]">
                                    <ClipCard
                                        clip={clip}
                                        index={index + 1}
                                        autoUploaded={autoUploaded}
                                        streamId={streamId || ''}
                                        streamIndex={Number(searchParams.get('streamIndex'))}
                                    />
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}