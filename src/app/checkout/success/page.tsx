"use client"

import { useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle, Loader2 } from "lucide-react"

export default function CheckoutSuccessPage() {
  const searchParams = useSearchParams()
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

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
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
            <CheckCircle className="h-6 w-6 text-green-600" />
          </div>
          <CardTitle className="text-green-600">Payment Successful!</CardTitle>
          <CardDescription>Thank you for your purchase. Your subscription is now active.</CardDescription>
        </CardHeader>
        <CardContent className="text-center">
          <p className="text-sm text-muted-foreground mb-4">Session ID: {sessionId}</p>
          <p className="text-sm">
            You should receive a confirmation email shortly. If you have any questions, please contact our support team.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
