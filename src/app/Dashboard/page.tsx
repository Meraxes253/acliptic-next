"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { BarChart3, Users, FolderOpen, Zap, Settings, CreditCard, Calendar, TrendingUp } from "lucide-react"
import Link from "next/link"
import { BillingPortalButton } from "@/components/billing/billing-portal-button"

// Mock user data - replace with your actual user context/auth
const MOCK_USER = {
  id: "2e8c0365-a382-4d95-a877-263c2dbe9561",
  email: "user@example.com",
  name: "John Doe",
}

interface DashboardData {
  subscription: {
    plan: string
    status: string
    trialEnd?: string
    currentPeriodEnd: string
  }
  usage: {
    projects: { current: number; limit: number }
    users: { current: number; limit: number }
    storage: { current: number; limit: number }
    apiCalls: { current: number; limit: number }
  }
  stats: {
    totalProjects: number
    activeUsers: number
    apiCallsThisMonth: number
    storageUsed: number
  }
}

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Mock data - replace with actual API calls
    setTimeout(() => {
      setData({
        subscription: {
          plan: "Basic Plan",
          status: "active",
          trialEnd: undefined,
          currentPeriodEnd: "2024-02-15",
        },
        usage: {
          projects: { current: 3, limit: 5 },
          users: { current: 2, limit: 5 },
          storage: { current: 2.5, limit: 10 },
          apiCalls: { current: 4500, limit: 10000 },
        },
        stats: {
          totalProjects: 3,
          activeUsers: 2,
          apiCallsThisMonth: 4500,
          storageUsed: 2.5,
        },
      })
      setLoading(false)
    }, 1000)
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Loading dashboard...</p>
        </div>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Failed to load dashboard data</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Zap className="h-6 w-6 text-primary" />
              <span className="text-xl font-bold">SaaS App</span>
            </div>
            <div className="flex items-center gap-4">
              <Button variant="ghost" asChild>
                <Link href="/">Home</Link>
              </Button>
              <Button variant="ghost" asChild>
                <Link href="/pricing">Pricing</Link>
              </Button>
              <Button variant="ghost" asChild>
                <Link href="/billing">
                  <Settings className="mr-2 h-4 w-4" />
                  Settings
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </nav>

      <div className="container mx-auto py-8 px-4">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Welcome back, {MOCK_USER.name}!</h1>
            <p className="text-muted-foreground">Here's what's happening with your account today.</p>
          </div>

          {/* Subscription Status */}
          <Card className="mb-8">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <CreditCard className="h-5 w-5" />
                    Current Plan: {data.subscription.plan}
                  </CardTitle>
                  <CardDescription>
                    <Badge variant="default" className="mt-2">
                      {data.subscription.status}
                    </Badge>
                  </CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" asChild>
                    <Link href="/pricing">Upgrade Plan</Link>
                  </Button>
                  <BillingPortalButton userId={MOCK_USER.id} />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar className="h-4 w-4" />
                <span>Next billing: {new Date(data.subscription.currentPeriodEnd).toLocaleDateString()}</span>
              </div>
            </CardContent>
          </Card>

          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Projects</CardTitle>
                <FolderOpen className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{data.stats.totalProjects}</div>
                <p className="text-xs text-muted-foreground">
                  {data.usage.projects.current} of {data.usage.projects.limit} used
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Users</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{data.stats.activeUsers}</div>
                <p className="text-xs text-muted-foreground">
                  {data.usage.users.current} of {data.usage.users.limit} used
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">API Calls</CardTitle>
                <BarChart3 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{data.stats.apiCallsThisMonth.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">This month</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Storage Used</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{data.stats.storageUsed}GB</div>
                <p className="text-xs text-muted-foreground">
                  {data.usage.storage.current} of {data.usage.storage.limit}GB used
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Usage Details */}
          <Card>
            <CardHeader>
              <CardTitle>Usage & Limits</CardTitle>
              <CardDescription>Your current usage for this billing period</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {Object.entries(data.usage).map(([key, usage]) => (
                <div key={key} className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="capitalize font-medium">{key.replace(/([A-Z])/g, " $1")}</span>
                    <span>
                      {usage.current}
                      {usage.limit === -1 ? " / Unlimited" : ` / ${usage.limit}`}
                      {key === "storage" && " GB"}
                    </span>
                  </div>
                  <Progress value={usage.limit === -1 ? 0 : (usage.current / usage.limit) * 100} className="h-2" />
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
