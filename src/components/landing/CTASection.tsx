
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

const CTASection = () => {
  return (
    <section className="py-20 bg-kendrah-purple text-white">
      <div className="container mx-auto px-6 text-center">
        <h2 className="text-3xl font-bold mb-6">Pronto para simplificar sua rotina?</h2>
        <p className="text-xl mb-8 max-w-2xl mx-auto">
          Comece agora mesmo com 14 dias de teste grátis. Sem compromisso, sem cartão de crédito.
        </p>
        <Link to="/register">
          <Button className="text-lg px-8 py-6 bg-zinc-50 text-zinc-800">
            Criar Minha Conta Grátis
          </Button>
        </Link>
      </div>
    </section>
  );
};

export default CTASection;
