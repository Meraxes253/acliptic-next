"use client"

import { useEffect, useState } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CheckCircle, Loader2, ArrowRight } from "lucide-react"

export default function CheckoutSuccessPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [countdown, setCountdown] = useState(5)

  useEffect(() => {
    const sessionIdParam = searchParams.get("session_id")

    if (sessionIdParam) {
      setSessionId(sessionIdParam)
      console.log(`[Success] Session ID found: ${sessionIdParam}`)
    } else {
      console.error("[Success] No session ID found in URL")
    }

    setLoading(false)
  }, [searchParams])

  // Countdown and redirect effect
  useEffect(() => {
    if (!loading && sessionId) {
      if (countdown > 0) {
        const timer = setTimeout(() => {
          setCountdown(countdown - 1)
        }, 1000)
        return () => clearTimeout(timer)
      } else {
        // Redirect to Studio when countdown reaches 0
        router.push('/Studio')
      }
    }
  }, [countdown, loading, sessionId, router])

  const handleGoNow = () => {
    router.push('/Studio')
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  if (!sessionId) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-red-600">Payment Error</CardTitle>
            <CardDescription>No session ID found. Please contact support if you completed a payment.</CardDescription>
          </CardHeader>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <Card className="w-full max-w-lg shadow-2xl">
        <CardHeader className="text-center pb-6">
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-green-100 dark:bg-green-900 animate-pulse">
            <CheckCircle className="h-12 w-12 text-green-600 dark:text-green-400" />
          </div>
          <CardTitle className="text-3xl font-bold text-green-600 dark:text-green-400 mb-2">
            Payment Successful!
          </CardTitle>
          <CardDescription className="text-lg">
            Welcome to Acliptic! Your subscription is now active.
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center space-y-6">
          <div className="bg-blue-50 dark:bg-gray-800 rounded-lg p-6 space-y-4">
            <p className="text-4xl font-bold text-blue-600 dark:text-blue-400">
              {countdown}
            </p>
            <p className="text-sm text-muted-foreground">
              Redirecting to your Studio in {countdown} {countdown === 1 ? 'second' : 'seconds'}...
            </p>
          </div>

          <Button
            onClick={handleGoNow}
            size="lg"
            className="w-full text-lg"
          >
            Go to Studio Now
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>

          <div className="pt-4 border-t">
            <p className="text-xs text-muted-foreground mb-2">
              Session ID: {sessionId}
            </p>
            <p className="text-sm text-muted-foreground">
              You will receive a confirmation email shortly. Start creating amazing content!
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
