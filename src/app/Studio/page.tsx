'use client'

import { Suspense, useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Navigation from "@/components/afterNav";
import StudioPage from "@/components/Studio/StudioPage";

function StudioContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [userId, setUserId] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  // Profile modal state
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const [profileModalTab, setProfileModalTab] = useState('profile');

  // Fetch user data on mount
  useEffect(() => {
    async function fetchUserData() {
      try {
        const response = await fetch('/api/user/me');
        if (response.ok) {
          const data = await response.json();
          setUser(data.user);
          setUserId(data.user.id);
        } else {
          // Set empty user if not authenticated
          setUser({
            id: "",
            email: "",
            username: "",
            phone_number: "",
            image: "",
          });
        }
      } catch (error) {
        console.error("Error fetching user:", error);
        setUser({
          id: "",
          email: "",
          username: "",
          phone_number: "",
          image: "",
        });
      } finally {
        setIsLoading(false);
      }
    }

    fetchUserData();
  }, []);

  // Handle URL parameters for profile modal
  useEffect(() => {
    const openProfileModal = searchParams.get('openProfileModal');
    const activeTab = searchParams.get('activeTab');

    if (openProfileModal === 'true') {
      setProfileModalOpen(true);
      setProfileModalTab(activeTab || 'profile');

      // Clear the URL parameters
      const newSearchParams = new URLSearchParams(searchParams.toString());
      newSearchParams.delete('openProfileModal');
      newSearchParams.delete('activeTab');

      const newParamsString = newSearchParams.toString();
      const newUrl = newParamsString ? `/Studio?${newParamsString}` : '/Studio';
      router.replace(newUrl, { scroll: false });
    }
  }, [searchParams, router]);

  const handleProfileModalClose = () => {
    setProfileModalOpen(false);
  };

  if (isLoading || !user) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  return (
    <>
      <Navigation
        user={user}
        externalSettingsOpen={profileModalOpen}
        externalSettingsTab={profileModalTab}
        onExternalSettingsClose={handleProfileModalClose}
      />
      <StudioPage
        user_id={userId}
        twitch_username={user.username}
        youtube_channel_id={user.youtube_channel_id || ""}
      />
    </>
  );
}

export default function Studio() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen">Loading...</div>}>
      <StudioContent />
    </Suspense>
  );
}