import { Quote, Star, MessageSquareHeart } from 'lucide-react';

interface TestimonialProps {
  name: string;
  role: string;
  quote: string;
}

const TestimonialCard = ({ name, role, quote }: TestimonialProps) => (
  <div className="group relative flex h-full w-[320px] shrink-0 flex-col rounded-2xl border border-border/60 bg-background/70 p-7 shadow-sm backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:border-kendrah-purple/30 hover:shadow-elegant sm:w-[380px]">
    <Quote className="h-7 w-7 text-kendrah-purple/30" />
    <p className="mt-4 flex-1 text-zinc-700">{quote}</p>
    <div className="mt-6 flex items-center gap-3 border-t border-border/60 pt-5">
      <div className="flex h-11 w-11 items-center justify-center rounded-full bg-kendrah-purple/10 font-semibold text-kendrah-purple">
        {name.charAt(0)}
      </div>
      <div>
        <h4 className="font-semibold text-kendrah-black">{name}</h4>
        <p className="text-sm text-zinc-500">{role}</p>
      </div>
      <div className="ml-auto flex gap-0.5" aria-label="5 estrelas">
        {Array.from({ length: 5 }).map((_, i) => (
          <Star key={i} className="h-3.5 w-3.5 fill-kendrah-purple text-kendrah-purple" />
        ))}
      </div>
    </div>
  </div>
);

const testimonials: TestimonialProps[] = [
  {
    name: 'Juliana Prado',
    role: 'Nail Designer',
    quote: 'Antes eu parava no meio do atendimento para responder mensagem. Hoje mando o link e a cliente escolhe o horário sozinha.',
  },
  {
    name: 'Diego Martins',
    role: 'Personal Trainer',
    quote: 'O calendário virou meu painel de controle. Bateu o olho, sei exatamente como está a semana.',
  },
  {
    name: 'Aline Ferreira',
    role: 'Maquiadora',
    quote: 'Minha agenda ficou muito mais organizada. Agora consigo visualizar os horários sem depender de anotações no papel.',
  },
  {
    name: 'Renata Alves',
    role: 'Cabeleireira',
    quote: 'As clientes conseguem solicitar horários mesmo quando estou atendendo. Eu vejo tudo organizado no painel.',
  },
  {
    name: 'Gustavo Pinto',
    role: 'Professor de Música',
    quote: 'Reagendar ficou muito mais simples. Tenho os horários organizados e consigo acompanhar meus alunos com facilidade.',
  },
  {
    name: 'Sofia Andrade',
    role: 'Designer de Sobrancelhas',
    quote: 'O link personalizado facilita muito para minhas clientes. Elas já chegam sabendo como encontrar um horário disponível.',
  },
];

const TestimonialsSection = () => (
  <section className="overflow-hidden bg-white py-24">
    <div className="container mx-auto px-6">
      <div className="mb-14 text-center">
        <span className="inline-flex items-center gap-2 rounded-full border border-kendrah-purple/20 bg-kendrah-purple/5 px-4 py-1.5 text-sm font-medium text-kendrah-purple">
          <MessageSquareHeart className="h-4 w-4" />
          Experiência de uso
        </span>
        <h2 className="mt-5 text-3xl font-bold tracking-tight text-kendrah-black md:text-4xl">
          Mais praticidade para quem vive de atendimentos
        </h2>
        <p className="mx-auto mt-4 max-w-2xl text-lg text-zinc-600">
          Uma agenda mais organizada para você passar menos tempo respondendo mensagens e mais tempo cuidando do seu trabalho.
        </p>
      </div>
    </div>

    <div className="marquee-mask overflow-hidden">
      <div
        className="animate-marquee-left flex w-max gap-6 hover:[animation-play-state:paused]"
        style={{ ['--marquee-duration' as string]: '55s' }}
      >
        {[...testimonials, ...testimonials].map((t, i) => (
          <TestimonialCard key={`${t.name}-${i}`} {...t} />
        ))}
      </div>
    </div>

    <p className="mt-10 text-center text-sm text-zinc-500">
      Passe o mouse sobre um depoimento para pausar.
    </p>
  </section>
);

export default TestimonialsSection;
