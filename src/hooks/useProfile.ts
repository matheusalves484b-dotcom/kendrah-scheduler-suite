import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface ProviderProfile {
  id: string;
  displayName: string;
  businessName: string | null;
  email: string | null;
}

export const useProfile = () => {
  const [profile, setProfile] = useState<ProviderProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        if (active) {
          setProfile(null);
          setLoading(false);
        }
        return;
      }

      const { data } = await supabase
        .from('profiles')
        .select('id, business_name')
        .eq('id', user.id)
        .maybeSingle();

      const metaName =
        (user.user_metadata?.name as string | undefined) ||
        (user.user_metadata?.full_name as string | undefined);

      if (active) {
        setProfile({
          id: user.id,
          displayName:
            metaName?.trim() ||
            data?.business_name?.trim() ||
            user.email?.split('@')[0] ||
            'Prestador',
          businessName: data?.business_name ?? null,
          email: user.email ?? null,
        });
        setLoading(false);
      }
    };

    load();

    const { data: sub } = supabase.auth.onAuthStateChange(() => {
      load();
    });

    return () => {
      active = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  return { profile, loading };
};
