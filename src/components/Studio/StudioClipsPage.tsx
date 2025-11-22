'use client'

import ActionButtons from '@/components/clipActionButtons';
import ClipComponent from '@/components/ClipComponent';
import Header from '@/components/ClipHeader';
import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { HashLoader } from "react-spinners";
import { useSession } from "next-auth/react";

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


interface StudioClipsPageComponentProps {
    stream_id: string,
}

export default function StudioClipsPageComponent({stream_id} : StudioClipsPageComponentProps) {

    const { data: session } = useSession();
    const autoUploaded = true;

    // get stream id from dynamic route
    const streamId = stream_id;
    const [clips, setClips] = useState<Clip[]>([]);
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);

            try {
                const response = await fetch(`/api/streams/${streamId}/clips`);
                const data = await response.json();
                if (data.confirmation === "success" && Array.isArray(data.data)) {
                    setClips(data.data);
                } else {
                    setError("Invalid response format");
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
        <>        
          {/* Breadcrumb */}
          {/* <div className="flex items-center space-x-1 md:space-x-2 overflow-x-auto max-w-[calc(100vw-200px)]">
            {pathSegments.map((segment, index) => (
              <div key={index} className="flex items-center whitespace-nowrap">
                {index > 0 && (
                  <span className="text-[#666666] text-lg md:text-[24px] font-['SF_Pro_Display'] font-normal mx-1">
                    /
                  </span>
                )}
                <span className="text-[#666666] text-xs md:text-[16px] font-['SF_Pro_Display'] font-normal">
                  {segment.charAt(0).toUpperCase() + segment.slice(1)}
                </span>
              </div>
            ))}
          </div> */}
          
            <div className="w-full bg-white dark:bg-black pt-24 min-h-screen flex flex-col">
                {isLoading ? (
                    <div className="flex flex-col flex-1 items-center justify-center p-4 md:p-10">
                        <HashLoader 
                            color="#000000"
                            size={50}
                            speedMultiplier={0.9}
                        />
                    </div>
                ) : error ? (
                    <div className="flex flex-col flex-1 items-start justify-end p-4 md:p-10">
                        <div className="text-3xl md:text-5xl font-medium text-black dark:text-white" 
                             style={{ letterSpacing: '-0.04em', lineHeight: '92.7%' }}>
                            Error loading clips. Please try again.
                        </div>
                    </div>
                ) : clips && clips.length === 0 ? (
                    <div className="flex flex-col h-full">
                        <div className="p-4 md:p-8">
                            <Link href="/Studio">
                                <Button
                                    className="h-10 w-10 bg-white dark:bg-gray-900 text-black dark:text-white rounded-xl flex items-center justify-center p-0 border border-black dark:border-gray-700"
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
                        <div className="flex flex-1 items-end p-4 md:p-10">
                            <div className="text-3xl md:text-5xl font-medium text-black dark:text-white" 
                                 style={{ letterSpacing: '-0.04em', lineHeight: '92.7%' }}>
                                No clips found for this stream.
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="flex flex-col w-full">
                        <Header clipCount={clips ? clips.length : 0} />
                        <ActionButtons autoUploaded={autoUploaded} user_id={session?.user?.id || ''} />
                        
                        <div className="w-full px-4 md:px-8 lg:px-10 xl:px-[8.9375rem] py-6">
                            <div className="grid grid-cols-1 gap-6">
                                {clips && clips.map((clip, index) => (
                                    <ClipComponent
                                        key={clip.clip_id}
                                        index={index + 1}
                                        title={clip.clip_title || "Untitled Clip"}
                                        duration={"0:30"}
                                        viralityScore={clip.virality_score ? Number(clip.virality_score) * 100 : 0}
                                        contentCritique={clip.content_critique || ""}
                                        transcript={clip.transcript || ""}
                                        videoUrl={clip.clip_link || ""}
                                        autoUploaded={autoUploaded}
                                        streamId={streamId || ''}
                                        clip_id={clip.clip_id}
                                        streamIndex={1}
                                    />
                                ))}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </>
    );
}