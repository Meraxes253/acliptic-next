// "use client";

// import { useEffect, useState, useRef } from "react";
// import Image from "next/image";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { Label } from "@/components/ui/label";
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import { toast, Toaster } from "sonner";
// import useSWR from "swr";
// import { Dialog, DialogContent, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
// import { SkeletonLoader } from "@/components/LoadingSkeletonScreen";

// // Define social media handle type
// interface SocialMediaHandle {
//   id: string;
//   platform: 'youtube' | 'twitch' | 'instagram';
//   handle: string;
//   connection_status: string;
//   created_at: string;
//   updated_at: string;
// }

// // API response type
// interface ApiResponse {
//   confirmation: 'success' | 'fail';
//   data?: SocialMediaHandle[];
//   message?: string;
//   error?: string;
// }

// // Fetcher function for SWR
// const fetcher = async (url: string) => {
//   const response = await fetch(url);
//   const data = await response.json();
  
//   if (!response.ok) {
//     throw new Error(data.error || 'Failed to fetch data');
//   }
  
//   return data;
// };

// interface ProfilePageProps {
//   user_id: string;
//   email: string;
//   username: string;
//   phone_number: string;
//   image: string;
//   youtube_channel_id?: string;
//   presets?: Record<string, unknown>;
//   onBoardingCompleted?: boolean;
//   plugin_active?: boolean;
// }

// export default function ProfilePage(
//   {user_id, email, username, phone_number, image, youtube_channel_id, presets, onBoardingCompleted, plugin_active} : ProfilePageProps) {

//   const [loading, setLoading] = useState(false);
//   const [profile, setProfile] = useState({
//     email: "",
//     username: "",
//     phone_number: "",
//     image: "",
//     youtube_channel_id: "",
//   });
  
//   // Track social media connections
//   const [socialConnections, setSocialConnections] = useState({
//     youtube: false,
//     instagram: false
//   });

//   const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
//   const fileInputRef = useRef<HTMLInputElement>(null);

//   // Add to component state:
//   const [confirmOpen, setConfirmOpen] = useState(false);
//   const [pendingDelete, setPendingDelete] = useState<"instagram" | "youtube" | null>(null);

//   const handleConfirmDelete = () => {
//     if (pendingDelete) {
//       handleDeleteConnection(pendingDelete);
//       setPendingDelete(null);
//       setConfirmOpen(false);
//     }
//   };
  
//   // Setup SWR for social media handles
//   const { data: socialMediaData, error: socialMediaError, mutate: mutateSocialMedia } = useSWR<ApiResponse>(
//     user_id ? `/api/streamers/${user_id}/social_media_handles` : null,
//     fetcher
//   );
  
//   // Extract social media handles and status from SWR data
//   useEffect(() => {
//     if (socialMediaData?.data) {
//       const youtubeHandle = socialMediaData.data.find(item => 
//         item.platform === 'youtube' && item.connection_status === 'active'
//       );

//       const instagramHandle = socialMediaData.data.find(item => 
//         item.platform === 'instagram' && item.connection_status === 'active'
//       );

//       setSocialConnections({
//         youtube: !!youtubeHandle,
//         instagram: !!instagramHandle
//       });
//     }
//   }, [socialMediaData]);

//   useEffect(() => {
//     const initializeUser = async () => {
//       setLoading(true);

//       try {
//         setProfile({
//           email: email || "",
//           username: username || "",
//           phone_number: phone_number || "",
//           image: image || "",
//           youtube_channel_id: youtube_channel_id || "",
//         });
//       } catch(error) {
//         console.error("Error initializing user:", error);
//         toast.error("An error occurred while loading your profile");
//       } finally {
//         setLoading(false);
//       }
//     }

//     initializeUser();

//   }, [email, username, phone_number, image, youtube_channel_id]);

//   const handleYoutubeConnect = async () => {
//     if (!user_id) {
//       toast.error("You must be logged in to connect your YouTube account");
//       return;
//     }
//     window.open("/api/youtube/auth", "_self");
//   };

//   const handleInstagramConnect = async () => {
//     if (!user_id) {
//       toast.error("You must be logged in to connect your Instagram account");
//       return;
//     }
//     window.open("/api/instagram/auth", "_self");
//   };

//   // Handle input changes
//   const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     setProfile({ ...profile, [e.target.name]: e.target.value });
//   };

//   // Handle avatar file selection
//   const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     if (e.target.files && e.target.files[0]) {
//       const file = e.target.files[0];
      
//       // Create a preview URL
//       const reader = new FileReader();
//       reader.onload = (event) => {
//         if (event.target?.result) {
//           // Create an HTMLImageElement instead of using the Image constructor
//           const img = document.createElement('img');
//           img.onload = () => {
//             // Create a canvas to resize the image if needed
//             const canvas = document.createElement('canvas');
//             const ctx = canvas.getContext('2d');
            
//             // Set canvas to a square with the size we want
//             const size = 150;
//             canvas.width = size;
//             canvas.height = size;
            
//             if (ctx) {
//               // Draw the image centered and cropped to fill the square
//               const minDimension = Math.min(img.width, img.height);
//               const sourceX = (img.width - minDimension) / 2;
//               const sourceY = (img.height - minDimension) / 2;
              
//               // Draw a circle and clip
//               ctx.beginPath();
//               ctx.arc(size/2, size/2, size/2, 0, Math.PI * 2);
//               ctx.closePath();
//               ctx.clip();
              
//               // Draw the image inside the circle
//               ctx.drawImage(
//                 img,
//                 sourceX, sourceY, minDimension, minDimension,
//                 0, 0, size, size
//               );
              
//               // Convert canvas to data URL and set as preview
//               setAvatarPreview(canvas.toDataURL('image/png'));
//             }
//           };
//           img.src = event.target.result as string;
//         }
//       };
//       reader.readAsDataURL(file);
//     }
//   };

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
    
//     try {
//       const image = profile.image;

//       // update user information in database with locally state variables   
//       let res = await fetch("/api/user/updateInfo", {
//         method: "POST",
//         body: JSON.stringify({
//           user_id: user_id,
//           username: profile.username,
//           phone_number: profile.phone_number,
//           youtube_channel_id: profile.youtube_channel_id
//         })
//       });

//       res = await res.json();
//       console.log(res);

//       // Update local profile state with new avatar URL
//       setProfile({ ...profile, image });

//       // Trigger SWR to revalidate and fetch the latest data
//       mutateSocialMedia();
    
//       // Show success notification with more details
//       toast.success("Profile updated successfully!", {
//         description: "Your changes have been saved to the database",
//         duration: 4000,
//       });

//     } catch (error) {
//       console.error("Error updating profile:", error);
//       toast.error("Failed to update profile", {
//         description: "There was a problem saving your changes to the database",
//         duration: 4000,
//       });
//     } finally {
//       setLoading(false);
//     }
//   };
  
//   const handleDeleteConnection = async (platform: 'youtube' | 'instagram') => {
//     try {
//       const response = await fetch(`/api/streamers/${user_id}/social_media_handles?platform=${platform}`, {
//         method: 'DELETE',
//       });

//       if (!response.ok) {
//         const data = await response.json();
//         throw new Error(data.error || 'Failed to delete connection');
//       }

//       toast.success(`${platform.charAt(0).toUpperCase() + platform.slice(1)} connection removed successfully`);
//       mutateSocialMedia(); // Refresh the data
//     } catch (error) {
//       console.error('Error deleting connection:', error);
//       toast.error('Failed to remove connection');
//     }
//   };
  

  
//   // Determine if social media data is loading
//   const socialMediaLoading = user_id && !socialMediaData && !socialMediaError;
  
//   return (
//     <div>
//       <Toaster position="top-right" />

//       <div className="w-full max-w-[1150px] mx-auto px-4 mb-16">
//         <div className="h-[250px] rounded-md overflow-hidden border">
//           <div className="w-full h-full relative">
//             <Image
//               src="/profilebg2.jpg"
//               alt="Studio background"
//               fill
//               className="object-cover rounded-md"
//               priority
//             />
//           </div>
//         </div>

//         {/* Profile Section */}
//         <div className="flex flex-col sm:flex-row items-start sm:items-end gap-6 -mt-20 px-4 sm:px-8">
//           {/* Avatar Section */}
//           <div className="flex flex-col items-center sm:items-start">
//             {(avatarPreview || profile.image) ? (
//               <div className="relative">
//                 <Image
//                   src={avatarPreview || profile.image}
//                   alt="Profile picture"
//                   width={150}
//                   height={150}
//                   className="rounded-full border-4 border-white dark:border-gray-800 object-cover"
//                   priority
//                 />
//                 {!profile.image || profile.image === "" ? (
//                   <button
//                     type="button"
//                     onClick={() => fileInputRef.current?.click()}
//                     className="absolute bottom-0 right-0 bg-blue-500 text-white p-1.5 rounded-full hover:bg-blue-600 shadow-md"
//                     aria-label="Upload profile picture"
//                   >
//                     <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
//                       <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
//                     </svg>
//                   </button>
//                 ) : null}
//               </div>
//             ) : (
//               <div className="w-[150px] h-[150px] rounded-full border-4 border-white dark:border-gray-800 bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
//                 <svg 
//                   xmlns="http://www.w3.org/2000/svg" 
//                   className="h-16 w-16 text-gray-400 dark:text-gray-500" 
//                   fill="none" 
//                   viewBox="0 0 24 24" 
//                   stroke="currentColor"
//                 >
//                   <path 
//                     strokeLinecap="round" 
//                     strokeLinejoin="round" 
//                     strokeWidth={2} 
//                     d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" 
//                   />
//                 </svg>
//               </div>
//             )}
//             <input
//               ref={fileInputRef}
//               type="file"
//               accept="image/*"
//               onChange={handleAvatarChange}
//               className="hidden"
//             />
//           </div>
//         </div>
//       </div>

//       <div className="max-w-4xl mx-auto p-4 sm:p-6 space-y-6">
//         {/* User Details Card */}
//         <Card className="border border-gray-800 dark:border-gray-700">
//           <CardHeader>
//             <CardTitle className="text-xl">Profile Information</CardTitle>
//           </CardHeader>
//           <CardContent>
//             {loading ? (
//               <div className="space-y-4">
//                 <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
//                   <div className="space-y-2">
//                     <SkeletonLoader className="h-4 w-16" />
//                     <SkeletonLoader className="h-10 w-full" />
//                   </div>
//                   <div className="space-y-2">
//                     <SkeletonLoader className="h-4 w-24" />
//                     <SkeletonLoader className="h-10 w-full" />
//                   </div>
//                   <div className="space-y-2">
//                     <SkeletonLoader className="h-4 w-20" />
//                     <SkeletonLoader className="h-10 w-full" />
//                   </div>
//                   <div className="space-y-2">
//                     <SkeletonLoader className="h-4 w-28" />
//                     <SkeletonLoader className="h-10 w-full" />
//                   </div>
//                 </div>
//                 <SkeletonLoader className="h-12 w-full" />
//               </div>
//             ) : (
//               <form className="space-y-4" onSubmit={handleSubmit}>
//                 <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
//                   <div className="space-y-2">
//                     <Label htmlFor="email">Email</Label>
//                     <Input 
//                       id="email" 
//                       name="email" 
//                       type="email" 
//                       value={profile.email} 
//                       disabled 
//                       className="hel-font border-gray-800" 
//                     />
//                   </div>
//                   <div className="space-y-2">
//                     <Label htmlFor="username">Twitch Username</Label>
//                     <Input 
//                       id="username" 
//                       name="username" 
//                       placeholder="Your Twitch username" 
//                       value={profile.username}
//                       onChange={handleChange}
//                       className="hel-font border-gray-800" 
//                     />
//                   </div>
//                   <div className="space-y-2">
//                     <Label htmlFor="phone_number">Phone Number</Label>
//                     <Input 
//                       id="phone_number" 
//                       name="phone_number" 
//                       placeholder="Phone Number" 
//                       value={profile.phone_number}
//                       onChange={handleChange}
//                       className="hel-font border-gray-800" 
//                     />
//                   </div>
//                   <div className="space-y-2">
//                     <Label htmlFor="youtube_channel_id">YouTube Channel ID</Label>
//                     <Input 
//                       id="youtube_channel_id" 
//                       name="youtube_channel_id" 
//                       placeholder="Your YouTube Channel ID" 
//                       value={profile.youtube_channel_id}
//                       onChange={handleChange}
//                       className="hel-font border-gray-800" 
//                     />
//                   </div>
//                 </div>

//                 <Button type="submit" className="w-full border-gray-800" variant="outline" disabled={loading}>
//                   {loading ? "Saving..." : "Save Changes"}
//                 </Button>
//               </form>
//             )}
//           </CardContent>
//         </Card>

//         {/* Integrations Card */}
//         <Card className="border border-gray-800 dark:border-gray-700">
//           <CardHeader>
//             <CardTitle className="text-xl">Integrations</CardTitle>
//           </CardHeader>
//           <CardContent>
//             {socialMediaLoading ? (
//               <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
//                 <div className="space-y-2">
//                   <SkeletonLoader className="h-4 w-16" />
//                   <div className="flex flex-col items-start space-y-2">
//                     <div className="flex items-center space-x-2">
//                       <SkeletonLoader className="h-10 w-24" />
//                       <SkeletonLoader className="h-8 w-16" />
//                     </div>
//                     <SkeletonLoader className="h-3 w-48" />
//                   </div>
//                 </div>
//                 <div className="space-y-2">
//                   <SkeletonLoader className="h-4 w-16" />
//                   <div className="flex items-center space-x-2">
//                     <SkeletonLoader className="h-10 w-24" />
//                     <SkeletonLoader className="h-8 w-16" />
//                   </div>
//                 </div>
//               </div>
//             ) : socialMediaError ? (
//               <div className="text-red-600 dark:text-red-400 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
//                 <p>Error loading social connections: {socialMediaError.message}</p>
//               </div>
//             ) : (
//               <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
//                 <div className="space-y-2">
//                   <Label htmlFor="instagram">Instagram</Label>
//                   <div className="flex flex-col items-start space-y-2">
//                     <div className="flex items-center space-x-2">
//                       <Button 
//                         id="instagram" 
//                         onClick={handleInstagramConnect}
//                         disabled={socialConnections.instagram}
//                         variant={socialConnections.instagram ? "outline" : "default"}
//                         className="w-full sm:w-auto border-gray-800 dark:bg-gray-800 dark:text-white"
//                       >
//                         {socialConnections.instagram ? "Connected" : "Connect"}
//                       </Button>

//                       {socialConnections.instagram && (
//                         <Button
//                           variant="destructive"
//                           size="sm"
//                           onClick={() => {
//                             setPendingDelete('instagram');
//                             setConfirmOpen(true);
//                           }}
//                         >
//                           Remove
//                         </Button>
//                       )}
//                     </div>

//                     {socialConnections.instagram && (
//                       <a
//                         href="/instagram-revoke-access"
//                         className="text-xs text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 transition"
//                         target="_blank"
//                         rel="noopener noreferrer"
//                       >
//                         How to completely revoke Instagram access
//                       </a>
//                     )}
//                   </div>
//                 </div>
//                 <div className="space-y-2">
//                   <Label htmlFor="youtube">YouTube</Label>
//                   <div className="flex items-center space-x-2">
//                     <Button 
//                       id="youtube" 
//                       onClick={handleYoutubeConnect}
//                       disabled={socialConnections.youtube}
//                       variant={socialConnections.youtube ? "outline" : "default"}
//                       className="w-full sm:w-auto border-gray-800 dark:bg-gray-800 dark:text-white"
//                     >
//                       {socialConnections.youtube ? "Connected" : "Connect"}
//                     </Button>
//                     {socialConnections.youtube && (
//                       <Button
//                         variant="destructive"
//                         size="sm"
//                         onClick={() => {
//                           setPendingDelete('youtube');
//                           setConfirmOpen(true);
//                         }}
//                       >
//                         Remove
//                       </Button>
//                     )}
//                   </div>
//                 </div>
//               </div>
//             )}
//           </CardContent>
//         </Card>

//         {/* Subscription Status Card */}
//         <Card className="border border-gray-800 dark:border-gray-700">
//           <CardHeader>
//             <CardTitle className="text-xl">Subscription Status</CardTitle>
//           </CardHeader>
//           <CardContent>
//             {loading ? (
//               <div className="space-y-4">
//                 <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 border border-gray-800 dark:border-gray-700 rounded-lg">
//                   <div className="space-y-2">
//                     <SkeletonLoader className="h-5 w-24" />
//                     <SkeletonLoader className="h-4 w-16" />
//                   </div>
//                   <div className="text-right space-y-2">
//                     <SkeletonLoader className="h-6 w-20" />
//                     <SkeletonLoader className="h-3 w-16" />
//                   </div>
//                 </div>

//                 <div className="space-y-2">
//                   <SkeletonLoader className="h-5 w-24" />
//                   <div className="space-y-2">
//                     <SkeletonLoader className="h-4 w-48" />
//                     <SkeletonLoader className="h-4 w-52" />
//                     <SkeletonLoader className="h-4 w-44" />
//                     <SkeletonLoader className="h-4 w-40" />
//                   </div>
//                 </div>

//                 <div className="pt-4 border-t border-gray-800 dark:border-gray-700 space-y-2">
//                   <SkeletonLoader className="h-10 w-full" />
//                   <SkeletonLoader className="h-3 w-64 mx-auto" />
//                 </div>
//               </div>
//             ) : (
//               <div className="space-y-4">
//                 <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 border border-gray-800 dark:border-gray-700 rounded-lg">
//                   <div>
//                     <h3 className="font-semibold">Current Plan</h3>
//                     <p className="text-sm text-gray-600 dark:text-gray-400">Free Plan</p>
//                   </div>
//                   <div className="text-right">
//                     <p className="font-bold text-lg">$0/month</p>
//                     <p className="text-xs text-gray-500 dark:text-gray-400">No billing</p>
//                   </div>
//                 </div>

//                 <div className="space-y-2">
//                   <h4 className="font-medium">Plan Features</h4>
//                   <ul className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
//                     <li className="flex items-center">
//                       <svg className="w-4 h-4 mr-2 text-green-500" fill="currentColor" viewBox="0 0 20 20">
//                         <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
//                       </svg>
//                       Basic profile management
//                     </li>
//                     <li className="flex items-center">
//                       <svg className="w-4 h-4 mr-2 text-green-500" fill="currentColor" viewBox="0 0 20 20">
//                         <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
//                       </svg>
//                       Social media integrations
//                     </li>
//                     <li className="flex items-center opacity-50">
//                       <svg className="w-4 h-4 mr-2 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
//                         <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
//                       </svg>
//                       Advanced analytics (Pro only)
//                     </li>
//                     <li className="flex items-center opacity-50">
//                       <svg className="w-4 h-4 mr-2 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
//                         <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
//                       </svg>
//                       Priority support (Pro only)
//                     </li>
//                   </ul>
//                 </div>

//                 <div className="pt-4 border-t border-gray-800 dark:border-gray-700">
//                   <Button className="w-full border-gray-800" variant="outline">
//                     Upgrade to Pro
//                   </Button>
//                   <p className="text-xs text-gray-500 dark:text-gray-400 text-center mt-2">
//                     Get access to advanced features and priority support
//                   </p>
//                 </div>
//               </div>
//             )}
//           </CardContent>
//         </Card>
//       </div>

//       <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
//         <DialogContent>
//           <DialogTitle>Are you sure?</DialogTitle>
//           <DialogDescription>
//             This will permanently remove your {pendingDelete} connection. You can reconnect it anytime.
//           </DialogDescription>
//           <DialogFooter>
//             <Button variant="ghost" onClick={() => setConfirmOpen(false)}>Cancel</Button>
//             <Button variant="destructive" onClick={handleConfirmDelete}>Confirm</Button>
//           </DialogFooter>
//         </DialogContent>
//       </Dialog>

//     </div>
//   );
// }