
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { Checkbox } from '@/components/ui/checkbox';

const RegisterPage = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name || !email || !password || !confirmPassword) {
      toast({
        title: "Campos obrigatórios",
        description: "Por favor, preencha todos os campos",
        variant: "destructive",
      });
      return;
    }
    
    if (password !== confirmPassword) {
      toast({
        title: "Senhas não conferem",
        description: "As senhas digitadas não são iguais",
        variant: "destructive",
      });
      return;
    }
    
    if (!acceptTerms) {
      toast({
        title: "Termos de uso",
        description: "Você precisa aceitar os termos de uso para continuar",
        variant: "destructive",
      });
      return;
    }
    
    setIsLoading(true);
    
    // Simulate registration - replace with actual registration
    try {
      setTimeout(() => {
        // Example registration success
        toast({
          title: "Conta criada",
          description: "Sua conta foi criada com sucesso!",
        });
        
        // Redirect to dashboard (would use react-router navigation)
        window.location.href = '/dashboard';
      }, 2000);
    } catch (error) {
      toast({
        title: "Erro ao criar conta",
        description: "Houve um problema ao criar sua conta. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-kendrah-gray/30 p-4">
      <div className="mb-8 text-center">
        <Link to="/" className="text-3xl font-bold text-kendrah-purple">Kendrah</Link>
        <p className="text-gray-500 mt-2">Automatize sua agenda. Simplifique sua rotina.</p>
      </div>
      
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">Crie sua conta</CardTitle>
          <CardDescription>
            Experimente grátis por 14 dias, sem necessidade de cartão de crédito
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleRegister} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nome completo</Label>
              <Input
                id="name"
                type="text"
                placeholder="Seu nome completo"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="kendrah-input"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="seu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="kendrah-input"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password">Senha</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="kendrah-input"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirme sua senha</Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="kendrah-input"
                required
              />
            </div>
            
            <div className="flex items-start space-x-2">
              <Checkbox 
                id="terms" 
                checked={acceptTerms} 
                onCheckedChange={(checked) => setAcceptTerms(checked === true)} 
              />
              <label
                htmlFor="terms"
                className="text-sm text-gray-500 leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Eu li e aceito os{" "}
                <Link to="/terms" className="text-kendrah-purple hover:underline">
                  termos de uso
                </Link>{" "}
                e{" "}
                <Link to="/privacy" className="text-kendrah-purple hover:underline">
                  política de privacidade
                </Link>
              </label>
            </div>
            
            <Button 
              type="submit"
              className="kendrah-button w-full"
              disabled={isLoading}
            >
              {isLoading ? 'Criando conta...' : 'Iniciar teste grátis'}
            </Button>
            
            <p className="text-xs text-center text-gray-500">
              Ao criar sua conta, você concorda em receber emails sobre atualizações do produto e informações relevantes ao sistema.
            </p>
          </form>
          
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-500">
              Já tem uma conta?{" "}
              <Link to="/login" className="text-kendrah-purple hover:underline font-medium">
                Faça login
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default RegisterPage;
