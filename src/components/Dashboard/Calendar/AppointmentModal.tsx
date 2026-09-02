import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Appointment } from '@/types';
import { format } from 'date-fns';
import { pt } from 'date-fns/locale';
import { supabase } from '@/integrations/supabase/client';

interface AppointmentModalProps { appointment: Appointment; isOpen: boolean; onClose: () => void; }

const AppointmentModal = ({ appointment, isOpen, onClose }: AppointmentModalProps) => {
  const [cancelling, setCancelling] = useState(false);
  const [completing, setCompleting] = useState(false);
  if (!appointment) return null;
  const formatDate = (date: Date) => format(date, "dd 'de' MMMM 'de' yyyy", { locale: pt });
  const formatTime = (date: Date) => format(date, 'HH:mm');

  const handleCancel = async () => {
    if (!window.confirm(`Tem certeza que deseja cancelar o agendamento de ${appointment.customer_name}?`)) return;
    setCancelling(true);
    const { error } = await supabase.from('appointments').update({ status: 'cancelled' }).eq('id', appointment.id).eq('user_id', appointment.user_id);
    setCancelling(false);
    if (error) { console.error('Erro ao cancelar agendamento:', error); window.alert('Não foi possível cancelar o agendamento. Tente novamente.'); return; }
    onClose();
  };

  const handleComplete = async () => {
    if (!window.confirm(`Marcar o atendimento de ${appointment.customer_name} como concluído?`)) return;
    setCompleting(true);
    const { error } = await supabase.from('appointments').update({ status: 'completed' }).eq('id', appointment.id).eq('user_id', appointment.user_id);
    setCompleting(false);
    if (error) { console.error('Erro ao concluir agendamento:', error); window.alert('Não foi possível concluir o agendamento. Tente novamente.'); return; }
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader><DialogTitle className="text-xl font-bold">Detalhes do Agendamento</DialogTitle></DialogHeader>
        <div className="space-y-6 mt-4">
          <div><h3 className="text-lg font-semibold text-kendrah-purple">{appointment.service_name}</h3><div className="flex items-center mt-2"><svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-kendrah-purple/70 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5v12a2 2 0 002 2h14" /></svg><span>{formatDate(new Date(appointment.start_time))}</span></div><div className="flex items-center mt-2"><svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-kendrah-purple/70 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg><span>{formatTime(new Date(appointment.start_time))} - {formatTime(new Date(appointment.end_time))}</span></div></div>
          <div className="border-t border-gray-200 pt-4"><h4 className="text-sm uppercase text-gray-500 mb-2">Cliente</h4><div className="flex items-center mt-2"><span className="font-medium">{appointment.customer_name}</span></div><div className="flex items-center mt-2"><span>{appointment.customer_email}</span></div><div className="flex items-center mt-2"><span>{appointment.customer_phone}</span></div></div>
          {appointment.notes && <div className="border-t border-gray-200 pt-4"><h4 className="text-sm uppercase text-gray-500 mb-2">Observações</h4><p className="text-gray-700">{appointment.notes}</p></div>}
          <div className="border-t border-gray-200 pt-4 flex items-center justify-between gap-3"><span className={`inline-block px-3 py-1 rounded-full text-xs ${appointment.status === 'confirmed' ? 'bg-green-100 text-green-800' : appointment.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : appointment.status === 'cancelled' ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'}`}>{appointment.status === 'confirmed' ? 'Confirmado' : appointment.status === 'pending' ? 'Pendente' : appointment.status === 'cancelled' ? 'Cancelado' : 'Concluído'}</span><div className="flex flex-wrap justify-end gap-2">{appointment.status !== 'cancelled' && appointment.status !== 'completed' && <Button variant="outline" className="text-green-700 border-green-200 hover:bg-green-50" onClick={handleComplete} disabled={completing}>{completing ? 'Concluindo...' : 'Concluir atendimento'}</Button>}{appointment.status !== 'cancelled' && appointment.status !== 'completed' && <Button variant="outline" className="text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700" onClick={handleCancel} disabled={cancelling}>{cancelling ? 'Cancelando...' : 'Cancelar agendamento'}</Button>}<Button variant="outline" className="text-kendrah-black border-kendrah-black hover:bg-kendrah-black/10">Editar</Button><Button className="bg-kendrah-purple hover:bg-kendrah-purple/90">Enviar Lembrete</Button></div></div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
export default AppointmentModal;
