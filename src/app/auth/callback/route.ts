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
      if (role === 'management' || role === 'staff') {
        return NextResponse.redirect(`${origin}/management`)
      }
      return NextResponse.redirect(`${origin}/family`)
    }
  }

  // return the user to an error page with instructions
  return NextResponse.redirect(`${origin}/login?error=Could not authenticate`)
}
