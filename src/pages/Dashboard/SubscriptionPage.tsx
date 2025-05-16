
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { toast } from "@/components/ui/use-toast";
import DashboardLayout from '@/components/Dashboard/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface SubscriptionData {
  name: string;
  status: 'trial' | 'active' | 'expired';
  trialDaysLeft?: number;
  expiresAt?: Date;
  price: string;
}

const SubscriptionPage = () => {
  const [subscription, setSubscription] = useState<SubscriptionData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    // Simulate loading subscription data
    // Replace with actual API call to get subscription data
    setTimeout(() => {
      // Mock subscription data - replace with API call
      const mockSubscription: SubscriptionData = {
        name: "Plano Mensal",
        status: "trial", // or 'active', 'expired'
        trialDaysLeft: 7,
        price: "R$ 39,90",
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days from now
      };
      
      setSubscription(mockSubscription);
      setIsLoading(false);
    }, 1000);
  }, []);

  const handleSubscribe = () => {
    // In a real app, this would redirect to your payment processor
    // For demo, we'll just show a success toast
    toast({
      title: "Redirecionando para pagamento",
      description: "Você será redirecionado para a plataforma de pagamento."
    });
    
    // Mock redirect to payment gateway
    // window.location.href = 'https://payment-gateway.com/checkout/kendrah-subscription';
    
    // For demo, let's simulate a successful payment after 3 seconds
    setTimeout(() => {
      setSubscription(prev => prev ? {
        ...prev,
        status: 'active',
        trialDaysLeft: undefined,
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days from now
      } : null);
      
      toast({
        title: "Assinatura ativada!",
        description: "Sua assinatura foi ativada com sucesso.",
        variant: "default",
      });
    }, 3000);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-500">Ativa</Badge>;
      case 'trial':
        return <Badge className="bg-blue-500">Em teste</Badge>;
      case 'expired':
        return <Badge className="bg-red-500">Expirada</Badge>;
      default:
        return null;
    }
  };

  return (
    <DashboardLayout>
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-6">Assinatura</h1>
        
        {isLoading ? (
          <div className="flex justify-center items-center h-48">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-kendrah-purple"></div>
          </div>
        ) : subscription ? (
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle className="text-xl">{subscription.name}</CardTitle>
                  <CardDescription className="text-lg font-medium mt-1">{subscription.price}/mês</CardDescription>
                </div>
                {getStatusBadge(subscription.status)}
              </div>
            </CardHeader>
            <CardContent>
              {subscription.status === 'trial' && subscription.trialDaysLeft && (
                <div className="bg-kendrah-purple/10 p-4 rounded-md">
                  <p className="font-medium">
                    Seu período de teste termina em {subscription.trialDaysLeft} dias
                  </p>
                  <p className="text-sm text-gray-600 mt-1">
                    Assine agora para continuar utilizando todos os recursos
                  </p>
                </div>
              )}
              
              {subscription.status === 'active' && subscription.expiresAt && (
                <div className="bg-green-50 p-4 rounded-md">
                  <p className="font-medium text-green-700">
                    Sua assinatura está ativa até {subscription.expiresAt.toLocaleDateString('pt-BR')}
                  </p>
                  <p className="text-sm text-gray-600 mt-1">
                    A renovação acontecerá automaticamente
                  </p>
                </div>
              )}
              
              {subscription.status === 'expired' && (
                <div className="bg-red-50 p-4 rounded-md">
                  <p className="font-medium text-red-700">
                    Sua assinatura expirou
                  </p>
                  <p className="text-sm text-gray-600 mt-1">
                    Renove agora para continuar utilizando o sistema
                  </p>
                </div>
              )}
              
              <div className="mt-6">
                <h3 className="font-medium mb-2">O que está incluso:</h3>
                <ul className="space-y-2">
                  <li className="flex items-center">
                    <svg className="w-5 h-5 text-kendrah-purple mr-2" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path>
                    </svg>
                    Agendamentos ilimitados
                  </li>
                  <li className="flex items-center">
                    <svg className="w-5 h-5 text-kendrah-purple mr-2" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path>
                    </svg>
                    Cadastro de clientes
                  </li>
                  <li className="flex items-center">
                    <svg className="w-5 h-5 text-kendrah-purple mr-2" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path>
                    </svg>
                    Configuração de disponibilidade
                  </li>
                  <li className="flex items-center">
                    <svg className="w-5 h-5 text-kendrah-purple mr-2" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path>
                    </svg>
                    Suporte por email
                  </li>
                </ul>
              </div>
            </CardContent>
            <CardFooter>
              {(subscription.status === 'trial' || subscription.status === 'expired') && (
                <Button 
                  className="w-full bg-kendrah-purple hover:bg-kendrah-purple/90" 
                  onClick={handleSubscribe}
                >
                  {subscription.status === 'trial' ? 'Assinar agora' : 'Renovar assinatura'}
                </Button>
              )}
              
              {subscription.status === 'active' && (
                <Button 
                  variant="outline" 
                  className="w-full border-kendrah-purple text-kendrah-purple hover:bg-kendrah-purple/10"
                  onClick={() => {
                    toast({
                      title: "Gerenciando assinatura",
                      description: "Você será redirecionado para o portal de gerenciamento."
                    });
                  }}
                >
                  Gerenciar assinatura
                </Button>
              )}
            </CardFooter>
          </Card>
        ) : (
          <div className="text-center py-8">
            <p className="text-lg text-gray-500">Não foi possível carregar os dados da assinatura.</p>
            <Button 
              className="mt-4 bg-kendrah-purple hover:bg-kendrah-purple/90"
              onClick={() => setIsLoading(true)}
            >
              Tentar novamente
            </Button>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default SubscriptionPage;
