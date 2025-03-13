import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  
  // Skip Supabase authentication in development mode
  if (process.env.NODE_ENV === 'development') {
    return res
  }
  
  try {
    const supabase = createMiddlewareClient({ req, res })

    const {
      data: { session },
    } = await supabase.auth.getSession()

    // If the user is not signed in and the route is not public, redirect to auth page
    const isAuthRoute = req.nextUrl.pathname.startsWith('/auth')
    const isApiRoute = req.nextUrl.pathname.startsWith('/api')
    const isChatRoute = req.nextUrl.pathname.startsWith('/chat')
    const isPublicRoute = isAuthRoute || isApiRoute || req.nextUrl.pathname === '/' || isChatRoute

    if (!session && !isPublicRoute) {
      const redirectUrl = new URL('/auth', req.url)
      return NextResponse.redirect(redirectUrl)
    }

    // If the user is signed in and trying to access auth page, redirect to dashboard
    if (session && isAuthRoute) {
      const redirectUrl = new URL('/', req.url)
      return NextResponse.redirect(redirectUrl)
    }
  } catch (error) {
    console.error('Middleware error:', error)
  }

  return res
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
} 