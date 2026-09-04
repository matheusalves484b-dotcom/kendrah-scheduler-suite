const steps = [
  {
    title: 'Crie sua agenda',
    description: 'Cadastre seus serviços, duração e preços e deixe sua agenda pronta em poucos minutos.',
  },
  {
    title: 'Defina seus horários',
    description: 'Escolha os dias e horários disponíveis. Você continua no controle da sua rotina.',
  },
  {
    title: 'Compartilhe seu link',
    description: 'Coloque seu link na bio, no WhatsApp ou onde seus clientes já estão e facilite o agendamento.',
  },
  {
    title: 'Deixe o cliente agendar',
    description: 'O cliente escolhe o serviço e o horário disponível. Você acompanha tudo pelo painel da Kendrah.',
  },
];

const HowItWorksSection = () => {
  return (
    <section className="bg-white py-20 md:py-28">
      <div className="container mx-auto px-6">
        <div className="mx-auto mb-14 max-w-2xl text-center">
          <span className="text-sm font-semibold uppercase tracking-[0.2em] text-kendrah-purple">
            Como funciona
          </span>
          <h2 className="mt-4 text-3xl font-bold tracking-tight text-kendrah-black md:text-4xl">
            Configure uma vez. Sua agenda começa a trabalhar por você.
          </h2>
        </div>

        <ol className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          {steps.map((step, index) => (
            <li key={step.title} className="group relative rounded-2xl border border-kendrah-gray bg-kendrah-light/60 p-7 transition-all duration-300 hover:-translate-y-1 hover:border-kendrah-purple/40 hover:bg-white hover:shadow-elegant">
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-kendrah-purple text-lg font-bold text-white">
                {index + 1}
              </span>
              <h3 className="mt-5 text-lg font-bold text-kendrah-black">{step.title}</h3>
              <p className="mt-2 text-gray-600">{step.description}</p>
              {index < steps.length - 1 && (
                <span
                  aria-hidden="true"
                  className="absolute right-[-1.25rem] top-12 hidden h-px w-8 bg-kendrah-purple/30 lg:block"
                />
              )}
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
};

export default HowItWorksSection;
