import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    const normalizedEmail = email.trim().toLowerCase();

    if (!normalizedEmail) {
      toast({ title: 'E-mail obrigatório', description: 'Informe seu e-mail para continuar.', variant: 'destructive' });
      return;
    }

    setIsLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(normalizedEmail, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) throw error;
      setSent(true);
      toast({ title: 'E-mail enviado', description: 'Se existir uma conta com este e-mail, você receberá um link para redefinir a senha.' });
    } catch (error) {
      toast({ title: 'Não foi possível enviar o e-mail', description: error instanceof Error ? error.message : 'Tente novamente.', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-kendrah-gray/30 p-4">
      <div className="mb-8 text-center">
        <Link to="/" className="text-3xl font-bold text-kendrah-purple">Kendrah</Link>
        <p className="text-gray-500 mt-2">Recupere o acesso à sua conta</p>
      </div>

      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">Esqueceu a senha?</CardTitle>
          <CardDescription>
            {sent ? 'Confira sua caixa de entrada e siga o link enviado.' : 'Digite o e-mail cadastrado para receber o link de recuperação.'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {sent ? (
            <div className="space-y-4 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-kendrah-purple/10 text-kendrah-purple">
                <Mail className="h-7 w-7" />
              </div>
              <p className="text-sm text-muted-foreground">O link é seguro e permitirá que você crie uma nova senha.</p>
              <Button className="kendrah-button w-full" onClick={() => navigate('/login')}>Voltar para o login</Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="forgot-email">E-mail</Label>
                <Input id="forgot-email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="seu@email.com" className="kendrah-input" autoComplete="email" required />
              </div>
              <Button type="submit" className="kendrah-button w-full" disabled={isLoading}>
                {isLoading ? 'Enviando...' : 'Enviar link de recuperação'}
              </Button>
              <Button type="button" variant="ghost" className="w-full" onClick={() => navigate('/login')}>
                <ArrowLeft className="mr-2 h-4 w-4" /> Voltar para o login
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ForgotPasswordPage;
