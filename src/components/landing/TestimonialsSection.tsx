interface TestimonialProps {
  name: string;
  role: string;
  quote: string;
}
const TestimonialCard = ({
  name,
  role,
  quote
}: TestimonialProps) => <div className="kendrah-card">
    <div className="flex items-center mb-4">
      <div className="bg-kendrah-purple/10 text-kendrah-purple rounded-full w-12 h-12 flex items-center justify-center mr-4">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      </div>
      <div>
        <h4 className="font-bold">{name}</h4>
        <p className="text-gray-500 text-sm">{role}</p>
      </div>
    </div>
    <p className="text-gray-700">"{quote}"</p>
  </div>;
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
  return <section className="py-20 bg-white">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold mb-4 text-kendrah-black">➼ O que nossos clientes dizem ➼</h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Profissionais que já transformaram sua rotina com o Kendrah
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => <TestimonialCard key={index} name={testimonial.name} role={testimonial.role} quote={testimonial.quote} />)}
        </div>
      </div>
    </section>;
};
export default TestimonialsSection;