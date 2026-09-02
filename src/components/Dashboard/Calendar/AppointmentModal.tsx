import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Appointment } from '@/types';
import { format } from 'date-fns';
import { pt } from 'date-fns/locale';
import { supabase } from '@/integrations/supabase/client';

interface AppointmentModalProps {
  appointment: Appointment;
  isOpen: boolean;
  onClose: () => void;
}

const AppointmentModal = ({ appointment, isOpen, onClose }: AppointmentModalProps) => {
  const [cancelling, setCancelling] = useState(false);
  if (!appointment) return null;

  const formatDate = (date: Date) => {
    return format(date, "dd 'de' MMMM 'de' yyyy", { locale: pt });
  };

  const formatTime = (date: Date) => {
    return format(date, 'HH:mm');
  };

  const handleCancel = async () => {
    const confirmed = window.confirm(
      `Tem certeza que deseja cancelar o agendamento de ${appointment.customer_name}?`
    );
    if (!confirmed) return;

    setCancelling(true);
    const { error } = await supabase
      .from('appointments')
      .update({ status: 'cancelled' })
      .eq('id', appointment.id)
      .eq('user_id', appointment.user_id);

    setCancelling(false);

    if (error) {
      console.error('Erro ao cancelar agendamento:', error);
      window.alert('Não foi possível cancelar o agendamento. Tente novamente.');
      return;
    }

    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">Detalhes do Agendamento</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6 mt-4">
          <div>
            <h3 className="text-lg font-semibold text-kendrah-purple">{appointment.service_name}</h3>
            <div className="flex items-center mt-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-kendrah-purple/70 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 002 2v12a2 2 0 002-2z" />
              </svg>
              <span>{formatDate(new Date(appointment.start_time))}</span>
            </div>
            
            <div className="flex items-center mt-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-kendrah-purple/70 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>{formatTime(new Date(appointment.start_time))} - {formatTime(new Date(appointment.end_time))}</span>
            </div>
          </div>
          
          <div className="border-t border-gray-200 pt-4">
            <h4 className="text-sm uppercase text-gray-500 mb-2">Cliente</h4>
            
            <div className="flex items-center mt-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-kendrah-purple/70 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              <span className="font-medium">{appointment.customer_name}</span>
            </div>
            
            <div className="flex items-center mt-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-kendrah-purple/70 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002-2z" />
              </svg>
              <span>{appointment.customer_email}</span>
            </div>
            
            <div className="flex items-center mt-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-kendrah-purple/70 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-2.257 1.13 11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
              <span>{appointment.customer_phone}</span>
            </div>
          </div>
          
          {appointment.notes && (
            <div className="border-t border-gray-200 pt-4">
              <h4 className="text-sm uppercase text-gray-500 mb-2">Observações</h4>
              <p className="text-gray-700">{appointment.notes}</p>
            </div>
          )}
          
          <div className="border-t border-gray-200 pt-4 flex items-center justify-between gap-3">
            <span className={`inline-block px-3 py-1 rounded-full text-xs ${
              appointment.status === 'confirmed' ? 'bg-green-100 text-green-800' :
              appointment.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
              appointment.status === 'cancelled' ? 'bg-red-100 text-red-800' :
              'bg-blue-100 text-blue-800'
            }`}>
              {appointment.status === 'confirmed' ? 'Confirmado' :
               appointment.status === 'pending' ? 'Pendente' :
               appointment.status === 'cancelled' ? 'Cancelado' :
               'Concluído'}
            </span>
            
            <div className="flex flex-wrap justify-end gap-2">
              {appointment.status !== 'cancelled' && appointment.status !== 'completed' && (
                <Button
                  variant="outline"
                  className="text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700"
                  onClick={handleCancel}
                  disabled={cancelling}
                >
                  {cancelling ? 'Cancelando...' : 'Cancelar agendamento'}
                </Button>
              )}
              <Button variant="outline" className="text-kendrah-black border-kendrah-black hover:bg-kendrah-black/10">
                Editar
              </Button>
              <Button className="bg-kendrah-purple hover:bg-kendrah-purple/90">
                Enviar Lembrete
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AppointmentModal;
