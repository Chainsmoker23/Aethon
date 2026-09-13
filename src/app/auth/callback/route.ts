import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  
  // Custom param we passed from the login button to know where to route them
  const role = searchParams.get('role')

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    
    if (!error) {
      // Fetch the authenticated user
      const { data: { user } } = await supabase.auth.getUser()
      
      if (user) {
        // For this MVP/Demo, we trust the requested role from the login button
        const finalRole = (role === 'management' || role === 'staff') ? 'admin' : 'family'
        
        // Ensure they have a profile so the strict middleware RBAC doesn't block them
        await supabase.from('user_profiles').upsert({
          id: user.id,
          role: finalRole,
          full_name: user.user_metadata?.full_name || user.email || 'Demo User'
        })
      }

      if (role === 'management' || role === 'staff') {
        const response = NextResponse.redirect(`${origin}/management`)
        response.cookies.set('demo_role', 'admin', { path: '/' })
        return response
      }
      
      const response = NextResponse.redirect(`${origin}/family`)
      response.cookies.set('demo_role', 'family', { path: '/' })
      return response
    }
  }

  // return the user to an error page with instructions
  return NextResponse.redirect(`${origin}/login?error=Could not authenticate`)
}
