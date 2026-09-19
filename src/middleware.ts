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

  // Do not run on static files, api routes, or auth callback (to prevent consuming the code prematurely)
  if (
    request.nextUrl.pathname.startsWith('/_next') ||
    request.nextUrl.pathname.startsWith('/api') ||
    request.nextUrl.pathname.startsWith('/auth/callback') ||
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
      .select(`
        role, 
        facility_id,
        facilities ( subscription_status )
      `)
      .eq('id', user.id)
      .single()

    const role = profile?.role || 'family' 
    const isSuperAdmin = role === 'superadmin'
    const isStaff = role === 'staff' || role === 'admin' || role === 'caregiver'
    const isFamily = role === 'family'
    
    // @ts-ignore
    const facilityStatus = profile?.facilities?.subscription_status || 'pilot';

    const path = request.nextUrl.pathname

    // SUPER ADMIN ROUTING
    if (path.startsWith('/superadmin') && !isSuperAdmin) {
      const url = request.nextUrl.clone()
      url.pathname = isStaff ? '/management' : '/family'
      return NextResponse.redirect(url)
    }

    // Super Admins are allowed in /management, but not /family or auth routes
    if (isSuperAdmin && (path.startsWith('/family') || isAuthRoute)) {
      if (path !== '/superadmin') {
         const url = request.nextUrl.clone()
         url.pathname = '/superadmin'
         return NextResponse.redirect(url)
      }
    }

    // 0. LOCKOUT: If subscription is past due, force them to the settings page
    if (isStaff && facilityStatus === 'past_due' && path !== '/management/settings') {
      const url = request.nextUrl.clone()
      url.pathname = '/management/settings'
      return NextResponse.redirect(url)
    }

    // 1. Logged-in users hitting auth routes get redirected to their specific dashboard
    if (isAuthRoute && !isSuperAdmin) {
      const url = request.nextUrl.clone()
      url.pathname = isStaff ? '/management' : '/family'
      return NextResponse.redirect(url)
    }

    // 2. Prevent family from accessing management routes
    if (path.startsWith('/management') && !isStaff && !isSuperAdmin) {
      const url = request.nextUrl.clone()
      url.pathname = '/family'
      return NextResponse.redirect(url)
    }

    // 3. Prevent staff from accessing family routes (optional, but good for separation)
    if (path.startsWith('/family') && isStaff && !isSuperAdmin) {
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
