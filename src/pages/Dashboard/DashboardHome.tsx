import Sidebar from '@/components/Dashboard/Sidebar';
import DashboardHeader from '@/components/Dashboard/DashboardHeader';
import StatsCard from '@/components/Dashboard/StatsCard';
import { currentUser } from '@/lib/fakeData';
import { useProfile } from '@/hooks/useProfile';
import { useAppointments } from '@/hooks/useAppointments';
import { differenceInDays } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import TrialBanner from '@/components/TrialBanner';

const DashboardHome = () => {
  const { appointments } = useAppointments();
  const { profile, loading: profileLoading } = useProfile();


  // Calculate upcoming appointments (next 7 days)
  const today = new Date();
  const upcomingAppointments = appointments.filter(appointment => 
    appointment.status !== 'cancelled' && 
    differenceInDays(new Date(appointment.start_time), today) >= 0 &&
    differenceInDays(new Date(appointment.start_time), today) <= 7
  );


  return (
    <div className="flex min-h-screen bg-kendrah-gray/30">
      <Sidebar />
      <div className="flex-1 min-w-0 overflow-auto lg:pl-64 pt-14 lg:pt-0">
        <TrialBanner trialEndDate={currentUser.trialEndsAt} isSubscribed={currentUser.isSubscribed} />
        
        <div className="p-4 sm:p-6 lg:p-8">

          <DashboardHeader
            title={profileLoading ? 'Olá' : `Olá, ${profile?.displayName ?? 'Prestador'}`}
            subtitle="Bem-vindo ao seu painel de agendamentos"
          />
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <StatsCard
              title="Total de Agendamentos"
              value={appointments.length}
              icon={
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-kendrah-purple" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              }
              trend={{ value: 12, isPositive: true }}
            />
            
            <StatsCard
              title="Confirmados"
              value={appointments.filter(a => a.status === 'confirmed').length}
              icon={
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-kendrah-purple" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              }
            />
            
            <StatsCard
              title="Pendentes"
              value={appointments.filter(a => a.status === 'pending').length}
              icon={
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-kendrah-purple" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              }
            />
            
            <StatsCard
              title="Taxa de Conversão"
              value="87%"
              icon={
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-kendrah-purple" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              }
              trend={{ value: 5, isPositive: true }}
            />
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-2">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-lg font-bold">Próximos Agendamentos</CardTitle>
                <Link to="/dashboard/calendar">
                  <Button variant="outline" size="sm" className="text-kendrah-purple border-kendrah-purple hover:bg-kendrah-purple/10">
                    Ver todos
                  </Button>
                </Link>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {upcomingAppointments.length > 0 ? (
                    upcomingAppointments.slice(0, 5).map((appointment) => (
                      <div key={appointment.id} className="flex items-center justify-between border-b border-gray-100 pb-4 last:border-0">
                        <div className="flex items-center">
                          <div className="bg-kendrah-purple/10 text-kendrah-purple rounded-full w-10 h-10 flex items-center justify-center mr-4">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                          </div>
                          <div>
                            <h4 className="font-medium">{appointment.customer_name}</h4>
                            <p className="text-sm text-gray-500">{appointment.service_name}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">
                            {new Date(appointment.start_time).toLocaleDateString('pt-BR')}
                          </p>
                          <p className="text-sm text-gray-500">
                            {new Date(appointment.start_time).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="flex flex-col items-center justify-center py-8 text-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-gray-300 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <h3 className="text-lg font-medium text-gray-700">Nenhum agendamento próximo</h3>
                      <p className="text-gray-500 mt-1">Você não possui agendamentos para os próximos 7 dias.</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="text-lg font-bold">Links Rápidos</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Link to="/dashboard/calendar" className="flex items-center p-3 rounded-md bg-kendrah-purple/5 hover:bg-kendrah-purple/10 transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-kendrah-purple mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <div>
                    <h3 className="font-medium">Visualizar Agenda</h3>
                    <p className="text-sm text-gray-500">Veja todos os seus agendamentos</p>
                  </div>
                </Link>
                
                <Link to="/dashboard/services" className="flex items-center p-3 rounded-md bg-kendrah-purple/5 hover:bg-kendrah-purple/10 transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-kendrah-purple mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                  <div>
                    <h3 className="font-medium">Gerenciar Serviços</h3>
                    <p className="text-sm text-gray-500">Configure seus serviços</p>
                  </div>
                </Link>
                
                <Link to="/dashboard/settings" className="flex items-center p-3 rounded-md bg-kendrah-purple/5 hover:bg-kendrah-purple/10 transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-kendrah-purple mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <div>
                    <h3 className="font-medium">Configurações</h3>
                    <p className="text-sm text-gray-500">Integração com WhatsApp e Webhooks</p>
                  </div>
                </Link>
                
                <Link to="/dashboard/public" className="flex items-center p-3 rounded-md bg-kendrah-purple/5 hover:bg-kendrah-purple/10 transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-kendrah-purple mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                  </svg>
                  <div>
                    <h3 className="font-medium">Página de Agendamento</h3>
                    <p className="text-sm text-gray-500">Veja e compartilhe seu link</p>
                  </div>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardHome;
