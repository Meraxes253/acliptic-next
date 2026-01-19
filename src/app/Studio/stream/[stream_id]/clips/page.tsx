'use client'

import { useEffect, useState } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { SessionProvider } from "next-auth/react"
import { use } from "react"
import Navigation from "@/components/afterNav"
import StudioClipsPageComponent from "@/components/Studio/StudioClipsPage"

interface StudioClipsPageProps {
  params: Promise<{
    stream_id: string
  }>
}

export default function StudioClipsPage({ params }: StudioClipsPageProps) {
  const { stream_id } = use(params)
  const searchParams = useSearchParams()
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Profile modal state
  const [profileModalOpen, setProfileModalOpen] = useState(false)
  const [profileModalTab, setProfileModalTab] = useState('profile')

  // Fetch user data on mount
  useEffect(() => {
    async function fetchUserData() {
      try {
        const response = await fetch('/api/user/me')
        if (response.ok) {
          const data = await response.json()
          setUser(data.user)
        } else {
          setUser({
            id: "",
            email: "",
            username: "",
            phone_number: "",
            image: "",
          })
        }
      } catch (error) {
        console.error("Error fetching user:", error)
        setUser({
          id: "",
          email: "",
          username: "",
          phone_number: "",
          image: "",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchUserData()
  }, [])

  // Handle URL parameters for profile modal
  useEffect(() => {
    const openProfileModal = searchParams.get('openProfileModal')
    const activeTab = searchParams.get('activeTab')

    if (openProfileModal === 'true') {
      setProfileModalOpen(true)
      setProfileModalTab(activeTab || 'profile')

      const newSearchParams = new URLSearchParams(searchParams.toString())
      newSearchParams.delete('openProfileModal')
      newSearchParams.delete('activeTab')

      const newParamsString = newSearchParams.toString()
      const newUrl = newParamsString ? `/Studio/stream/${stream_id}/clips?${newParamsString}` : `/Studio/stream/${stream_id}/clips`
      router.replace(newUrl, { scroll: false })
    }
  }, [searchParams, router, stream_id])

  const handleProfileModalClose = () => {
    setProfileModalOpen(false)
  }

  if (isLoading || !user) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>
  }

  return (
    <SessionProvider>
      <Navigation
        user={user}
        externalSettingsOpen={profileModalOpen}
        externalSettingsTab={profileModalTab}
        onExternalSettingsClose={handleProfileModalClose}
      />
      <StudioClipsPageComponent stream_id={stream_id} />
    </SessionProvider>
  )
}
