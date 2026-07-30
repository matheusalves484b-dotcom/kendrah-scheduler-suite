import { useCallback, useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Appointment, CalendarEvent } from '@/types';

export const useAppointments = () => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAppointments = useCallback(async () => {
    setLoading(true);
    setError(null);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setAppointments([]);
      setLoading(false);
      return;
    }

    const { data, error: fetchError } = await supabase
      .from('appointments')
      .select('*')
      .eq('user_id', user.id)
      .order('start_time', { ascending: true });

    if (fetchError) {
      console.error('Erro ao carregar agendamentos:', fetchError);
      setError('Não foi possível carregar os agendamentos.');
      setAppointments([]);
    } else {
      setAppointments((data || []) as Appointment[]);
    }

    setLoading(false);
  }, []);

  useEffect(() => {
    fetchAppointments();

    const channel = supabase
      .channel('appointments-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'appointments' },
        () => fetchAppointments()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchAppointments]);

  const events: CalendarEvent[] = appointments.map((appointment) => ({
    id: appointment.id,
    title: `${appointment.service_name} - ${appointment.customer_name}`,
    start: new Date(appointment.start_time),
    end: new Date(appointment.end_time),
    resource: appointment,
  }));

  return { appointments, events, loading, error, refetch: fetchAppointments };
};
