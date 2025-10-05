'use client'

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { HashLoader } from "react-spinners";

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
}

interface LibraryClipsPageComponentProps {
    user: User;
}

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
    
    const handleEditClick = () => {
        const absoluteUrl = clip.clip_link?.startsWith('/') 
            ? `${window.location.origin}${clip.clip_link}` 
            : clip.clip_link;
        window.location.href = `/Library/stream/${streamIndex}/clips/Editor?videoUrl=${encodeURIComponent(absoluteUrl || '')}&id=${streamId}&clipId=${clip.clip_id}`;
    };

    return (
        <div className="w-full">
            {/* Video Container */}
            <div className="relative rounded-2xl overflow-hidden bg-gray-900 aspect-[9/16]">
                <video
                    className="w-full h-full object-cover"
                    src={clip.clip_link || ''}
                    poster={clip.clip_link || ''}
                />
                
                {/* Duration Badge */}
                <div className="absolute top-3 right-3 bg-gray-800/80 backdrop-blur-sm text-white text-xs px-2.5 py-1 rounded-md font-medium">
                    00:00 <span className="text-gray-300">00:46</span>
                </div>

                {/* Title Overlay */}
                {clip.clip_title && (
                    <div className="absolute bottom-3 left-3 right-3">
                        <div className="bg-white/90 backdrop-blur-sm text-black text-xs px-3 py-2 rounded-lg font-medium line-clamp-2">
                            {clip.clip_title}
                        </div>
                    </div>
                )}
            </div>

            {/* Virality Score & Title */}
            <div className="mt-3 flex items-start gap-2">
                <div className="text-4xl font-serif italic text-black dark:text-white flex-shrink-0">
                    {viralityScore}
                </div>
                <div className="flex-1 pt-1">
                    <p className="text-xs text-gray-500 dark:text-gray-400 leading-snug line-clamp-2">
                        {clip.clip_title || "Untitled Clip"}
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
                            content_critique: "Great energy and excitement! The commentary is engaging and the gameplay is top-tier. This clip has high viral potential.",
                            clip_link: "/tmp/youtube-upload-1742263969172.mp4",
                            virality_score: "0.98",
                            created_at: new Date().toISOString(),
                            updated_at: null
                        },
                        {
                            clip_id: "dummy-2",
                            clip_title: "Ally Rene rates names men like to call women...😭",
                            transcript: "The streamer's reaction to this unexpected event was absolutely hilarious and genuine, creating a perfect moment for viewers.",
                            content_critique: "Perfect comedic timing! This type of authentic reaction content performs extremely well on social media platforms.",
                            clip_link: "/tmp/youtube-upload-1742277570934.mp4",
                            virality_score: "0.82",
                            created_at: new Date().toISOString(),
                            updated_at: null
                        },
                        {
                            clip_id: "dummy-3",
                            clip_title: "Ally Rene rates names men like to call women...😭",
                            transcript: "Watch as the player demonstrates incredible mechanical skill and game knowledge in this clutch situation.",
                            content_critique: "Showcases exceptional talent and expertise. This type of skill-based content attracts dedicated gaming audiences.",
                            clip_link: "/tmp/youtube-upload-1742277603826.mp4",
                            virality_score: "0.81",
                            created_at: new Date().toISOString(),
                            updated_at: null
                        },
                        {
                            clip_id: "dummy-4",
                            clip_title: "Ally Rene rates names men like to call women...😭",
                            transcript: "A heartwarming moment of interaction between the streamer and their community that shows the strong bond they've built.",
                            content_critique: "Great community engagement! This shows authentic connection with viewers and builds loyalty.",
                            clip_link: "/tmp/youtube-upload-1742370571002.mp4",
                            virality_score: "0.79",
                            created_at: new Date().toISOString(),
                            updated_at: null
                        },
                        {
                            clip_id: "dummy-5",
                            clip_title: "Free will: Exploring uncertainty.",
                            transcript: "Here the streamer breaks down advanced strategies and provides valuable tips for viewers looking to improve their gameplay.",
                            content_critique: "Educational content with high value. Tutorial-style clips have strong retention and sharing potential.",
                            clip_link: "/tmp/youtube-upload-1742469722427.mp4",
                            virality_score: "0.98",
                            created_at: new Date().toISOString(),
                            updated_at: null
                        },
                        {
                            clip_id: "dummy-6",
                            clip_title: "Free will: Exploring uncertainty.",
                            transcript: "Here the streamer breaks down advanced strategies and provides valuable tips for viewers looking to improve their gameplay.",
                            content_critique: "Educational content with high value. Tutorial-style clips have strong retention and sharing potential.",
                            clip_link: "/tmp/youtube-upload-1742469722427.mp4",
                            virality_score: "0.82",
                            created_at: new Date().toISOString(),
                            updated_at: null
                        },
                        {
                            clip_id: "dummy-7",
                            clip_title: "Free will: Exploring uncertainty.",
                            transcript: "Here the streamer breaks down advanced strategies and provides valuable tips for viewers looking to improve their gameplay.",
                            content_critique: "Educational content with high value. Tutorial-style clips have strong retention and sharing potential.",
                            clip_link: "/tmp/youtube-upload-1742469722427.mp4",
                            virality_score: "0.81",
                            created_at: new Date().toISOString(),
                            updated_at: null
                        },
                        {
                            clip_id: "dummy-8",
                            clip_title: "Free will: Exploring uncertainty.",
                            transcript: "Here the streamer breaks down advanced strategies and provides valuable tips for viewers looking to improve their gameplay.",
                            content_critique: "Educational content with high value. Tutorial-style clips have strong retention and sharing potential.",
                            clip_link: "/tmp/youtube-upload-1742469722427.mp4",
                            virality_score: "0.79",
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
                <div className="flex flex-col flex-1 items-center justify-center p-4 md:p-10 min-h-screen">
                    <HashLoader 
                        color="#000000"
                        size={50}
                        speedMultiplier={0.9}
                    />
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
                                className="h-10 w-10 bg-white dark:bg-gray-900 text-black dark:text-white rounded-xl flex items-center justify-center p-0 border border-gray-300 dark:border-gray-700"
                                variant="outline"
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
                                className="h-10 w-10 bg-white dark:bg-gray-900 text-black dark:text-white rounded-xl flex items-center justify-center p-0 border border-gray-300 dark:border-gray-700 mb-6"
                                variant="outline"
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
                        
                        <h1 className="text-3xl sm:text-4xl md:text-5xl font-serif italic text-black dark:text-white mb-2">
                            {streamTitle}
                        </h1>
                    </div>

                    {/* Grid Layout for Clips */}
                    <div className="px-4 sm:px-6 md:px-10 lg:px-16 pb-12">
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
                            {clips.map((clip, index) => (
                                <ClipCard
                                    key={clip.clip_id}
                                    clip={clip}
                                    index={index + 1}
                                    autoUploaded={autoUploaded}
                                    streamId={streamId || ''}
                                    streamIndex={Number(searchParams.get('streamIndex'))}
                                />
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}