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
import { DollarSign } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import TrialBanner from '@/components/TrialBanner';

const DashboardHome = () => {
  const { appointments } = useAppointments();
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
  const upcomingAppointments = appointments.filter(appointment =>
    appointment.status !== 'cancelled' &&
    differenceInDays(new Date(appointment.start_time), today) >= 0 &&
    differenceInDays(new Date(appointment.start_time), today) <= 7
  );
  const confirmedAppointments = appointments.filter(a => a.status === 'confirmed').length;
  const todayAppointments = appointments.filter(a => a.status !== 'cancelled' && isSameDay(new Date(a.start_time), today)).length;
  const cancelledAppointments = appointments.filter(a => a.status === 'cancelled').length;

  // Faturamento realizado: somente atendimentos marcados como concluídos.
  const priceByService = new Map(services.map((service) => [service.id, Number(service.price ?? 0)]));
  const revenue = appointments
    .filter(a => a.status === 'completed')
    .reduce((total, appointment) => total + (priceByService.get(appointment.service_id) ?? 0), 0);
  const formattedRevenue = revenue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

  return (
    <div className="flex min-h-screen bg-kendrah-gray/30">
      <Sidebar />
      <div className="flex-1 min-w-0 overflow-auto lg:pl-64 pt-14 lg:pt-0">
        <TrialBanner />
        <div className="p-4 sm:p-6 lg:p-8">
          <DashboardHeader title={profileLoading ? 'Olá' : `Olá, ${profile?.displayName ?? 'Prestador'}`} subtitle="Bem-vindo ao seu painel de agendamentos" />

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
            <StatsCard title="Total de Agendamentos" value={appointments.length} icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-kendrah-purple" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>} />
            <StatsCard title="Confirmados" value={confirmedAppointments} icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-kendrah-purple" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>} />
            <StatsCard title="Agendamentos Hoje" value={todayAppointments} icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-kendrah-purple" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>} />
            <StatsCard title="Cancelados" value={cancelledAppointments} icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-kendrah-purple" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>} />
            <StatsCard title="Faturamento" value={formattedRevenue} icon={<DollarSign className="h-6 w-6 text-kendrah-purple" />} />
          </div>

          <div className="mb-6 rounded-xl border bg-background p-4 shadow-sm">
            <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between"><div><p className="text-sm font-medium text-muted-foreground">Faturamento realizado</p><p className="text-xs text-muted-foreground">Soma dos serviços marcados como concluídos.</p></div><DollarSign className="h-5 w-5 text-kendrah-purple" /></div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-2">
              <CardHeader className="flex flex-row items-center justify-between pb-2"><CardTitle className="text-lg font-bold">Próximos Agendamentos</CardTitle><Link to="/dashboard/calendar"><Button variant="outline" size="sm" className="text-kendrah-purple border-kendrah-purple hover:bg-kendrah-purple/10">Ver todos</Button></Link></CardHeader>
              <CardContent><div className="space-y-4">{upcomingAppointments.length > 0 ? upcomingAppointments.slice(0, 5).map((appointment) => <div key={appointment.id} className="flex items-center justify-between border-b border-gray-100 pb-4 last:border-0"><div className="flex items-center"><div className="bg-kendrah-purple/10 text-kendrah-purple rounded-full w-10 h-10 flex items-center justify-center mr-4"><svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg></div><div><h4 className="font-medium">{appointment.customer_name}</h4><p className="text-sm text-gray-500">{appointment.service_name}</p></div></div><div className="text-right"><p className="font-medium">{new Date(appointment.start_time).toLocaleDateString('pt-BR')}</p><p className="text-sm text-gray-500">{new Date(appointment.start_time).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</p></div></div>) : <div className="flex flex-col items-center justify-center py-8 text-center"><svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-gray-300 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg><h3 className="text-lg font-medium text-gray-700">Nenhum agendamento próximo</h3><p className="text-gray-500 mt-1">Você não possui agendamentos para os próximos 7 dias.</p></div>}</div></CardContent>
            </Card>
            <Card><CardHeader><CardTitle className="text-lg font-bold">Links Rápidos</CardTitle></CardHeader><CardContent className="space-y-4"><Link to="/dashboard/calendar" className="flex items-center p-3 rounded-md bg-kendrah-purple/5 hover:bg-kendrah-purple/10 transition-colors"><span className="text-kendrah-purple mr-3">📅</span><div><h3 className="font-medium">Visualizar Agenda</h3><p className="text-sm text-gray-500">Veja todos os seus agendamentos</p></div></Link><Link to="/dashboard/services" className="flex items-center p-3 rounded-md bg-kendrah-purple/5 hover:bg-kendrah-purple/10 transition-colors"><span className="text-kendrah-purple mr-3">✂️</span><div><h3 className="font-medium">Gerenciar Serviços</h3><p className="text-sm text-gray-500">Configure seus serviços</p></div></Link><Link to="/dashboard/team" className="flex items-center p-3 rounded-md bg-kendrah-purple/5 hover:bg-kendrah-purple/10 transition-colors"><span className="text-kendrah-purple mr-3">👥</span><div><h3 className="font-medium">Gerenciar Equipe</h3><p className="text-sm text-gray-500">Adicione 1 profissional à sua conta</p></div></Link><Link to="/dashboard/settings" className="flex items-center p-3 rounded-md bg-kendrah-purple/5 hover:bg-kendrah-purple/10 transition-colors"><span className="text-kendrah-purple mr-3">⚙️</span><div><h3 className="font-medium">Configurações</h3><p className="text-sm text-gray-500">Integração com WhatsApp e Webhooks</p></div></Link><Link to="/dashboard/public" className="flex items-center p-3 rounded-md bg-kendrah-purple/5 hover:bg-kendrah-purple/10 transition-colors"><span className="text-kendrah-purple mr-3">🔗</span><div><h3 className="font-medium">Página de Agendamento</h3><p className="text-sm text-gray-500">Veja e compartilhe seu link</p></div></Link></CardContent></Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardHome;
