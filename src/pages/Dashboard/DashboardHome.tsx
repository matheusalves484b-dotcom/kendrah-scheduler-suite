import Sidebar from '@/components/Dashboard/Sidebar';
import DashboardHeader from '@/components/Dashboard/DashboardHeader';
import StatsCard from '@/components/Dashboard/StatsCard';
import { useProfile } from '@/hooks/useProfile';
import { useAppointments } from '@/hooks/useAppointments';
import { getWorkspaceOwnerId } from '@/hooks/useWorkspace';
import { differenceInDays, isSameDay } from 'date-fns';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  Clock3,
  DollarSign,
  Link2,
  Scissors,
  Settings2,
  UsersRound,
  UserRound,
  XCircle,
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import TrialBanner from '@/components/TrialBanner';

const DashboardHome = () => {
  const { appointments, professionals } = useAppointments();
  const { profile, loading: profileLoading } = useProfile();

  const { data: services = [] } = useQuery({
    queryKey: ['dashboard-services'],
    queryFn: async () => {
      const ownerId = await getWorkspaceOwnerId();
      if (!ownerId) return [];
      const { data, error } = await supabase.from('services').select('id, price').eq('user_id', ownerId);
      if (error) throw error;
      return data ?? [];
    },
  });

  const today = new Date();
  const upcomingAppointments = appointments.filter((appointment) => {
    const start = new Date(appointment.start_time);
    const days = differenceInDays(start, today);
    return appointment.status !== 'cancelled' && start >= today && days <= 7;
  });

  const confirmedAppointments = appointments.filter((a) => a.status === 'confirmed').length;
  const todayAppointments = appointments.filter(
    (a) => a.status !== 'cancelled' && isSameDay(new Date(a.start_time), today)
  ).length;
  const cancelledAppointments = appointments.filter((a) => a.status === 'cancelled').length;

  const priceByService = new Map(services.map((service) => [service.id, Number(service.price ?? 0)]));
  const revenue = appointments
    .filter((a) => a.status === 'completed')
    .reduce((total, appointment) => total + (priceByService.get(appointment.service_id) ?? 0), 0);
  const formattedRevenue = revenue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

  const professionalNameById = new Map(professionals.map((professional) => [professional.id, professional.name]));

  const quickLinks = [
    { to: '/dashboard/calendar', label: 'Visualizar agenda', description: 'Veja e organize seus horários', icon: CalendarDays },
    { to: '/dashboard/services', label: 'Gerenciar serviços', description: 'Edite seus serviços e preços', icon: Scissors },
    { to: '/dashboard/team', label: 'Gerenciar equipe', description: 'Equipe e profissionais', icon: UsersRound },
    { to: '/dashboard/settings', label: 'Configurações', description: 'WhatsApp e integrações', icon: Settings2 },
    { to: '/dashboard/public', label: 'Página de agendamento', description: 'Compartilhe seu link público', icon: Link2 },
  ];

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      <Sidebar />
      <div className="min-w-0 flex-1 overflow-auto lg:pl-64 pt-14 lg:pt-0">
        <TrialBanner />

        <main className="mx-auto w-full max-w-[1500px] p-4 sm:p-6 lg:p-8">
          <div className="mb-7 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <DashboardHeader
              title={profileLoading ? 'Olá' : `Olá, ${profile?.displayName ?? 'Prestador'}`}
              subtitle="Aqui está um resumo da sua agenda."
            />
            <Link to="/dashboard/calendar">
              <Button className="h-11 rounded-xl bg-kendrah-purple px-5 font-semibold text-white shadow-sm hover:bg-kendrah-purple/90">
                <CalendarDays className="mr-2 h-4 w-4" />
                Abrir agenda
              </Button>
            </Link>
          </div>

          <section className="mb-7 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
            <StatsCard
              title="Total de agendamentos"
              value={appointments.length}
              icon={<CalendarDays className="h-5 w-5" />}
            />
            <StatsCard
              title="Confirmados"
              value={confirmedAppointments}
              icon={<CheckCircle2 className="h-5 w-5" />}
            />
            <StatsCard
              title="Agendamentos hoje"
              value={todayAppointments}
              icon={<Clock3 className="h-5 w-5" />}
            />
            <StatsCard
              title="Cancelados"
              value={cancelledAppointments}
              icon={<XCircle className="h-5 w-5" />}
            />
            <StatsCard
              title="Faturamento realizado"
              value={formattedRevenue}
              icon={<DollarSign className="h-5 w-5" />}
            />
          </section>

          <section className="mb-7 rounded-2xl border border-kendrah-purple/20 bg-kendrah-purple/[0.06] p-5 shadow-sm sm:p-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-kendrah-purple/15 text-kendrah-purple">
                  <DollarSign className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Faturamento realizado</p>
                  <p className="mt-0.5 text-sm text-muted-foreground/80">Considera somente os atendimentos concluídos.</p>
                </div>
              </div>
              <p className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">{formattedRevenue}</p>
            </div>
          </section>

          <section className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1.7fr)_minmax(330px,1fr)]">
            <Card className="overflow-hidden rounded-2xl border-border/60 bg-card shadow-sm">
              <CardHeader className="border-b border-border/50 px-5 py-5 sm:px-6">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <CardTitle className="text-lg font-bold">Próximos agendamentos</CardTitle>
                    <p className="mt-1 text-sm text-muted-foreground">Seus próximos horários nos próximos 7 dias.</p>
                  </div>
                  <Link to="/dashboard/calendar">
                    <Button variant="ghost" size="sm" className="hidden rounded-lg text-kendrah-purple hover:bg-kendrah-purple/10 hover:text-kendrah-purple sm:flex">
                      Ver todos <ArrowRight className="ml-1.5 h-4 w-4" />
                    </Button>
                  </Link>
                </div>
              </CardHeader>

              <CardContent className="p-0">
                {upcomingAppointments.length > 0 ? (
                  <div className="divide-y divide-border/50">
                    {upcomingAppointments.slice(0, 6).map((appointment) => {
                      const professionalId = appointment.professional_id || appointment.user_id;
                      const professionalName = professionalNameById.get(professionalId) || 'Profissional';
                      const start = new Date(appointment.start_time);

                      return (
                        <div key={appointment.id} className="flex items-center justify-between gap-4 px-5 py-4 transition-colors hover:bg-muted/30 sm:px-6">
                          <div className="flex min-w-0 items-center gap-3">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-kendrah-purple/10 text-kendrah-purple">
                              <UserRound className="h-4.5 w-4.5" />
                            </div>
                            <div className="min-w-0">
                              <p className="truncate font-semibold text-foreground">{appointment.customer_name}</p>
                              <div className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-sm text-muted-foreground">
                                <span>{appointment.service_name}</span>
                                <span className="text-border">•</span>
                                <span>{professionalName}</span>
                              </div>
                            </div>
                          </div>
                          <div className="shrink-0 text-right">
                            <p className="font-semibold text-foreground">{start.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })}</p>
                            <p className="mt-0.5 text-sm text-muted-foreground">{start.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center px-6 py-14 text-center">
                    <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-muted text-muted-foreground">
                      <CalendarDays className="h-7 w-7" />
                    </div>
                    <h3 className="font-semibold text-foreground">Nenhum agendamento próximo</h3>
                    <p className="mt-1 max-w-sm text-sm text-muted-foreground">Você não possui horários marcados para os próximos 7 dias.</p>
                    <Link to="/dashboard/calendar" className="mt-4">
                      <Button variant="outline" className="rounded-xl">Abrir agenda</Button>
                    </Link>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="rounded-2xl border-border/60 bg-card shadow-sm">
              <CardHeader className="px-5 py-5 sm:px-6">
                <CardTitle className="text-lg font-bold">Acesso rápido</CardTitle>
                <p className="mt-1 text-sm text-muted-foreground">Atalhos para as áreas mais usadas.</p>
              </CardHeader>
              <CardContent className="space-y-2 px-5 pb-5 sm:px-6">
                {quickLinks.map(({ to, label, description, icon: Icon }) => (
                  <Link
                    key={to}
                    to={to}
                    className="group flex items-center gap-3 rounded-xl border border-transparent p-3 transition-all hover:border-border/60 hover:bg-muted/50"
                  >
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-kendrah-purple/10 text-kendrah-purple">
                      <Icon className="h-4.5 w-4.5" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block font-semibold text-foreground">{label}</span>
                      <span className="mt-0.5 block truncate text-sm text-muted-foreground">{description}</span>
                    </span>
                    <ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-kendrah-purple" />
                  </Link>
                ))}
              </CardContent>
            </Card>
          </section>
        </main>
      </div>
    </div>
  );
};

export default DashboardHome;
