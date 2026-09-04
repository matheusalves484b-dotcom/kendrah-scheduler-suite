import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { toast } from "@/components/ui/use-toast";
import DashboardLayout from '@/components/Dashboard/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useSubscription, daysLeft } from '@/hooks/useSubscription';
import { Check, RefreshCw } from 'lucide-react';

const INCLUDED = ['Agendamentos ilimitados', 'Cadastro de clientes', 'Configuração de disponibilidade', 'Notificações via WhatsApp', 'Suporte por email'];
const SUPABASE_URL = 'https://opqzywvuasgiyubwqtgh.supabase.co';
const SUPABASE_PUBLISHABLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9wcXp5d3Z1YXNnaXl1YndxdGdoIiwiaWF0IjoxNzQ3ODgwMDcyLCJleHAiOjIwNjM0NTYwNzJ9.tczJsQ_4-eDv0jdPVITs_HErO96isZ8B2yRWB-zDmbA';

const SubscriptionPage = () => {
  const { data, isLoading, refetch, isFetching } = useSubscription();
  const [busy, setBusy] = useState(false);
  const [params, setParams] = useSearchParams();

  useEffect(() => {
    const checkout = params.get('checkout');
    if (!checkout) return;
    if (checkout === 'success') {
      toast({ title: 'Pagamento recebido!', description: 'Estamos confirmando sua assinatura.' });
      refetch();
    } else toast({ title: 'Pagamento cancelado', description: 'Você pode assinar quando quiser.' });
    params.delete('checkout');
    setParams(params, { replace: true });
  }, [params, setParams, refetch]);

  const invokeFn = async (fn: 'create-checkout' | 'customer-portal') => {
    setBusy(true);
    try {
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      if (sessionError) throw sessionError;
      if (!session?.access_token) throw new Error('Sua sessão expirou. Faça login novamente.');

      const response = await fetch(`${SUPABASE_URL}/functions/v1/${fn}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': SUPABASE_PUBLISHABLE_KEY,
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({}),
      });

      const responseText = await response.text();
      let res: { url?: string; error?: string } = {};
      try { res = JSON.parse(responseText); } catch { /* resposta não-JSON */ }

      if (!response.ok) throw new Error(res.error || `Erro ao iniciar pagamento (${response.status}).`);
      if (res.url) window.location.href = res.url;
      else throw new Error('Não foi possível gerar o checkout. Tente novamente.');
    } catch (e) {
      toast({ title: 'Não foi possível continuar', description: e instanceof Error ? e.message : 'Tente novamente em instantes.', variant: 'destructive' });
    } finally { setBusy(false); }
  };

  const trialDays = daysLeft(data?.trial_end ?? null);
  const status: 'active' | 'trial' | 'expired' | 'ambassador' = data?.is_ambassador ? 'ambassador' : data?.subscribed ? 'active' : trialDays > 0 ? 'trial' : 'expired';

  const statusBadge = {
    active: <Badge className="bg-green-600">Ativa</Badge>,
    trial: <Badge className="bg-blue-500">Em teste</Badge>,
    expired: <Badge className="bg-red-500">Expirada</Badge>,
    ambassador: <Badge className="bg-purple-600">Embaixador</Badge>,
  }[status];

  return (
    <DashboardLayout>
      <div className="p-4 sm:p-6">
        <div className="flex items-center justify-between mb-6 gap-3">
          <h1 className="text-2xl font-bold">Assinatura</h1>
          <Button variant="ghost" size="sm" onClick={() => refetch()} disabled={isFetching}><RefreshCw className={`h-4 w-4 mr-2 ${isFetching ? 'animate-spin' : ''}`} />Atualizar</Button>
        </div>
        {isLoading ? (
          <div className="flex justify-center items-center h-48"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-kendrah-purple" /></div>
        ) : (
          <Card className="max-w-2xl">
            <CardHeader>
              <div className="flex justify-between items-start gap-4">
                <div><CardTitle className="text-xl">{status === 'ambassador' ? 'Plano Embaixador' : 'Plano Mensal'}</CardTitle><CardDescription className="text-lg font-medium mt-1">{status === 'ambassador' ? 'Gratuito vitalício' : 'R$ 39,90/mês'}</CardDescription></div>
                <div>{statusBadge}</div>
              </div>
            </CardHeader>
            <CardContent>
              {status === 'ambassador' && <div className="bg-purple-50 p-4 rounded-md"><p className="font-medium text-purple-700">Acesso de embaixador ativo</p><p className="text-sm text-muted-foreground mt-1">Sua conta possui acesso gratuito e não precisa de assinatura para continuar usando o KENDRAH.</p></div>}
              {status === 'trial' && <div className="bg-kendrah-purple/10 p-4 rounded-md"><p className="font-medium">Seu período de teste termina em {trialDays} {trialDays === 1 ? 'dia' : 'dias'}</p><p className="text-sm text-muted-foreground mt-1">Assine agora para continuar usando todos os recursos. Cancele quando quiser.</p></div>}
              {status === 'active' && <div className="bg-green-50 p-4 rounded-md"><p className="font-medium text-green-700">{data?.cancel_at_period_end ? 'Assinatura ativa até' : 'Renovação automática em'} {data?.subscription_end ? new Date(data.subscription_end).toLocaleDateString('pt-BR') : '—'}</p><p className="text-sm text-muted-foreground mt-1">{data?.cancel_at_period_end ? 'Sua assinatura não será renovada.' : 'A renovação acontece automaticamente.'}</p></div>}
              {status === 'expired' && <div className="bg-red-50 p-4 rounded-md"><p className="font-medium text-red-700">Seu período de teste terminou</p><p className="text-sm text-muted-foreground mt-1">Assine para continuar usando o KENDRAH e recebendo agendamentos.</p></div>}
              <div className="mt-6"><h3 className="font-medium mb-2">O que está incluso:</h3><ul className="space-y-2">{INCLUDED.map(item => <li key={item} className="flex items-center text-sm"><Check className="w-4 h-4 text-kendrah-purple mr-2 shrink-0" />{item}</li>)}</ul></div>
            </CardContent>
            <CardFooter>
              {status === 'ambassador' ? <div className="w-full text-center text-sm text-muted-foreground">Você não precisa realizar nenhum pagamento.</div> : status === 'active' ? <Button variant="outline" className="w-full border-kendrah-purple text-kendrah-purple hover:bg-kendrah-purple/10" disabled={busy} onClick={() => invokeFn('customer-portal')}>Gerenciar assinatura</Button> : <Button className="w-full bg-kendrah-purple hover:bg-kendrah-purple/90" disabled={busy} onClick={() => invokeFn('create-checkout')}>{busy ? 'Abrindo pagamento...' : 'Assinar por R$ 39,90/mês'}</Button>}
            </CardFooter>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
};

export default SubscriptionPage;
