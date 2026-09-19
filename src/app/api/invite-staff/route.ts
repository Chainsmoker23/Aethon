import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: Request) {
  try {
    const { email, role } = await request.json();

    if (!email || !role) {
      return NextResponse.json({ error: 'Email and role are required' }, { status: 400 });
    }

    const supabase = await createClient();

    // 1. Verify user is authenticated and is an admin
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: profile } = await supabase
      .from('user_profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (profile?.role !== 'admin' && profile?.role !== 'staff') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Insert into Supabase
    const { error: dbError } = await supabase
      .from('staff_invitations')
      .insert([
        {
          email: email.trim(),
          role: role,
          invited_by: user.id
        }
      ]);

    if (dbError) {
      if (dbError.code !== '23505') { 
         console.error('DB Error:', dbError);
         return NextResponse.json({ error: 'Database Error: ' + dbError.message }, { status: 500 });
      }
    }

    const loginUrl = `${process.env.NEXT_PUBLIC_SITE_URL || 'https://aethon-amber.vercel.app'}/login?role=management`;

    // 2. Create a beautiful HTML email template
    const htmlEmail = `
      <div style="font-family: Arial, sans-serif; max-w: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px; background-color: #ffffff;">
        <div style="text-align: center; padding-bottom: 20px; border-bottom: 1px solid #e2e8f0;">
          <h1 style="color: #0f172a; margin-bottom: 0;">Aethon<span style="color: #0284c7; font-weight: 300;">Health</span></h1>
        </div>
        
        <div style="padding: 30px 0; color: #334155; line-height: 1.6;">
          <h2 style="color: #0f172a; font-size: 20px;">You've been invited to join the staff team</h2>
          <p>Hello,</p>
          <p>You have been invited to access the Aethon Health Management Dashboard as a <strong>${role === 'admin' ? 'Facility Admin' : 'Caregiver'}</strong>.</p>
          
          <div style="text-align: center; margin: 40px 0;">
            <a href="${loginUrl}" style="background-color: #0f172a; color: #ffffff; text-decoration: none; padding: 14px 28px; border-radius: 8px; font-weight: bold; font-size: 16px; display: inline-block;">
              Access Dashboard
            </a>
          </div>
          
          <p style="font-size: 14px; color: #64748b;">
            To sign in, please click the button above and select "Sign in with Google" using this email address (<strong>${email}</strong>).
          </p>
        </div>
        
        <div style="padding-top: 20px; border-top: 1px solid #e2e8f0; text-align: center; font-size: 12px; color: #94a3b8;">
          <p>Built with Swiss Precision. Securely hosted in Switzerland.</p>
          <p>c ${new Date().getFullYear()} Alpina Health / Aethon Health</p>
        </div>
      </div>
    `;

    // 3. Send the email using Resend
    const { data, error: sendError } = await resend.emails.send({
      from: 'Aethon Health <onboarding@resend.dev>',
      to: email,
      subject: `Invitation to join Aethon Health as a ${role === 'admin' ? 'Facility Admin' : 'Caregiver'}`,
      html: htmlEmail,
    });

    if (sendError) {
      console.error('Resend Error:', sendError);
      return NextResponse.json({ error: sendError.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, data });

  } catch (error: any) {
    console.error('Email send error:', error);
    return NextResponse.json({ error: error.message || 'Failed to send email' }, { status: 500 });
  }
}
