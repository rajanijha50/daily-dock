import { getToken } from 'next-auth/jwt';
import { NextRequest, NextResponse } from 'next/server'
 
export async function proxy(request: NextRequest) {
  const token = await getToken({ 
    req: request, 
    secret: process.env.NEXTAUTH_SECRET 
  });

  // If not logged in, redirect to /login
  if (!token) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // If logged in, allow the request to proceed
  return NextResponse.next()
}
 
export const config = {
  matcher: ['/note', '/diary','/todo','/timer'],
}