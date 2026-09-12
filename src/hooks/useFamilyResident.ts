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
        // --- MVP AUTO-LINKING MAGIC ---
        // For testing purposes, if you log in and aren't linked to anyone, 
        // the app will automatically link your Google account to Eleanor 
        // so the UI works instantly without you having to write manual SQL.
        
        targetResidentId = '11111111-1111-1111-1111-111111111111'; // Eleanor's ID

        // Create their user profile
        await supabase.from('user_profiles').upsert({
          id: user.id,
          role: 'family',
          full_name: user.user_metadata?.full_name || user.email || 'Family Member'
        });

        // Link them to Eleanor
        await supabase.from('family_access').upsert({
          user_id: user.id,
          resident_id: targetResidentId
        });
      }

      setResidentId(targetResidentId);

      // Fetch the resident's basic info for the headers
      if (targetResidentId) {
        const { data: resData } = await supabase
          .from('residents')
          .select('first_name, last_name')
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
