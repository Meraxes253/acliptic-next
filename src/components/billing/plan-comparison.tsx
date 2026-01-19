"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Check } from "lucide-react"
import { formatCurrency } from "@/lib/stripe"

interface Plan {
  id: string
  name: string
  description: string
  amount: number
  currency: string
  interval: string
  features: string[]
  popular?: boolean
}

interface PlanComparisonProps {
  plans: Plan[]
  currentPlanId?: string
  onSelectPlan: (planId: string) => void
}

export function PlanComparison({ plans, currentPlanId, onSelectPlan }: PlanComparisonProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {plans.map((plan) => (
        <Card key={plan.id} className={`relative ${plan.popular ? "border-primary" : ""}`}>
          {plan.popular && <Badge className="absolute -top-2 left-1/2 transform -translate-x-1/2">Most Popular</Badge>}
          <CardHeader>
            <CardTitle>{plan.name}</CardTitle>
            <CardDescription>{plan.description}</CardDescription>
            <div className="text-3xl font-bold">
              {plan.amount === 0 ? "Free" : formatCurrency(plan.amount)}
              {plan.amount > 0 && <span className="text-sm font-normal text-muted-foreground">/{plan.interval}</span>}
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <ul className="space-y-2">
              {plan.features.map((feature, index) => (
                <li key={index} className="flex items-center gap-2 text-sm">
                  <Check className="h-4 w-4 text-green-500" />
                  {feature}
                </li>
              ))}
            </ul>
            <Button
              onClick={() => onSelectPlan(plan.id)}
              disabled={currentPlanId === plan.id}
              className="w-full"
              variant={currentPlanId === plan.id ? "outline" : "default"}
            >
              {currentPlanId === plan.id ? "Current Plan" : plan.amount === 0 ? "Downgrade" : "Upgrade"}
            </Button>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
