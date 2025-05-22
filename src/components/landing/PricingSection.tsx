import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
const PricingSection = () => {
  const features = ["Agendamentos ilimitados", "Notificações por WhatsApp", "Link de agendamento personalizado", "Cadastro ilimitado de serviços", "Horários personalizados", "Relatórios detalhados", "Suporte prioritário", "Atualizações e novidades"];
  return <section className="py-20 bg-kendrah-gray/20 bg-gray-900">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold mb-4 text-kendrah-black text-zinc-50">Simples e Transparente</h2>
          <p className="text-xl max-w-3xl mx-auto text-zinc-200">
            Sem taxas ocultas, sem complicações. Apenas um preço justo por tudo que você precisa.
          </p>
        </div>
        
        <div className="flex justify-center bg-gray-900">
          <div className="kendrah-card max-w-lg border-2 border-kendrah-purple rounded-3xl bg-gray-900">
            <div className="text-center">
              <h3 className="text-xl font-bold text-kendrah-accent text-zinc-50">Plano Premium</h3>
              <div className="mt-4">
                <span className="text-4xl font-bold text-kendrah-accent text-kendrah-purple">R$ 39,90</span>
                <span className="ml-2 text-zinc-400">/mês</span>
              </div>
              <p className="mt-2 text-zinc-400">Cobrado mensalmente</p>
            </div>
            
            <div className="mt-8 space-y-4 bg-gray-900">
              {features.map((feature, index) => <div key={index} className="flex items-center bg-transparent">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-kendrah-purple mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-zinc-50 text-lg">{feature}</span>
                </div>)}
            </div>
            
            <div className="mt-8">
              <Link to="/register" className="w-full">
                <Button className="kendrah-button w-full py-6">
                  Experimente Grátis por 14 Dias
                </Button>
              </Link>
              <p className="text-sm text-center mt-3 text-gray-500">
                Sem necessidade de cartão de crédito para o teste
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>;
};
export default PricingSection;