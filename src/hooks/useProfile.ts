import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface ProviderProfile {
  id: string;
  displayName: string;
  businessName: string | null;
  email: string | null;
  slug: string | null;
  whatsappNumber: string | null;
}

export const fetchProviderProfile = async (): Promise<ProviderProfile | null> => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data } = await supabase
    .from('profiles')
    .select('id, business_name, slug, whatsapp_number')
    .eq('id', user.id)
    .maybeSingle();

  const metaName =
    (user.user_metadata?.name as string | undefined) ||
    (user.user_metadata?.full_name as string | undefined);

  return {
    id: user.id,
    displayName:
      metaName?.trim() ||
      data?.business_name?.trim() ||
      user.email?.split('@')[0] ||
      'Prestador',
    businessName: data?.business_name ?? null,
    email: user.email ?? null,
    slug: data?.slug ?? null,
    whatsappNumber: data?.whatsapp_number ?? null,
  };
};

export const useProfile = () => {
  const queryClient = useQueryClient();

  const { data: profile, isLoading } = useQuery({
    queryKey: ['provider-profile'],
    queryFn: fetchProviderProfile,
    staleTime: 1000 * 60 * 5,
  });

  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_OUT') {
        queryClient.setQueryData(['provider-profile'], null);
      } else {
        queryClient.invalidateQueries({ queryKey: ['provider-profile'] });
      }
    });
    return () => sub.subscription.unsubscribe();
  }, [queryClient]);

  return { profile: profile ?? null, loading: isLoading };
};
