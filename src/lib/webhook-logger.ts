// Webhook event logger for debugging and monitoring
export interface WebhookLog {
  eventId: string
  eventType: string
  timestamp: Date
  processed: boolean
  error?: string
  processingTime?: number
}

class WebhookLogger {
  private logs: WebhookLog[] = []
  private maxLogs = 1000

  log(eventId: string, eventType: string, processed: boolean, error?: string, processingTime?: number) {
    const logEntry: WebhookLog = {
      eventId,
      eventType,
      timestamp: new Date(),
      processed,
      error,
      processingTime,
    }

    this.logs.unshift(logEntry)

    // Keep only the most recent logs
    if (this.logs.length > this.maxLogs) {
      this.logs = this.logs.slice(0, this.maxLogs)
    }

    // Log to console for development
    if (process.env.NODE_ENV === "development") {
      console.log(`[WebhookLogger] ${eventType} - ${processed ? "SUCCESS" : "FAILED"}`, {
        eventId,
        error,
        processingTime,
      })
    }
  }

  getRecentLogs(limit = 50): WebhookLog[] {
    return this.logs.slice(0, limit)
  }

  getFailedLogs(): WebhookLog[] {
    return this.logs.filter((log) => !log.processed)
  }

  getLogsByEventType(eventType: string): WebhookLog[] {
    return this.logs.filter((log) => log.eventType === eventType)
  }
}

export const webhookLogger = new WebhookLogger()
