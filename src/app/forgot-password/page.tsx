'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast, Toaster } from "sonner";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch('/api/user/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        setEmailSent(true);
        toast.success('Check your email!', {
          description: 'If an account exists, you will receive a password reset link.',
          duration: 5000,
        });
      } else {
        toast.error(data.error || 'Something went wrong');
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
            <Link href='/'>
                <Image
                    src="/AElogo.svg"
                    alt="Logo"
                    width={45}
                    height={43}
                    className="absolute top-5 left-8"
                    priority
                    quality={100}
                    sizes="100vw"
                />
            </Link>       

      <Toaster position="top-right" />

      {/* Left Side - Image */}
      <div className="hidden lg:flex lg:w-1/2 relative">
        <div className="relative w-full h-full flex items-center justify-center">
          <div className="absolute inset-0 opacity-20 rounded-r-[3rem]"></div>

          <div className="relative w-[759px] h-[771px] rounded-[2rem] overflow-hidden">
            <Image
              src="/login-img1.png"
              alt="Forgot password illustration"
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

          {/* Header */}
          <div className="mb-6 md:mb-8">
            <h1 className="text-6xl sm:text-7xl md:text-8xl lg:text-9xl font-light text-black tracking-wide leading-none mb-4 relative z-10 denton-condensed">
              Forgot
              <br />
              Password?
            </h1>
            <p className="text-gray-600 text-xs sm:text-sm mt-4">
              {emailSent
                ? "We've sent you an email with instructions to reset your password."
                : "No worries! Enter your email and we'll send you reset instructions."}
            </p>
          </div>

          {!emailSent ? (
            <form onSubmit={handleSubmit} className="space-y-4 md:space-y-6">
              {/* Email Field */}
              <div className="space-y-1.5 md:space-y-2">
                <Label htmlFor="email" className="text-xs sm:text-sm font-medium text-gray-700">
                  Email Address
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="example@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
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
                {isLoading ? "Sending..." : "Send Reset Link"}
              </Button>
            </form>
          ) : (
            <div className="space-y-4">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <p className="text-sm text-green-800">
                  ✓ Email sent! Check your inbox and spam folder.
                </p>
              </div>
              <Button
                onClick={() => setEmailSent(false)}
                variant="outline"
                className="w-full rounded-full py-3"
              >
                Send Another Email
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
