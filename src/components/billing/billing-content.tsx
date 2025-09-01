"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { AlertCircle, CreditCard, Calendar, Users, Zap, Settings } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { redirectToPortal } from "@/lib/checkout-helpers"
import { formatCurrency } from "@/lib/stripe"

// Mock user data - replace with your actual user context/auth
const MOCK_USER = {
  id: "2e8c0365-a382-4d95-a877-263c2dbe9561",
  email: "user@example.com",
  name: "John Doe",
}

interface SubscriptionData {
  subscription: {
    id: string
    status: string
    currentPeriodStart: string
    currentPeriodEnd: string
    cancelAtPeriodEnd: boolean
    trialEnd?: string
  }
  plan: {
    id: string
    name: string
    amount: number
    currency: string
    interval: string
  }
  customer: {
    email: string
    name?: string
  }
}

export function BillingContent() {
  const [subscription, setSubscription] = useState<SubscriptionData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [portalLoading, setPortalLoading] = useState(false)

  useEffect(() => {
    fetchSubscriptionData()
  }, [])

  const fetchSubscriptionData = async () => {
    try {
      // Replace with your actual API call
      const response = await fetch(`/api/subscription`)

      if (response.ok) {
        const data = await response.json()
        setSubscription(data)
      } else if (response.status === 404) {
        // No subscription found - user is on free plan
        setSubscription(null)
      } else {
        throw new Error("Failed to fetch subscription data")
      }
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleManageBilling = async () => {
    setPortalLoading(true)
    try {
      await redirectToPortal( window.location.href)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setPortalLoading(false)
    }
  }

  if (loading) {
    return <div>Loading...</div>
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    )
  }

  return (
    <div className="space-y-6">
      {/* Current Plan */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Current Plan
          </CardTitle>
          <CardDescription>Your current subscription details</CardDescription>
        </CardHeader>
        <CardContent>
          {subscription ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold">{subscription.plan.name}</h3>
                  <p className="text-muted-foreground">
                    {formatCurrency(subscription.plan.amount)} per {subscription.plan.interval}
                  </p>
                </div>
                <Badge variant={getStatusVariant(subscription.subscription.status)}>
                  {subscription.subscription.status}
                </Badge>
              </div>

              <Separator />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Current Period</p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(subscription.subscription.currentPeriodStart).toLocaleDateString()} -{" "}
                      {new Date(subscription.subscription.currentPeriodEnd).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Billing Email</p>
                    <p className="text-sm text-muted-foreground">{subscription.customer.email}</p>
                  </div>
                </div>
              </div>

              {subscription.subscription.trialEnd && (
                <Alert>
                  <Zap className="h-4 w-4" />
                  <AlertDescription>
                    Your trial ends on {new Date(subscription.subscription.trialEnd).toLocaleDateString()}
                  </AlertDescription>
                </Alert>
              )}

              {subscription.subscription.cancelAtPeriodEnd && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    Your subscription will be canceled on{" "}
                    {new Date(subscription.subscription.currentPeriodEnd).toLocaleDateString()}
                  </AlertDescription>
                </Alert>
              )}
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="mb-4">
                <Zap className="h-12 w-12 text-muted-foreground mx-auto" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Free Plan</h3>
              <p className="text-muted-foreground mb-4">You're currently on the free plan</p>
              <Button asChild>
                <a href="/pricing">Upgrade Plan</a>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Billing Management */}
      {subscription && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Billing Management
            </CardTitle>
            <CardDescription>Manage your billing information and payment methods</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Use Stripe's secure billing portal to update your payment method, download invoices, and manage your
                subscription.
              </p>

              <div className="flex gap-2">
                <Button onClick={handleManageBilling} disabled={portalLoading}>
                  {portalLoading ? "Loading..." : "Manage Billing"}
                </Button>
                <Button variant="outline" asChild>
                  <a href="/pricing">Change Plan</a>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Usage & Limits */}
      <Card>
        <CardHeader>
          <CardTitle>Usage & Limits</CardTitle>
          <CardDescription>Your current usage for this billing period</CardDescription>
        </CardHeader>
        <CardContent>
          <UsageLimits planId={subscription?.plan.id || "free"} />
        </CardContent>
      </Card>
    </div>
  )
}

function getStatusVariant(status: string): "default" | "secondary" | "destructive" | "outline" {
  switch (status) {
    case "active":
      return "default"
    case "trialing":
      return "secondary"
    case "canceled":
    case "incomplete":
    case "past_due":
      return "destructive"
    default:
      return "outline"
  }
}

function UsageLimits({ planId }: { planId: string }) {
  // Mock usage data - replace with your actual usage tracking
  const usage = {
    projects: { current: 2, limit: planId === "free" ? 1 : planId === "basic_monthly" ? 5 : -1 },
    users: { current: 1, limit: planId === "free" ? 1 : planId === "basic_monthly" ? 5 : -1 },
    storage: { current: 0.5, limit: planId === "free" ? 1 : planId === "basic_monthly" ? 10 : 100 },
    apiCalls: { current: 450, limit: planId === "free" ? 1000 : planId === "basic_monthly" ? 10000 : 100000 },
  }

  return (
    <div className="space-y-4">
      {Object.entries(usage).map(([key, data]) => (
        <div key={key} className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="capitalize">{key.replace(/([A-Z])/g, " $1")}</span>
            <span>
              {data.current}
              {data.limit === -1 ? " / Unlimited" : ` / ${data.limit}`}
              {key === "storage" && " GB"}
            </span>
          </div>
          <div className="w-full bg-secondary rounded-full h-2">
            <div
              className="bg-primary h-2 rounded-full transition-all"
              style={{
                width: data.limit === -1 ? "0%" : `${Math.min((data.current / data.limit) * 100, 100)}%`,
              }}
            />
          </div>
        </div>
      ))}
    </div>
  )
}
