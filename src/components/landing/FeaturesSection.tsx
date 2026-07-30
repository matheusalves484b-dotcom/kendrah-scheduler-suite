import { ReactNode } from 'react';
import {
  CalendarDays,
  MessageCircle,
  Link2,
  ClipboardList,
  Clock,
  BarChart3,
} from 'lucide-react';

interface FeatureCardProps {
  icon: ReactNode;
  title: string;
  description: string;
}

const FeatureCard = ({ icon, title, description }: FeatureCardProps) => (
  <div className="group relative overflow-hidden rounded-2xl border border-kendrah-gray bg-white p-7 transition-all duration-300 hover:-translate-y-1 hover:border-kendrah-purple/40 hover:shadow-elegant">
    <div className="absolute inset-x-0 top-0 h-1 scale-x-0 bg-kendrah-purple transition-transform duration-300 group-hover:scale-x-100" />
    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-kendrah-purple/10 text-kendrah-purple transition-colors group-hover:bg-kendrah-purple group-hover:text-white">
      {icon}
    </div>
    <h3 className="mt-5 text-lg font-bold text-kendrah-black">{title}</h3>
    <p className="mt-2 text-gray-600">{description}</p>
  </div>
);

const FeaturesSection = () => {
  const features = [
    {
      icon: <CalendarDays className="h-6 w-6" />,
      title: 'Agenda Online',
      description: 'Calendário completo e personalizável para gerenciar seus compromissos com facilidade.',
    },
    {
      icon: <MessageCircle className="h-6 w-6" />,
      title: 'Contato por WhatsApp',
      description: 'Fale com o cliente em um clique e envie lembretes e confirmações sem sair do painel.',
    },
    {
      icon: <Link2 className="h-6 w-6" />,
      title: 'Link Personalizado',
      description: 'Receba agendamentos por um link próprio que você compartilha onde quiser.',
    },
    {
      icon: <ClipboardList className="h-6 w-6" />,
      title: 'Cadastro de Serviços',
      description: 'Registre serviços, duração e preços para o cliente escolher na hora de agendar.',
    },
    {
      icon: <Clock className="h-6 w-6" />,
      title: 'Horários Personalizados',
      description: 'Configure sua disponibilidade com flexibilidade para cada dia da semana.',
    },
    {
      icon: <BarChart3 className="h-6 w-6" />,
      title: 'Relatórios e Histórico',
      description: 'Acompanhe seu histórico de atendimentos e enxergue a saúde da sua agenda.',
    },
  ];

  return (
    <section className="bg-kendrah-light py-20 md:py-28">
      <div className="container mx-auto px-6">
        <div className="mx-auto mb-14 max-w-2xl text-center">
          <span className="text-sm font-semibold uppercase tracking-[0.2em] text-kendrah-purple">
            Funcionalidades
          </span>
          <h2 className="mt-4 text-3xl font-bold tracking-tight text-kendrah-black md:text-4xl">
            Tudo o que sua agenda precisa, em um só lugar
          </h2>
          <p className="mt-4 text-lg text-gray-600">
            Recursos pensados para quem atende pessoas e não tem tempo a perder com burocracia.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => (
            <FeatureCard key={feature.title} {...feature} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
