"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Lock, Zap } from "lucide-react"
import Link from "next/link"

interface SubscriptionGuardProps {
  children: React.ReactNode
  requiredPlan?: "basic" | "pro"
  feature?: string
  fallback?: React.ReactNode
}

export function SubscriptionGuard({
  children,
  requiredPlan = "basic",
  feature = "this feature",
  fallback,
}: SubscriptionGuardProps) {
  const [hasAccess, setHasAccess] = useState<boolean | null>(null)

  useEffect(() => {
    // Mock access check - replace with actual subscription check
    // This would typically check the user's current subscription against the required plan
    const checkAccess = async () => {
      // Simulate API call
      setTimeout(() => {
        // Mock: user has basic plan
        const userPlan = "free" // This would come from your auth/subscription context
        const hasRequiredAccess = userPlan === requiredPlan || (requiredPlan === "basic" && userPlan === "pro")

        setHasAccess(hasRequiredAccess)
      }, 500)
    }

    checkAccess()
  }, [requiredPlan])

  if (hasAccess === null) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!hasAccess) {
    if (fallback) {
      return <>{fallback}</>
    }

    return (
      <Card className="max-w-md mx-auto">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-muted">
            <Lock className="h-6 w-6 text-muted-foreground" />
          </div>
          <CardTitle>Upgrade Required</CardTitle>
          <CardDescription>
            You need a {requiredPlan} plan or higher to access {feature}
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <p className="text-sm text-muted-foreground">Upgrade your plan to unlock this feature and many more.</p>
          <div className="flex gap-2 justify-center">
            <Button asChild>
              <Link href="/pricing">
                <Zap className="mr-2 h-4 w-4" />
                Upgrade Now
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/dashboard">Go Back</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return <>{children}</>
}
