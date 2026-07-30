import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowRight, ShieldCheck, CreditCard, Zap } from 'lucide-react';

const CTASection = () => {
  return (
    <section className="relative overflow-hidden bg-hero-gradient py-20 text-white md:py-28">
      <div className="absolute inset-0 grid-pattern opacity-50" aria-hidden="true" />
      <div className="absolute -bottom-32 left-1/2 h-80 w-80 -translate-x-1/2 rounded-full bg-accent/30 blur-3xl" aria-hidden="true" />

      <div className="container relative mx-auto px-6 text-center">
        <h2 className="mx-auto max-w-3xl text-3xl font-bold tracking-tight md:text-4xl">
          Pronto para simplificar sua rotina?
        </h2>
        <p className="mx-auto mt-5 max-w-2xl text-lg text-white/80">
          Comece agora com 14 dias de teste grátis. Configure sua agenda em minutos
          e receba o primeiro agendamento ainda hoje.
        </p>

        <div className="mt-9 flex justify-center">
          <Link to="/register">
            <Button size="lg" className="group h-14 bg-white px-8 text-base font-semibold text-kendrah-purple hover:bg-white/90">
              Criar minha conta grátis
              <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
            </Button>
          </Link>
        </div>

        <ul className="mx-auto mt-10 flex max-w-2xl flex-col items-center justify-center gap-4 text-sm text-white/75 sm:flex-row sm:gap-8">
          <li className="flex items-center gap-2"><CreditCard className="h-4 w-4" /> Sem cartão de crédito</li>
          <li className="flex items-center gap-2"><Zap className="h-4 w-4" /> Configuração em minutos</li>
          <li className="flex items-center gap-2"><ShieldCheck className="h-4 w-4" /> Cancele quando quiser</li>
        </ul>
      </div>
    </section>
  );
};

export default CTASection;
