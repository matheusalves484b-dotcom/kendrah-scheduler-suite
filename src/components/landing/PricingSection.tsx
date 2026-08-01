import { Link } from 'react-router-dom';
import { Check, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';

const PricingSection = () => {
  const features = ["Agendamentos ilimitados", "Notificações por WhatsApp", "Link de agendamento personalizado", "Cadastro ilimitado de serviços", "Horários personalizados", "Relatórios detalhados", "Suporte prioritário", "Atualizações e novidades"];

  return (
    <section className="py-24 bg-transparent">
      <div className="container mx-auto px-6">
        <div className="text-center mb-14">
          <span className="inline-flex items-center gap-2 rounded-full border border-kendrah-purple/20 bg-kendrah-purple/5 px-4 py-1.5 text-sm font-medium text-kendrah-purple">
            <ShieldCheck className="h-4 w-4" />
            Preço justo, sem letras miúdas
          </span>
          <h2 className="mt-5 text-3xl font-bold tracking-tight text-kendrah-black md:text-4xl">
            Prezamos pela honestidade e transparência
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-zinc-600">
            Sabemos como é frustrante descobrir uma cobrança extra depois. Aqui é um plano só,
            com tudo incluído: você sabe exatamente quanto paga desde o primeiro dia.
          </p>
        </div>

        <div className="flex justify-center">
          <div className="relative w-full max-w-lg rounded-3xl border border-kendrah-purple/25 bg-background/70 p-8 shadow-elegant backdrop-blur-sm">
            <div className="text-center">
              <h3 className="text-xl font-bold text-kendrah-black">Plano Premium</h3>
              <p className="mt-1 text-sm text-zinc-500">Tudo o que a sua agenda precisa</p>
              <div className="mt-5 flex items-end justify-center gap-2">
                <span className="text-5xl font-bold text-kendrah-purple">R$ 39,90</span>
                <span className="pb-2 text-zinc-500">/mês</span>
              </div>
              <p className="mt-2 text-sm text-zinc-500">Cobrado mensalmente. Cancele quando quiser.</p>
            </div>

            <div className="mt-8 space-y-3">
              {features.map((feature) => (
                <div key={feature} className="flex items-center gap-3">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-kendrah-purple/10">
                    <Check className="h-3.5 w-3.5 text-kendrah-purple" />
                  </span>
                  <span className="text-zinc-700">{feature}</span>
                </div>
              ))}
            </div>

            <div className="mt-8">
              <Link to="/register" className="block w-full">
                <Button className="kendrah-button w-full py-6 text-base">
                  Experimente grátis por 7 dias
                </Button>
              </Link>
              <p className="mt-3 text-center text-sm text-zinc-500">
                7 dias grátis, cancele quando quiser.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PricingSection;
