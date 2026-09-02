import { useEffect, useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { CheckCircle2, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const AcceptInvitePage = () => {
  const navigate = useNavigate();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('Validando seu convite...');

  useEffect(() => {
    let active = true;

    const accept = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();

        if (!session?.user) {
          if (active) {
            setStatus('error');
            setMessage('O link de convite expirou ou não foi autenticado. Solicite um novo convite ao proprietário.');
          }
          return;
        }

        const { data: ownerId, error } = await supabase.rpc('accept_team_invitation');
        if (error) throw error;

        if (!ownerId) {
          if (active) {
            setStatus('error');
            setMessage('Não encontramos um convite pendente para este e-mail. Solicite um novo convite ao proprietário.');
          }
          return;
        }

        if (active) {
          setStatus('success');
          setMessage('Convite aceito! Preparando seu acesso ao KENDRAH...');
          setTimeout(() => navigate('/dashboard', { replace: true }), 900);
        }
      } catch (error) {
        console.error('Erro ao aceitar convite:', error);
        if (active) {
          setStatus('error');
          setMessage(error instanceof Error ? error.message : 'Não foi possível aceitar o convite.');
        }
      }
    };

    const { data: listener } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_IN' || event === 'INITIAL_SESSION') accept();
    });

    accept();

    return () => {
      active = false;
      listener.subscription.unsubscribe();
    };
  }, [navigate]);

  if (status === 'success') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="w-full max-w-md text-center">
          <CardHeader>
            <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-green-100 text-green-600">
              <CheckCircle2 className="h-6 w-6" />
            </div>
            <CardTitle>Convite aceito</CardTitle>
          </CardHeader>
          <CardContent><p className="text-muted-foreground">{message}</p></CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md text-center">
        <CardHeader>
          <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-kendrah-purple/10 text-kendrah-purple">
            {status === 'loading' ? <Loader2 className="h-6 w-6 animate-spin" /> : <span className="text-xl">!</span>}
          </div>
          <CardTitle>{status === 'loading' ? 'Entrando no KENDRAH' : 'Convite não disponível'}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">{message}</p>
          {status === 'error' && <Button onClick={() => navigate('/login')}>Ir para o login</Button>}
        </CardContent>
      </Card>
    </div>
  );
};

export default AcceptInvitePage;
