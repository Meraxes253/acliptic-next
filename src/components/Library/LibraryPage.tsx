"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { LoadingScreen, SkeletonLoader } from "@/components/LoadingSkeletonScreen";
import useSWR from 'swr';
import { toast, Toaster } from "sonner";
import { AnimatePresence, motion } from "framer-motion";
import { Search, Filter, ChevronDown, ChevronUp } from "lucide-react";

// Type definitions
interface ClipCount {
  count: number;
}

interface Stream {
  stream_id: string;
  user_id: string;
  stream_title: string;
  stream_link?: string;
  stream_start: string;
  stream_end?: string;
  auto_upload: boolean;
  created_at?: string;
  updated_at?: string;
  thumbnail_url: string | null;
  clipCount: ClipCount[];
  live: boolean;
  platform_id: number;
}

interface ApiResponse {
  confirmation: string;
  data: Stream[];
}
 
interface StreamData {
  streamId: string;
  index: number;
  title: string;
  thumbnail: string;
  streamTime: string;
  clipCount: number;
  autoUploaded: boolean;
  live: boolean;
  platform: 'YouTube' | 'Twitch' | 'Unknown';
  platformId: number;
  createdAt: Date;
}

// Filter and sort types
type SortBy = 'date' | 'title' | 'clipCount';
type SortOrder = 'asc' | 'desc';
type PlatformFilter = 'all' | 'youtube' | 'twitch';
type StatusFilter = 'all' | 'livestream' | 'video';
type DateRange = 'all' | 'today' | 'week' | 'month' | 'quarter' | 'year';

// Helper function to get platform name
function getPlatformName(platformId: number): 'YouTube' | 'Twitch' | 'Unknown' {
  switch (platformId) {
    case 701:
      return 'YouTube';
    case 702:
      return 'Twitch';
    default:
      return 'Unknown';
  }
}

// Helper function to get platform colors
function getPlatformColor(platform: 'YouTube' | 'Twitch' | 'Unknown'): string {
  switch (platform) {
    case 'YouTube':
      return 'bg-red-600 text-white';
    case 'Twitch':
      return 'bg-purple-600 text-white';
    default:
      return 'bg-gray-600 text-white';
  }
}

// Helper function to format stream time
function formatStreamTime(streamDate: Date): string {
  const now = new Date();
  const diffInHours = Math.floor((now.getTime() - streamDate.getTime()) / (1000 * 60 * 60));
  
  if (diffInHours < 1) {
    return "streamed just now";
  } else if (diffInHours === 1) {
    return "streamed an hour ago";
  } else if (diffInHours < 24) {
    return `streamed ${diffInHours} hours ago`;
  } else {
    const days = Math.floor(diffInHours / 24);
    return `streamed ${days} ${days === 1 ? 'day' : 'days'} ago`;
  }
}

// Helper function to check if date is within range
function isDateInRange(date: Date, range: DateRange): boolean {
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const dayInMs = 24 * 60 * 60 * 1000;
  
  switch (range) {
    case 'today':
      return diff < dayInMs;
    case 'week':
      return diff < 7 * dayInMs;
    case 'month':
      return diff < 30 * dayInMs;
    case 'quarter':
      return diff < 90 * dayInMs;
    case 'year':
      return diff < 365 * dayInMs;
    default:
      return true;
  }
}

// Filter and sort functions
function filterAndSortStreams(
  streams: StreamData[],
  searchTerm: string,
  sortBy: SortBy,
  sortOrder: SortOrder,
  platformFilter: PlatformFilter,
  statusFilter: StatusFilter,
  dateRange: DateRange
): StreamData[] {
  let filtered = [...streams];

  // Apply search filter
  if (searchTerm) {
    filtered = filtered.filter(stream =>
      stream.title.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }

  // Apply platform filter
  if (platformFilter !== 'all') {
    filtered = filtered.filter(stream => {
      if (platformFilter === 'youtube') return stream.platform === 'YouTube';
      if (platformFilter === 'twitch') return stream.platform === 'Twitch';
      return true;
    });
  }

  // Apply status filter
  if (statusFilter !== 'all') {
    filtered = filtered.filter(stream => {
      if (statusFilter === 'livestream') return stream.live;
      if (statusFilter === 'video') return !stream.live;
      return true;
    });
  }

  // Apply date range filter
  if (dateRange !== 'all') {
    filtered = filtered.filter(stream => isDateInRange(stream.createdAt, dateRange));
  }

  // Apply sorting
  filtered.sort((a, b) => {
    let comparison = 0;
    
    switch (sortBy) {
      case 'date':
        comparison = a.createdAt.getTime() - b.createdAt.getTime();
        break;
      case 'title':
        comparison = a.title.localeCompare(b.title);
        break;
      case 'clipCount':
        comparison = a.clipCount - b.clipCount;
        break;
    }
    
    return sortOrder === 'asc' ? comparison : -comparison;
  });

  return filtered;
}

// Skeleton Components
const StreamCardSkeleton = () => (
  <div className="relative w-full rounded-2xl overflow-hidden bg-black shadow-lg border border-gray-600">
    {/* Image Container */}
    <div className="aspect-video w-full relative">
      <SkeletonLoader className="w-full h-full" />

      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent"></div>

      {/* Top Labels */}
      <div className="absolute top-3 left-3 flex flex-wrap gap-2">
        <SkeletonLoader className="w-16 h-6 rounded-full" />
        <SkeletonLoader className="w-24 h-6 rounded-full" />
      </div>

      {/* Platform Badge */}
      <div className="absolute top-3 right-3">
        <SkeletonLoader className="w-16 h-6 rounded-full" />
      </div>

      {/* Bottom Content */}
      <div className="absolute bottom-0 left-0 right-0 p-4">
        <SkeletonLoader className="w-3/4 h-5 rounded mb-2" />
        <SkeletonLoader className="w-1/2 h-4 rounded" />
      </div>
    </div>
  </div>
);

const StreamsLoadingSkeleton = () => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mx-auto max-w-[1400px] mt-8 mb-12 px-4">
    {[...Array(6)].map((_, index) => (
      <StreamCardSkeleton key={index} />
    ))}
  </div>
);

// Filter Component
const FilterSection = ({
  searchTerm,
  setSearchTerm,
  sortBy,
  setSortBy,
  sortOrder,
  setSortOrder,
  platformFilter,
  setPlatformFilter,
  statusFilter,
  setStatusFilter,
  dateRange,
  setDateRange,
  isOpen,
  setIsOpen
}: {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  sortBy: SortBy;
  setSortBy: (sort: SortBy) => void;
  sortOrder: SortOrder;
  setSortOrder: (order: SortOrder) => void;
  platformFilter: PlatformFilter;
  setPlatformFilter: (platform: PlatformFilter) => void;
  statusFilter: StatusFilter;
  setStatusFilter: (status: StatusFilter) => void;
  dateRange: DateRange;
  setDateRange: (range: DateRange) => void;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}) => (
  <div className="gradient-silver border rounded-2xl p-4 sm:p-6 mx-auto max-w-[1400px] mt-8 mb-6">
    {/* Search Bar - Always Visible */}
    <div className="mb-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 w-5 h-5" />
        <Input
          placeholder="Search streams by title..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10 bg-white text-black placeholder-gray-500 rounded-full shadow-sm"
        />
      </div>
    </div>

    {/* Filter Toggle */}
    <div className="flex items-center justify-between mb-4">
      <div className="flex items-center gap-2">
        <Filter className="w-5 h-5 text-white" />
        <h3 className="text-base font-medium text-white">Advanced Filters</h3>
      </div>
      <Button
        variant="ghost"
        onClick={() => setIsOpen(!isOpen)}
        className="text-white hover:text-white hover:bg-gray-800 rounded-full"
      >
        {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        {isOpen ? 'Hide' : 'Show'}
      </Button>
    </div>

    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="overflow-hidden"
        >
          {/* Filter Controls */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {/* Sort By */}
            <div>
              <Label className="text-white text-sm font-medium mb-2 block">Sort By</Label>
              <Select value={sortBy} onValueChange={(value: SortBy) => setSortBy(value)}>
                <SelectTrigger className="bg-black border-gray-600 text-white rounded-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-black border-gray-600">
                  <SelectItem value="date" className="text-white">Date Created</SelectItem>
                  <SelectItem value="title" className="text-white">Title</SelectItem>
                  <SelectItem value="clipCount" className="text-white">Clip Count</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Order */}
            <div>
              <Label className="text-white text-sm font-medium mb-2 block">Order</Label>
              <Select value={sortOrder} onValueChange={(value: SortOrder) => setSortOrder(value)}>
                <SelectTrigger className="bg-black border-gray-600 text-white rounded-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-black border-gray-600">
                  <SelectItem value="desc" className="text-white">Newest First</SelectItem>
                  <SelectItem value="asc" className="text-white">Oldest First</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Platform */}
            <div>
              <Label className="text-white text-sm font-medium mb-2 block">Platform</Label>
              <Select value={platformFilter} onValueChange={(value: PlatformFilter) => setPlatformFilter(value)}>
                <SelectTrigger className="bg-black border-gray-600 text-white rounded-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-black border-gray-600">
                  <SelectItem value="all" className="text-white">All Platforms</SelectItem>
                  <SelectItem value="youtube" className="text-white">YouTube</SelectItem>
                  <SelectItem value="twitch" className="text-white">Twitch</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Status */}
            <div>
              <Label className="text-white text-sm font-medium mb-2 block">Status</Label>
              <Select value={statusFilter} onValueChange={(value: StatusFilter) => setStatusFilter(value)}>
                <SelectTrigger className="bg-black border-gray-600 text-white rounded-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-black border-gray-600">
                  <SelectItem value="all" className="text-white">All Status</SelectItem>
                  <SelectItem value="livestream" className="text-white">Livestream</SelectItem>
                  <SelectItem value="video" className="text-white">Video</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Date Range */}
          <div>
            <Label className="text-white text-sm font-medium mb-2 block">Date Range</Label>
            <div className="flex flex-wrap gap-2">
              {[
                { value: 'all', label: 'All Time' },
                { value: 'today', label: 'Today' },
                { value: 'week', label: 'This Week' },
                { value: 'month', label: 'This Month' },
                { value: 'quarter', label: 'Last 3 Months' },
                { value: 'year', label: 'This Year' }
              ].map((range) => (
                <Button
                  key={range.value}
                  variant={dateRange === range.value ? "default" : "secondary"}
                  size="sm"
                  onClick={() => setDateRange(range.value as DateRange)}
                  className={`rounded-full ${
                    dateRange === range.value
                      ? 'gradient-silver text-white hover:text-white hover:opacity-90 border-0'
                      : 'bg-black text-white hover:bg-gray-800 border border-gray-600'
                  }`}
                >
                  {range.label}
                </Button>
              ))}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  </div>
);
 
interface LibraryPageProps {
  user_id: string,
}

// Custom fetcher for GET requests used by SWR
const fetcher = (url: string) => fetch(url).then(res => res.json());

// Custom fetcher for POST requests used by SWR
const postFetcher = (url: string, user_id: string) => {
  return fetch(url, {
      method: "POST",
      headers: {
          "Content-Type": "application/json",
      },
      body: JSON.stringify({ user_id }),
  })
      .then((res) => {
          if (!res.ok) {
              const error = new Error("Failed to fetch plugin state via POST");
              throw error;
          }
          return res.json();
      })
      .then((response) => {
           if (response && typeof response.data !== 'undefined') {
               return response.data;
           }
           console.warn("Response structure might be different than expected:", response);
           return response;
      })
      .catch(error => {
           console.error("Error in postFetcher:", error);
           throw error;
      });
};
 
export default function LibraryPage({user_id } : LibraryPageProps) {

  const router = useRouter();
  const [streams, setStreams] = useState<StreamData[]>([]);
  const [pluginState, setPluginState] = useState<{plugin_active: boolean} | null>(null);
  
  // Filter and pagination state
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<SortBy>('date');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const [platformFilter, setPlatformFilter] = useState<PlatformFilter>('all');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [dateRange, setDateRange] = useState<DateRange>('all');
  const [isFilterOpen, setIsFilterOpen] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [streamsPerPage] = useState(10);
  

  // SWR hook for streams data
  const {
    data: streamsData,
    error: streamsError,
    isLoading: streamsLoading,
    mutate: mutateStreams,
  } = useSWR(
    user_id ? `/api/streamers/${user_id}/streams` : null,
    fetcher,
    {
      refreshInterval: 10000,
      revalidateOnFocus: true,
      revalidateOnReconnect: true,
    }
  );

  // Fetch plugin state manually
  const fetchPluginState = async () => {
    try {
      const response = await postFetcher("/api/user/plugin_state", user_id);
      setPluginState(response);
    } catch (error) {
      console.error("Error fetching plugin state:", error);
    }
  };

  // Filter state on mobile
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const isSmallScreen = window.innerWidth < 768;
      setIsFilterOpen(!isSmallScreen);
    }
  }, []);

  // Process streams data when it changes
  useEffect(() => {
    if (streamsData?.data) {
      const streamsRawData = streamsData.data;
      const formattedStreams: StreamData[] = streamsRawData.map((stream: Stream, index: number) => ({
        streamId: stream.stream_id,
        index: index + 1,
        title: stream.stream_title || "Untitled Stream",
        thumbnail: stream.thumbnail_url || "/stream-thumbnail.png",
        streamTime: formatStreamTime(new Date(stream?.created_at|| "")),
        clipCount: stream.clipCount || 0,
        autoUploaded: stream.auto_upload || false,
        live: stream.live || false,
        platform: getPlatformName(stream.platform_id),
        platformId: stream.platform_id,
        createdAt: new Date(stream.created_at || "")
      }));
      
      setStreams(formattedStreams);
    }
  }, [streamsData]);

  // Fetch plugin state on component mount
  useEffect(() => {
    if (user_id) {
      fetchPluginState();
    }
  }, [user_id]);

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, sortBy, sortOrder, platformFilter, statusFilter, dateRange]);

  // Filter and paginate streams
  const filteredStreams = filterAndSortStreams(
    streams,
    searchTerm,
    sortBy,
    sortOrder,
    platformFilter,
    statusFilter,
    dateRange
  );

  const totalPages = Math.ceil(filteredStreams.length / streamsPerPage);
  const startIndex = (currentPage - 1) * streamsPerPage;
  const endIndex = startIndex + streamsPerPage;
  const currentStreams = filteredStreams.slice(startIndex, endIndex);

  // Show loading state while initializing
  if (streamsLoading && !user_id) {
    return <LoadingScreen />;
  }

  return (
    <div className="min-h-screen">
      <Toaster position="top-right" />
      
      {/* Header */}
      <div className="px-4 pt-16 pb-4">
        <h1 className="text-7xl denton-condensed mx-auto max-w-[1400px]">
          Complete Library
        </h1>
      </div>

      {/* Filter Section */}
      <div className="px-4">
        <FilterSection
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          sortBy={sortBy}
          setSortBy={setSortBy}
          sortOrder={sortOrder}
          setSortOrder={setSortOrder}
          platformFilter={platformFilter}
          setPlatformFilter={setPlatformFilter}
          statusFilter={statusFilter}
          setStatusFilter={setStatusFilter}
          dateRange={dateRange}
          setDateRange={setDateRange}
          isOpen={isFilterOpen}
          setIsOpen={setIsFilterOpen}
        />
      </div>

      {streamsLoading ? (
        <StreamsLoadingSkeleton />
      ) : streamsError ? (
        <div className="text-center py-10 text-white">Failed to load streams. Please try again.</div>
      ) : filteredStreams.length === 0 ? (
        <div className="text-center py-10 text-gray-400">
          {streams.length === 0 
            ? "No streams found. Start streaming to see your content here!"
            : "No streams match your current filters. Try adjusting your search criteria."
          }
        </div>
      ) : (
        <>
          {/* Results Info */}
          <div className="mx-auto max-w-[1400px] px-4 mb-4">
            <p className="text-gray-500 text-sm">
              Showing {startIndex + 1}-{Math.min(endIndex, filteredStreams.length)} of {filteredStreams.length} streams
            </p>
          </div>

          {/* Streams Grid - Card Layout */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mx-auto max-w-[1400px] mb-12 px-4">
            {currentStreams.map((stream: StreamData) => (
              <Link
                key={stream.streamId}
                href={{
                  pathname: `/Library/stream/${stream.index}/clips`,
                  query: {
                    autoUploaded: stream.autoUploaded,
                    id: stream.streamId
                  }
                }}
                className="block group"
              >
                <div className="relative w-full rounded-2xl overflow-hidden bg-black shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02] border border-gray-600">
                  {/* Image Container */}
                  <div className="aspect-video w-full relative">
                    <Image
                      src={stream.thumbnail}
                      alt={stream.title}
                      fill
                      className="object-cover"
                    />
                    {/* Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent"></div>

                    {/* Top Labels */}
                    <div className="absolute top-3 left-3 flex flex-wrap gap-2">
                      <span className="bg-black/80 backdrop-blur-sm text-white text-xs px-2.5 py-1.5 rounded-full font-medium border border-gray-600">
                        {stream.clipCount} clips
                      </span>
                      {stream.autoUploaded && (
                        <span className="bg-emerald-600 text-white text-xs px-2.5 py-1.5 rounded-full font-medium">
                          Auto Uploaded
                        </span>
                      )}
                    </div>

                    {/* Platform Badge */}
                    <div className="absolute top-3 right-3">
                      <span className={`text-xs px-2.5 py-1.5 rounded-full font-medium ${getPlatformColor(stream.platform)}`}>
                        {stream.platform}
                      </span>
                    </div>

                    {/* Bottom Content */}
                    <div className="absolute bottom-0 left-0 right-0 p-4">
                      <h3 className="text-white text-base font-semibold mb-1 line-clamp-2 group-hover:text-white transition-colors">
                        {stream.title}
                      </h3>
                      <p className="text-gray-500 text-sm flex items-center gap-2">
                        {stream.streamTime}
                      </p>
                    </div>

                    {/* Live Indicator */}
                    {stream.live && (
                      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                        <div className="bg-red-600 text-white px-4 py-2 rounded-lg font-bold text-sm animate-pulse shadow-lg">
                          🔴 LIVE
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-2 mb-12 px-4">
              <Button
                variant="outline"
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="bg-black border-gray-600 text-white hover:bg-gray-800 disabled:opacity-50 rounded-full"
              >
                Previous
              </Button>

              <div className="flex gap-1">
                {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
                  let page;
                  if (totalPages <= 7) {
                    page = i + 1;
                  } else if (currentPage <= 4) {
                    page = i + 1;
                  } else if (currentPage >= totalPages - 3) {
                    page = totalPages - 6 + i;
                  } else {
                    page = currentPage - 3 + i;
                  }

                  return (
                    <Button
                      key={page}
                      variant={currentPage === page ? "default" : "outline"}
                      onClick={() => setCurrentPage(page)}
                      className={`w-10 h-10 rounded-full ${
                        currentPage === page
                          ? 'gradient-silver text-white hover:text-white hover:opacity-90 border-0'
                          : 'bg-black border-gray-600 text-white hover:bg-gray-800'
                      }`}
                    >
                      {page}
                    </Button>
                  );
                })}
              </div>

              <Button
                variant="outline"
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className="bg-black border-gray-600 text-white hover:bg-gray-800 disabled:opacity-50 rounded-full"
              >
                Next
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}