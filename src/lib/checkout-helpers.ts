// Create checkout session
export async function createCheckoutSession({
  priceId,
  successUrl,
  cancelUrl,
}: {
  priceId: string
  successUrl?: string
  cancelUrl?: string
}) {
  const response = await fetch("/api/checkout", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      priceId,
      successUrl,
      cancelUrl,
    }),
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || "Failed to create checkout session")
  }

  return response.json()
}

// Redirect to checkout
export async function redirectToCheckout({
  priceId,
  successUrl,
  cancelUrl,
}: {
  priceId: string
  successUrl?: string
  cancelUrl?: string
}) {
  try {
    const { sessionId, url, redirectUrl } = await createCheckoutSession({
      priceId,
      successUrl,
      cancelUrl,
    })

    // Handle free plan or direct redirect
    if (redirectUrl) {
      window.location.href = redirectUrl
      return
    }

    // Redirect to Stripe checkout
    if (url) {
      window.location.href = url
    } else {
      throw new Error("No checkout URL received")
    }
  } catch (error: any) {
    console.error("Checkout redirect error:", error)
    throw error
  }
}

// Create billing portal session
export async function createPortalSession( returnUrl?: string) {
  const response = await fetch("/api/portal", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      returnUrl,
    }),
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || "Failed to create portal session")
  }

  return response.json()
}

// Redirect to billing portal
export async function redirectToPortal( returnUrl?: string) {
  try {
    const { url } = await createPortalSession( returnUrl)
    window.location.href = url
  } catch (error: any) {
    console.error("Portal redirect error:", error)
    throw error
  }
}

// Get checkout session details
export async function getCheckoutSession(sessionId: string) {
  const response = await fetch(`/api/checkout/session?session_id=${sessionId}`)

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || "Failed to retrieve session")
  }

  return response.json()
}
