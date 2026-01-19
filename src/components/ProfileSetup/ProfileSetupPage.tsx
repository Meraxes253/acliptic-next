"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
//import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const testimonials = [
  {
    text: "Acliptic is a revelation. Other platforms shroud their payment structure in secrecy, but Acliptic is transparent and fair.",
    author: "Jane Smith",
    role: "Application Development",
    image: "/t5.jpg"
  },
  {
    text: "The platform's intuitive interface and robust feature set have transformed how I manage my livestreams. It's a game-changer for content creators.",
    author: "Michael Chen",
    role: "Full Stack Developer",
    image: "/t6.jpg"
  },
  {
    text: "What sets Acliptic apart is their commitment to fair compensation and transparency. It's refreshing to work with a platform that puts creators first.",
    author: "Sarah Johnson",
    role: "Software Engineer",
    image: "/t7.jpg"
  },
  {
    text: "I've tried many platforms, but Acliptic's approach to clipping and shortform content is unmatched. It's become my go-to platform.",
    author: "Charlize David",
    role: "Backend Developer",
    image: "/t8.jpg"
  }
];

interface ProfileSetupPageProps{
    user_id : string,
  }
export default function ProfileSetupPage({user_id} : ProfileSetupPageProps) {
  const router = useRouter();
  //const supabase = createClient();
  const [loading, setLoading] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [step, setStep] = useState('social'); // Changed initial step to social
  const [progressBarWidth, setProgressBarWidth] = useState(0);
  const [socialConnectionsLoading, setSocialConnectionsLoading] = useState(true);

  // Add state for social connections
  const [socialConnections, setSocialConnections] = useState({
    youtube: false,
    instagram: false
  });

  const [profile, setProfile] = useState({
    username: "",
    phoneNumber: "",
    youtube_channel_id: "", // Add this line
  });

  // CHANGED USEEFFECT

  useEffect(() => {
    const fetchUserData = async () => {

        try {
            // ASSUME USER AUTHENTICATED AUTH CHECK DONE IN MIDDLEWARE

             // Fetch social media handles using the API route
            const response = await fetch(`/api/streamers/${user_id}/social_media_handles`);

            if (!response.ok) {
            throw new Error(`Error fetching social media handles: ${response.statusText}`);
            }

            const socialData = await response.json();

            // Check for YouTube and Instagram connections (platform_id: 701 for YouTube, 703 for Instagram)
            const youtubeConnected = socialData?.data?.some((item: { platform_id: number; access_token: string | null; connection_status: string }) => 
                item.platform_id === 701 && item.access_token && item.connection_status !== "disconnected"
            );

            const instagramConnected = socialData?.data?.some((item: { platform_id: number; access_token: string | null; connection_status: string }) => 
                item.platform_id === 703 && item.access_token && item.connection_status !== "disconnected"
            );

            setSocialConnections({
            youtube: youtubeConnected || false,
            instagram: instagramConnected || false
            });

        } catch (error) {
            console.error("Error fetching user data:", error);
          } finally {
            setSocialConnectionsLoading(false);
          }
        };

        fetchUserData();

  }, [])

  /*
  useEffect(() => {
    const fetchUserData = async () => {
      
      try {
        // Get the current user
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        
        if (userError || !user) {
          console.error("User not authenticated:", userError);
          setSocialConnectionsLoading(false);
          return;
        }
        
        // Fetch social media handles using the API route
        const response = await fetch(`/api/streamers/${user.id}/social_media_handles`);
        
        if (!response.ok) {
          throw new Error(`Error fetching social media handles: ${response.statusText}`);
        }
        
        const socialData = await response.json();
        
        // Check for YouTube and Instagram connections (platform_id: 701 for YouTube, 703 for Instagram)
        const youtubeConnected = socialData?.some((item: any) => 
          item.platform_id === 701 && item.access_token && item.connection_status !== "disconnected"
        );
        
        const instagramConnected = socialData?.some((item: any) => 
          item.platform_id === 703 && item.access_token && item.connection_status !== "disconnected"
        );
        
        setSocialConnections({
          youtube: youtubeConnected || false,
          instagram: instagramConnected || false
        });
      } catch (error) {
        console.error("Error fetching user data:", error);
      } finally {
        setSocialConnectionsLoading(false);
      }
    };
    fetchUserData();
  }, []);
  */

  useEffect(() => {
    const timer = setInterval(() => {
      setIsTransitioning(true);
      setTimeout(() => {
        setCurrentIndex((prev) => (prev + 1) % testimonials.length);
        setIsTransitioning(false);
      }, 100);
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    setProgressBarWidth(step === 'social' ? 0 : 100);
  }, [step]);

  // CHANGED FOR DRIZZLE
  const handleSkip = async () => {
    setLoading(true);
    try {
      // Mark onboarding as complete without filling profile details
      await fetch("/api/user/updateOnboardingStatus", {
        method: "POST",
        body: JSON.stringify({
          user_id: user_id,
          username: "",
          phone_number: "",
          youtube_channel_id: ""
        })
      });
      router.push("/Studio");
    } catch (error) {
      console.error("Error skipping profile setup:", error);
      alert("Error skipping profile setup.");
    } finally {
      setLoading(false);
    }
  };

  const handleNext = async (e: React.FormEvent) => {

    e.preventDefault();
    if (step === 'social') {
      setStep('profile');
      return;
    }

    setLoading(true);

    try {
        // ASUME USER IS AUTHENTICATED
        // ONBOARDING BOOLEAN SET TO TRUE IN API ROUTE
        let res = await fetch("/api/user/updateOnboardingStatus",{
            method: "POST",
            body: JSON.stringify({
              user_id: user_id,
              username: profile.username,
              phone_number:  profile.phoneNumber,
              youtube_channel_id: profile.youtube_channel_id // Add this line
            })
          })

          res = await res.json()

          console.log(res)

          router.push("/Studio");

    } catch (error) {
      console.error("Error setting up profile:", error);
      alert("Error setting up profile.");
    } finally {
      setLoading(false);
    }

    /*
    e.preventDefault();
    if (step === 'social') {
      setStep('profile');
      return;
    }
    setLoading(true);
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (!user || authError) {
        alert("User not authenticated.");
        return;
      }
      const { error: updateError } = await supabase.auth.updateUser({
        data: {
          username: profile.username,
          phone: profile.phoneNumber,
          onboarding: true,
        },
      });
      if (updateError) throw updateError;
      router.push("/Dashboard");
    } catch (error) {
      console.error("Error setting up profile:", error);
      alert("Error setting up profile.");
    } finally {
      setLoading(false);
    }
    */
  };

  const handleSocialAuth = (provider: 'instagram' | 'youtube') => {
    if (provider === 'instagram' && !socialConnections.instagram) {
      window.location.href = '/api/instagram/auth';
    } else if (provider === 'youtube' && !socialConnections.youtube) {
      window.location.href = '/api/youtube/auth';
    }
  };

  return (
    <div className="flex min-h-screen flex-col lg:flex-row">
      {/* Main Content */}
      <div className="flex-1 flex flex-col items-center justify-center p-4 sm:p-6 lg:p-8 -mt-20">
        <img 
          src="/AElogo2.png" 
          alt="Side Effect Logo" 
          className="mb-2 h-16 sm:h-20"
        />

        <div className="flex mb-4 sm:mb-8">
          <img src="/t1.jpg" alt="" className="w-6 h-6 sm:w-8 sm:h-8 rounded-full" />
          <img src="/t2.jpg" alt="" className="w-6 h-6 sm:w-8 sm:h-8 rounded-full -ml-2" />
          <img src="/t3.jpg" alt="" className="w-6 h-6 sm:w-8 sm:h-8 rounded-full -ml-2" />
          <img src="/t4.jpg" alt="" className="w-6 h-6 sm:w-8 sm:h-8 rounded-full -ml-2" />
        </div>

        {step === 'social' ? (
          <>
            <div className="w-full max-w-md">
              <p className="text-xs sm:text-sm mb-2 hel-font">You&#39;re almost there!</p>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-normal mb-4 sm:mb-8" style={{ letterSpacing: '-0.04em', lineHeight: '92.7%' }}>
                Link your accounts
              </h1>

              <form onSubmit={handleNext} className="space-y-4 sm:space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <p className="mb-2 hel-font text-sm sm:text-base">Connect Instagram</p>
                    <Button
                      type="button"
                      onClick={() => handleSocialAuth('instagram')}
                      className={`w-full h-20 sm:h-24 flex items-start justify-start pt-4 pl-4 rounded-2xl ${
                        socialConnections.instagram
                          ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                          : 'gradient-silver text-white hover:opacity-90'
                      }`}
                      disabled={socialConnections.instagram || socialConnectionsLoading}
                    >
                      <div className="flex flex-col items-start">
                        <img src="/instaSvg.svg" alt="Instagram" className="w-5 h-5 sm:w-6 sm:h-6 mb-2" />
                        {socialConnections.instagram && (
                          <span className="text-xs font-medium mt-2">Connected</span>
                        )}
                      </div>
                    </Button>
                  </div>
                  <div>
                    <p className="mb-2 hel-font text-sm sm:text-base">Connect YouTube</p>
                    <Button
                      type="button"
                      onClick={() => handleSocialAuth('youtube')}
                      className={`w-full h-20 sm:h-24 flex items-start justify-start pt-4 pl-4 rounded-2xl ${
                        socialConnections.youtube
                          ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                          : 'gradient-silver text-white hover:opacity-90'
                      }`}
                      disabled={socialConnections.youtube || socialConnectionsLoading}
                    >
                      <div className="flex flex-col items-start">
                        <img src="/youtubeSvg.svg" alt="YouTube" className="w-6 h-6 sm:w-7 sm:h-7 mb-2" />
                        {socialConnections.youtube && (
                          <span className="text-xs font-medium mt-2">Connected</span>
                        )}
                      </div>
                    </Button>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex gap-3">
                    <Button
                      type="submit"
                      className="flex-1 sm:flex-none sm:px-8 gradient-silver text-white hover:opacity-90 rounded-full border-0 hel-font text-sm sm:text-base"
                      disabled={loading || socialConnectionsLoading}
                    >
                      Next
                    </Button>
                    <Button
                      type="button"
                      onClick={handleSkip}
                      className="flex-1 sm:flex-none sm:px-8 gradient-silver text-white hover:opacity-90 rounded-full border-0 hel-font text-sm sm:text-base"
                      disabled={loading || socialConnectionsLoading}
                    >
                      Skip
                    </Button>
                  </div>

                  <div className="flex gap-2 relative h-1">
                    <div className="h-full w-[160px] sm:w-[320px] gradient-silver rounded" />
                    <div className="h-full w-[160px] sm:w-[320px] bg-gray-200 rounded overflow-hidden">
                      <div
                        className="h-full gradient-silver transition-all duration-700 ease-in-out"
                        style={{ width: `${progressBarWidth}%` }}
                      />
                    </div>
                  </div>
                </div>
              </form>
            </div>
          </>
        ) : (
          <>
            <div className="w-full max-w-lg">
              <p className="text-xs sm:text-sm mb-2 hel-font">Last step!</p>
              <h1 className="text-2xl sm:text-3xl font-normal mb-4 sm:mb-8" style={{ letterSpacing: '-0.04em', lineHeight: '92.7%' }}>
                Complete your profile information
              </h1>

              <form onSubmit={handleNext} className="space-y-4 sm:space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 hel-font">
                  <div>
                    <Label htmlFor="username" className="text-sm sm:text-base">Your Twitch Username</Label>
                    <Input
                      id="username"
                      value={profile.username}
                      onChange={(e) => setProfile({ ...profile, username: e.target.value })}
                      className="mt-2 text-sm sm:text-base gradient-silver text-white placeholder-gray-300 border-0 rounded-full focus:ring-2 focus:ring-gray-400"
                      placeholder="Your Twitch Username"
                    />
                  </div>
                  <div>
                    <Label htmlFor="youtube_channel_id" className="text-sm sm:text-base">YouTube Channel ID</Label>
                    <Input
                      id="youtube_channel_id"
                      value={profile.youtube_channel_id}
                      onChange={(e) => setProfile({ ...profile, youtube_channel_id: e.target.value })}
                      className="mt-2 text-sm sm:text-base gradient-silver text-white placeholder-gray-300 border-0 rounded-full focus:ring-2 focus:ring-gray-400"
                      placeholder="Your YouTube Channel ID"
                    />
                  </div>
                  <div>
                    <Label htmlFor="phoneNumber" className="text-sm sm:text-base">Phone Number</Label>
                    <Input
                      id="phoneNumber"
                      value={profile.phoneNumber}
                      onChange={(e) => setProfile({ ...profile, phoneNumber: e.target.value })}
                      className="mt-2 text-sm sm:text-base gradient-silver text-white placeholder-gray-300 border-0 rounded-full focus:ring-2 focus:ring-gray-400"
                      placeholder="Phone Number"
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <Button 
                    type="submit" 
                    className="w-full sm:w-auto px-8 bg-black text-white hover:bg-gray-800 text-sm sm:text-base"
                    disabled={loading}
                  >
                    Finish
                  </Button>

                  <div className="flex gap-2 relative h-1">
                    <div className="h-full w-[160px] sm:w-[320px] bg-black rounded" />
                    <div className="h-full w-[160px] sm:w-[320px] bg-gray-200 rounded overflow-hidden">
                      <div 
                        className="h-full bg-black transition-all duration-700 ease-in-out" 
                        style={{ width: `${progressBarWidth}%` }}
                      />
                    </div>
                  </div>
                </div>
              </form>
            </div>
          </>
        )}
      </div>

      {/* Testimonial Sidebar */}
      <div className="w-full lg:w-[450px] bg-[#F5F8FE] p-6 sm:p-9 flex flex-col justify-center">
        <div>
          <p 
            className={`text-lg sm:text-xl mb-4 sm:mb-6 transition-opacity duration-200 ${
              isTransitioning ? 'opacity-0' : 'opacity-100'
            }`}
          >
            {testimonials[currentIndex].text}
          </p>
          <div 
            className={`flex items-center gap-3 transition-opacity duration-200 ${
              isTransitioning ? 'opacity-0' : 'opacity-100'
            }`}
          >
            <img 
              src={testimonials[currentIndex].image}
              alt="" 
              className="w-8 h-8 sm:w-10 sm:h-10 rounded-full"
            />
            <div>
              <p className="font-medium text-sm sm:text-base">{testimonials[currentIndex].author}</p>
              <p className="text-xs sm:text-sm text-gray-600">{testimonials[currentIndex].role}</p>
            </div>
          </div>
        </div>

        {/* Navigation Dots */}
        <div className="flex gap-2 justify-center mt-6 sm:mt-8">
          {testimonials.map((_, index) => (
            <button
              key={index}
              onClick={() => {
                setIsTransitioning(true);
                setTimeout(() => {
                  setCurrentIndex(index);
                  setIsTransitioning(false);
                }, 200);
              }}
              className={`w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full transition-colors ${
                index === currentIndex ? 'bg-blue-600' : 'bg-gray-300'
              }`}
              aria-label={`Go to testimonial ${index + 1}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}