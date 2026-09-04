import { CalendarDays, CheckCircle2, Clock3, Scissors, UserRound } from 'lucide-react';

const BookingFlowSection = () => {
  return (
    <section className="bg-kendrah-light py-20 md:py-28">
      <div className="container mx-auto px-6">
        <div className="mx-auto mb-14 max-w-2xl text-center">
          <span className="text-sm font-semibold uppercase tracking-[0.2em] text-kendrah-purple">
            Experiência do cliente
          </span>
          <h2 className="mt-4 text-3xl font-bold tracking-tight text-kendrah-black md:text-4xl">
            Seu cliente agenda sozinho em poucos passos
          </h2>
          <p className="mt-4 text-lg text-gray-600">
            Você compartilha seu link. O cliente escolhe o serviço, encontra um horário disponível e confirma o atendimento.
          </p>
        </div>

        <div className="mx-auto grid max-w-5xl items-center gap-10 lg:grid-cols-[1fr_auto_1fr]">
          <div className="space-y-4">
            {[
              { icon: Scissors, title: 'Escolhe o serviço', text: 'Visualiza os serviços e informações que você cadastrou.' },
              { icon: UserRound, title: 'Escolhe o profissional', text: 'Quando houver mais de um profissional, seleciona quem irá atender.' },
              { icon: CalendarDays, title: 'Escolhe data e horário', text: 'Aparecem apenas os horários disponíveis para aquele atendimento.' },
            ].map(({ icon: Icon, title, text }, index) => (
              <div key={title} className="flex gap-4 rounded-2xl border border-kendrah-gray bg-white p-5 shadow-sm">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-kendrah-purple/10 text-kendrah-purple">
                  <Icon className="h-5 w-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-kendrah-purple">0{index + 1}</span>
                    <h3 className="font-bold text-kendrah-black">{title}</h3>
                  </div>
                  <p className="mt-1 text-sm text-gray-600">{text}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="hidden h-20 w-px bg-kendrah-purple/20 lg:block" />

          <div className="mx-auto w-full max-w-sm rounded-3xl border border-kendrah-purple/20 bg-white p-5 shadow-elegant">
            <div className="flex items-center justify-between border-b border-kendrah-gray pb-4">
              <div>
                <p className="text-xs font-medium text-gray-500">Agendamento online</p>
                <h3 className="mt-1 font-bold text-kendrah-black">Seu negócio</h3>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-kendrah-purple text-white">
                <CalendarDays className="h-5 w-5" />
              </div>
            </div>

            <div className="mt-5 rounded-2xl bg-kendrah-light p-4">
              <p className="text-xs font-medium text-gray-500">Serviço selecionado</p>
              <div className="mt-2 flex items-center justify-between">
                <span className="font-semibold text-kendrah-black">Corte + Barba</span>
                <span className="text-sm font-medium text-kendrah-purple">R$ 80</span>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-3">
              <div className="rounded-xl border border-kendrah-gray p-3">
                <div className="flex items-center gap-2 text-xs text-gray-500"><UserRound className="h-3.5 w-3.5" /> Profissional</div>
                <p className="mt-1 text-sm font-semibold text-kendrah-black">Lucas</p>
              </div>
              <div className="rounded-xl border border-kendrah-gray p-3">
                <div className="flex items-center gap-2 text-xs text-gray-500"><Clock3 className="h-3.5 w-3.5" /> Horário</div>
                <p className="mt-1 text-sm font-semibold text-kendrah-black">14:30</p>
              </div>
            </div>

            <div className="mt-4 rounded-xl border border-kendrah-purple/20 bg-kendrah-purple/5 p-4">
              <div className="flex items-center gap-2 text-sm font-semibold text-kendrah-purple">
                <CheckCircle2 className="h-4 w-4" /> Horário disponível
              </div>
              <p className="mt-1 text-xs text-gray-600">Confirmação enviada após finalizar o agendamento.</p>
            </div>

            <button type="button" className="mt-5 w-full rounded-xl bg-kendrah-purple px-5 py-3 text-sm font-semibold text-white shadow-sm">
              Confirmar agendamento
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default BookingFlowSection;
