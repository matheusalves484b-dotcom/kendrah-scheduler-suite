
import Sidebar from '@/components/Dashboard/Sidebar';
import DashboardHeader from '@/components/Dashboard/DashboardHeader';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import AppointmentCalendar from '@/components/Dashboard/Calendar/AppointmentCalendar';
import { useAppointments } from '@/hooks/useAppointments';
import { format } from 'date-fns';
import { pt } from 'date-fns/locale';

const CalendarPage = () => {
  const { events, appointments, loading, error } = useAppointments();

  const formatDate = (date: Date) => {
    return format(new Date(date), 'dd/MM/yyyy', {
      locale: pt
    });
  };

  const formatTime = (date: Date) => {
    return format(new Date(date), 'HH:mm', {
      locale: pt
    });
  };


  return (
    <div className="flex min-h-screen bg-kendrah-gray/30">
      <Sidebar />
      <div className="flex-1 min-w-0 p-4 sm:p-6 lg:p-8 overflow-auto lg:pl-64 pt-14 lg:pt-8">

        <DashboardHeader 
          title="Agenda" 
          subtitle="Gerencie seus agendamentos e visualize sua agenda" 
          actionLabel="Novo Agendamento" 
          actionPath="/dashboard/appointments/new" 
        />

        <div className="mb-6">
          <Tabs defaultValue="calendar" className="w-full bg-transparent">
            <div className="flex flex-col gap-3 sm:flex-row sm:justify-between sm:items-center mb-6">
              <TabsList className="w-full sm:w-auto">
                <TabsTrigger value="calendar" className="flex-1 sm:flex-none">Calendário</TabsTrigger>
                <TabsTrigger value="list" className="flex-1 sm:flex-none">Lista</TabsTrigger>
              </TabsList>
              
              <div className="flex space-x-2">
                <Button variant="outline" className="text-kendrah-black border-kendrah-black hover:bg-kendrah-black/10 bg-zinc-950 hover:bg-zinc-800 text-zinc-50">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                  </svg>
                  Filtrar
                </Button>
                
                <Button variant="outline" className="text-kendrah-black border-kendrah-black hover:bg-kendrah-black/10 bg-zinc-950 hover:bg-zinc-800 text-zinc-50">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                  </svg>
                  Exportar
                </Button>
              </div>
            </div>
            
            <TabsContent value="calendar" className="mt-0">
              <AppointmentCalendar events={calendarEvents} />
            </TabsContent>
            
            <TabsContent value="list" className="mt-0">
              <div className="kendrah-card p-2 sm:p-6 overflow-x-auto">
                <table className="min-w-[720px] w-full divide-y divide-gray-200">
                  <thead>
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Cliente
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Serviço
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Data
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Horário
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Ações
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {calendarEvents.map((event) => (
                      <tr key={event.id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="font-medium text-gray-900">{event.resource.customer_name}</div>
                          <div className="text-sm text-gray-500">{event.resource.customer_email}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{event.resource.service_name}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {formatDate(event.start)}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {formatTime(event.start)} - 
                            {formatTime(event.end)}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            event.resource.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                            event.resource.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                            event.resource.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                            'bg-blue-100 text-blue-800'
                          }`}>
                            {event.resource.status === 'confirmed' ? 'Confirmado' :
                             event.resource.status === 'pending' ? 'Pendente' :
                             event.resource.status === 'cancelled' ? 'Cancelado' :
                             'Concluído'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <Button variant="ghost" size="sm" className="text-kendrah-purple hover:text-kendrah-purple hover:bg-kendrah-purple/10">
                            Detalhes
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default CalendarPage;
