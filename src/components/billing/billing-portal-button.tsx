"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { ExternalLink, Loader2 } from "lucide-react"
import { redirectToPortal } from "@/lib/checkout-helpers"

interface BillingPortalButtonProps {
  userId: string
  returnUrl?: string
  children?: React.ReactNode
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link"
  size?: "default" | "sm" | "lg" | "icon"
  className?: string
}

export function BillingPortalButton({
  userId,
  returnUrl,
  children = "Manage Billing",
  variant = "outline",
  size = "default",
  className,
}: BillingPortalButtonProps) {
  const [loading, setLoading] = useState(false)

  const handleClick = async () => {
    setLoading(true)
    try {
      await redirectToPortal(userId, returnUrl || window.location.href)
    } catch (error) {
      console.error("Failed to redirect to billing portal:", error)
      // You might want to show a toast notification here
    } finally {
      setLoading(false)
    }
  }

  return (
    <Button onClick={handleClick} disabled={loading} variant={variant} size={size} className={className}>
      {loading ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Loading...
        </>
      ) : (
        <>
          {children}
          <ExternalLink className="ml-2 h-4 w-4" />
        </>
      )}
    </Button>
  )
}
