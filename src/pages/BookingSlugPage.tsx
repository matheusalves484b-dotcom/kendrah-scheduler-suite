import { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Profile, Service } from '@/types';
import { format, addDays, startOfDay, isBefore } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { z } from 'zod';

type AvailabilityRow = { day_of_week: number; start_time: string; end_time: string; is_available: boolean };
type BookedInterval = { start_time: string; end_time: string };

const bookingSchema = z.object({
  service: z.string().uuid({ message: 'Selecione um serviço.' }),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, { message: 'Selecione uma data.' }),
  time: z.string().regex(/^\d{2}:\d{2}$/, { message: 'Selecione um horário.' }),
  name: z.string().trim().min(2, { message: 'Informe seu nome completo.' }).max(100, { message: 'Nome muito longo (máx. 100 caracteres).' }),
  email: z.string().trim().email({ message: 'Informe um e-mail válido.' }).max(255, { message: 'E-mail muito longo.' }),
  phone: z.string().trim().min(8, { message: 'Informe um telefone válido.' }).max(20, { message: 'Telefone muito longo.' }).refine(v => { const digits = v.replace(/\D/g, '').length; return digits >= 8 && digits <= 15; }, { message: 'Informe um telefone válido.' }),
  notes: z.string().trim().max(1000, { message: 'Observações muito longas (máx. 1000 caracteres).' }).optional(),
});

const toMinutes = (value: string) => { const [h, m] = value.slice(0, 5).split(':').map(Number); return h * 60 + m; };
const toHHMM = (minutes: number) => `${String(Math.floor(minutes / 60)).padStart(2, '0')}:${String(minutes % 60).padStart(2, '0')}`;

const BookingSlugPage = () => {
  const { slug } = useParams<{ slug: string }>(); const navigate = useNavigate();
  const [profile, setProfile] = useState<Profile | null>(null); const [services, setServices] = useState<Service[]>([]); const [availability, setAvailability] = useState<AvailabilityRow[]>([]); const [bookedIntervals, setBookedIntervals] = useState<BookedInterval[]>([]);
  const [loading, setLoading] = useState(true); const [loadingTimes, setLoadingTimes] = useState(false); const [submitting, setSubmitting] = useState(false); const [notFound, setNotFound] = useState(false);
  const [selectedService, setSelectedService] = useState(''); const [selectedDate, setSelectedDate] = useState(''); const [selectedTime, setSelectedTime] = useState(''); const [customerName, setCustomerName] = useState(''); const [customerEmail, setCustomerEmail] = useState(''); const [customerPhone, setCustomerPhone] = useState(''); const [notes, setNotes] = useState('');

  useEffect(() => { if (slug) fetchProfileAndServices(); }, [slug]);
  const fetchProfileAndServices = async () => {
    try {
      setLoading(true);
      const { data: profileData, error: profileError } = await supabase.from('profiles').select('*').eq('slug', slug).single();
      if (profileError || !profileData) { setNotFound(true); return; } setProfile(profileData);
      const [{ data: servicesData, error: servicesError }, { data: availabilityData, error: availabilityError }] = await Promise.all([
        supabase.from('services').select('*').eq('user_id', profileData.id).order('name'),
        supabase.from('availability_slots').select('day_of_week,start_time,end_time,is_available').eq('user_id', profileData.id).eq('is_available', true).order('day_of_week').order('start_time'),
      ]);
      if (servicesError) { console.error('Error fetching services:', servicesError); return; }
      if (availabilityError) { console.error('Error fetching availability:', availabilityError); toast({ title: 'Não foi possível carregar a disponibilidade', description: 'Tente novamente mais tarde.', variant: 'destructive' }); }
      setServices(servicesData || []); setAvailability((availabilityData || []) as AvailabilityRow[]);
    } catch (error) { console.error('Error:', error); setNotFound(true); } finally { setLoading(false); }
  };

  const availableDates = useMemo(() => Array.from({ length: 30 }, (_, i) => { const date = addDays(startOfDay(new Date()), i); return { value: format(date, 'yyyy-MM-dd'), label: format(date, "EEEE, dd 'de' MMMM", { locale: ptBR }), date, dayOfWeek: date.getDay() }; }).filter(({ date, dayOfWeek }) => !isBefore(date, startOfDay(new Date())) && availability.some(a => a.day_of_week === dayOfWeek && a.is_available)), [availability]);

  useEffect(() => {
    setSelectedTime(''); if (!selectedDate || !profile) { setBookedIntervals([]); return; }
    const loadBooked = async () => { setLoadingTimes(true); const { data, error } = await supabase.rpc('get_public_booked_intervals', { p_user_id: profile.id, p_date: selectedDate }); if (error) { console.error('Error fetching booked intervals:', error); setBookedIntervals([]); } else setBookedIntervals((data || []) as BookedInterval[]); setLoadingTimes(false); };
    loadBooked();
  }, [selectedDate, profile?.id]);

  const availableTimes = useMemo(() => {
    if (!selectedDate || !selectedService) return []; const service = services.find(s => s.id === selectedService); if (!service) return [];
    const dayOfWeek = new Date(`${selectedDate}T12:00:00`).getDay(); const daySlots = availability.filter(a => a.day_of_week === dayOfWeek && a.is_available); const result: string[] = []; const now = Date.now();
    for (const slot of daySlots) { const start = toMinutes(slot.start_time); const end = toMinutes(slot.end_time); for (let minute = start; minute + service.duration <= end; minute += 30) { const time = toHHMM(minute); const startDateTime = new Date(`${selectedDate}T${time}:00`); const endDateTime = new Date(startDateTime.getTime() + service.duration * 60000); const overlaps = bookedIntervals.some(b => startDateTime.getTime() < new Date(b.end_time).getTime() && endDateTime.getTime() > new Date(b.start_time).getTime()); if (startDateTime.getTime() > now && !overlaps) result.push(time); } }
    return [...new Set(result)].sort();
  }, [selectedDate, selectedService, services, availability, bookedIntervals]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); const parsed = bookingSchema.safeParse({ service: selectedService, date: selectedDate, time: selectedTime, name: customerName, email: customerEmail, phone: customerPhone, notes });
    if (!parsed.success) { toast({ title: 'Verifique os dados', description: parsed.error.issues[0].message, variant: 'destructive' }); return; }
    const startDateTime = new Date(`${parsed.data.date}T${parsed.data.time}:00`); if (startDateTime.getTime() <= Date.now()) { toast({ title: 'Horário inválido', description: 'Escolha um horário no futuro.', variant: 'destructive' }); return; }
    setSubmitting(true);
    try {
      const selectedServiceData = services.find(s => s.id === selectedService);
      if (!selectedServiceData || !profile) throw new Error('Serviço ou prestador não encontrado.');
      const endDateTime = new Date(startDateTime.getTime() + selectedServiceData.duration * 60000);

      const { data: freshBooked, error: bookedError } = await supabase.rpc('get_public_booked_intervals', { p_user_id: profile.id, p_date: parsed.data.date });
      if (bookedError) throw bookedError;
      if ((freshBooked || []).some((b: BookedInterval) => startDateTime.getTime() < new Date(b.end_time).getTime() && endDateTime.getTime() > new Date(b.start_time).getTime())) {
        toast({ title: 'Horário indisponível', description: 'Este horário acabou de ser ocupado. Por favor, escolha outro horário.', variant: 'destructive' });
        setSelectedTime(''); return;
      }

      // A criação definitiva é feita por RPC SECURITY DEFINER, que valida novamente
      // o serviço, horário, disponibilidade e conflito dentro de uma única transação.
      const { data, error } = await supabase.rpc('create_public_appointment', {
        p_user_id: profile.id,
        p_service_id: selectedServiceData.id,
        p_service_name: selectedServiceData.name,
        p_customer_name: parsed.data.name,
        p_customer_email: parsed.data.email,
        p_customer_phone: parsed.data.phone,
        p_start_time: startDateTime.toISOString(),
        p_end_time: endDateTime.toISOString(),
        p_notes: parsed.data.notes || null,
      });

      if (error) {
        console.error('Erro RPC create_public_appointment:', error);
        if (error.message?.includes('APPOINTMENT_CONFLICT') || error.code === '23P01') {
          toast({ title: 'Horário indisponível', description: 'Este horário acabou de ser ocupado. Por favor, escolha outro horário.', variant: 'destructive' });
          setSelectedTime(''); return;
        }
        throw error;
      }

      if (!data?.success) {
        if (data?.code === 'APPOINTMENT_CONFLICT') {
          toast({ title: 'Horário indisponível', description: 'Este horário acabou de ser ocupado. Por favor, escolha outro horário.', variant: 'destructive' });
          setSelectedTime(''); return;
        }
        throw new Error(data?.error || 'Não foi possível concluir o agendamento.');
      }

      navigate('/agendamento-confirmado', { state: { serviceName: selectedServiceData.name, startTime: startDateTime.toISOString(), endTime: endDateTime.toISOString(), customerName: parsed.data.name, businessName: profile.business_name, whatsappNumber: profile.whatsapp_number, slug, price: selectedServiceData.price ?? null, duration: selectedServiceData.duration ?? null } });
    } catch (error) {
      console.error('Error creating appointment:', error);
      toast({ title: 'Erro ao concluir agendamento', description: error instanceof Error ? error.message : 'Não foi possível realizar o agendamento. Tente novamente.', variant: 'destructive' });
    } finally { setSubmitting(false); }
  };

  if (loading) return <div className="min-h-screen bg-gradient-to-br from-kendrah-purple to-kendrah-black flex items-center justify-center"><div className="text-white text-xl">Carregando...</div></div>;
  if (notFound) return <div className="min-h-screen bg-gradient-to-br from-kendrah-purple to-kendrah-black flex items-center justify-center"><Card className="max-w-md mx-auto"><CardContent className="p-8 text-center"><h1 className="text-2xl font-bold mb-4">Link não encontrado</h1><p className="text-gray-600 mb-6">Este link de agendamento não está disponível ou expirou.</p><Button onClick={() => navigate('/')} className="bg-kendrah-purple hover:bg-kendrah-purple/90">Voltar ao início</Button></CardContent></Card></div>;
  if (services.length === 0) return <div className="min-h-screen bg-gradient-to-br from-kendrah-purple to-kendrah-black flex items-center justify-center"><Card className="max-w-md mx-auto"><CardContent className="p-8 text-center"><h1 className="text-2xl font-bold mb-4">{profile?.business_name}</h1><p className="text-gray-600 mb-6">Nenhum serviço foi configurado ainda para este profissional.</p><Button onClick={() => navigate('/')} className="bg-kendrah-purple hover:bg-kendrah-purple/90">Voltar ao início</Button></CardContent></Card></div>;

  return <div className="min-h-screen bg-gradient-to-br from-kendrah-purple to-kendrah-black"><div className="container mx-auto px-4 py-8"><div className="text-center mb-8"><h1 className="text-4xl font-bold text-white mb-2">{profile?.business_name || 'Agendamento Online'}</h1><p className="text-gray-200">Escolha um serviço e agende seu horário</p>{profile?.whatsapp_number && <div className="mt-4"><a href={`https://wa.me/${profile.whatsapp_number}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-green-400 hover:text-green-300"><MessageSquare className="h-4 w-4" />WhatsApp: {profile.whatsapp_number}</a></div>}</div>
    <Card className="max-w-2xl mx-auto"><CardHeader><CardTitle className="text-2xl text-center">Novo Agendamento</CardTitle></CardHeader><CardContent><form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2"><Label htmlFor="service">Serviço *</Label><Select value={selectedService} onValueChange={v => { setSelectedService(v); setSelectedTime(''); }}><SelectTrigger><SelectValue placeholder="Selecione um serviço" /></SelectTrigger><SelectContent>{services.map(service => <SelectItem key={service.id} value={service.id}><div className="flex justify-between items-center w-full"><span>{service.name}</span><div className="text-sm text-gray-500 ml-4">{service.duration}min{service.price && ` - R$ ${service.price.toFixed(2)}`}</div></div></SelectItem>)}</SelectContent></Select>{selectedService && <div className="text-sm text-gray-600">{services.find(s => s.id === selectedService)?.description}</div>}</div>
      <div className="space-y-2"><Label htmlFor="date">Data *</Label><Select value={selectedDate} onValueChange={v => { setSelectedDate(v); setSelectedTime(''); }}><SelectTrigger><SelectValue placeholder="Selecione uma data" /></SelectTrigger><SelectContent>{availableDates.map(date => <SelectItem key={date.value} value={date.value}>{date.label}</SelectItem>)}</SelectContent></Select>{availability.length === 0 && <p className="text-sm text-destructive">O prestador ainda não configurou dias e horários disponíveis.</p>}</div>
      <div className="space-y-2"><Label htmlFor="time">Horário *</Label><Select value={selectedTime} onValueChange={setSelectedTime} disabled={!selectedDate || !selectedService || loadingTimes}><SelectTrigger><SelectValue placeholder={loadingTimes ? 'Carregando horários...' : 'Selecione um horário'} /></SelectTrigger><SelectContent>{availableTimes.map(time => <SelectItem key={time} value={time}>{time}</SelectItem>)}</SelectContent></Select>{selectedDate && selectedService && !loadingTimes && availableTimes.length === 0 && <p className="text-sm text-muted-foreground">Não há horários disponíveis para esta data.</p>}</div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4"><div className="space-y-2"><Label htmlFor="name">Nome completo *</Label><Input id="name" value={customerName} onChange={e => setCustomerName(e.target.value)} placeholder="Seu nome completo" /></div><div className="space-y-2"><Label htmlFor="phone">Telefone *</Label><Input id="phone" value={customerPhone} onChange={e => setCustomerPhone(e.target.value)} placeholder="(00) 00000-0000" /></div></div>
      <div className="space-y-2"><Label htmlFor="email">E-mail *</Label><Input id="email" type="email" value={customerEmail} onChange={e => setCustomerEmail(e.target.value)} placeholder="seu@email.com" /></div><div className="space-y-2"><Label htmlFor="notes">Observações</Label><Textarea id="notes" value={notes} onChange={e => setNotes(e.target.value)} placeholder="Alguma observação especial?" rows={3} /></div>
      <Button type="submit" className="w-full bg-kendrah-purple hover:bg-kendrah-purple/90" disabled={submitting || !selectedTime}>{submitting ? 'Agendando...' : 'Confirmar Agendamento'}</Button>
    </form></CardContent></Card><div className="text-center mt-8 text-white/70"><p>Powered by Kendrah</p></div></div></div>;
};
export default BookingSlugPage;
