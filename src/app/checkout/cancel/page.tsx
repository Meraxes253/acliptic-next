import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { XCircle } from "lucide-react"
import Link from "next/link"

export default function CheckoutCancelPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
            <XCircle className="h-6 w-6 text-red-600" />
          </div>
          <CardTitle>Payment Canceled</CardTitle>
          <CardDescription>Your payment was canceled. No charges were made to your account.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground text-center">
            You can try again anytime. If you have questions, please contact our support team.
          </p>
          <div className="flex gap-2">
            <Button asChild className="flex-1">
              <Link href="/pricing">Try Again</Link>
            </Button>
            <Button variant="outline" asChild className="flex-1 bg-transparent">
              <Link href="/Studio">Go back to Studio</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
