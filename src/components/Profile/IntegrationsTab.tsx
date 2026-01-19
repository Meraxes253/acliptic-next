'use client'
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { SkeletonLoader } from '@/components/LoadingSkeletonScreen';
import useSWR from 'swr';

interface SocialMediaHandle {
  id: string;
  platform: 'youtube' | 'instagram';
  handle: string;
  connection_status: string;
  created_at: string;
  updated_at: string;
}

interface ApiResponse {
  confirmation: 'success' | 'fail';
  data?: SocialMediaHandle[];
  message?: string;
  error?: string;
}

interface IntegrationsTabProps {
  user_id: string;
  loading?: boolean;
}

// Fetcher function for SWR
const fetcher = async (url: string) => {
  const response = await fetch(url);
  const data = await response.json();
  
  if (!response.ok) {
    throw new Error(data.error || 'Failed to fetch data');
  }
  
  return data;
};

export default function IntegrationsTab({ user_id, loading = false }: IntegrationsTabProps) {
  const [socialConnections, setSocialConnections] = useState({
    youtube: false,
    instagram: false,
  });

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pendingDelete, setPendingDelete] = useState<"instagram" | "youtube" | null>(null);

  // Setup SWR for social media handles
  const { data: socialMediaData, error: socialMediaError, mutate: mutateSocialMedia } = useSWR<ApiResponse>(
    user_id ? `/api/streamers/${user_id}/social_media_handles` : null,
    fetcher
  );

  // Extract social media handles and status from SWR data
  useEffect(() => {
    if (socialMediaData?.data) {
      const youtubeHandle = socialMediaData.data.find(item => 
        item.platform === 'youtube' && item.connection_status === 'active'
      );

      const instagramHandle = socialMediaData.data.find(item => 
        item.platform === 'instagram' && item.connection_status === 'active'
      );


      setSocialConnections({
        youtube: !!youtubeHandle,
        instagram: !!instagramHandle
      });

    }
  }, [socialMediaData]);

  const handleYoutubeConnect = async () => {
    if (!user_id) {
      toast.error("You must be logged in to connect your YouTube account");
      return;
    }
    window.open("/api/youtube/auth", "_self");
  };

  const handleInstagramConnect = async () => {
    if (!user_id) {
      toast.error("You must be logged in to connect your Instagram account");
      return;
    }
    window.open("/api/instagram/auth", "_self");
  };



  const handleDeleteConnection = async (platform: 'youtube' | 'instagram') => {
    try {
      const response = await fetch(`/api/streamers/${user_id}/social_media_handles?platform=${platform}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to delete connection');
      }

      toast.success(`${platform.charAt(0).toUpperCase() + platform.slice(1)} connection removed successfully`);
      mutateSocialMedia(); // Refresh the data
    } catch (error) {
      console.error('Error deleting connection:', error);
      toast.error('Failed to remove connection');
    }
  };

  const handleConfirmDelete = () => {
    if (pendingDelete) {
      handleDeleteConnection(pendingDelete);
      setPendingDelete(null);
      setConfirmOpen(false);
    }
  };

  const socialMediaLoading = user_id && !socialMediaData && !socialMediaError;

  if (loading || socialMediaLoading) {
    return (
      <div className="space-y-6">
        <Card className="border-gray-200 dark:border-gray-700">
          <CardHeader>
            <CardTitle className="text-lg">Social Media Connections</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="space-y-2">
                  <SkeletonLoader className="h-4 w-16" />
                  <div className="flex items-center space-x-2">
                    <SkeletonLoader className="h-10 w-24" />
                    <SkeletonLoader className="h-8 w-16" />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (socialMediaError) {
    return (
      <div className="text-red-600 dark:text-red-400 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
        <p>Error loading social connections: {socialMediaError.message}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Social Media Connections */}
      <Card className="border-gray-200 dark:border-gray-700">
        <CardHeader>
          <CardTitle className="text-lg">Social Media Connections</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-6">
            {/* YouTube */}
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                  </svg>
                </div>
                <div className="flex-1">
                  <Label className="text-base font-medium">YouTube</Label>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Connect your YouTube channel</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <Button
                  onClick={handleYoutubeConnect}
                  disabled={socialConnections.youtube}
                  variant={socialConnections.youtube ? "outline" : "default"}
                  className={`min-w-[100px] rounded-full ${
                    !socialConnections.youtube ? 'gradient-silver text-white hover:text-white hover:opacity-90 border-0' : ''
                  }`}
                >
                  {socialConnections.youtube ? "Connected" : "Connect"}
                </Button>

                {socialConnections.youtube && (
                  <Button
                    variant="destructive"
                    size="sm"
                    className="rounded-full"
                    onClick={() => {
                      setPendingDelete('youtube');
                      setConfirmOpen(true);
                    }}
                  >
                    Remove
                  </Button>
                )}
              </div>
            </div>

            {/* Instagram */}
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                  </svg>
                </div>
                <div className="flex-1">
                  <Label className="text-base font-medium">Instagram</Label>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Connect your Instagram account</p>
                </div>
              </div>
              
              <div className="flex flex-col space-y-2">
                <div className="flex items-center space-x-3">
                  <Button
                    onClick={handleInstagramConnect}
                    disabled={socialConnections.instagram}
                    variant={socialConnections.instagram ? "outline" : "default"}
                    className={`min-w-[100px] rounded-full ${
                      !socialConnections.instagram ? 'gradient-silver text-white hover:text-white hover:opacity-90 border-0' : ''
                    }`}
                  >
                    {socialConnections.instagram ? "Connected" : "Connect"}
                  </Button>

                  {socialConnections.instagram && (
                    <Button
                      variant="destructive"
                      size="sm"
                      className="rounded-full"
                      onClick={() => {
                        setPendingDelete('instagram');
                        setConfirmOpen(true);
                      }}
                    >
                      Remove
                    </Button>
                  )}
                </div>

                {socialConnections.instagram && (
                  <a
                    href="/instagram-revoke-access"
                    className="text-xs text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 transition"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    How to completely revoke Instagram access
                  </a>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* API Access */}
      {/* <Card className="border-gray-200 dark:border-gray-700">
        <CardHeader>
          <CardTitle className="text-lg">API Access</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
              <div>
                <h3 className="font-medium text-gray-900 dark:text-white">API Key</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">Access our API programmatically</p>
              </div>
              <Button variant="outline" size="sm" disabled>
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                Pro Only
              </Button>
            </div>
            
            <div className="text-sm text-gray-600 dark:text-gray-400">
              <p>API access is available for Pro subscribers. Upgrade your plan to get:</p>
              <ul className="mt-2 space-y-1 list-disc list-inside">
                <li>Full API access with 10,000 requests/month</li>
                <li>Real-time webhooks</li>
                <li>Advanced analytics endpoints</li>
                <li>Priority support</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card> */}

      {/* Confirmation Dialog */}
      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent>
          <DialogTitle>Are you sure?</DialogTitle>
          <DialogDescription>
            This will permanently remove your {pendingDelete} connection. You can reconnect it anytime.
          </DialogDescription>
          <DialogFooter>
            <Button variant="ghost" className="rounded-full" onClick={() => setConfirmOpen(false)}>Cancel</Button>
            <Button variant="destructive" className="rounded-full" onClick={handleConfirmDelete}>Confirm</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}