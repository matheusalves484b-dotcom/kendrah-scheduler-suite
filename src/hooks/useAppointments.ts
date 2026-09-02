import { useCallback, useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Appointment, CalendarEvent } from '@/types';
import { getWorkspaceOwnerId } from '@/hooks/useWorkspace';

interface ProfessionalLabel {
  id: string;
  name: string;
}

export const useAppointments = () => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [professionals, setProfessionals] = useState<ProfessionalLabel[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAppointments = useCallback(async () => {
    setLoading(true);
    setError(null);

    const ownerId = await getWorkspaceOwnerId();
    if (!ownerId) {
      setAppointments([]);
      setProfessionals([]);
      setLoading(false);
      return;
    }

    const [{ data, error: fetchError }, { data: team }] = await Promise.all([
      supabase
        .from('appointments')
        .select('*')
        .eq('user_id', ownerId)
        .order('start_time', { ascending: true }),
      (supabase as any)
        .from('team_members')
        .select('member_id, invited_email, status')
        .eq('owner_id', ownerId)
        .eq('status', 'active'),
    ]);

    if (fetchError) {
      console.error('Erro ao carregar agendamentos:', fetchError);
      setError('Não foi possível carregar os agendamentos.');
      setAppointments([]);
    } else {
      setAppointments((data || []) as Appointment[]);
    }

    const { data: { user } } = await supabase.auth.getUser();
    const professionalList: ProfessionalLabel[] = [
      { id: ownerId, name: ownerId === user?.id ? (user?.user_metadata?.name || user?.email || 'Profissional principal') : 'Profissional principal' },
    ];

    (team || []).forEach((member: any) => {
      if (member.member_id) {
        professionalList.push({
          id: member.member_id,
          name: member.invited_email || 'Segundo profissional',
        });
      }
    });

    setProfessionals(professionalList);
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

  const professionalNameById = new Map(professionals.map((professional) => [professional.id, professional.name]));

  const events: CalendarEvent[] = appointments.map((appointment) => {
    const professionalId = appointment.professional_id || appointment.user_id;
    const professionalName = professionalNameById.get(professionalId) || 'Profissional';

    return {
      id: appointment.id,
      title: `${appointment.service_name} - ${appointment.customer_name}`,
      start: new Date(appointment.start_time),
      end: new Date(appointment.end_time),
      resource: { ...appointment, professional_name: professionalName },
    };
  });

  return { appointments, events, professionals, loading, error, refetch: fetchAppointments };
};
