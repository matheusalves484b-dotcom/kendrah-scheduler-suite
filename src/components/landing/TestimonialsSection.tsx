import { Quote, Star, MessageSquareHeart } from 'lucide-react';

interface TestimonialProps {
  name: string;
  role: string;
  quote: string;
}

const TestimonialCard = ({ name, role, quote }: TestimonialProps) => (
  <div className="group relative flex h-full flex-col rounded-2xl border border-border/60 bg-background/70 p-7 shadow-sm backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:border-kendrah-purple/30 hover:shadow-elegant">
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

const TestimonialsSection = () => {
  const testimonials = [{
    name: "Mariana Costa",
    role: "Terapeuta",
    quote: "O Kendrah simplificou completamente minha agenda. Reduzi em 80% o tempo que gastava organizando consultas e meus clientes adoraram a facilidade de agendar online."
  }, {
    name: "Rafael Oliveira",
    role: "Coach de Carreira",
    quote: "As notificações automáticas por WhatsApp diminuíram drasticamente o número de faltas. Uma ferramenta que se paga sozinha logo no primeiro mês!"
  }, {
    name: "Camila Souza",
    role: "Esteticista",
    quote: "Interface super intuitiva e fácil de usar. Consegui configurar todo o sistema em menos de 30 minutos e já comecei a receber agendamentos no mesmo dia."
  }];

  return (
    <section className="py-24 bg-white">
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

        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          {testimonials.map((testimonial) => (
            <TestimonialCard key={testimonial.name} {...testimonial} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;
