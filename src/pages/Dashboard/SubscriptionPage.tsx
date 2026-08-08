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

const INCLUDED = [
  'Agendamentos ilimitados',
  'Cadastro de clientes',
  'Configuração de disponibilidade',
  'Notificações via WhatsApp',
  'Suporte por email',
];

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
    } else {
      toast({ title: 'Pagamento cancelado', description: 'Você pode assinar quando quiser.' });
    }
    params.delete('checkout');
    setParams(params, { replace: true });
  }, [params, setParams, refetch]);

  const invokeFn = async (fn: 'create-checkout' | 'customer-portal') => {
    setBusy(true);
    try {
      const { data: res, error } = await supabase.functions.invoke(fn);
      if (error) throw error;
      if (res?.url) window.open(res.url, '_blank');
    } catch (e) {
      toast({
        title: 'Não foi possível continuar',
        description: e instanceof Error ? e.message : 'Tente novamente em instantes.',
        variant: 'destructive',
      });
    } finally {
      setBusy(false);
    }
  };

  const trialDays = daysLeft(data?.trial_end ?? null);
  const status: 'active' | 'trial' | 'expired' = data?.subscribed
    ? 'active'
    : trialDays > 0
      ? 'trial'
      : 'expired';

  const statusBadge = {
    active: <Badge className="bg-green-600">Ativa</Badge>,
    trial: <Badge className="bg-blue-500">Em teste</Badge>,
    expired: <Badge className="bg-red-500">Expirada</Badge>,
  }[status];

  return (
    <DashboardLayout>
      <div className="p-4 sm:p-6">
        <div className="flex items-center justify-between mb-6 gap-3">
          <h1 className="text-2xl font-bold">Assinatura</h1>
          <Button variant="ghost" size="sm" onClick={() => refetch()} disabled={isFetching}>
            <RefreshCw className={`h-4 w-4 mr-2 ${isFetching ? 'animate-spin' : ''}`} />
            Atualizar
          </Button>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center h-48">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-kendrah-purple"></div>
          </div>
        ) : (
          <Card className="max-w-2xl">
            <CardHeader>
              <div className="flex justify-between items-start gap-4">
                <div>
                  <CardTitle className="text-xl">Plano Mensal</CardTitle>
                  <CardDescription className="text-lg font-medium mt-1">R$ 39,90/mês</CardDescription>
                </div>
                {statusBadge}
              </div>
            </CardHeader>

            <CardContent>
              {status === 'trial' && (
                <div className="bg-kendrah-purple/10 p-4 rounded-md">
                  <p className="font-medium">
                    Seu período de teste termina em {trialDays} {trialDays === 1 ? 'dia' : 'dias'}
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Assine agora para continuar usando todos os recursos. Cancele quando quiser.
                  </p>
                </div>
              )}

              {status === 'active' && (
                <div className="bg-green-50 p-4 rounded-md">
                  <p className="font-medium text-green-700">
                    {data?.cancel_at_period_end ? 'Assinatura ativa até' : 'Renovação automática em'}{' '}
                    {data?.subscription_end
                      ? new Date(data.subscription_end).toLocaleDateString('pt-BR')
                      : '—'}
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    {data?.cancel_at_period_end
                      ? 'Sua assinatura não será renovada.'
                      : 'A renovação acontece automaticamente.'}
                  </p>
                </div>
              )}

              {status === 'expired' && (
                <div className="bg-red-50 p-4 rounded-md">
                  <p className="font-medium text-red-700">Seu período de teste terminou</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Assine para continuar recebendo agendamentos.
                  </p>
                </div>
              )}

              <div className="mt-6">
                <h3 className="font-medium mb-2">O que está incluso:</h3>
                <ul className="space-y-2">
                  {INCLUDED.map((item) => (
                    <li key={item} className="flex items-center text-sm">
                      <Check className="w-4 h-4 text-kendrah-purple mr-2 shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </CardContent>

            <CardFooter>
              {status === 'active' ? (
                <Button
                  variant="outline"
                  className="w-full border-kendrah-purple text-kendrah-purple hover:bg-kendrah-purple/10"
                  disabled={busy}
                  onClick={() => invokeFn('customer-portal')}
                >
                  Gerenciar assinatura
                </Button>
              ) : (
                <Button
                  className="w-full bg-kendrah-purple hover:bg-kendrah-purple/90"
                  disabled={busy}
                  onClick={() => invokeFn('create-checkout')}
                >
                  {busy ? 'Abrindo pagamento...' : 'Assinar por R$ 39,90/mês'}
                </Button>
              )}
            </CardFooter>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
};

export default SubscriptionPage;
