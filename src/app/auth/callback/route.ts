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
        let finalRole = 'family'; // Default secure role

        const { createClient: createSupabaseClient } = await import('@supabase/supabase-js');
        const supabaseAdmin = createSupabaseClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.SUPABASE_SERVICE_ROLE_KEY!
        );

        // 1. Check if they were invited as staff using Service Role
        const targetEmail = user.email?.toLowerCase().trim() || '';
        const { data: invite, error: inviteError } = await supabaseAdmin
          .from('staff_invitations')
          .select('role')
          .ilike('email', targetEmail)
          .single();

        if (inviteError && inviteError.code !== 'PGRST116') {
           console.error("Invite fetch error:", inviteError);
        }

        if (invite) {
          // Grant them the invited role
          finalRole = invite.role === 'admin' ? 'admin' : 'caregiver';

          // Consume the invite
          await supabaseAdmin
            .from('staff_invitations')
            .delete()
            .ilike('email', targetEmail);
        } else {
          // If no invite, check if they already have a profile with a staff role
          const { data: profile } = await supabase
            .from('user_profiles')
            .select('role')
            .eq('id', user.id)
            .single();
            
          if (profile?.role === 'admin' || profile?.role === 'staff' || profile?.role === 'caregiver') {
            finalRole = profile.role;
          }
        }
        
        // Ensure they have a profile so the strict middleware RBAC doesn't block them
        await supabaseAdmin.from('user_profiles').upsert({
          id: user.id,
          role: finalRole,
          full_name: user.user_metadata?.full_name || user.email || 'User'
        });

        if (finalRole === 'admin' || finalRole === 'staff' || finalRole === 'caregiver') {
          const response = NextResponse.redirect(`${origin}/management`)
          // We clear the demo_role since we are secure now
          response.cookies.delete('demo_role')
          return response
        }
      }
      
      const response = NextResponse.redirect(`${origin}/family`)
      response.cookies.delete('demo_role')
      return response
    } else {
      console.error("Auth callback error:", error.message);
      return NextResponse.redirect(`${origin}/login?error=${encodeURIComponent(error.message)}`)
    }
  }

  // return the user to an error page with instructions
  return NextResponse.redirect(`${origin}/login?error=No+auth+code+provided`)
}
