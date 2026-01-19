import { type NextRequest, NextResponse } from "next/server"
import { webhookLogger } from "@/lib/webhook-logger"

// Test endpoint to view webhook logs (development only)
export async function GET(req: NextRequest) {
  if (process.env.NODE_ENV !== "development") {
    return NextResponse.json({ error: "Not available in production" }, { status: 404 })
  }

  const { searchParams } = new URL(req.url)
  const type = searchParams.get("type")
  const failed = searchParams.get("failed") === "true"

  let logs
  if (failed) {
    logs = webhookLogger.getFailedLogs()
  } else if (type) {
    logs = webhookLogger.getLogsByEventType(type)
  } else {
    logs = webhookLogger.getRecentLogs()
  }

  return NextResponse.json({
    logs,
    total: logs.length,
  })
}
