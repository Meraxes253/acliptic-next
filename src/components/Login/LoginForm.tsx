'use client'
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast, Toaster } from "sonner";
import { googleSignInAction } from "@/actions/googleSignInAction";

export default function LoginPage() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsLoading(true);

        const formData = new FormData(e.currentTarget);
        const email = formData.get('email') as string;
        const password = formData.get('password') as string;

        try {
            const result = await signIn('credentials', {
                email,
                password,
                redirect: false,
            });

            if (result?.error) {
                toast.error('Invalid email or password');
                setIsLoading(false);
                return;
            }

            router.push('/Signup');
        } catch (error) {
            toast.error('An error occurred. Please try again.');
            console.log(error)
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
                    {/* Background gradient overlay */}
                    <div className="absolute inset-0 opacity-20 rounded-r-[3rem]"></div>
                    
                    {/* Image container with rounded corners */}
                    <div className="relative w-[759px] h-[771px] rounded-[2rem] overflow-hidden ">
                        <Image
                            src="/login-img1.png"
                            alt="Login illustration"
                            fill
                            className="object-cover"
                            priority
                        />

                    </div>
                        {/* Live badge */}
                        <div className="absolute bottom-12 left-32 flex items-center gap-2">
                            <span className="text-md font-medium text-black">LIVE</span>
                        </div>

                        {/* Attribution */}
                        <div className="absolute bottom-12 right-32">
                            <span className="text-md text-black">Clipped with Acliptic</span>
                        </div>
                </div>
            </div>

            {/* Right Side - Login Form */}
            <div className="w-full lg:w-1/2 flex items-center justify-center px-4 sm:px-6 md:px-8 lg:px-16 py-8">
                <div className="w-full max-w-md space-y-4 md:space-y-6">
                    {/* Header */}
                    <div className="mb-6 md:mb-8">
                        <h1 className="text-6xl sm:text-7xl md:text-8xl lg:text-9xl xl:text-[10rem] font-light text-black tracking-wide leading-none text-center mb-8 md:mb-12 lg:mb-16 relative z-10 denton-condensed">
                            Login
                        </h1>
                        <p className="text-gray-600 text-xs sm:text-sm">
                            Welcome back! Enter your Credentials to access your account
                        </p>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="space-y-4 md:space-y-6">
                        {/* Email Field */}
                        <div className="space-y-1.5 md:space-y-2">
                            <Label htmlFor="email" className="text-xs sm:text-sm font-medium text-gray-700">
                                Email
                            </Label>
                            <Input
                                id="email"
                                name="email"
                                type="email"
                                placeholder="example@email.com"
                                required
                                className="w-full px-4 py-3 sm:px-5 sm:py-3.5 md:px-6 md:py-4 gradient-silver rounded-full text-white placeholder-gray-300 border-0 focus:outline-none focus:ring-2 focus:ring-gray-400 transition-all duration-200 text-sm sm:text-base md:text-lg"
                            />
                        </div>

                        {/* Password Field */}
                        <div className="space-y-1.5 md:space-y-2">
                            <div className="flex items-center justify-between">
                                <Label htmlFor="password" className="text-xs sm:text-sm font-medium text-gray-700">
                                    Password
                                </Label>
                                <Link href="/forgot-password" className="text-xs sm:text-sm text-gray-500 hover:text-gray-700">
                                    Forgot Password
                                </Link>
                            </div>
                            <Input
                                id="password"
                                name="password"
                                type="password"
                                placeholder="••••••••••••"
                                required
                                className="w-full px-4 py-3 sm:px-5 sm:py-3.5 md:px-6 md:py-4 gradient-silver rounded-full text-white placeholder-gray-300 border-0 focus:outline-none focus:ring-2 focus:ring-gray-400 transition-all duration-200 text-sm sm:text-base md:text-lg"
                            />
                        </div>

                        {/* Login Button */}
                        <Button
                            type="submit"
                            className="w-full gradient-silver text-white py-3 px-4 sm:py-3.5 sm:px-5 md:py-4 md:px-6 text-sm sm:text-base md:text-lg rounded-full font-medium hover:shadow-lg transition-all duration-200 transform hover:scale-[1.02] border-0"
                            disabled={isLoading}
                        >
                            {isLoading ? "Signing in..." : "Login"}
                        </Button>
                    </form>

                    {/* Divider */}
                    <div className="flex items-center">
                        <div className="flex-grow h-px bg-gray-200"></div>
                        <span className="px-2 text-xs uppercase text-gray-500 bg-white">OR</span>
                        <div className="flex-grow h-px bg-gray-200"></div>
                    </div>

                    {/* Google Sign In */}
                    <Button
                        variant="outline"
                        className="w-full gradient-silver text-white border-0 hover:shadow-lg transition-all duration-200 transform hover:scale-[1.02] py-3 px-4 sm:py-3.5 sm:px-5 md:py-4 md:px-6 text-sm sm:text-base md:text-lg rounded-full font-medium"
                        onClick={async () => {
                            try {
                                await googleSignInAction()
                            } catch (error) {
                                console.log(error)
                                toast.error("Failed to sign in with Google")
                            }
                        }}
                    >
                        <svg className="w-4 h-4 sm:w-5 sm:h-5 mr-2" viewBox="0 0 24 24">
                            <path
                                fill="#4285F4"
                                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                            />
                            <path
                                fill="#34A853"
                                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                            />
                            <path
                                fill="#FBBC05"
                                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                            />
                            <path
                                fill="#EA4335"
                                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                            />
                        </svg>
                        Continue with Google
                    </Button>

                    {/* Sign Up Link */}
                    <p className="text-center text-xs sm:text-sm text-gray-500">
                        Don't have an account?{' '}
                        <Link href="/Signup" className="text-black font-medium hover:underline">
                            Sign Up
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}