'use client'
import { useState, useRef } from 'react';
import Image from 'next/image';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

interface ProfileTabProps {
  user?: {
    id: string;
    email: string;
    username: string;
    phone_number: string;
    image: string;
    youtube_channel_id?: string;
    presets?: Record<string, unknown>;
    onBoardingCompleted?: boolean;
    plugin_active?: boolean;
  };
}

export default function ProfileTab({ user }: ProfileTabProps) {
  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState({
    email: user?.email || "",
    username: user?.username || "",
    phone_number: user?.phone_number || "",
    image: user?.image || "",
    youtube_channel_id: user?.youtube_channel_id || "",
  });
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Password change state
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setProfile({ ...profile, [e.target.name]: e.target.value });
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPasswordData({ ...passwordData, [e.target.name]: e.target.value });
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];

      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          const img = document.createElement('img');
          img.onload = () => {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');

            const size = 150;
            canvas.width = size;
            canvas.height = size;

            if (ctx) {
              const minDimension = Math.min(img.width, img.height);
              const sourceX = (img.width - minDimension) / 2;
              const sourceY = (img.height - minDimension) / 2;

              ctx.beginPath();
              ctx.arc(size/2, size/2, size/2, 0, Math.PI * 2);
              ctx.closePath();
              ctx.clip();

              ctx.drawImage(
                img,
                sourceX, sourceY, minDimension, minDimension,
                0, 0, size, size
              );

              setAvatarPreview(canvas.toDataURL('image/png'));
            }
          };
          img.src = event.target.result as string;
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch("/api/user/updateInfo", {
        method: "POST",
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: user?.id,
          username: profile.username,
          phone_number: profile.phone_number,
          youtube_channel_id: profile.youtube_channel_id
        })
      });

      if (response.ok) {
        toast.success("Profile updated successfully!", {
          description: "Your changes have been saved",
          duration: 4000,
        });
      } else {
        throw new Error('Failed to update profile');
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error("Failed to update profile", {
        description: "There was a problem saving your changes",
        duration: 4000,
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error("Passwords don't match", {
        description: "Please make sure both passwords are the same",
        duration: 4000,
      });
      return;
    }

    if (passwordData.newPassword.length < 8) {
      toast.error("Password too short", {
        description: "Password must be at least 8 characters long",
        duration: 4000,
      });
      return;
    }

    setPasswordLoading(true);

    try {
      const response = await fetch("/api/user/change-password", {
        method: "POST",
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword,
        })
      });

      const data = await response.json();

      if (response.ok) {
        toast.success("Password changed successfully!", {
          description: "Your password has been updated",
          duration: 4000,
        });
        setPasswordData({
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        });
      } else {
        toast.error("Failed to change password", {
          description: data.error || "Please check your current password",
          duration: 4000,
        });
      }
    } catch (error) {
      console.error("Error changing password:", error);
      toast.error("Failed to change password", {
        description: "There was a problem updating your password",
        duration: 4000,
      });
    } finally {
      setPasswordLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
          Profile Information
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Update your account settings and profile information
        </p>
      </div>

      {/* Avatar Section */}
      <div className="flex items-center space-x-6">
        <div className="relative">
          {(avatarPreview || profile.image) ? (
            <div className="relative">
              <Image
                src={avatarPreview || profile.image}
                alt="Profile picture"
                width={100}
                height={100}
                className="rounded-full border-4 border-gray-200 dark:border-gray-600 object-cover"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="absolute bottom-0 right-0 bg-blue-500 text-white p-2 rounded-full hover:bg-blue-600 shadow-lg transition-colors duration-200"
                aria-label="Upload profile picture"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                </svg>
              </button>
            </div>
          ) : (
            <div className="w-[100px] h-[100px] rounded-full border-4 border-gray-200 dark:border-gray-600 bg-gray-100 dark:bg-gray-700 flex items-center justify-center cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors duration-200"
                onClick={() => fileInputRef.current?.click()}>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-12 w-12 text-gray-400 dark:text-gray-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                />
              </svg>
            </div>
          )}
        </div>

        <div className="flex-1">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">
            Profile Photo
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Upload a new avatar. Recommended size: 150x150px
          </p>
          <Button
            variant="outline"
            size="sm"
            className="mt-2 gradient-silver text-white hover:text-white hover:opacity-90 rounded-full border-0"
            onClick={() => fileInputRef.current?.click()}
          >
            Change Photo
          </Button>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleAvatarChange}
          className="hidden"
        />
      </div>

      {/* Profile Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              value={profile.email}
              disabled
              className="bg-gray-50 dark:bg-gray-800 rounded-full border border-gray-600 dark:border-gray-600 shadow-sm"
            />
          </div>

          <div className="space-y-2 pr-2">
            <Label htmlFor="username">Twitch Username</Label>
            <Input
              id="username"
              name="username"
              placeholder="Your Twitch username"
              value={profile.username}
              onChange={handleChange}
              className="rounded-full border border-gray-600 dark:border-gray-600 shadow-sm"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone_number">Phone Number</Label>
            <Input
              id="phone_number"
              name="phone_number"
              placeholder="Phone Number"
              value={profile.phone_number}
              onChange={handleChange}
              className="rounded-full border border-gray-600 dark:border-gray-600 shadow-sm"
            />
          </div>

          <div className="space-y-2 pr-2">
            <Label htmlFor="youtube_channel_id">YouTube Channel ID</Label>
            <Input
              id="youtube_channel_id"
              name="youtube_channel_id"
              placeholder="Your YouTube Channel ID"
              value={profile.youtube_channel_id}
              onChange={handleChange}
              className="rounded-full border border-gray-600 dark:border-gray-600 shadow-sm"
            />
          </div>
        </div>

        <div className="flex justify-end pt-4 border-t border-gray-200 dark:border-gray-700">
          <Button type="submit" disabled={loading} className="gradient-silver text-white hover:text-white hover:opacity-90 rounded-full border-0">
            {loading ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </form>

      {/* Change Password Section */}
      <div className="pt-6 mt-6 border-t border-gray-200 dark:border-gray-700">
        <div className="mb-4">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            Change Password
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Update your password to keep your account secure
          </p>
        </div>

        <form onSubmit={handlePasswordSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="currentPassword">Current Password</Label>
              <Input
                id="currentPassword"
                name="currentPassword"
                type="password"
                placeholder="Enter current password"
                value={passwordData.currentPassword}
                onChange={handlePasswordChange}
                className="rounded-full border border-gray-600 dark:border-gray-600 shadow-sm"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="newPassword">New Password</Label>
              <Input
                id="newPassword"
                name="newPassword"
                type="password"
                placeholder="Enter new password"
                value={passwordData.newPassword}
                onChange={handlePasswordChange}
                className="rounded-full border border-gray-600 dark:border-gray-600 shadow-sm"
              />
              <p className="text-xs text-gray-500">Must be at least 8 characters</p>
            </div>

            <div className="space-y-2 pr-2">
              <Label htmlFor="confirmPassword">Confirm New Password</Label>
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                placeholder="Confirm new password"
                value={passwordData.confirmPassword}
                onChange={handlePasswordChange}
                className="rounded-full border border-gray-600 dark:border-gray-600 shadow-sm"
              />
            </div>
          </div>

          <div className="flex justify-end pt-4">
            <Button
              type="submit"
              disabled={passwordLoading}
              className="gradient-silver text-white hover:text-white hover:opacity-90 rounded-full border-0"
            >
              {passwordLoading ? "Updating..." : "Update Password"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
