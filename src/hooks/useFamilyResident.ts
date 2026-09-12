"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";

export function useFamilyResident() {
  const [residentId, setResidentId] = useState<string | null>(null);
  const [residentInfo, setResidentInfo] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    async function fetchAccess() {
      // 1. Get the currently logged-in Google Auth user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { 
        setLoading(false); 
        return; 
      }

      // 2. Check the family_access table to see which resident they are linked to
      const { data: accessData } = await supabase
        .from('family_access')
        .select('resident_id')
        .eq('user_id', user.id)
        .single();

      let targetResidentId = null;

      if (accessData) {
        targetResidentId = accessData.resident_id;
      } else {
        // --- REAL INVITE LOGIC ---
        // Check if this email was invited by the facility
        const { data: inviteData } = await supabase
          .from('family_invitations')
          .select('resident_id')
          .eq('email', user.email)
          .single();

        if (inviteData) {
          targetResidentId = inviteData.resident_id;

          // Create their user profile
          await supabase.from('user_profiles').upsert({
            id: user.id,
            role: 'family',
            full_name: user.user_metadata?.full_name || user.email || 'Family Member'
          });

          // Link them permanently in family_access
          await supabase.from('family_access').upsert({
            user_id: user.id,
            resident_id: targetResidentId
          });

          // Consume the invite (delete it)
          await supabase.from('family_invitations').delete().eq('email', user.email);
        } else {
          // --- MVP DEMO FALLBACK ---
          // If they just log in blindly without being invited, show Eleanor so the app doesn't break
          targetResidentId = '11111111-1111-1111-1111-111111111111'; // Eleanor's ID
        }
      }

      setResidentId(targetResidentId);

      // Fetch the resident's basic info for the headers
      if (targetResidentId) {
        const { data: resData } = await supabase
          .from('residents')
          .select('*')
          .eq('id', targetResidentId)
          .single();
        if (resData) setResidentInfo(resData);
      }

      setLoading(false);
    }
    fetchAccess();
  }, []);

  return { residentId, residentInfo, loading };
}
