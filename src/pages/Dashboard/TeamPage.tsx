import { useEffect, useState } from 'react';
import { Users, Mail, UserPlus, Trash2, CheckCircle2, Clock3 } from 'lucide-react';
import DashboardLayout from '@/components/Dashboard/DashboardLayout';
import DashboardHeader from '@/components/Dashboard/DashboardHeader';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useWorkspace } from '@/hooks/useWorkspace';

interface TeamMemberRow { id: string; owner_id: string; member_id: string | null; invited_email: string; role: 'professional'; status: 'pending' | 'active' | 'revoked'; created_at: string; }

const TeamPage = () => {
  const { data: workspace, isLoading: workspaceLoading, refetch } = useWorkspace();
  const [member, setMember] = useState<TeamMemberRow | null>(null);
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const loadMember = async () => {
    if (!workspace?.ownerId) return;
    setLoading(true);
    const { data, error } = await (supabase as any).from('team_members').select('id, owner_id, member_id, invited_email, role, status, created_at').eq('owner_id', workspace.ownerId).in('status', ['pending', 'active']).maybeSingle();
    if (error) console.error('Erro ao carregar equipe:', error);
    setMember((data as TeamMemberRow | null) ?? null);
    setLoading(false);
  };
  useEffect(() => { loadMember(); }, [workspace?.ownerId]);

  const handleInvite = async (event: React.FormEvent) => {
    event.preventDefault();
    const normalizedEmail = email.trim().toLowerCase();
    if (!workspace?.isOwner) { toast({ title: 'Acesso restrito', description: 'Somente o proprietário pode adicionar um profissional.', variant: 'destructive' }); return; }
    if (!normalizedEmail || !normalizedEmail.includes('@')) { toast({ title: 'E-mail inválido', description: 'Informe um e-mail válido para o profissional.', variant: 'destructive' }); return; }
    if (member) { toast({ title: 'Limite atingido', description: 'Seu plano permite o proprietário + 1 profissional.', variant: 'destructive' }); return; }
    setSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Sessão expirada. Faça login novamente.');
      if (normalizedEmail === user.email?.toLowerCase()) throw new Error('Você não pode adicionar seu próprio e-mail.');
      const { data, error } = await supabase.functions.invoke('invite-team-member', { body: { email: normalizedEmail } });
      if (error) throw error;
      if (!data?.success) throw new Error(data?.error || 'Não foi possível enviar o convite.');
      setEmail(''); await loadMember();
      toast({ title: 'Convite enviado', description: `Enviamos um link seguro de acesso para ${normalizedEmail}.` });
    } catch (error) { toast({ title: 'Não foi possível convidar', description: error instanceof Error ? error.message : 'Tente novamente.', variant: 'destructive' }); }
    finally { setSaving(false); }
  };

  const handleRevoke = async () => {
    if (!workspace?.isOwner || !member?.id) return;
    setSaving(true);
    try {
      const { data, error } = await supabase.functions.invoke('revoke-team-member', {
        body: { team_member_id: member.id },
      });
      if (error) throw error;
      if (!data?.success) throw new Error(data?.error || 'Não foi possível remover o profissional.');
      await loadMember(); await refetch();
      toast({ title: 'Profissional removido', description: 'O acesso foi encerrado e o e-mail foi liberado para um novo cadastro independente.' });
    } catch (error) { toast({ title: 'Erro ao remover profissional', description: error instanceof Error ? error.message : 'Tente novamente.', variant: 'destructive' }); }
    finally { setSaving(false); }
  };

  return (
    <DashboardLayout>
      <div className="container mx-auto max-w-3xl px-4 py-6 sm:py-8">
        <DashboardHeader title="Equipe" subtitle="Use sua conta KENDRAH com mais 1 profissional, sem contratar outro plano." />
        {workspaceLoading || loading ? <div className="flex h-40 items-center justify-center text-muted-foreground">Carregando equipe...</div> : !workspace?.isOwner ? (
          <Card><CardHeader><CardTitle>Conta compartilhada</CardTitle><CardDescription>Você está usando o KENDRAH como profissional convidado.</CardDescription></CardHeader><CardContent><div className="flex items-center gap-3 rounded-lg bg-kendrah-purple/5 p-4"><CheckCircle2 className="h-5 w-5 text-kendrah-purple" /><p className="text-sm">Você tem acesso à agenda, serviços, clientes e demais recursos compartilhados pelo proprietário.</p></div></CardContent></Card>
        ) : (
          <div className="space-y-6"><Card><CardHeader><div className="flex items-start justify-between gap-4"><div><CardTitle className="flex items-center gap-2"><Users className="h-5 w-5 text-kendrah-purple" />Profissionais</CardTitle><CardDescription className="mt-1">Seu plano inclui você e mais 1 profissional.</CardDescription></div><Badge variant="secondary">{member ? '2 de 2' : '1 de 2'} profissionais</Badge></div></CardHeader><CardContent>
            <div className="rounded-xl border p-4 mb-4"><div className="flex items-center gap-3"><div className="flex h-10 w-10 items-center justify-center rounded-full bg-kendrah-purple/10 text-kendrah-purple font-semibold">Você</div><div><p className="font-medium">Proprietário</p><p className="text-sm text-muted-foreground">Acesso completo à conta</p></div><Badge className="ml-auto">Proprietário</Badge></div></div>
            {member ? <div className="rounded-xl border p-4"><div className="flex flex-col gap-4 sm:flex-row sm:items-center"><div className="flex items-center gap-3 flex-1"><div className="flex h-10 w-10 items-center justify-center rounded-full bg-kendrah-purple/10 text-kendrah-purple font-semibold">{member.invited_email.charAt(0).toUpperCase()}</div><div><p className="font-medium break-all">{member.invited_email}</p><div className="flex items-center gap-2 text-sm text-muted-foreground">{member.status === 'active' ? <><CheckCircle2 className="h-4 w-4 text-green-600" />Ativo</> : <><Clock3 className="h-4 w-4 text-amber-600" />Aguardando acesso</>}</div></div></div><Button variant="outline" className="text-red-600 border-red-200 hover:bg-red-50" onClick={handleRevoke} disabled={saving}><Trash2 className="mr-2 h-4 w-4" />{saving ? 'Removendo...' : 'Remover'}</Button></div></div> : <form onSubmit={handleInvite} className="rounded-xl border border-dashed p-5"><div className="mb-4 flex items-center gap-3"><div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted"><UserPlus className="h-5 w-5 text-muted-foreground" /></div><div><p className="font-medium">Adicionar profissional</p><p className="text-sm text-muted-foreground">Ele receberá um link seguro para entrar no KENDRAH.</p></div></div><div className="space-y-2"><Label htmlFor="team-email">E-mail do profissional</Label><div className="flex flex-col gap-2 sm:flex-row"><Input id="team-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="profissional@email.com" required /><Button type="submit" disabled={saving}><Mail className="mr-2 h-4 w-4" />{saving ? 'Enviando...' : 'Enviar convite'}</Button></div></div></form>}
          </CardContent></Card><div className="rounded-lg bg-muted/50 p-4 text-sm text-muted-foreground">O profissional convidado acessa a mesma conta de negócio. Ao ser removido, seu acesso compartilhado é encerrado e o e-mail fica disponível para um cadastro independente no KENDRAH.</div></div>
        )}
      </div>
    </DashboardLayout>
  );
};
export default TeamPage;
