'use client'
import { Button } from "@/components/ui/button";
import Image from "next/image";
import Navigation from '@/components/main/mainNavigation';
import { useRouter } from 'next/navigation';

// First, let's export the videos data so it can be shared
export const videosData = [
    { id: 1, likes: '16K', comments: '81K', bookmarks: '20K' },
    { id: 2, likes: '24K', comments: '92K', bookmarks: '15K' },
    { id: 3, likes: '12K', comments: '45K', bookmarks: '8K' },
    { id: 4, likes: '32K', comments: '120K', bookmarks: '25K' },
    { id: 5, likes: '18K', comments: '73K', bookmarks: '12K' },
    { id: 6, likes: '16K', comments: '65K', bookmarks: '19K' },
    { id: 7, likes: '24K', comments: '88K', bookmarks: '22K' },
    { id: 8, likes: '12K', comments: '55K', bookmarks: '10K' },
    { id: 9, likes: '32K', comments: '95K', bookmarks: '28K' },
    { id: 10, likes: '18K', comments: '70K', bookmarks: '15K' }
];

interface FXXPageProps{
    user_id : string,
  }
export default function FXXPage({user_id}: FXXPageProps) {
    const router = useRouter();

    const handleVideoClick = (videoId: number) => {
        router.push(`/FXX/Clips?video=${videoId}`);
    };

    return (
        <div className="min-h-screen bg-black">
            <Navigation user_id={user_id}/>
            <div className=" w-full">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8 pt-8">
                    <div className="flex flex-col lg:flex-row items-start justify-between gap-8">
                        <div className="flex-1">
                            <h1 className="text-white text-6xl sm:text-8xl lg:text-[280px] leading-none tracking-tighter">
                                ALTER FXX
                            </h1>
                            <p className="text-white text-2xl sm:text-3xl lg:text-4xl mt-4" style={{ letterSpacing: '-0.04em', lineHeight: '92.7%' }}>
                                The best clips, all in one place.
                            </p>
                            
                            <Button 
                                variant="outline" 
                                className="group mt-8 bg-black text-white border-white hover:bg-white hover:text-black transition-all duration-300 rounded-md px-6 py-6 sm:px-8 sm:py-9 flex items-center gap-4"
                            >
                                <Image
                                    src="/FXXButton.png"
                                    alt="FXX"
                                    width={70}
                                    height={70}
                                    className="transition-all duration-300 group-hover:invert"
                                />
                                <div className="flex flex-col items-start">
                                    <span className="text-sm">Scroll down for</span>
                                    <span className="text-2xl sm:text-3xl">CLIPS</span>
                                </div>
                            </Button>
                            
                            <p className="text-white/50 text-sm mt-4 hover:text-white cursor-pointer transition-colors hel-font relative group w-fit">
                                Or click here to go
                                <span className="absolute bottom-0 left-0 w-full h-[1px] bg-white/50"></span>
                                <span className="absolute bottom-0 left-0 w-0 h-[1px] bg-white group-hover:w-full transition-all duration-300"></span>
                            </p>
                        </div>

                        <div className="flex-1 flex flex-col items-end">
                            <div className="relative w-full max-w-[470px]">
                                <Image
                                    src="/FXX3.png"
                                    alt="FXX Main"
                                    width={470}
                                    height={500}
                                    className="w-full h-auto object-contain rounded-3xl [filter:drop-shadow(-20px_-20px_25px_rgba(0,0,0,0.5))]"
                                    priority
                                />
                                <div className="absolute -bottom-20 hidden md:block -left-20 w-[450px] h-[450px]">
                                    <Image
                                        src="/FXXLIVE.png"
                                        alt="FXX Demo"
                                        width={450}
                                        height={450}
                                        className="w-full h-full object-contain"
                                        priority
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="mt-16 grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-5xl">
                        <div>
                            <p className="text-[#B5B5B5] text-base mb-4 leading-[110%]">
                                The FXX Clips section is open! Your<br />
                                favorite clips, app-exclusive content, first<br />
                                looks & more.<br />
                                Unlock the full experience with<br />
                                Side/Effect&#39;s membership.
                            </p>
                        </div>

                        <div>
                            <h3 className="text-[#B5B5B5] text-xs mb-4">MEMBERSHIP BENEFITS:</h3>
                            <ul className="space-y-4">
                                <li className="text-[#737373] text-sm pb-3 relative leading-[104%]">
                                    Browse FXX clips available to download with<br />
                                    streamer commentaries
                                    <div className="absolute bottom-0 left-0 w-[45%] h-[1px] bg-[#737373]/20"></div>
                                </li>
                                <li className="text-[#737373] text-sm pb-3 relative leading-[104%]">
                                    Watch hundreds of hours of behind the<br />
                                    scenes, interviews and podcasts.
                                    <div className="absolute bottom-0 left-0 w-[45%] h-[1px] bg-[#737373]/20"></div>
                                </li>
                                <li className="text-[#737373] text-sm pb-3 relative leading-[104%]">
                                    FXX members get more: first looks, deeper<br />
                                    cuts, free screenings & exclusive perks
                                    <div className="absolute bottom-0 left-0 w-[45%] h-[1px] bg-[#737373]/20"></div>
                                </li>
                                <li className="text-[#737373] text-sm leading-[104%]">
                                    ... and much more to come
                                </li>
                            </ul>
                        </div>
                    </div>
                    
                    <div className="mt-10 max-w-5xl">
                        <Image
                            src="/FXXplat.png"
                            alt="FXX Platforms"
                            width={640}
                            height={200}
                            className="w-full h-auto"
                            priority
                        />
                    </div>
                </div>
            </div>

            <div className="bg-white w-full">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8 pt-16">
                    <h2 className="text-black text-3xl sm:text-4xl lg:text-5xl mb-12" style={{ letterSpacing: '-0.04em', lineHeight: '92.7%' }}>LATEST CLIPS</h2>
                    
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 max-w-7xl mx-auto">
                        {videosData.map((video) => (
                            <div 
                                key={video.id} 
                                onClick={() => handleVideoClick(video.id)}
                                className="cursor-pointer relative aspect-[9/16] rounded-xl overflow-hidden group"
                            >
                                <video
                                    src={`/f${video.id}.mp4`}
                                    className="w-full h-full object-cover"
                                    loop
                                    muted
                                    playsInline
                                    onMouseEnter={(e) => e.currentTarget.play()}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.pause();
                                        e.currentTarget.currentTime = 0;
                                    }}
                                />
                                <div className="absolute bottom-4 left-4 flex items-center gap-2 z-10">
                                    <Image
                                        src="/FXXlike.svg"
                                        alt="Likes"
                                        width={24}
                                        height={24}
                                        className="text-white"
                                    />
                                    <span className="text-white text-sm">{video.likes}</span>
                                </div>
                                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent pointer-events-none" />
                            </div>
                        ))}
                    </div>

                    <div className="mt-16 mb-8 text-center lg:text-left">
                        <h2 className="text-black text-3xl sm:text-4xl lg:text-5xl mb-8" style={{ letterSpacing: '-0.04em', lineHeight: '92.7%' }}>
                            WANT TO SEE MORE?
                        </h2>
                        <button className="bg-black hel-font text-white px-8 py-4 text-xl sm:text-2xl hover:bg-white hover:text-black border border-black transition-all duration-300">
                            Join To See All
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}