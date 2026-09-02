import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface WorkspaceMember {
  id: string;
  owner_id: string;
  member_id: string | null;
  invited_email: string;
  role: 'professional';
  status: 'pending' | 'active' | 'revoked';
}

export const getWorkspaceOwnerId = async (): Promise<string | null> => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  // The function is added by a migration not yet reflected in generated Supabase types.
  const { data, error } = await (supabase as any).rpc('get_workspace_owner_id');
  if (error) {
    console.error('Erro ao identificar a conta compartilhada:', error);
    return user.id;
  }
  return (data as string) || user.id;
};

export const useWorkspace = () => {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['workspace'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return { ownerId: null, currentUserId: null, isOwner: false, member: null as WorkspaceMember | null };

      // Accepta automaticamente um convite pendente quando o profissional entra.
      const { data: acceptedOwnerId } = await (supabase as any).rpc('accept_team_invitation');
      const ownerId = (acceptedOwnerId as string | null) || await getWorkspaceOwnerId();
      if (!ownerId) return { ownerId: null, currentUserId: user.id, isOwner: false, member: null };

      const { data: member } = await (supabase as any)
        .from('team_members')
        .select('id, owner_id, member_id, invited_email, role, status')
        .eq('owner_id', ownerId)
        .in('status', ['pending', 'active'])
        .maybeSingle();

      return {
        ownerId,
        currentUserId: user.id,
        isOwner: ownerId === user.id,
        member: (member as WorkspaceMember | null) ?? null,
      };
    },
    staleTime: 1000 * 60 * 2,
  });

  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange(() => {
      queryClient.invalidateQueries({ queryKey: ['workspace'] });
    });
    return () => sub.subscription.unsubscribe();
  }, [queryClient]);

  return query;
};
