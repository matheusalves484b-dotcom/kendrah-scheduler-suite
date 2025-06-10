import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
const HeroSection = () => {
  return <section className="bg-gradient-to-br from-kendrah-purple to-kendrah-black text-white py-20">
      <div className="container text-base px-[29px] my-[14px] py-[30px] mx-0">
        <div className="flex flex-col lg:flex-row items-center">
          <div className="lg:w-1/2 lg:pr-10 mb-10 lg:mb-0">
            <h1 className="text-4xl font-bold mb-6 leading-tight md:text-4xl">
              Automatize sua agenda. <br />
              Simplifique sua rotina.
            </h1>
            <p className="text-xl mb-8 text-gray-100">
              Sistema de agendamento online completo para profissionais que valorizam seu tempo e querem crescer.
            </p>
            <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
              <Link to="/register">
                <Button className="text-lg px-8 py-6 text-kendrah-purple bg-white text-zinc-950">
                  Teste Grátis por 14 Dias
                </Button>
              </Link>
              <Link to="/login">
                <Button variant="outline" className="text-lg text-white border-white px-8 py-6 bg-zinc-950 hover:bg-zinc-800">
                  Área do Cliente
                </Button>
              </Link>
            </div>
            <p className="mt-4 text-sm text-gray-300">Sem necessidade de cartão de crédito</p>
          </div>
          <div className="lg:w-1/2">
            <img alt="Kendrah Dashboard" src="/lovable-uploads/44ca7fde-ed90-4bac-b28a-5ca01e22a155.png" className="rounded-lg shadow-2xl object-scale-down" />
          </div>
        </div>
      </div>
    </section>;
};
export default HeroSection;