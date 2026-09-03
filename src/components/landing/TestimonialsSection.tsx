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
      <div className="ml-auto flex gap-0.5">
        {Array.from({ length: 5 }).map((_, i) => (
          <Star key={i} className="h-3.5 w-3.5 fill-kendrah-purple text-kendrah-purple" />
        ))}
      </div>
    </div>
  </div>
);

const testimonials: TestimonialProps[] = [
  {
    name: 'Mariana Costa',
    role: 'Terapeuta',
    quote:
      'O Kendrah simplificou completamente minha agenda. Reduzi em 80% o tempo que gastava organizando consultas e meus clientes adoraram a facilidade de agendar online.',
  },
  {
    name: 'Rafael Oliveira',
    role: 'Coach de Carreira',
    quote:
      'As notificações automáticas por WhatsApp diminuíram drasticamente o número de faltas. Uma ferramenta que se paga sozinha logo no primeiro mês!',
  },
  {
    name: 'Camila Souza',
    role: 'Esteticista',
    quote:
      'Interface super intuitiva e fácil de usar. Consegui configurar todo o sistema em menos de 30 minutos e já comecei a receber agendamentos no mesmo dia.',
  },
  {
    name: 'Juliana Prado',
    role: 'Nail Designer',
    quote:
      'Antes eu parava no meio do atendimento para responder mensagem. Hoje mando o link e a cliente escolhe o horário sozinha. Minhas mãos agradecem.',
  },
  {
    name: 'Diego Martins',
    role: 'Personal Trainer',
    quote:
      'Tenho alunos em três horários diferentes por dia. O calendário do Kendrah virou meu painel de controle: bateu o olho, sei exatamente como está a semana.',
  },
  {
    name: 'Aline Ferreira',
    role: 'Maquiadora',
    quote:
      'Em época de formatura eu lotava a agenda no papel e sempre dava conflito. Agora é impossível marcar duas noivas no mesmo horário.',
  },
  {
    name: 'Bruno Tavares',
    role: 'Barbeiro',
    quote:
      'Coloquei o link na bio do Instagram e no primeiro fim de semana fechei 23 cortes sem trocar uma única mensagem. Foi o melhor R$ 49,90 que já gastei.',
  },
  {
    name: 'Patrícia Nunes',
    role: 'Nutricionista',
    quote:
      'Meus pacientes recebem o lembrete e simplesmente aparecem. As faltas caíram de umas cinco por semana para praticamente nenhuma.',
  },
  {
    name: 'Letícia Ramos',
    role: 'Fisioterapeuta',
    quote:
      'Trabalho sozinha, sem secretária. O Kendrah é literalmente minha recepção: atende, organiza e me avisa. Só preciso cuidar do paciente.',
  },
  {
    name: 'Carlos Mendes',
    role: 'Tatuador',
    quote:
      'O que mais gosto é a página de agendamento com a minha cara. Passa profissionalismo antes mesmo do cliente chegar no estúdio.',
  },
  {
    name: 'Fernanda Lima',
    role: 'Depiladora',
    quote:
      'Minha agenda vive cheia e eu não perco mais tempo confirmando horário uma por uma. O sistema faz isso por mim enquanto atendo.',
  },
  {
    name: 'Thiago Barros',
    role: 'Quiropraxista',
    quote:
      'Antes eu anotava tudo num caderno e às vezes esquecia sessão marcada. Hoje abro o painel e a semana inteira está ali, organizada.',
  },
  {
    name: 'Renata Alves',
    role: 'Cabeleireira',
    quote:
      'As clientes agendam de madrugada, no domingo, na hora que quiserem. Eu só acordo e vejo o dia já montado.',
  },
  {
    name: 'Gustavo Pinto',
    role: 'Professor de Música',
    quote:
      'Dou aula para 20 alunos por semana. Reagendar era um caos, agora é dois cliques e todo mundo recebe o aviso.',
  },
  {
    name: 'Sofia Andrade',
    role: 'Designer de Sobrancelhas',
    quote:
      'O link personalizado deu outra cara ao meu trabalho. As clientes comentam que parece um estúdio bem maior do que é.',
  },
  {
    name: 'Marcos Vinícius',
    role: 'Psicólogo',
    quote:
      'Discrição e organização são essenciais no meu consultório. O Kendrah entrega os dois sem complicar nada.',
  },
];

const TestimonialsSection = () => (
  <section className="overflow-hidden bg-white py-24">
    <div className="container mx-auto px-6">
      <div className="mb-14 text-center">
        <span className="inline-flex items-center gap-2 rounded-full border border-kendrah-purple/20 bg-kendrah-purple/5 px-4 py-1.5 text-sm font-medium text-kendrah-purple">
          <MessageSquareHeart className="h-4 w-4" />
          Histórias de quem usa todo dia
        </span>
        <h2 className="mt-5 text-3xl font-bold tracking-tight text-kendrah-black md:text-4xl">
          O que nossos clientes dizem
        </h2>
        <p className="mx-auto mt-4 max-w-2xl text-lg text-zinc-600">
          Não precisa acreditar só na nossa palavra. Veja como profissionais como você
          organizaram a agenda e pararam de perder horários.
        </p>
      </div>
    </div>

    <div className="marquee-mask overflow-hidden">
      <div
        className="animate-marquee-left flex w-max gap-6 hover:[animation-play-state:paused]"
        style={{ ['--marquee-duration' as string]: '90s' }}
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
