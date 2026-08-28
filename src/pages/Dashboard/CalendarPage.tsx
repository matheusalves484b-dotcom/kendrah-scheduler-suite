import { useState } from 'react';
import Sidebar from '@/components/Dashboard/Sidebar';
import NewAppointmentDialog from '@/components/Dashboard/Calendar/NewAppointmentDialog';
import DashboardHeader from '@/components/Dashboard/DashboardHeader';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import AppointmentCalendar from '@/components/Dashboard/Calendar/AppointmentCalendar';
import { useAppointments } from '@/hooks/useAppointments';
import { format, startOfMonth, endOfMonth, isWithinInterval } from 'date-fns';
import { pt } from 'date-fns/locale';
import { Download, FileText, FileSpreadsheet } from 'lucide-react';
import { exportAppointmentsCSV, exportAppointmentsPDF } from '@/utils/exportAppointments';
import { toast } from 'sonner';

const CalendarPage = () => {
  const { events, loading, error, refetch } = useAppointments();
  const [dialogOpen, setDialogOpen] = useState(false);
  const formatDate = (date: Date) => format(new Date(date), 'dd/MM/yyyy', { locale: pt });
  const formatTime = (date: Date) => format(new Date(date), 'HH:mm', { locale: pt });
  const monthlyEvents = events.filter(event => isWithinInterval(new Date(event.start), { start: startOfMonth(new Date()), end: endOfMonth(new Date()) }));
  const exportData = monthlyEvents.map(event => ({ customer_name:event.resource.customer_name, customer_email:event.resource.customer_email, service_name:event.resource.service_name, start:event.start, end:event.end, status:event.resource.status }));
  const handleCSV = () => { if (!exportData.length) return toast.info('Não há clientes agendados neste mês para exportar.'); exportAppointmentsCSV(exportData); toast.success('Lista de clientes exportada em CSV.'); };
  const handlePDF = () => { if (!exportData.length) return toast.info('Não há clientes agendados neste mês para exportar.'); exportAppointmentsPDF(exportData); };
  return <div className="flex min-h-screen bg-kendrah-gray/30"><Sidebar /><div className="flex-1 min-w-0 p-4 sm:p-6 lg:p-8 overflow-auto lg:pl-64 pt-14 lg:pt-8">
    <DashboardHeader title="Agenda" subtitle="Gerencie seus agendamentos e visualize sua agenda" actionLabel="Novo Agendamento" actionPath="#" onActionClick={() => setDialogOpen(true)} />
    <NewAppointmentDialog open={dialogOpen} onOpenChange={setDialogOpen} onCreated={refetch} />
    <div className="mb-6"><Tabs defaultValue="calendar" className="w-full bg-transparent"><div className="flex flex-col gap-3 sm:flex-row sm:justify-between sm:items-center mb-6"><TabsList className="w-full sm:w-auto"><TabsTrigger value="calendar" className="flex-1 sm:flex-none">Calendário</TabsTrigger><TabsTrigger value="list" className="flex-1 sm:flex-none">Lista</TabsTrigger></TabsList><div className="flex flex-wrap gap-2"><Button variant="outline" className="bg-zinc-950 text-zinc-50 hover:bg-zinc-800" onClick={() => toast.info('Filtro de agenda em breve.')}>Filtrar</Button><Button variant="outline" className="bg-zinc-950 text-zinc-50 hover:bg-zinc-800" onClick={handleCSV}><FileSpreadsheet className="h-4 w-4 mr-1" /> CSV</Button><Button variant="outline" className="bg-zinc-950 text-zinc-50 hover:bg-zinc-800" onClick={handlePDF}><FileText className="h-4 w-4 mr-1" /> PDF</Button></div></div>
    <TabsContent value="calendar" className="mt-0">{loading ? <div className="kendrah-card p-8 text-center text-gray-500">Carregando agendamentos...</div> : error ? <div className="kendrah-card p-8 text-center text-red-600">{error}</div> : <AppointmentCalendar events={events} />}</TabsContent>
    <TabsContent value="list" className="mt-0"><div className="kendrah-card p-2 sm:p-6 overflow-x-auto"><div className="mb-4 flex items-center justify-between gap-3"><div><h3 className="font-semibold text-gray-900">Clientes do mês</h3><p className="text-sm text-gray-500">{monthlyEvents.length} agendamento(s) no mês atual</p></div><Button variant="outline" onClick={handleCSV}><Download className="h-4 w-4 mr-2" /> Exportar clientes</Button></div><table className="min-w-[720px] w-full divide-y divide-gray-200"><thead><tr>{['Cliente','Serviço','Data','Horário','Status','Ações'].map(h=><th key={h} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{h}</th>)}</tr></thead><tbody className="bg-white divide-y divide-gray-200">{loading && <tr><td colSpan={6} className="px-6 py-8 text-center text-gray-500">Carregando agendamentos...</td></tr>}{!loading && events.length === 0 && <tr><td colSpan={6} className="px-6 py-8 text-center text-gray-500">Nenhum agendamento ainda. Compartilhe seu link de agendamento para começar.</td></tr>}{events.map(event=><tr key={event.id}><td className="px-6 py-4 whitespace-nowrap"><div className="font-medium text-gray-900">{event.resource.customer_name}</div><div className="text-sm text-gray-500">{event.resource.customer_email}</div></td><td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{event.resource.service_name}</td><td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{formatDate(event.start)}</td><td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{formatTime(event.start)} - {formatTime(event.end)}</td><td className="px-6 py-4 whitespace-nowrap text-sm">{event.resource.status === 'confirmed' ? 'Confirmado' : event.resource.status === 'pending' ? 'Pendente' : event.resource.status === 'cancelled' ? 'Cancelado' : 'Concluído'}</td><td className="px-6 py-4 whitespace-nowrap text-right"><Button variant="ghost" size="sm" className="text-kendrah-purple">Detalhes</Button></td></tr>)}</tbody></table></div></TabsContent></Tabs></div>
  </div></div>;
};
export default CalendarPage;
