import { useLocation, useNavigate, Link } from 'react-router-dom';
import { CheckCircle2, Calendar, Clock, Scissors, User, MessageSquare, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface ConfirmationState {
  serviceName?: string;
  startTime?: string;
  endTime?: string;
  customerName?: string;
  businessName?: string;
  whatsappNumber?: string;
  slug?: string;
  price?: number | null;
  duration?: number | null;
}

const BookingConfirmedPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const state = (location.state || {}) as ConfirmationState;

  if (!state.startTime || !state.serviceName) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-kendrah-purple to-kendrah-black flex items-center justify-center px-4">
        <Card className="max-w-md w-full">
          <CardContent className="p-8 text-center">
            <h1 className="text-2xl font-bold mb-4">Nenhum agendamento encontrado</h1>
            <p className="text-muted-foreground mb-6">
              Não encontramos os dados deste agendamento. Faça um novo agendamento pelo link do profissional.
            </p>
            <Button onClick={() => navigate('/')} className="bg-kendrah-purple hover:bg-kendrah-purple/90">
              Voltar ao início
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const start = new Date(state.startTime);
  const end = state.endTime ? new Date(state.endTime) : null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-kendrah-purple to-kendrah-black">
      <div className="container mx-auto px-4 py-10 md:py-16">
        <div className="max-w-xl mx-auto text-center mb-8">
          <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-white/15 backdrop-blur">
            <CheckCircle2 className="h-9 w-9 text-green-400" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-3">Obrigado, {state.customerName?.split(' ')[0] || 'tudo certo'}!</h1>
          <p className="text-gray-200">
            Seu agendamento foi registrado. Você receberá a confirmação dentro de alguns minutos.
          </p>
        </div>

        <Card className="max-w-xl mx-auto">
          <CardContent className="p-6 md:p-8">
            <h2 className="text-lg font-semibold mb-5">Resumo do agendamento</h2>

            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <Scissors className="h-5 w-5 text-kendrah-purple mt-0.5" />
                <div>
                  <p className="text-sm text-muted-foreground">Serviço</p>
                  <p className="font-medium">
                    {state.serviceName}
                    {state.duration ? ` · ${state.duration} min` : ''}
                    {typeof state.price === 'number' ? ` · R$ ${state.price.toFixed(2)}` : ''}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Calendar className="h-5 w-5 text-kendrah-purple mt-0.5" />
                <div>
                  <p className="text-sm text-muted-foreground">Data</p>
                  <p className="font-medium capitalize">
                    {format(start, "EEEE, dd/MM/yyyy", { locale: ptBR })}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Clock className="h-5 w-5 text-kendrah-purple mt-0.5" />
                <div>
                  <p className="text-sm text-muted-foreground">Horário</p>
                  <p className="font-medium">
                    {format(start, 'HH:mm')}
                    {end ? ` às ${format(end, 'HH:mm')}` : ''}
                  </p>
                </div>
              </div>

              {state.customerName && (
                <div className="flex items-start gap-3">
                  <User className="h-5 w-5 text-kendrah-purple mt-0.5" />
                  <div>
                    <p className="text-sm text-muted-foreground">Cliente</p>
                    <p className="font-medium">{state.customerName}</p>
                  </div>
                </div>
              )}
            </div>

            <div className="mt-6 rounded-lg bg-muted p-4 text-sm text-muted-foreground">
              O status atual é <strong className="text-foreground">aguardando confirmação</strong>.
              {state.businessName ? ` ${state.businessName}` : ' O profissional'} confirmará seu horário em instantes.
            </div>

            <div className="mt-6 flex flex-col sm:flex-row gap-3">
              {state.whatsappNumber && (
                <Button asChild className="flex-1 bg-kendrah-purple hover:bg-kendrah-purple/90">
                  <a
                    href={`https://wa.me/${state.whatsappNumber.replace(/\D/g, '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Falar no WhatsApp
                  </a>
                </Button>
              )}
              <Button asChild variant="outline" className="flex-1">
                <Link to={state.slug ? `/agendar/${state.slug}` : '/'}>
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Fazer outro agendamento
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="text-center mt-8 text-white/70">
          <p>Powered by Kendrah</p>
        </div>
      </div>
    </div>
  );
};

export default BookingConfirmedPage;
