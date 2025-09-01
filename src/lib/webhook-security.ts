import { stripe } from "./stripe"

// Verify webhook signature
export function verifyWebhookSignature(body: string, signature: string, secret: string) {
  try {
    return stripe.webhooks.constructEvent(body, signature, secret)
  } catch (error: any) {
    throw new Error(`Webhook signature verification failed: ${error.message}`)
  }
}

// Rate limiting for webhooks (optional but recommended)
const webhookAttempts = new Map<string, { count: number; resetTime: number }>()

export function checkWebhookRateLimit(eventId: string, maxAttempts = 5, windowMs = 60000): boolean {
  const now = Date.now()
  const attempts = webhookAttempts.get(eventId)

  if (!attempts || now > attempts.resetTime) {
    webhookAttempts.set(eventId, { count: 1, resetTime: now + windowMs })
    return true
  }

  if (attempts.count >= maxAttempts) {
    return false
  }

  attempts.count++
  return true
}

// Clean up old rate limit entries
setInterval(() => {
  const now = Date.now()
  for (const [eventId, attempts] of webhookAttempts.entries()) {
    if (now > attempts.resetTime) {
      webhookAttempts.delete(eventId)
    }
  }
}, 300000) // Clean up every 5 minutes
