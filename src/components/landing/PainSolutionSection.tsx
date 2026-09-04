import { Check, X } from 'lucide-react';
import dorImg from '@/assets/dor.jpg';
import solucaoImg from '@/assets/solucao.jpg';

const pains = [
  'Mensagens de “tem horário?” chegando a qualquer hora do dia',
  'Agenda espalhada entre caderno, print e memória',
  'Clientes que esquecem e simplesmente não aparecem',
  'Horas perdidas confirmando e remarcando manualmente',
];

const solutions = [
  'Seu cliente escolhe o serviço e o horário pelo seu link, sem precisar falar com você',
  'Uma única agenda online para visualizar e organizar seus atendimentos',
  'Lembretes e confirmações pelo WhatsApp para manter o cliente informado',
  'Serviços, durações e horários configurados uma vez para sua rotina funcionar melhor',
];

const PainSolutionSection = () => {
  return (
    <section className="bg-soft-gradient py-20 md:py-28">
      <div className="container mx-auto px-6">
        <div className="mx-auto mb-14 max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-kendrah-black md:text-4xl">
            Sua agenda não deveria depender de você o dia inteiro
          </h2>
          <p className="mt-4 text-lg text-gray-600">
            Quando o agendamento fica no automático, você ganha tempo para cuidar do seu negócio e dos seus clientes.
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-2">
          {/* Dor */}
          <article className="overflow-hidden rounded-2xl border border-kendrah-gray bg-white shadow-sm">
            <img
              src={dorImg}
              alt="Profissional sobrecarregado respondendo mensagens e organizando anotações"
              loading="lazy"
              width={1024}
              height={1024}
              className="h-52 w-full object-cover grayscale"
            />
            <div className="p-8">
              <span className="inline-flex items-center gap-2 rounded-full bg-kendrah-black/5 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-kendrah-black/70">
                Sem a Kendrah
              </span>
              <h3 className="mt-4 text-xl font-bold text-kendrah-black">Menos tempo atendendo, mais tempo organizando</h3>
              <ul className="mt-6 space-y-4">
                {pains.map((item) => (
                  <li key={item} className="flex gap-3 text-gray-600">
                    <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-kendrah-black/5">
                      <X className="h-3.5 w-3.5 text-kendrah-black/60" />
                    </span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </article>

          {/* Solução */}
          <article className="overflow-hidden rounded-2xl border border-kendrah-purple/25 bg-white shadow-elegant">
            <img
              src={solucaoImg}
              alt="Profissional tranquila acompanhando seus agendamentos pelo celular"
              loading="lazy"
              width={1024}
              height={1024}
              className="h-52 w-full object-cover"
            />
            <div className="p-8">
              <span className="inline-flex items-center gap-2 rounded-full bg-kendrah-purple/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-kendrah-purple">
                Com a Kendrah
              </span>
              <h3 className="mt-4 text-xl font-bold text-kendrah-black">Seu cliente agenda. Você acompanha.</h3>
              <ul className="mt-6 space-y-4">
                {solutions.map((item) => (
                  <li key={item} className="flex gap-3 text-gray-700">
                    <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-kendrah-purple/10">
                      <Check className="h-3.5 w-3.5 text-kendrah-purple" />
                    </span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </article>
        </div>
      </div>
    </section>
  );
};

export default PainSolutionSection;
