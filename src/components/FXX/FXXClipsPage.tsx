'use client'
import { useState, useRef, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import Navigation from '@/components/main/mainNavigation';
import Image from "next/image";
import { videosData } from './FXXpage';


interface FXXClipsPageProps{
    user_id : string,
  }
export default function FXXClipsPage({user_id} : FXXClipsPageProps) {
    const searchParams = useSearchParams();
    const initialVideoId = parseInt(searchParams.get('video') || '1') - 1;
    const [currentVideoIndex, setCurrentVideoIndex] = useState(initialVideoId);
    const [likedVideos, setLikedVideos] = useState<{[key: number]: boolean}>({});
    const [isMuted, setIsMuted] = useState(false);
    const [isPlaying, setIsPlaying] = useState(true);
    const [isCommentsOpen, setIsCommentsOpen] = useState(false);
    const [newComment, setNewComment] = useState('');
    const [commentsPerVideo, setCommentsPerVideo] = useState<{[key: number]: Array<{id: number, user: string, comment: string, time: string, likes: string, profilePic: string}>}>({});
    const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);

    const videos = videosData;

    // Define different comments for each video
    const dummyCommentsData: {[key: number]: Array<{id: number, user: string, comment: string, time: string, likes: string, profilePic: string}>} = {
        1: [
            { id: 1, user: "Elsie", comment: "it was tdy?", time: "2 days ago", likes: "12K", profilePic: "/test68.jpg" },
            { id: 2, user: "Sarah", comment: "This is amazing! 🔥", time: "1 day ago", likes: "8K", profilePic: "/test69.jpg" },
            { id: 3, user: "Marcus", comment: "I can't believe how good this is", time: "5 hours ago", likes: "4.2K", profilePic: "/p1.jpeg" },
            { id: 4, user: "Liam", comment: "Watched this on repeat!", time: "3 hours ago", likes: "2.8K", profilePic: "/test71.jpg" },
        ],
        2: [
            { id: 1, user: "Mike", comment: "Can't wait for the next one", time: "5 hours ago", likes: "5K", profilePic: "/test70.jpg" },
            { id: 2, user: "Jessica", comment: "Love this content!", time: "3 hours ago", likes: "3K", profilePic: "/test71.jpg" },
            { id: 3, user: "Noah", comment: "This deserves to go viral", time: "1 day ago", likes: "6.7K", profilePic: "/p2.jpeg" },
            { id: 4, user: "Emma", comment: "How do you come up with these ideas?", time: "7 hours ago", likes: "3.9K", profilePic: "/test68.jpg" },
        ],
        3: [
            { id: 1, user: "Alex", comment: "This is so cool", time: "1 day ago", likes: "7K", profilePic: "/test79.jpg" },
            { id: 2, user: "Jordan", comment: "Incredible work!", time: "12 hours ago", likes: "4K", profilePic: "/test68.jpg" },
            { id: 3, user: "Sophia", comment: "I've shared this with everyone I know", time: "6 hours ago", likes: "5.3K", profilePic: "/test69.jpg" },
            { id: 4, user: "Ethan", comment: "Pure genius", time: "2 days ago", likes: "8.1K", profilePic: "/p1.jpeg" },
            { id: 5, user: "Olivia", comment: "This made my whole week", time: "4 hours ago", likes: "2.5K", profilePic: "/test70.jpg" },
        ],
        4: [
            { id: 1, user: "Taylor", comment: "I need more of this", time: "6 hours ago", likes: "9K", profilePic: "/test69.jpg" },
            { id: 2, user: "Jamie", comment: "Best one yet!", time: "2 hours ago", likes: "6K", profilePic: "/test70.jpg" },
            { id: 3, user: "William", comment: "How is this not trending everywhere?", time: "1 day ago", likes: "7.2K", profilePic: "/test71.jpg" },
            { id: 4, user: "Ava", comment: "I've watched this 20 times already", time: "8 hours ago", likes: "4.6K", profilePic: "/p2.jpeg" },
        ],
        5: [
            { id: 1, user: "Chris", comment: "Absolutely brilliant!", time: "4 hours ago", likes: "15K", profilePic: "/p1.jpeg" },
            { id: 2, user: "Morgan", comment: "How did you do that?", time: "1 day ago", likes: "7.5K", profilePic: "/test71.jpg" },
            { id: 3, user: "Isabella", comment: "This is art", time: "2 days ago", likes: "9.3K", profilePic: "/test68.jpg" },
            { id: 4, user: "Lucas", comment: "Mind = blown", time: "5 hours ago", likes: "6.1K", profilePic: "/test79.jpg" },
            { id: 5, user: "Mia", comment: "I can't stop watching this", time: "3 hours ago", likes: "4.8K", profilePic: "/test69.jpg" },
        ],
        6: [
            { id: 1, user: "Riley", comment: "This made my day!", time: "8 hours ago", likes: "11K", profilePic: "/p2.jpeg" },
            { id: 2, user: "Casey", comment: "I've watched this 10 times already", time: "5 hours ago", likes: "8.2K", profilePic: "/test79.jpg" },
            { id: 3, user: "Benjamin", comment: "Incredible talent", time: "1 day ago", likes: "10.5K", profilePic: "/test70.jpg" },
            { id: 4, user: "Charlotte", comment: "How do you make it look so easy?", time: "7 hours ago", likes: "7.8K", profilePic: "/p1.jpeg" },
            { id: 5, user: "Henry", comment: "This is why I love this platform", time: "2 days ago", likes: "9.1K", profilePic: "/test71.jpg" },
        ],
        7: [
            { id: 1, user: "Avery", comment: "Mind blown 🤯", time: "3 days ago", likes: "20K", profilePic: "/test68.jpg" },
            { id: 2, user: "Quinn", comment: "Can we get a tutorial?", time: "1 day ago", likes: "9.7K", profilePic: "/p1.jpeg" },
            { id: 3, user: "Amelia", comment: "I've never seen anything like this", time: "6 hours ago", likes: "12.3K", profilePic: "/test69.jpg" },
            { id: 4, user: "Sebastian", comment: "Pure creativity", time: "4 hours ago", likes: "8.5K", profilePic: "/test70.jpg" },
            { id: 5, user: "Harper", comment: "I'm in awe", time: "2 days ago", likes: "11.2K", profilePic: "/p2.jpeg" },
            { id: 6, user: "Elijah", comment: "This deserves an award", time: "9 hours ago", likes: "7.9K", profilePic: "/test79.jpg" },
        ],
        8: [
            { id: 1, user: "Jordan", comment: "This deserves more views", time: "7 hours ago", likes: "13K", profilePic: "/test69.jpg" },
            { id: 2, user: "Blake", comment: "Perfection!", time: "2 days ago", likes: "6.8K", profilePic: "/p2.jpeg" },
            { id: 3, user: "Evelyn", comment: "I'm obsessed with this", time: "1 day ago", likes: "10.7K", profilePic: "/test71.jpg" },
            { id: 4, user: "James", comment: "How many takes did this require?", time: "5 hours ago", likes: "8.3K", profilePic: "/test68.jpg" },
            { id: 5, user: "Abigail", comment: "This is next level", time: "3 days ago", likes: "14.6K", profilePic: "/p1.jpeg" },
        ],
        9: [
            { id: 1, user: "Dakota", comment: "I'm speechless...", time: "9 hours ago", likes: "17K", profilePic: "/test70.jpg" },
            { id: 2, user: "Reese", comment: "How is this even possible?", time: "1 day ago", likes: "10.3K", profilePic: "/test71.jpg" },
            { id: 3, user: "Alexander", comment: "This is why I follow you", time: "2 days ago", likes: "13.8K", profilePic: "/test79.jpg" },
            { id: 4, user: "Elizabeth", comment: "Absolutely mesmerizing", time: "6 hours ago", likes: "9.5K", profilePic: "/p2.jpeg" },
            { id: 5, user: "Daniel", comment: "I've shared this with everyone", time: "4 hours ago", likes: "7.2K", profilePic: "/test68.jpg" },
            { id: 6, user: "Sofia", comment: "Can't stop watching this", time: "1 day ago", likes: "11.9K", profilePic: "/test69.jpg" },
        ],
        10: [
            { id: 1, user: "Skyler", comment: "This is why I follow you!", time: "4 hours ago", likes: "22K", profilePic: "/p1.jpeg" },
            { id: 2, user: "Parker", comment: "Absolutely incredible", time: "2 days ago", likes: "14.5K", profilePic: "/test79.jpg" },
            { id: 3, user: "Victoria", comment: "I can't believe what I just watched", time: "1 day ago", likes: "18.3K", profilePic: "/test70.jpg" },
            { id: 4, user: "Joseph", comment: "This needs to go viral", time: "7 hours ago", likes: "12.7K", profilePic: "/test71.jpg" },
            { id: 5, user: "Grace", comment: "You never disappoint", time: "5 hours ago", likes: "16.2K", profilePic: "/p2.jpeg" },
            { id: 6, user: "Matthew", comment: "I'm showing this to everyone I know", time: "3 days ago", likes: "19.8K", profilePic: "/test68.jpg" },
            { id: 7, user: "Chloe", comment: "This is art in its purest form", time: "8 hours ago", likes: "15.4K", profilePic: "/test69.jpg" },
        ],
    };

    // Add these at the top of your component with other state variables
    const [touchStart, setTouchStart] = useState(0);
    const [touchEnd, setTouchEnd] = useState(0);

    // Touch handlers for document
    const handleDocumentTouchStart = (e: TouchEvent) => {
        setTouchStart(e.targetTouches[0].clientY);
    };

    const handleDocumentTouchEnd = (e: TouchEvent) => {
        setTouchEnd(e.changedTouches[0].clientY);
        handleSwipe();
    };

    // Touch handlers for div element
    const handleDivTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
        setTouchStart(e.targetTouches[0].clientY);
    };

    const handleDivTouchEnd = (e: React.TouchEvent<HTMLDivElement>) => {
        setTouchEnd(e.changedTouches[0].clientY);
        handleSwipe();
    };

    // Add this useEffect for touch events
    useEffect(() => {
        // Add touch event listeners to the document
        document.addEventListener('touchstart', handleDocumentTouchStart as EventListener);
        document.addEventListener('touchend', handleDocumentTouchEnd as EventListener);
        
        // Clean up
        return () => {
            document.removeEventListener('touchstart', handleDocumentTouchStart as EventListener);
            document.removeEventListener('touchend', handleDocumentTouchEnd as EventListener);
        };
    }, [currentVideoIndex]); // Add currentVideoIndex as a dependency

    const handleSwipe = () => {
    // Minimum swipe distance required (in pixels)
    const minSwipeDistance = 50;
    
    if (touchStart && touchEnd) {
        // Calculate swipe distance
        const distance = touchStart - touchEnd;
        
        // Swipe up (next video)
        if (distance > minSwipeDistance && currentVideoIndex < videos.length - 1) {
        handleNextVideo();
        }
        
        // Swipe down (previous video)
        if (distance < -minSwipeDistance && currentVideoIndex > 0) {
        handlePreviousVideo();
        }
        
        // Reset touch positions
        setTouchStart(0);
        setTouchEnd(0);
    }
    };

    // Initialize comments for each video
    useEffect(() => {
        const initialCommentsPerVideo: {[key: number]: Array<{id: number, user: string, comment: string, time: string, likes: string, profilePic: string}>} = {};
        videos.forEach(video => {
            initialCommentsPerVideo[video.id] = dummyCommentsData[video.id as keyof typeof dummyCommentsData] || [];
        });
        setCommentsPerVideo(initialCommentsPerVideo);
    }, []);

    // Get current video's comments
    const currentComments = commentsPerVideo[videos[currentVideoIndex]?.id] || [];

    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'ArrowUp' && currentVideoIndex > 0) {
                handlePreviousVideo();
            } else if (event.key === 'ArrowDown' && currentVideoIndex < videos.length - 1) {
                handleNextVideo();
            }
        };

        window.addEventListener('keydown', handleKeyDown);

        // Cleanup listener on component unmount
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [currentVideoIndex]);  // Added currentVideoIndex to dependencies

    const handleNextVideo = () => {
        if (currentVideoIndex < videos.length - 1) {
            setCurrentVideoIndex(prev => prev + 1);
        }
    };

    const handlePreviousVideo = () => {
        if (currentVideoIndex > 0) {
            setCurrentVideoIndex(prev => prev - 1);
        }
    };

    const toggleLike = (videoId: number) => {
        setLikedVideos(prev => ({
            ...prev,
            [videoId]: !prev[videoId]
        }));
    };

    const togglePlay = () => {
        const currentVideo = videoRefs.current[currentVideoIndex];
        if (currentVideo) {
            if (isPlaying) {
                currentVideo.pause();
            } else {
                currentVideo.play();
            }
            setIsPlaying(!isPlaying);
        }
    };

    const toggleMute = () => {
        const currentVideo = videoRefs.current[currentVideoIndex];
        if (currentVideo) {
            currentVideo.muted = !isMuted;
            setIsMuted(!isMuted);
        }
    };

    const toggleComments = () => {
        setIsCommentsOpen(!isCommentsOpen);
    };

    const handleAddComment = () => {
        if (newComment.trim() === '') return;
        
        const currentVideoId = videos[currentVideoIndex].id;
        const newCommentObj = {
            id: Date.now(), // Use timestamp for unique ID
            user: "You",
            comment: newComment,
            time: "Just now",
            likes: "0",
            profilePic: "/test77.jpg" // Using test77.jpg for new comments
        };
        
        setCommentsPerVideo(prev => ({
            ...prev,
            [currentVideoId]: [newCommentObj, ...(prev[currentVideoId] || [])]
        }));
        
        setNewComment('');
    };

    useEffect(() => {
        videoRefs.current = videoRefs.current.slice(0, videos.length);
    }, [videos.length]);

    return (
        <div className="bg-black min-h-screen w-full overflow-hidden">
            <Navigation user_id={user_id}/>
            <div className="h-[calc(100vh-70px)] w-full flex flex-col md:flex-row items-center justify-center overflow-hidden relative px-2 sm:px-4 md:px-6">
                {/* Main Video Container - Responsive for all screen sizes */}
                <div 
                    className={`relative aspect-[9/16] h-[60vh] sm:h-[70vh] md:h-[85%] max-w-full 
                        transition-transform duration-300 ${
                        isCommentsOpen ? 'transform scale-75 md:scale-100 md:-translate-x-[25%] lg:-translate-x-[35%] xl:-translate-x-[40%]' : ''
                    } overflow-hidden mt-4 md:-mt-16 md:ml-0 lg:ml-8`}
                    onTouchStart={handleDivTouchStart}
                    onTouchEnd={handleDivTouchEnd}
                >
                    {videos[currentVideoIndex] && (
                        <div 
                            key={currentVideoIndex}
                            className="animate-fade-up absolute w-full h-full"
                            style={{
                                willChange: 'transform, opacity',
                                backfaceVisibility: 'hidden'
                            }}
                        >
                            <video
                                ref={el => { videoRefs.current[currentVideoIndex] = el; }}
                                src={`/f${videos[currentVideoIndex].id}.mp4`}
                                className="w-full h-full object-cover rounded-xl cursor-pointer"
                                loop
                                autoPlay
                                muted={isMuted}
                                playsInline
                                onClick={togglePlay}
                                onPlay={() => setIsPlaying(true)}
                                onPause={() => setIsPlaying(false)}
                            />
                            
                            {/* Mute/Unmute Button - Responsive positioning */}
                            <button 
                                onClick={(e) => {
                                    e.stopPropagation();
                                    toggleMute();
                                }}
                                className="absolute bottom-4 right-4 bg-black/50 p-2 rounded-full hover:bg-black/70 transition-colors"
                            >
                                <Image
                                    src={isMuted ? "/volume-mute.svg" : "/volume-up.svg"}
                                    alt={isMuted ? "Unmute" : "Mute"}
                                    width={24}
                                    height={24}
                                />
                            </button>

                            {/* Play/Pause Overlay */}
                            {!isPlaying && (
                                <div 
                                    className="absolute inset-0 bg-black/30 flex items-center justify-center cursor-pointer"
                                    onClick={togglePlay}
                                >
                                    <Image
                                        src="/play.svg"
                                        alt="Play"
                                        width={64}
                                        height={64}
                                    />
                                </div>
                            )}
                            
                            {/* Gradient overlay */}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent pointer-events-none rounded-xl" />
                        </div>
                    )}
                </div>

                {/* Right Side Actions - Responsive positioning and sizing */}
                {videos[currentVideoIndex] && (
                    <div className={`flex flex-row md:flex-col gap-4 justify-center 
                        mt-4 md:mt-52 md:ml-4 transition-transform duration-300 ${
                        isCommentsOpen ? 'opacity-0 md:opacity-100 md:-translate-x-[60%] lg:-translate-x-[80%] xl:-translate-x-[100%]' : ''
                    }`}>
                        <div className="flex flex-col items-center">
                            <button 
                                onClick={() => toggleLike(videos[currentVideoIndex].id)}
                                className="bg-white rounded-lg p-2 w-[40px] h-[40px] sm:w-[50px] sm:h-[50px] flex items-center justify-center hover:scale-105 transition-transform"
                            >
                                <Image
                                    src={likedVideos[videos[currentVideoIndex].id] ? "/FXXfilledlike.svg" : "/FXXnotfilledlike.svg"}
                                    alt="Like"
                                    width={20}
                                    height={20}
                                    className="sm:w-6 sm:h-6"
                                />
                            </button>
                            <span className="text-white text-xs mt-1">{videos[currentVideoIndex].likes}</span>
                        </div>

                        <div className="flex flex-col items-center">
                            <button 
                                onClick={toggleComments}
                                className="bg-white rounded-lg p-2 w-[40px] h-[40px] sm:w-[50px] sm:h-[50px] flex items-center justify-center hover:scale-105 transition-transform"
                            >
                                <Image
                                    src="/FXXcomment.svg"
                                    alt="Comment"
                                    width={20}
                                    height={20}
                                    className="sm:w-6 sm:h-6"
                                />
                            </button>
                            <span className="text-white text-xs mt-1">{videos[currentVideoIndex].comments}</span>
                        </div>

                        <div className="flex flex-col items-center">
                            <button className="bg-white rounded-lg p-2 w-[40px] h-[40px] sm:w-[50px] sm:h-[50px] flex items-center justify-center hover:scale-105 transition-transform">
                                <Image
                                    src="/FXXbookmark.svg"
                                    alt="Bookmark"
                                    width={20}
                                    height={20}
                                    className="sm:w-6 sm:h-6"
                                />
                            </button>
                            <span className="text-white text-xs mt-1">{videos[currentVideoIndex].bookmarks}</span>
                        </div>
                    </div>
                )}

                {/* Navigation Arrows - Responsive positioning */}
                <div className={`fixed bottom-4 md:bottom-auto md:absolute right-4 sm:right-6
                    md:right-10 md:top-1/2 md:-translate-y-1/2 flex flex-row md:flex-col gap-4 transition-transform duration-300 z-10 ${
                    isCommentsOpen ? 'md:right-[40%] lg:right-[35%] xl:right-[30%]' : 'md:right-10'
                }`}>
                    <button 
                        onClick={handlePreviousVideo}
                        className={`bg-white rounded-lg p-2 w-[40px] h-[40px] sm:w-[50px] sm:h-[50px] flex items-center justify-center hover:scale-105 transition-transform ${
                            currentVideoIndex === 0 ? 'opacity-50 cursor-not-allowed' : ''
                        }`}
                        disabled={currentVideoIndex === 0}
                    >
                        <Image
                            src="/FXXchevronup.svg"
                            alt="Previous"
                            width={20}
                            height={20}
                            className="sm:w-6 sm:h-6 -rotate-90 md:rotate-0"
                        />
                    </button>
                    <button 
                        onClick={handleNextVideo}
                        className={`bg-white rounded-lg p-2 w-[40px] h-[40px] sm:w-[50px] sm:h-[50px] flex items-center justify-center hover:scale-105 transition-transform ${
                            currentVideoIndex === videos.length - 1 ? 'opacity-50 cursor-not-allowed' : ''
                        }`}
                        disabled={currentVideoIndex === videos.length - 1}
                    >
                        <Image
                            src="/FXXchevrondown.svg"
                            alt="Next"
                            width={20}
                            height={20}
                            className="sm:w-6 sm:h-6 -rotate-90 md:rotate-0"
                        />
                    </button>
                </div>

                {/* Comments Section - Responsive width and positioning */}
                {isCommentsOpen && (
                    <div className="fixed inset-0 md:absolute md:right-4 lg:right-10 md:top-[55%] md:-translate-y-1/2 
                        h-full md:h-[80%] w-full md:w-[450px] lg:w-[500px] xl:w-[550px] 
                        bg-black z-20 md:z-10 md:border md:border-white md:rounded-xl transition-transform duration-300 overflow-y-auto md:overflow-hidden">
                        <div className="flex items-center justify-between p-4 border-b border-white/20 sticky top-0 bg-black">
                            <h2 className="text-white text-xl hel-font">Comments {videos[currentVideoIndex].comments}</h2>
                            <button 
                                onClick={toggleComments}
                                className="text-white hover:opacity-70"
                            >
                                <Image
                                    src="/cross.svg"
                                    alt="Close"
                                    width={24}
                                    height={24}
                                    className='invert'
                                />
                            </button>
                        </div>
                        <div className="p-4 h-[calc(100%-140px)] overflow-y-auto">
                            {currentComments.map((comment: {id: number, user: string, comment: string, time: string, likes: string, profilePic: string}) => (
                                <div key={comment.id} className="mb-6">
                                    <div className="flex items-start gap-3">
                                        <Image
                                            src={comment.profilePic}
                                            alt={`${comment.user}'s profile`}
                                            width={32}
                                            height={32}
                                            className="rounded-full object-cover"
                                        />
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2">
                                                <span className="text-white font-medium hel-font">{comment.user}</span>
                                                <span className="text-gray-400 text-sm hel-font">{comment.time}</span>
                                            </div>
                                            <p className="text-white mt-1 hel-font">{comment.comment}</p>
                                            <div className="flex items-center gap-3 mt-2">
                                                <button className="text-gray-400 hover:text-white">
                                                    <Image
                                                        src="/FXXlike.svg"
                                                        alt="Like"
                                                        width={16}
                                                        height={16}
                                                    />
                                                </button>
                                                <span className="text-gray-400 text-sm hel-font">{comment.likes}</span>
                                                <button className="text-gray-400 hover:text-white text-sm hel-font">Reply</button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="sticky bottom-0 w-full p-4 border-t border-white/20 bg-black">
                            <div className="flex items-center gap-2">
                                <input
                                    type="text"
                                    placeholder="Add Comment..."
                                    className="w-full bg-transparent text-white border border-white/20 rounded-lg p-2 hel-font"
                                    value={newComment}
                                    onChange={(e) => setNewComment(e.target.value)}
                                    onKeyPress={(e) => {
                                        if (e.key === 'Enter') {
                                            handleAddComment();
                                        }
                                    }}
                                />
                                <button 
                                    onClick={handleAddComment}
                                    className="bg-white text-black px-3 py-2 rounded-lg hover:bg-gray-200 transition-colors whitespace-nowrap"
                                >
                                    Post
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}