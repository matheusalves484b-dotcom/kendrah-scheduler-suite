import { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MessageSquare, UserRound, CalendarDays, Clock3, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Profile, Service } from '@/types';
import { format, addDays, startOfDay } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { z } from 'zod';

type AvailabilityRow = { day_of_week: number; start_time: string; end_time: string; is_available: boolean };
type BookedInterval = { start_time: string; end_time: string };
type TimeOption = { time: string; booked: boolean };
type Professional = { id: string; name: string };

const bookingSchema = z.object({
  service: z.string().uuid({ message: 'Selecione um serviço.' }),
  professional: z.string().uuid({ message: 'Selecione um profissional.' }),
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
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [services, setServices] = useState<Service[]>([]);
  const [professionals, setProfessionals] = useState<Professional[]>([]);
  const [availability, setAvailability] = useState<AvailabilityRow[]>([]);
  const [bookedIntervals, setBookedIntervals] = useState<BookedInterval[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingTimes, setLoadingTimes] = useState(false);
  const [bookingTimesError, setBookingTimesError] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [notFound, setNotFound] = useState(false);
  const [selectedService, setSelectedService] = useState('');
  const [selectedProfessional, setSelectedProfessional] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [notes, setNotes] = useState('');

  useEffect(() => { if (slug) fetchPublicBookingData(); }, [slug]);

  const fetchPublicBookingData = async () => {
    try {
      setLoading(true);
      const { data: profileData, error: profileError } = await supabase.from('profiles').select('*').eq('slug', slug).single();
      if (profileError || !profileData) { setNotFound(true); return; }
      setProfile(profileData);

      const [{ data: servicesData, error: servicesError }, { data: availabilityData, error: availabilityError }, { data: professionalsData, error: professionalsError }] = await Promise.all([
        supabase.from('services').select('*').eq('user_id', profileData.id).order('name'),
        supabase.from('availability_slots').select('day_of_week,start_time,end_time,is_available').eq('user_id', profileData.id).eq('is_available', true).order('day_of_week').order('start_time'),
        (supabase as any).rpc('get_public_booking_professionals', { p_user_id: profileData.id }),
      ]);

      if (servicesError) { console.error('Error fetching services:', servicesError); return; }
      if (availabilityError) console.error('Error fetching availability:', availabilityError);
      if (professionalsError) toast({ title: 'Não foi possível carregar os profissionais', description: 'Atualize a página e tente novamente.', variant: 'destructive' });

      setServices((servicesData || []) as Service[]);
      setAvailability((availabilityData || []) as AvailabilityRow[]);
      setProfessionals((professionalsData || []) as Professional[]);
    } catch (error) {
      console.error('Error loading public booking:', error);
      setNotFound(true);
    } finally { setLoading(false); }
  };

  const availableDates = useMemo(() => Array.from({ length: 30 }, (_, i) => {
    const date = addDays(startOfDay(new Date()), i);
    return { value: format(date, 'yyyy-MM-dd'), label: format(date, "EEEE, dd 'de' MMMM", { locale: ptBR }), dayOfWeek: date.getDay() };
  }).filter(({ dayOfWeek }) => availability.some(a => a.day_of_week === dayOfWeek && a.is_available)), [availability]);

  useEffect(() => {
    setSelectedTime(''); setBookingTimesError(false); setBookedIntervals([]);
    if (!selectedDate || !profile || !selectedProfessional) return;
    let active = true;
    const loadBooked = async () => {
      setLoadingTimes(true);
      const { data, error } = await (supabase as any).rpc('get_public_booked_intervals', { p_user_id: profile.id, p_date: selectedDate, p_professional_id: selectedProfessional });
      if (!active) return;
      if (error) {
        console.error('Error fetching booked intervals:', error); setBookingTimesError(true);
        toast({ title: 'Não foi possível verificar os horários', description: 'Atualize a página e tente novamente.', variant: 'destructive' });
      } else setBookedIntervals((data || []) as BookedInterval[]);
      setLoadingTimes(false);
    };
    loadBooked();
    return () => { active = false; };
  }, [selectedDate, selectedProfessional, profile?.id]);

  const timeOptions = useMemo(() => {
    if (!selectedDate || !selectedService || !selectedProfessional || bookingTimesError) return [];
    const service = services.find(s => s.id === selectedService); if (!service) return [];
    const dayOfWeek = new Date(`${selectedDate}T12:00:00`).getDay();
    const daySlots = availability.filter(a => a.day_of_week === dayOfWeek && a.is_available);
    const result: TimeOption[] = []; const now = Date.now();
    for (const slot of daySlots) {
      const start = toMinutes(slot.start_time); const end = toMinutes(slot.end_time);
      for (let minute = start; minute + service.duration <= end; minute += 30) {
        const time = toHHMM(minute); const startDateTime = new Date(`${selectedDate}T${time}:00`); const endDateTime = new Date(startDateTime.getTime() + service.duration * 60000);
        if (startDateTime.getTime() <= now) continue;
        const booked = bookedIntervals.some(b => startDateTime.getTime() < new Date(b.end_time).getTime() && endDateTime.getTime() > new Date(b.start_time).getTime());
        result.push({ time, booked });
      }
    }
    const unique = new Map<string, TimeOption>();
    result.forEach(option => { if (!unique.has(option.time) || option.booked) unique.set(option.time, option); });
    return [...unique.values()].sort((a, b) => a.time.localeCompare(b.time));
  }, [selectedDate, selectedService, selectedProfessional, services, availability, bookedIntervals, bookingTimesError]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = bookingSchema.safeParse({ service: selectedService, professional: selectedProfessional, date: selectedDate, time: selectedTime, name: customerName, email: customerEmail, phone: customerPhone, notes });
    if (!parsed.success) { toast({ title: 'Verifique os dados', description: parsed.error.issues[0].message, variant: 'destructive' }); return; }
    const startDateTime = new Date(`${parsed.data.date}T${parsed.data.time}:00`);
    if (startDateTime.getTime() <= Date.now()) { toast({ title: 'Horário inválido', description: 'Escolha um horário no futuro.', variant: 'destructive' }); return; }
    setSubmitting(true);
    try {
      const service = services.find(s => s.id === selectedService);
      const professional = professionals.find(p => p.id === selectedProfessional);
      if (!service || !professional || !profile) throw new Error('Serviço, profissional ou prestador não encontrado.');
      const endDateTime = new Date(startDateTime.getTime() + service.duration * 60000);

      const { data: freshBooked, error: bookedError } = await (supabase as any).rpc('get_public_booked_intervals', { p_user_id: profile.id, p_date: parsed.data.date, p_professional_id: professional.id });
      if (bookedError) throw bookedError;
      if ((freshBooked || []).some((b: BookedInterval) => startDateTime.getTime() < new Date(b.end_time).getTime() && endDateTime.getTime() > new Date(b.start_time).getTime())) {
        toast({ title: 'Horário indisponível', description: 'Este horário acabou de ser ocupado. Por favor, escolha outro horário.', variant: 'destructive' }); setSelectedTime(''); return;
      }

      const { data, error } = await (supabase as any).rpc('create_public_appointment', {
        p_user_id: profile.id,
        p_service_id: service.id,
        p_service_name: service.name,
        p_professional_id: professional.id,
        p_customer_name: parsed.data.name,
        p_customer_email: parsed.data.email,
        p_customer_phone: parsed.data.phone,
        p_start_time: startDateTime.toISOString(),
        p_end_time: endDateTime.toISOString(),
        p_notes: parsed.data.notes || null,
      });
      if (error) {
        if (error.message?.includes('APPOINTMENT_CONFLICT') || error.code === '23P01') { toast({ title: 'Horário indisponível', description: 'Este horário acabou de ser ocupado. Por favor, escolha outro horário.', variant: 'destructive' }); setSelectedTime(''); return; }
        throw error;
      }
      const result = (data ?? {}) as { success?: boolean; code?: string; error?: string };
      if (!result.success) {
        if (result.code === 'APPOINTMENT_CONFLICT') { toast({ title: 'Horário indisponível', description: 'Este horário acabou de ser ocupado. Por favor, escolha outro horário.', variant: 'destructive' }); setSelectedTime(''); return; }
        throw new Error(result.error || 'Não foi possível concluir o agendamento.');
      }

      navigate('/agendamento-confirmado', { state: { serviceName: service.name, professionalName: professional.name, startTime: startDateTime.toISOString(), endTime: endDateTime.toISOString(), customerName: parsed.data.name, businessName: profile.business_name, whatsappNumber: profile.whatsapp_number, slug, price: service.price ?? null, duration: service.duration ?? null } });
    } catch (error) {
      console.error('Error creating appointment:', error);
      toast({ title: 'Erro ao concluir agendamento', description: error instanceof Error ? error.message : 'Não foi possível realizar o agendamento. Tente novamente.', variant: 'destructive' });
    } finally { setSubmitting(false); }
  };

  if (loading) return <div className="min-h-screen bg-gradient-to-br from-kendrah-purple to-kendrah-black flex items-center justify-center"><div className="text-white text-xl">Carregando agendamento...</div></div>;
  if (notFound) return <div className="min-h-screen bg-gradient-to-br from-kendrah-purple to-kendrah-black flex items-center justify-center px-4"><Card className="max-w-md"><CardContent className="p-8 text-center"><h1 className="text-2xl font-bold mb-4">Link não encontrado</h1><p className="text-gray-600 mb-6">Este link de agendamento não está disponível ou expirou.</p><Button onClick={() => navigate('/')} className="bg-kendrah-purple hover:bg-kendrah-purple/90">Voltar ao início</Button></CardContent></Card></div>;
  if (services.length === 0) return <div className="min-h-screen bg-gradient-to-br from-kendrah-purple to-kendrah-black flex items-center justify-center px-4"><Card className="max-w-md"><CardContent className="p-8 text-center"><h1 className="text-2xl font-bold mb-4">{profile?.business_name}</h1><p className="text-gray-600 mb-6">Nenhum serviço foi configurado ainda para este profissional.</p><Button onClick={() => navigate('/')} className="bg-kendrah-purple hover:bg-kendrah-purple/90">Voltar ao início</Button></CardContent></Card></div>;

  return <div className="min-h-screen bg-gradient-to-br from-kendrah-purple to-kendrah-black py-6 sm:py-10"><div className="container mx-auto max-w-3xl px-4">
    <div className="text-center mb-6 sm:mb-8">
      {profile?.business_logo_url && <img src={profile.business_logo_url} alt={profile.business_name || 'Logo'} className="mx-auto mb-4 h-16 w-16 rounded-full object-cover bg-white" />}
      <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2">{profile?.business_name || 'Agendamento Online'}</h1>
      <p className="text-gray-200">Escolha o serviço, profissional, data e horário.</p>
      {profile?.whatsapp_number && <div className="mt-3"><a href={`https://wa.me/${profile.whatsapp_number}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-green-400 hover:text-green-300 text-sm"><MessageSquare className="h-4 w-4" />Falar pelo WhatsApp</a></div>}
    </div>

    <Card className="shadow-xl"><CardHeader className="pb-4"><CardTitle className="text-xl sm:text-2xl text-center">Agende seu horário</CardTitle><div className="flex items-center justify-center gap-2 pt-2 text-xs sm:text-sm text-muted-foreground"><span className="flex items-center gap-1"><CheckCircle2 className="h-4 w-4 text-kendrah-purple" />1. Escolha</span><span>•</span><span>2. Dados</span><span>•</span><span>3. Confirme</span></div></CardHeader>
      <CardContent><form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2"><Label htmlFor="service">Serviço *</Label><Select value={selectedService} onValueChange={v => { setSelectedService(v); setSelectedProfessional(''); setSelectedDate(''); setSelectedTime(''); }}><SelectTrigger><SelectValue placeholder="Selecione um serviço" /></SelectTrigger><SelectContent>{services.map(service => <SelectItem key={service.id} value={service.id}><div className="flex justify-between items-center w-full"><span>{service.name}</span><span className="text-sm text-gray-500 ml-4">{service.duration} min{service.price !== undefined && service.price !== null ? ` — R$ ${Number(service.price).toFixed(2).replace('.', ',')}` : ''}</span></div></SelectItem>)}</SelectContent></Select>{selectedService && <p className="text-sm text-muted-foreground">{services.find(s => s.id === selectedService)?.description}</p>}</div>
        <div className="space-y-2"><Label htmlFor="professional" className="flex items-center gap-2"><UserRound className="h-4 w-4" />Profissional *</Label><Select value={selectedProfessional} onValueChange={v => { setSelectedProfessional(v); setSelectedDate(''); setSelectedTime(''); }} disabled={!selectedService || professionals.length === 0}><SelectTrigger><SelectValue placeholder={!selectedService ? 'Primeiro selecione um serviço' : 'Selecione o profissional'} /></SelectTrigger><SelectContent>{professionals.map(professional => <SelectItem key={professional.id} value={professional.id}>{professional.name}</SelectItem>)}</SelectContent></Select>{professionals.length === 0 && <p className="text-sm text-destructive">Nenhum profissional está disponível para agendamento.</p>}</div>
        <div className="space-y-2"><Label htmlFor="date" className="flex items-center gap-2"><CalendarDays className="h-4 w-4" />Data *</Label><Select value={selectedDate} onValueChange={v => { setSelectedDate(v); setSelectedTime(''); }} disabled={!selectedProfessional}><SelectTrigger><SelectValue placeholder={!selectedProfessional ? 'Primeiro selecione o profissional' : 'Selecione uma data'} /></SelectTrigger><SelectContent>{availableDates.map(date => <SelectItem key={date.value} value={date.value}>{date.label}</SelectItem>)}</SelectContent></Select>{availability.length === 0 && <p className="text-sm text-destructive">O prestador ainda não configurou dias e horários disponíveis.</p>}</div>
        <div className="space-y-2"><Label htmlFor="time" className="flex items-center gap-2"><Clock3 className="h-4 w-4" />Horário *</Label><Select value={selectedTime} onValueChange={setSelectedTime} disabled={!selectedDate || !selectedService || !selectedProfessional || loadingTimes || bookingTimesError}><SelectTrigger><SelectValue placeholder={loadingTimes ? 'Verificando horários...' : bookingTimesError ? 'Não foi possível verificar os horários' : !selectedDate ? 'Primeiro selecione a data' : 'Selecione um horário'} /></SelectTrigger><SelectContent>{timeOptions.map(option => <SelectItem key={option.time} value={option.time} disabled={option.booked} className={option.booked ? 'opacity-50' : ''}><div className="flex items-center justify-between w-full"><span>{option.time}</span><span className="ml-4 text-sm">{option.booked ? 'Indisponível' : 'Disponível'}</span></div></SelectItem>)}</SelectContent></Select>{selectedDate && !loadingTimes && !bookingTimesError && timeOptions.length === 0 && <p className="text-sm text-muted-foreground">Não há horários disponíveis para esta combinação. Escolha outra data.</p>}</div>
        <div className="border-t pt-6 space-y-4"><div><h2 className="font-semibold text-lg">Seus dados</h2><p className="text-sm text-muted-foreground">Precisamos destas informações para confirmar seu agendamento.</p></div><div className="space-y-2"><Label htmlFor="name">Nome completo *</Label><Input id="name" value={customerName} onChange={e => setCustomerName(e.target.value)} placeholder="Digite seu nome completo" autoComplete="name" /></div><div className="grid grid-cols-1 sm:grid-cols-2 gap-4"><div className="space-y-2"><Label htmlFor="email">E-mail *</Label><Input id="email" type="email" value={customerEmail} onChange={e => setCustomerEmail(e.target.value)} placeholder="seuemail@exemplo.com" autoComplete="email" /></div><div className="space-y-2"><Label htmlFor="phone">WhatsApp *</Label><Input id="phone" value={customerPhone} onChange={e => setCustomerPhone(e.target.value)} placeholder="(11) 99999-9999" autoComplete="tel" /></div></div><div className="space-y-2"><Label htmlFor="notes">Observações</Label><Textarea id="notes" value={notes} onChange={e => setNotes(e.target.value)} placeholder="Alguma observação? (opcional)" rows={3} /></div></div>
        {selectedService && selectedProfessional && selectedDate && selectedTime && <div className="rounded-xl bg-kendrah-purple/5 border border-kendrah-purple/20 p-4 space-y-2"><p className="font-semibold">Resumo do agendamento</p><p className="text-sm"><strong>Serviço:</strong> {services.find(s => s.id === selectedService)?.name}</p><p className="text-sm"><strong>Profissional:</strong> {professionals.find(p => p.id === selectedProfessional)?.name}</p><p className="text-sm"><strong>Data:</strong> {format(new Date(`${selectedDate}T12:00:00`), 'dd/MM/yyyy', { locale: ptBR })}</p><p className="text-sm"><strong>Horário:</strong> {selectedTime}</p></div>}
        <Button type="submit" className="w-full h-12 text-base bg-kendrah-purple hover:bg-kendrah-purple/90" disabled={submitting || loadingTimes || bookingTimesError}>{submitting ? 'Confirmando agendamento...' : 'Confirmar agendamento'}</Button>
        <p className="text-center text-xs text-muted-foreground">Ao confirmar, seu horário será reservado para o profissional selecionado.</p>
      </form></CardContent>
    </Card>
    <p className="text-center text-xs text-gray-300 mt-5">Agendamento online • KENDRAH</p>
  </div></div>;
};

export default BookingSlugPage;
