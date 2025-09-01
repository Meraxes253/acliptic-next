"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Check, Zap, Star, ArrowLeft } from "lucide-react"
import Link from "next/link"
import { redirectToCheckout } from "@/lib/checkout-helpers"
import { formatCurrency } from "@/lib/stripe"

// Mock user data - replace with your actual user context/auth
const MOCK_USER = {
  id: "2e8c0365-a382-4d95-a877-263c2dbe9561",
  email: "user@example.com",
  name: "John Doe",
}

const plans = [
  {
    id: "free",
    name: "Free",
    description: "Perfect for getting started",
    amount: 0,
    currency: "usd",
    interval: "month",
    features: ["1 Project", "1 Team Member", "1GB Storage", "1,000 API Calls/month", "Community Support"],
    popular: false,
  },
  {
    id: "price_1RyRH7IEWBlIFmthZINbRP6W", // Replace with your actual Stripe Price ID
    name: "Basic",
    description: "Great for small teams",
    amount: 999, // $9.99 in cents
    currency: "usd",
    interval: "month",
    features: [
      "5 Projects",
      "5 Team Members",
      "10GB Storage",
      "10,000 API Calls/month",
      "Email Support",
      "7-day Free Trial",
    ],
    popular: true,
  },
  {
    id: "price_1RyRINIEWBlIFmthVDMx500x", // Replace with your actual Stripe Price ID
    name: "Pro",
    description: "For growing businesses",
    amount: 2999, // $29.99 in cents
    currency: "usd",
    interval: "month",
    features: [
      "Unlimited Projects",
      "Unlimited Team Members",
      "100GB Storage",
      "100,000 API Calls/month",
      "Priority Support",
      "Advanced Analytics",
      "7-day Free Trial",
    ],
    popular: false,
  },
]

export default function PricingPage() {
  const [loading, setLoading] = useState<string | null>(null)

  const handleSelectPlan = async (planId: string) => {
    if (planId === "free") {
      // Handle free plan selection - redirect to dashboard or show success
      window.location.href = "/dashboard?plan=free"
      return
    }

    setLoading(planId)
    try {
      await redirectToCheckout({
        priceId: planId,
        successUrl: `${window.location.origin}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
        cancelUrl: `${window.location.origin}/pricing?canceled=true`,
      })
    } catch (error) {
      console.error("Checkout error:", error)
      // You might want to show a toast notification here
    } finally {
      setLoading(null)
    }
  }

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="container mx-auto max-w-6xl">
        {/* Header */}
        <div className="text-center mb-12">
          <Button variant="ghost" asChild className="mb-4">
            <Link href="/">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Home
            </Link>
          </Button>
          <h1 className="text-4xl font-bold mb-4">Choose Your Plan</h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Start with our free plan and upgrade as your needs grow. All paid plans include a 7-day free trial.
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          {plans.map((plan) => (
            <Card key={plan.id} className={`relative ${plan.popular ? "border-primary shadow-lg scale-105" : ""}`}>
              {plan.popular && (
                <Badge className="absolute -top-2 left-1/2 transform -translate-x-1/2 bg-primary">
                  <Star className="mr-1 h-3 w-3" />
                  Most Popular
                </Badge>
              )}
              <CardHeader className="text-center">
                <CardTitle className="text-2xl">{plan.name}</CardTitle>
                <CardDescription>{plan.description}</CardDescription>
                <div className="text-4xl font-bold mt-4">
                  {plan.amount === 0 ? "Free" : formatCurrency(plan.amount)}
                  {plan.amount > 0 && (
                    <span className="text-lg font-normal text-muted-foreground">/{plan.interval}</span>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <ul className="space-y-3">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-center gap-3">
                      <Check className="h-4 w-4 text-green-500 flex-shrink-0" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
                <Button
                  onClick={() => handleSelectPlan(plan.id)}
                  disabled={loading === plan.id}
                  className="w-full"
                  variant={plan.popular ? "default" : "outline"}
                >
                  {loading === plan.id ? (
                    "Loading..."
                  ) : plan.amount === 0 ? (
                    "Get Started Free"
                  ) : (
                    <>
                      Start Free Trial
                      <Zap className="ml-2 h-4 w-4" />
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* FAQ Section */}
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl font-bold text-center mb-8">Frequently Asked Questions</h2>
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Can I change plans anytime?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Yes, you can upgrade or downgrade your plan at any time. Changes will be prorated and reflected in
                  your next billing cycle.
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">What happens after the free trial?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  After your 7-day free trial ends, you'll be automatically charged for your selected plan. You can
                  cancel anytime during the trial with no charges.
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Is my data secure?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Absolutely. We use enterprise-grade security with end-to-end encryption and are compliant with
                  industry standards including SOC 2 and GDPR.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
