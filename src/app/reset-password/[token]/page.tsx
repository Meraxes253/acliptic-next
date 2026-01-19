'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast, Toaster } from "sonner";

export default function ResetPasswordPage() {
  const router = useRouter();
  const params = useParams();
  const token = params.token as string;

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [passwordReset, setPasswordReset] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    if (password.length < 8) {
      toast.error('Password must be at least 8 characters long');
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('/api/user/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password }),
      });

      const data = await response.json();

      if (response.ok) {
        setPasswordReset(true);
        toast.success('Password reset successful!', {
          description: 'You can now log in with your new password.',
          duration: 5000,
        });

        // Redirect to login after 2 seconds
        setTimeout(() => {
          router.push('/Login');
        }, 2000);
      } else {
        toast.error(data.error || 'Failed to reset password');
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex">
      <Toaster position="top-right" />

      {/* Left Side - Image */}
      <div className="hidden lg:flex lg:w-1/2 relative">
        <div className="relative w-full h-full flex items-center justify-center">
          <div className="absolute inset-0 opacity-20 rounded-r-[3rem]"></div>

          <div className="relative w-[759px] h-[771px] rounded-[2rem] overflow-hidden">
            <Image
              src="/login-img1.png"
              alt="Reset password illustration"
              fill
              className="object-cover"
              priority
            />
          </div>

          <div className="absolute bottom-12 left-32 flex items-center gap-2">
            <span className="text-md font-medium text-black">LIVE</span>
          </div>

          <div className="absolute bottom-12 right-32">
            <span className="text-md text-black">Clipped with Acliptic</span>
          </div>
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center px-4 sm:px-6 md:px-8 lg:px-16 py-8">
        <div className="w-full max-w-md space-y-4 md:space-y-6">
          {/* Logo */}
          <Link href="/">
            <Image
              src="/AElogo.svg"
              alt="Logo"
              width={45}
              height={43}
              className="mb-6"
              priority
            />
          </Link>

          {/* Header */}
          <div className="mb-6 md:mb-8">
            <h1 className="text-6xl sm:text-7xl md:text-8xl lg:text-9xl font-light text-black tracking-wide leading-none mb-4 relative z-10 denton-condensed">
              Reset
              <br />
              Password
            </h1>
            <p className="text-gray-600 text-xs sm:text-sm mt-4">
              {passwordReset
                ? "Your password has been reset successfully!"
                : "Enter your new password below."}
            </p>
          </div>

          {!passwordReset ? (
            <form onSubmit={handleSubmit} className="space-y-4 md:space-y-6">
              {/* New Password Field */}
              <div className="space-y-1.5 md:space-y-2">
                <Label htmlFor="password" className="text-xs sm:text-sm font-medium text-gray-700">
                  New Password
                </Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter new password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full px-4 py-3 sm:px-5 sm:py-3.5 md:px-6 md:py-4 gradient-silver rounded-full text-white placeholder-gray-300 border-0 focus:outline-none focus:ring-2 focus:ring-gray-400 transition-all duration-200 text-sm sm:text-base md:text-lg"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Must be at least 8 characters long
                </p>
              </div>

              {/* Confirm Password Field */}
              <div className="space-y-1.5 md:space-y-2">
                <Label htmlFor="confirmPassword" className="text-xs sm:text-sm font-medium text-gray-700">
                  Confirm Password
                </Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="Confirm new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  className="w-full px-4 py-3 sm:px-5 sm:py-3.5 md:px-6 md:py-4 gradient-silver rounded-full text-white placeholder-gray-300 border-0 focus:outline-none focus:ring-2 focus:ring-gray-400 transition-all duration-200 text-sm sm:text-base md:text-lg"
                />
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                className="w-full gradient-silver text-white py-3 px-4 sm:py-3.5 sm:px-5 md:py-4 md:px-6 text-sm sm:text-base md:text-lg rounded-full font-medium hover:shadow-lg transition-all duration-200 transform hover:scale-[1.02] border-0"
                disabled={isLoading}
              >
                {isLoading ? "Resetting..." : "Reset Password"}
              </Button>
            </form>
          ) : (
            <div className="space-y-4">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <p className="text-sm text-green-800">
                  ✓ Password reset successful! Redirecting to login...
                </p>
              </div>
              <Button
                onClick={() => router.push('/Login')}
                className="w-full gradient-silver text-white rounded-full py-3"
              >
                Go to Login
              </Button>
            </div>
          )}

          {/* Back to Login */}
          <div className="text-center">
            <Link
              href="/Login"
              className="text-sm text-gray-600 hover:text-gray-900 inline-flex items-center gap-2"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10 19l-7-7m0 0l7-7m-7 7h18"
                />
              </svg>
              Back to Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
