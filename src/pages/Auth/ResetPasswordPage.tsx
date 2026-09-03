import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { LockKeyhole } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';

const ResetPasswordPage = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [ready, setReady] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    let mounted = true;

    const prepareRecovery = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (mounted) setReady(Boolean(session));
    };

    const { data: listener } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY' || event === 'SIGNED_IN') {
        if (mounted) setReady(true);
      }
    });

    prepareRecovery();
    return () => {
      mounted = false;
      listener.subscription.unsubscribe();
    };
  }, []);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (password.length < 6) {
      toast({ title: 'Senha muito curta', description: 'Use pelo menos 6 caracteres.', variant: 'destructive' });
      return;
    }
    if (password !== confirmPassword) {
      toast({ title: 'Senhas não conferem', description: 'Digite a mesma senha nos dois campos.', variant: 'destructive' });
      return;
    }

    setIsLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;

      await supabase.auth.signOut();
      toast({ title: 'Senha alterada', description: 'Sua senha foi atualizada. Faça login com a nova senha.' });
      navigate('/login', { replace: true });
    } catch (error) {
      toast({ title: 'Não foi possível alterar a senha', description: error instanceof Error ? error.message : 'O link pode ter expirado. Solicite uma nova recuperação.', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-kendrah-gray/30 p-4">
      <div className="mb-8 text-center">
        <Link to="/" className="text-3xl font-bold text-kendrah-purple">Kendrah</Link>
        <p className="text-gray-500 mt-2">Redefina sua senha com segurança</p>
      </div>

      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-kendrah-purple/10 text-kendrah-purple">
            <LockKeyhole className="h-6 w-6" />
          </div>
          <CardTitle className="text-2xl font-bold">Criar nova senha</CardTitle>
          <CardDescription>Escolha uma nova senha para acessar sua conta.</CardDescription>
        </CardHeader>
        <CardContent>
          {!ready ? (
            <div className="space-y-4 text-center">
              <p className="text-sm text-muted-foreground">Este link de recuperação é inválido, expirou ou ainda está sendo validado.</p>
              <Button className="kendrah-button w-full" onClick={() => navigate('/forgot-password')}>Solicitar novo link</Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="new-password">Nova senha</Label>
                <Input id="new-password" type="password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder="••••••••" autoComplete="new-password" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirm-new-password">Confirme a nova senha</Label>
                <Input id="confirm-new-password" type="password" value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} placeholder="••••••••" autoComplete="new-password" required />
              </div>
              <Button type="submit" className="kendrah-button w-full" disabled={isLoading}>
                {isLoading ? 'Salvando...' : 'Alterar senha'}
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ResetPasswordPage;
