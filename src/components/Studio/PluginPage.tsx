'use client'
import { Button } from "@/components/ui/button";
import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from "next/navigation";
import { toast, Toaster } from "sonner";
import { useStreamParams } from "@/hooks/useStreamParams";
import { Youtube, Instagram } from "lucide-react";

interface ClipUpload {
    platform_id: number;
    upload_link: string | null;
    uploaded_at: Date | null;
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
    uploads: ClipUpload[];
}

// Platform indicator icons component
function PlatformIndicators({ uploads }: { uploads: ClipUpload[] }) {
    const hasYoutube = uploads.some(u => u.platform_id === 701);
    const hasInstagram = uploads.some(u => u.platform_id === 703);

    if (uploads.length === 0) {
        return (
            <div className="flex items-center gap-1.5">
                <span className="text-xs text-gray-500 font-medium">Not uploaded</span>
            </div>
        );
    }

    return (
        <div className="flex items-center gap-1.5">
            {hasYoutube && (
                <div className="w-6 h-6 bg-red-500 rounded-full flex items-center justify-center" title="Uploaded to YouTube">
                    <Youtube className="w-3.5 h-3.5 text-white" />
                </div>
            )}
            {hasInstagram && (
                <div className="w-6 h-6 bg-gradient-to-br from-purple-500 via-pink-500 to-orange-500 rounded-full flex items-center justify-center" title="Uploaded to Instagram">
                    <Instagram className="w-3.5 h-3.5 text-white" />
                </div>
            )}
        </div>
    );
}

// Individual Clip Card Component
function ClipCard({ clip }: { clip: Clip }) {
    const viralityScore = clip.virality_score ? Math.round(Number(clip.virality_score) * 100) : 0;

    return (
        <div className="cursor-pointer group">
            {/* Video Container */}
            <div className="relative rounded-3xl overflow-hidden bg-gray-900 w-[236px] h-[431px]">
                <video
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    src={clip.clip_link || ''}
                    poster={clip.clip_link || ''}
                />

                {/* Duration Badge */}
                <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm text-gray-900 text-xs px-3 py-1.5 rounded-full font-medium shadow-sm">
                    {clip.duration || '00:46'}
                </div>

                {/* Title Overlay */}
                {clip.clip_title && (
                    <div className="absolute bottom-3 left-3 right-3">
                        <div className="bg-white/90 backdrop-blur-sm text-gray-900 text-sm px-4 py-3 rounded-2xl font-medium line-clamp-2 shadow-lg">
                            {clip.clip_title}
                        </div>
                    </div>
                )}
            </div>

            {/* Virality Score & Description */}
            <div className="mt-4 flex items-start gap-3 w-[236px]">
                <div className="text-5xl font-serif italic text-gray-900 flex-shrink-0 leading-none">
                    {viralityScore}
                </div>
                <div className="flex-1 pt-1 min-w-0 space-y-2">
                    <p className="text-sm text-gray-600 leading-relaxed line-clamp-2 break-words">
                        {clip.content_critique || clip.clip_title || "Untitled Clip"}
                    </p>
                    <PlatformIndicators uploads={clip.uploads} />
                </div>
            </div>
        </div>
    );
}

export default function PluginClient() {
    const [currentStep, setCurrentStep] = useState(1); // Start at step 1 (Monitoring)
    const [autoUpload, setAutoUpload] = useState(true);
    const [clipCount, setClipCount] = useState(0);
    const [isDemo, setIsDemo] = useState(false);
    const [clips, setClips] = useState<Clip[]>([]);

    const router = useRouter();
    const searchParams = useSearchParams();
    const { streamId, userId } = useStreamParams();

    // Check if we're in demo/testing mode
    useEffect(() => {
        const demoMode = searchParams.get('demo') === 'true' || searchParams.get('test') === 'true';
        setIsDemo(demoMode);

        if (demoMode) {
            // Use mock data for demo mode
            setClipCount(6);

            // Add dummy clips for demo mode
            const dummyClips: Clip[] = [
                {
                    clip_id: "dummy-1",
                    clip_title: "What's the first thing Ally Rene notices in a guy?👀",
                    transcript: "This is an amazing gameplay moment",
                    content_critique: "Free will: Exploring uncertainty.",
                    clip_link: "/tmp/youtube-upload-1742263969172.mp4",
                    virality_score: "0.98",
                    duration: "00:35",
                    created_at: new Date().toISOString(),
                    updated_at: null,
                    uploads: [
                        { platform_id: 701, upload_link: "https://youtube.com/shorts/abc123", uploaded_at: new Date() }
                    ]
                },
                {
                    clip_id: "dummy-2",
                    clip_title: "Ally Rene rates names men like to call women...😭",
                    transcript: "Hilarious reaction moment",
                    content_critique: "Free will: Exploring uncertainty.",
                    clip_link: "/tmp/youtube-upload-1742277570934.mp4",
                    virality_score: "0.82",
                    duration: "00:46",
                    created_at: new Date().toISOString(),
                    updated_at: null,
                    uploads: [
                        { platform_id: 701, upload_link: "https://youtube.com/shorts/def456", uploaded_at: new Date() },
                        { platform_id: 703, upload_link: "https://instagram.com/reel/xyz789", uploaded_at: new Date() }
                    ]
                },
                {
                    clip_id: "dummy-3",
                    clip_title: "Epic gameplay clutch moment",
                    transcript: "Watch as the player demonstrates incredible skill",
                    content_critique: "High energy content with great pacing.",
                    clip_link: "/tmp/youtube-upload-1742277603826.mp4",
                    virality_score: "0.81",
                    duration: "01:00",
                    created_at: new Date().toISOString(),
                    updated_at: null,
                    uploads: [
                        { platform_id: 703, upload_link: "https://instagram.com/reel/abc789", uploaded_at: new Date() }
                    ]
                },
                {
                    clip_id: "dummy-4",
                    clip_title: "Heartwarming community moment",
                    transcript: "A special moment with viewers",
                    content_critique: "Emotional and engaging.",
                    clip_link: "/tmp/youtube-upload-1742370571002.mp4",
                    virality_score: "0.79",
                    duration: "00:58",
                    created_at: new Date().toISOString(),
                    updated_at: null,
                    uploads: []
                },
                {
                    clip_id: "dummy-5",
                    clip_title: "Pro tips and strategies",
                    transcript: "Advanced gameplay breakdown",
                    content_critique: "Educational and valuable.",
                    clip_link: "/tmp/youtube-upload-1742469722427.mp4",
                    virality_score: "0.75",
                    duration: "00:42",
                    created_at: new Date().toISOString(),
                    updated_at: null,
                    uploads: [
                        { platform_id: 701, upload_link: "https://youtube.com/shorts/ghi012", uploaded_at: new Date() }
                    ]
                },
                {
                    clip_id: "dummy-6",
                    clip_title: "Funny fails compilation",
                    transcript: "Laugh out loud moments",
                    content_critique: "High entertainment value.",
                    clip_link: "/tmp/youtube-upload-1742469722427.mp4",
                    virality_score: "0.88",
                    duration: "00:51",
                    created_at: new Date().toISOString(),
                    updated_at: null,
                    uploads: []
                }
            ];
            setClips(dummyClips);
        }
    }, [searchParams]);

    useEffect(() => {
        // Skip API calls in demo mode
        if (isDemo || !userId || !streamId) return;

        const fetchData = async () => {
            // Fetch clip count
            const res = await fetch(`api/user/getClipCount`, {
                method: 'POST',
                body: JSON.stringify({
                    streamerId: userId,
                    stream_id: streamId
                })
            });

            const data = await res.json();
            if (data.confirmation === "success" && data.data?.[0]) {
                setClipCount(data.data[0].clipCount);
            }

            // Fetch clips with upload information
            const clipsRes = await fetch(`/api/streams/${streamId}/clips`);
            const clipsData = await clipsRes.json();

            if (clipsData.confirmation === "success" && Array.isArray(clipsData.data)) {
                setClips(clipsData.data);
            }
        };

        fetchData().catch(console.error);

        // Set up polling to refresh clips periodically
        const interval = setInterval(() => {
            fetchData().catch(console.error);
        }, 10000); // Refresh every 10 seconds

        return () => clearInterval(interval);
    }, [userId, streamId, isDemo]);

    // Simulate progress through steps
    useEffect(() => {
        const interval = setInterval(() => {
          setCurrentStep((prev) => (prev < 5 ? prev + 1 : 1));
        }, 3000);

        return () => clearInterval(interval);
    }, []);

    const handleStop = async () => {
        // In demo mode, just navigate without API call
        if (isDemo) {
            toast.success("Plugin stopped (Demo Mode)", {
                description: "This is a demo - no actual changes were made",
                duration: 4000,
            });
            router.push('/Studio');
            return;
        }

        let response = await fetch("/api/stop-plugin/twitch/live", {
            method : "POST",
            body: JSON.stringify({
                stream_id : streamId
            })
        })

        toast.success("Plugin stopped successfully!", {
            description: "Your stream is no longer being clipped",
            duration: 4000,
        });

        router.push('/Studio')
        response = await response.json()
        console.log(response)
    }

    const handleGoToClips = async () => {
        if (isDemo) {
            toast.info("Demo Mode", {
                description: "In real mode, this would take you to your clips",
                duration: 3000,
            });
            return;
        }
        router.push(`/Studio/stream/1/clips?autoUploaded=true&id=${streamId}`);
    }

    const steps = [
        { id: 1, name: 'Monitoring', label: 'Watching your stream' },
        { id: 2, name: 'Clipping', label: 'Identifying highlights' },
        { id: 3, name: 'Reframing', label: 'Optimizing for social' },
        { id: 4, name: 'Processing', label: 'Applying effects' },
        { id: 5, name: autoUpload ? 'Uploading' : 'Complete', label: autoUpload ? 'Auto-uploading clips' : 'Ready to view' }
    ];

    return (
        <div className="flex flex-col w-full min-h-screen bg-gray-50">
            <Toaster position="top-right" />

            {/* Demo mode indicator */}
            {isDemo && (
                <div className="w-full bg-blue-500 text-white text-center py-2 text-sm font-medium">
                    Demo Mode - No API calls are being made
                </div>
            )}

            {/* Main content */}
            <div className="px-4 sm:px-6 md:px-8 w-full max-w-5xl mx-auto py-8 sm:py-12">

                {/* Header Section */}
                <div className="text-center mb-8 sm:mb-12">
                    <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-gray-900 mb-4 denton-condensed">
                        Live Clipping Active
                    </h1>
                    <p className="text-lg sm:text-xl text-gray-600">
                        Your stream is being automatically clipped in real-time
                    </p>
                </div>

                {/* Stats Card */}
                <div className="gradient-silver rounded-3xl p-8 sm:p-12 mb-8 sm:mb-12 shadow-lg">
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
                        <div className="text-center sm:text-left">
                            <p className="text-white/80 text-sm sm:text-base mb-2">Total Clips Generated</p>
                            <p className="text-5xl sm:text-6xl md:text-7xl font-bold text-white">
                                {clipCount}
                            </p>
                        </div>
                        <div className="flex flex-col sm:flex-row gap-3">
                            <Button
                                onClick={handleStop}
                                variant="outline"
                                className="border-2 border-white text-gray-900 px-6 py-6 text-base font-medium rounded-full hover:shadow-md transition-shadow"
                            >
                                Stop Plugin
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Progress Section */}
                <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-md">
                    <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-6">
                        Processing Pipeline
                    </h2>

                    {/* Step Indicators - Compact view at top */}
                    <div className="flex items-center justify-center mb-6">
                        {steps.map((step, index) => {
                            const isActive = currentStep === step.id;
                            const isComplete = currentStep > step.id;

                            return (
                                <div key={step.id} className="flex items-center">
                                    <div
                                        className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center font-semibold text-xs transition-all duration-300 ${
                                            isActive
                                                ? 'bg-gray-900 text-white scale-110'
                                                : isComplete
                                                ? 'bg-green-500 text-white'
                                                : 'bg-gray-200 text-gray-500'
                                        }`}
                                    >
                                        {isComplete ? (
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                            </svg>
                                        ) : (
                                            step.id
                                        )}
                                    </div>
                                    {index < steps.length - 1 && (
                                        <div className={`w-8 sm:w-12 h-0.5 transition-all duration-300 ${
                                            isComplete ? 'bg-green-500' : 'bg-gray-200'
                                        }`} />
                                    )}
                                </div>
                            );
                        })}
                    </div>

                    {/* Current Active Step - Large Display */}
                    <div className="relative overflow-hidden" style={{ minHeight: '120px' }}>
                        {steps.map((step) => {
                            const isActive = currentStep === step.id;

                            return (
                                <div
                                    key={step.id}
                                    className={`absolute inset-0 transition-all duration-500 ease-in-out ${
                                        isActive
                                            ? 'opacity-100 translate-x-0'
                                            : currentStep > step.id
                                            ? 'opacity-0 -translate-x-full'
                                            : 'opacity-0 translate-x-full'
                                    }`}
                                >
                                    <div className="bg-gray-100 border-2 border-gray-300 rounded-xl p-6">
                                        <div className="flex items-center gap-4">
                                            <div className="flex-shrink-0 w-12 h-12 rounded-full bg-gray-900 text-white flex items-center justify-center font-semibold text-lg animate-pulse">
                                                {step.id}
                                            </div>
                                            <div className="flex-1">
                                                <h3 className="font-semibold text-lg sm:text-xl text-gray-900">
                                                    {step.name}
                                                </h3>
                                                <p className="text-sm sm:text-base text-gray-600 mt-1">
                                                    {step.label}
                                                </p>
                                            </div>
                                            <div className="flex-shrink-0">
                                                <div className="flex items-center gap-1">
                                                    <div className="w-2 h-2 bg-gray-900 rounded-full animate-pulse"></div>
                                                    <div className="w-2 h-2 bg-gray-900 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                                                    <div className="w-2 h-2 bg-gray-900 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Info Section */}
                <div className="mt-8 text-center text-sm text-gray-500">
                    <p>
                        Clips are being generated and {autoUpload ? 'automatically uploaded to your library' : 'saved to your library'}
                    </p>
                </div>

                {/* Clips Grid Section */}
                {clips.length > 0 && (
                    <div className="mt-12">
                        <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-8">
                            Generated Clips
                        </h2>
                        <div className="flex flex-wrap gap-8 sm:gap-12 lg:gap-16">
                            {clips.map((clip) => (
                                <ClipCard key={clip.clip_id} clip={clip} />
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}