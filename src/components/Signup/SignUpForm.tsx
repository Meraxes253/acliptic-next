"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { toast, Toaster } from "sonner"
import { signInSchema } from "@/lib/zod"
import { googleSignInAction } from "@/actions/googleSignInAction"
import { ZodError } from "zod"
import Link from "next/link"
import Image from 'next/image'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export default function SignupPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [step, setStep] = useState("email")
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({})
  const router = useRouter()

  // Validate email in real-time as user types
  useEffect(() => {
    if (email) {
      try {
        signInSchema.shape.email.parse(email)
        setErrors((prev) => ({ ...prev, email: undefined }))
      } catch (error) {
        if (error instanceof ZodError) {
          setErrors((prev) => ({ ...prev, email: error.errors[0].message }))
        }
      }
    }
  }, [email])

  // Validate password in real-time as user types
  useEffect(() => {
    if (password) {
      try {
        signInSchema.shape.password.parse(password)
        setErrors((prev) => ({ ...prev, password: undefined }))
      } catch (error) {
        if (error instanceof ZodError) {
          setErrors((prev) => ({ ...prev, password: error.errors[0].message }))
        }
      }
    }
  }, [password])

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()

    if (step === "email") {
      // Validate email before proceeding to password step
      try {
        signInSchema.shape.email.parse(email)
        setStep("password")
      } catch (error) {
        if (error instanceof ZodError) {
          setErrors({ email: error.errors[0].message })
          toast.error(error.errors[0].message)
        }
      }
      return
    }

    // Validate full form before submission
    try {
      signInSchema.parse({ email, password })
    } catch (error) {
      if (error instanceof ZodError) {
        const formattedErrors = error.errors.reduce(
          (acc, curr) => {
            const path = curr.path[0] as string
            acc[path as keyof typeof acc] = curr.message
            return acc
          },
          {} as { email?: string; password?: string },
        )

        setErrors(formattedErrors)
        toast.error(error.errors[0].message)
        return
      }
    }

    setLoading(true)

    try {
      const response = await fetch("/api/user/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || "Something went wrong")
      }

      toast.success("Account created successfully!")
      // Redirect to login
      setTimeout(() => {
        router.push("/Login")
      }, 2000)
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Error signing up"
      toast.error(errorMessage)
      console.error("Signup error:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleAuth = async () => {
    try {
      await googleSignInAction()
    } catch (error) {
      toast.error("Error signing in with Google")
      console.error("Error with Google auth:", error)
    }
  }

  return (
    <div className="min-h-screen bg-white flex">
      <Toaster position="top-right" />      
      <div className="w-full flex items-center justify-center px-8 lg:px-16">
        <div className="w-full max-w-md space-y-6">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-9xl lg:text-[10rem] font-light text-black tracking-wide leading-none text-center mb-16 relative z-10 denton-condensed whitespace-nowrap">
              Sign Up
            </h1>
            <p className="text-gray-600 text-sm">
              Welcome to Acliptic! Enter your credentials to start clipping.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSignUp} className="space-y-6">
            <>
              {/* Email Field */}
              <div className="space-y-2">
                <Label htmlFor="email" className="text-lg font-medium text-gray-700">
                  Email
                </Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="example@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className={`w-full px-6 py-4 gradient-silver rounded-full text-white placeholder-gray-300 border-0 focus:outline-none focus:ring-2 focus:ring-gray-400 transition-all duration-200 text-lg ${
                    errors.email ? "ring-2 ring-red-400" : ""
                  }`}
                />
                {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
              </div>

              {/* Password Field */}
              <div className="space-y-2">
                <Label htmlFor="password" className="text-lg font-medium text-gray-700">
                  Password
                </Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="••••••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className={`w-full px-6 py-4 gradient-silver rounded-full text-white placeholder-gray-300 border-0 focus:outline-none focus:ring-2 focus:ring-gray-400 transition-all duration-200 text-lg ${
                    errors.password ? "ring-2 ring-red-400" : ""
                  }`}
                />
                {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password}</p>}
              </div>
            </>

            {/* Continue/Sign Up Button */}
            <Button
              type="submit"
              className="w-full gradient-silver text-white py-4 px-6 text-lg rounded-full font-medium hover:shadow-lg transition-all duration-200 transform hover:scale-[1.02] border-0"
              disabled={loading}
            >
              {loading ? "Loading..." : "Sign Up"}
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
              className="w-full gradient-silver rounded-full text-white border-0 hover:shadow-lg transition-all duration-200 transform hover:scale-[1.02] py-4 text-lg"
              onClick={handleGoogleAuth}
              disabled={loading}
            >
              <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
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

          {/* Sign In Link */}
          <p className="text-center text-sm text-gray-500">
            Already have an account?{' '}
            <Link href="/Login" className="text-black font-medium hover:underline">
              Log In
            </Link>
          </p>

          {/* Terms and Conditions */}
          <p className="text-center text-xs text-gray-500 mt-6">
            By clicking Sign up with Google or Continue with email you agree to our{' '}
            <Link href="#" className="text-black hover:underline">
              Terms
            </Link>
            {' '}and{' '}
            <Link href="/privacy-policy" className="text-black hover:underline">
              Conditions
            </Link>
            {' '}Apply
          </p>
        </div>
      </div>
    </div>
  )
}