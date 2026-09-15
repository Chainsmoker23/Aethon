import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          request.cookies.set({
            name,
            value,
            ...options,
          })
          supabaseResponse = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          supabaseResponse.cookies.set({
            name,
            value,
            ...options,
          })
        },
        remove(name: string, options: CookieOptions) {
          request.cookies.set({
            name,
            value: '',
            ...options,
          })
          supabaseResponse = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          supabaseResponse.cookies.set({
            name,
            value: '',
            ...options,
          })
        },
      },
    }
  )

  // Do not run on static files or api routes
  if (
    request.nextUrl.pathname.startsWith('/_next') ||
    request.nextUrl.pathname.startsWith('/api') ||
    request.nextUrl.pathname.includes('.')
  ) {
    return supabaseResponse
  }

  const { data: { user } } = await supabase.auth.getUser()

  const isAuthRoute = request.nextUrl.pathname.startsWith('/login') || request.nextUrl.pathname.startsWith('/auth')
  const isLandingPage = request.nextUrl.pathname === '/'
  const isTeamPage = request.nextUrl.pathname.startsWith('/team')
  const isTermsPage = request.nextUrl.pathname.startsWith('/terms')
  const isPrivacyPage = request.nextUrl.pathname.startsWith('/privacy')
  const isContactPage = request.nextUrl.pathname.startsWith('/contact')

  if (!user && !isAuthRoute && !isLandingPage && !isTeamPage && !isTermsPage && !isPrivacyPage && !isContactPage) {
    // If not logged in and not on a public page, redirect to login
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  // --- Strict Role-Based Access Control (RBAC) ---
  if (user) {
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    const demoRole = request.cookies.get('demo_role')?.value
    const role = demoRole || profile?.role || 'family' // Respect demo cookie if DB is locked
    const isStaff = role === 'staff' || role === 'admin'
    const isFamily = role === 'family'

    const path = request.nextUrl.pathname

    // 1. Logged-in users hitting auth routes get redirected to their specific dashboard
    if (isAuthRoute) {
      const url = request.nextUrl.clone()
      url.pathname = isStaff ? '/management' : '/family'
      return NextResponse.redirect(url)
    }

    // 2. Prevent family from accessing management routes
    if (path.startsWith('/management') && !isStaff) {
      const url = request.nextUrl.clone()
      url.pathname = '/family'
      return NextResponse.redirect(url)
    }

    // 3. Prevent staff from accessing family routes (optional, but good for separation)
    if (path.startsWith('/family') && isStaff) {
      const url = request.nextUrl.clone()
      url.pathname = '/management'
      return NextResponse.redirect(url)
    }
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * Feel free to modify this pattern to include more paths.
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
