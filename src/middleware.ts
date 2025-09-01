import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export function middleware(request: NextRequest) {
  // Allow all requests to pass through without any checks
  return NextResponse.next()
}

// You can comment out or remove the config entirely since we're not doing any filtering
// export const config = {
//   matcher: [
//     "/api/:path*",
//     "/dashboard/:path*",
//     "/studio/:path*",
//     "/profile/:path*",
//     "/billing/:path*",
//   ],
// }