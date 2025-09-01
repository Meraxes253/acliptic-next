"use client"

import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Calendar, CreditCard, AlertTriangle } from "lucide-react"
import { formatCurrency } from "@/lib/stripe"

interface SubscriptionStatusProps {
  subscription: {
    id: string
    status: string
    currentPeriodEnd: string
    cancelAtPeriodEnd: boolean
    trialEnd?: string
  }
  plan: {
    name: string
    amount: number
    currency: string
    interval: string
  }
  onManageBilling: () => void
  onUpgrade: () => void
}

export function SubscriptionStatus({ subscription, plan, onManageBilling, onUpgrade }: SubscriptionStatusProps) {
  const isTrialing = subscription.status === "trialing"
  const isCanceling = subscription.cancelAtPeriodEnd
  const isPastDue = subscription.status === "past_due"

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              {plan.name}
            </CardTitle>
            <CardDescription>
              {formatCurrency(plan.amount)} per {plan.interval}
            </CardDescription>
          </div>
          <Badge variant={getStatusVariant(subscription.status)}>{subscription.status}</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Calendar className="h-4 w-4" />
          <span>
            {isTrialing && subscription.trialEnd
              ? `Trial ends ${new Date(subscription.trialEnd).toLocaleDateString()}`
              : `Next billing: ${new Date(subscription.currentPeriodEnd).toLocaleDateString()}`}
          </span>
        </div>

        {isCanceling && (
          <div className="flex items-center gap-2 text-sm text-destructive">
            <AlertTriangle className="h-4 w-4" />
            <span>Subscription will end on {new Date(subscription.currentPeriodEnd).toLocaleDateString()}</span>
          </div>
        )}

        {isPastDue && (
          <div className="flex items-center gap-2 text-sm text-destructive">
            <AlertTriangle className="h-4 w-4" />
            <span>Payment is past due. Please update your payment method.</span>
          </div>
        )}

        <div className="flex gap-2">
          <Button onClick={onManageBilling} variant="outline">
            Manage Billing
          </Button>
          <Button onClick={onUpgrade}>Change Plan</Button>
        </div>
      </CardContent>
    </Card>
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
