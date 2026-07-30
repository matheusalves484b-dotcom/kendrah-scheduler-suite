const steps = [
  {
    title: 'Configure seus serviços',
    description: 'Cadastre o que você oferece, a duração e o preço de cada atendimento em poucos minutos.',
  },
  {
    title: 'Defina sua disponibilidade',
    description: 'Escolha os dias e horários em que aceita agendamentos. A Kendrah respeita seus limites.',
  },
  {
    title: 'Compartilhe seu link',
    description: 'Envie seu link personalizado na bio, no WhatsApp ou no story e deixe o cliente escolher o horário.',
  },
  {
    title: 'Receba e confirme',
    description: 'Acompanhe tudo no painel, com lembretes automáticos e histórico completo de cada cliente.',
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
            Pronto para receber agendamentos hoje mesmo
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
