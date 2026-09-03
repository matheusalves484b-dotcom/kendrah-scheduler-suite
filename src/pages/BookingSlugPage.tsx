import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { CalendarDays, CheckCircle2, Clock3, MessageSquare, UserRound } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Profile, Service } from '@/types';
import { addDays, format, startOfDay } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { z } from 'zod';

type AvailabilityRow = { day_of_week: number; start_time: string; end_time: string; is_available: boolean };
type BookedInterval = { start_time: string; end_time: string };
type Professional = { id: string; name: string };

const schema = z.object({
  service: z.string().uuid('Selecione um serviço.'),
  professional: z.string().uuid('Selecione um profissional.'),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Selecione uma data.'),
  time: z.string().regex(/^\d{2}:\d{2}$/, 'Selecione um horário.'),
  name: z.string().trim().min(2, 'Informe seu nome completo.').max(100, 'Nome muito longo.'),
  email: z.string().trim().email('Informe um e-mail válido.').max(255, 'E-mail muito longo.'),
  phone: z.string().trim().refine(v => { const n = v.replace(/\D/g, ''); return n.length >= 8 && n.length <= 15; }, 'Informe um WhatsApp válido.'),
  notes: z.string().trim().max(1000, 'Observações muito longas.').optional(),
});

const minutes = (v: string) => { const [h, m] = v.slice(0, 5).split(':').map(Number); return h * 60 + m; };
const hhmm = (v: number) => `${String(Math.floor(v / 60)).padStart(2, '0')}:${String(v % 60).padStart(2, '0')}`;

const BookingSlugPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [services, setServices] = useState<Service[]>([]);
  const [professionals, setProfessionals] = useState<Professional[]>([]);
  const [availability, setAvailability] = useState<AvailabilityRow[]>([]);
  const [booked, setBooked] = useState<BookedInterval[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingTimes, setLoadingTimes] = useState(false);
  const [timesError, setTimesError] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [notFound, setNotFound] = useState(false);
  const [serviceId, setServiceId] = useState('');
  const [professionalId, setProfessionalId] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [notes, setNotes] = useState('');

  useEffect(() => { if (slug) load(); }, [slug]);

  const load = async () => {
    setLoading(true);
    try {
      const { data: p, error: pe } = await supabase.from('profiles').select('*').eq('slug', slug).maybeSingle();
      if (pe || !p) { setNotFound(true); return; }
      setProfile(p as Profile);

      // business_logo_url pode guardar tanto uma URL completa quanto o caminho do arquivo no bucket avatars.
      if (p.business_logo_url) {
        if (/^https?:\/\//i.test(p.business_logo_url)) setLogoUrl(p.business_logo_url);
        else {
          const { data } = await supabase.storage.from('avatars').createSignedUrl(p.business_logo_url, 60 * 60);
          setLogoUrl(data?.signedUrl ?? null);
        }
      } else setLogoUrl(null);

      const [sr, ar, pr] = await Promise.all([
        supabase.from('services').select('*').eq('user_id', p.id).order('name'),
        supabase.from('availability_slots').select('day_of_week,start_time,end_time,is_available').eq('user_id', p.id).eq('is_available', true).order('day_of_week').order('start_time'),
        (supabase as any).rpc('get_public_booking_professionals', { p_user_id: p.id }),
      ]);
      if (sr.error) throw sr.error;
      if (ar.error) throw ar.error;
      if (pr.error) throw pr.error;
      setServices((sr.data ?? []) as Service[]);
      setAvailability((ar.data ?? []) as AvailabilityRow[]);
      setProfessionals((pr.data ?? []) as Professional[]);
    } catch (e) {
      console.error('Erro ao carregar agendamento público:', e);
      toast({ title: 'Não foi possível carregar o agendamento', description: 'Atualize a página e tente novamente.', variant: 'destructive' });
    } finally { setLoading(false); }
  };

  const availableDates = useMemo(() => Array.from({ length: 30 }, (_, i) => {
    const d = addDays(startOfDay(new Date()), i);
    return { value: format(d, 'yyyy-MM-dd'), label: format(d, "EEEE, dd 'de' MMMM", { locale: ptBR }), day: d.getDay() };
  }).filter(d => availability.some(a => a.day_of_week === d.day && a.is_available)), [availability]);

  useEffect(() => {
    setTime(''); setBooked([]); setTimesError(false);
    if (!profile || !date || !professionalId) return;
    let alive = true;
    (async () => {
      setLoadingTimes(true);
      const { data, error } = await (supabase as any).rpc('get_public_booked_intervals', {
        p_user_id: profile.id,
        p_date: date,
        p_professional_id: professionalId,
      });
      if (!alive) return;
      if (error) {
        console.error('Erro ao consultar horários:', error);
        setTimesError(true);
        toast({ title: 'Não foi possível verificar os horários', description: 'Atualize a página e tente novamente.', variant: 'destructive' });
      } else setBooked((data ?? []) as BookedInterval[]);
      setLoadingTimes(false);
    })();
    return () => { alive = false; };
  }, [profile?.id, date, professionalId]);

  const timeOptions = useMemo(() => {
    if (!date || !serviceId || !professionalId || timesError) return [];
    const service = services.find(s => s.id === serviceId);
    if (!service) return [];
    const dow = new Date(`${date}T12:00:00`).getDay();
    const result: { time: string; booked: boolean }[] = [];
    const now = Date.now();
    for (const slot of availability.filter(a => a.day_of_week === dow && a.is_available)) {
      for (let m = minutes(slot.start_time); m + service.duration <= minutes(slot.end_time); m += 30) {
        const t = hhmm(m);
        const start = new Date(`${date}T${t}:00`);
        const end = new Date(start.getTime() + service.duration * 60000);
        if (start.getTime() <= now) continue;
        const isBooked = booked.some(b => start < new Date(b.end_time) && end > new Date(b.start_time));
        result.push({ time: t, booked: isBooked });
      }
    }
    return Array.from(new Map(result.map(x => [x.time, x])).values()).sort((a, b) => a.time.localeCompare(b.time));
  }, [date, serviceId, professionalId, services, availability, booked, timesError]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = schema.safeParse({ service: serviceId, professional: professionalId, date, time, name, email, phone, notes });
    if (!parsed.success) { toast({ title: 'Verifique os dados', description: parsed.error.issues[0].message, variant: 'destructive' }); return; }
    if (!profile) return;
    const service = services.find(s => s.id === serviceId);
    const professional = professionals.find(p => p.id === professionalId);
    if (!service || !professional) { toast({ title: 'Dados inválidos', description: 'Selecione novamente o serviço e o profissional.', variant: 'destructive' }); return; }
    const start = new Date(`${date}T${time}:00`);
    const end = new Date(start.getTime() + service.duration * 60000);
    if (start.getTime() <= Date.now()) { toast({ title: 'Horário inválido', description: 'Escolha um horário futuro.', variant: 'destructive' }); return; }

    setSubmitting(true);
    try {
      const { data: fresh, error: fe } = await (supabase as any).rpc('get_public_booked_intervals', { p_user_id: profile.id, p_date: date, p_professional_id: professional.id });
      if (fe) throw fe;
      if ((fresh ?? []).some((b: BookedInterval) => start < new Date(b.end_time) && end > new Date(b.start_time))) {
        setTime('');
        toast({ title: 'Horário indisponível', description: 'Este horário acabou de ser ocupado. Escolha outro.', variant: 'destructive' });
        return;
      }

      const { data, error } = await (supabase as any).rpc('create_public_appointment', {
        p_user_id: profile.id,
        p_service_id: service.id,
        p_service_name: service.name,
        p_customer_name: parsed.data.name,
        p_customer_email: parsed.data.email,
        p_customer_phone: parsed.data.phone,
        p_start_time: start.toISOString(),
        p_end_time: end.toISOString(),
        p_notes: parsed.data.notes || null,
        p_professional_id: professional.id,
      });
      if (error) throw error;
      const result = data as { success?: boolean; code?: string; error?: string };
      if (!result?.success) {
        if (result?.code === 'APPOINTMENT_CONFLICT') { setTime(''); toast({ title: 'Horário indisponível', description: 'Escolha outro horário.', variant: 'destructive' }); return; }
        throw new Error(result?.error || 'Não foi possível concluir o agendamento.');
      }
      navigate('/agendamento-confirmado', { state: { serviceName: service.name, professionalName: professional.name, startTime: start.toISOString(), endTime: end.toISOString(), customerName: parsed.data.name, businessName: profile.business_name, whatsappNumber: profile.whatsapp_number, slug, price: service.price ?? null, duration: service.duration ?? null } });
    } catch (e) {
      console.error('Erro ao criar agendamento:', e);
      toast({ title: 'Erro ao concluir agendamento', description: e instanceof Error ? e.message : 'Tente novamente.', variant: 'destructive' });
    } finally { setSubmitting(false); }
  };

  if (loading) return <div className="min-h-screen bg-gradient-to-br from-kendrah-purple to-kendrah-black flex items-center justify-center"><span className="text-white text-xl">Carregando agendamento...</span></div>;
  if (notFound) return <div className="min-h-screen bg-gradient-to-br from-kendrah-purple to-kendrah-black flex items-center justify-center px-4"><Card><CardContent className="p-8 text-center"><h1 className="text-2xl font-bold mb-3">Link não encontrado</h1><p className="text-muted-foreground">Este link de agendamento não está disponível.</p></CardContent></Card></div>;

  return <div className="min-h-screen bg-gradient-to-br from-kendrah-purple to-kendrah-black py-6 sm:py-10">
    <div className="mx-auto max-w-3xl px-4">
      <header className="text-center mb-6 sm:mb-8">
        {logoUrl ? <img src={logoUrl} alt={profile?.business_name || 'Logo'} onError={() => setLogoUrl(null)} className="mx-auto mb-4 h-20 w-20 rounded-full object-cover bg-white shadow-lg" /> : <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-white text-kendrah-purple text-2xl font-bold shadow-lg">{(profile?.business_name || 'K').charAt(0).toUpperCase()}</div>}
        <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2">{profile?.business_name || 'Agendamento Online'}</h1>
        <p className="text-gray-200">Escolha o serviço, profissional, data e horário.</p>
        {profile?.whatsapp_number && <a href={`https://wa.me/${profile.whatsapp_number.replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer" className="mt-3 inline-flex items-center gap-2 text-green-400 hover:text-green-300 text-sm"><MessageSquare className="h-4 w-4" />Falar pelo WhatsApp</a>}
      </header>

      <Card className="shadow-xl">
        <CardHeader><CardTitle className="text-xl sm:text-2xl text-center">Agende seu horário</CardTitle><div className="flex justify-center gap-2 pt-2 text-xs text-muted-foreground"><span className="flex items-center gap-1"><CheckCircle2 className="h-4 w-4 text-kendrah-purple" />1. Escolha</span><span>•</span><span>2. Dados</span><span>•</span><span>3. Confirme</span></div></CardHeader>
        <CardContent>
          <form onSubmit={submit} className="space-y-6">
            <div className="space-y-2"><Label>Serviço *</Label><Select value={serviceId} onValueChange={v => { setServiceId(v); setProfessionalId(''); setDate(''); setTime(''); }}><SelectTrigger><SelectValue placeholder="Selecione um serviço" /></SelectTrigger><SelectContent>{services.map(s => <SelectItem key={s.id} value={s.id}>{s.name} — {s.duration} min{ s.price != null ? ` — R$ ${Number(s.price).toFixed(2).replace('.', ',')}` : ''}</SelectItem>)}</SelectContent></Select></div>
            <div className="space-y-2"><Label className="flex items-center gap-2"><UserRound className="h-4 w-4" />Profissional *</Label><Select value={professionalId} onValueChange={v => { setProfessionalId(v); setDate(''); setTime(''); }} disabled={!serviceId || professionals.length === 0}><SelectTrigger><SelectValue placeholder={!serviceId ? 'Primeiro selecione um serviço' : 'Selecione o profissional'} /></SelectTrigger><SelectContent>{professionals.map(p => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}</SelectContent></Select></div>
            <div className="space-y-2"><Label className="flex items-center gap-2"><CalendarDays className="h-4 w-4" />Data *</Label><Select value={date} onValueChange={v => { setDate(v); setTime(''); }} disabled={!professionalId}><SelectTrigger><SelectValue placeholder={!professionalId ? 'Primeiro selecione o profissional' : 'Selecione uma data'} /></SelectTrigger><SelectContent>{availableDates.map(d => <SelectItem key={d.value} value={d.value}>{d.label}</SelectItem>)}</SelectContent></Select>{availability.length === 0 && <p className="text-sm text-destructive">O prestador ainda não configurou horários.</p>}</div>
            <div className="space-y-2"><Label className="flex items-center gap-2"><Clock3 className="h-4 w-4" />Horário *</Label><Select value={time} onValueChange={setTime} disabled={!date || !serviceId || !professionalId || loadingTimes || timesError}><SelectTrigger><SelectValue placeholder={loadingTimes ? 'Verificando horários...' : timesError ? 'Erro ao verificar horários' : 'Selecione um horário'} /></SelectTrigger><SelectContent>{timeOptions.map(t => <SelectItem key={t.time} value={t.time} disabled={t.booked}>{t.time}{t.booked ? ' — Indisponível' : ' — Disponível'}</SelectItem>)}</SelectContent></Select>{date && !loadingTimes && !timesError && timeOptions.length === 0 && <p className="text-sm text-muted-foreground">Não há horários disponíveis nesta data.</p>}</div>

            <div className="border-t pt-6 space-y-4"><div><h2 className="font-semibold text-lg">Seus dados</h2><p className="text-sm text-muted-foreground">Preencha os dados para confirmar seu agendamento.</p></div><div className="space-y-2"><Label>Nome completo *</Label><Input value={name} onChange={e => setName(e.target.value)} placeholder="Seu nome completo" autoComplete="name" /></div><div className="grid grid-cols-1 sm:grid-cols-2 gap-4"><div className="space-y-2"><Label>E-mail *</Label><Input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="seuemail@exemplo.com" autoComplete="email" /></div><div className="space-y-2"><Label>WhatsApp *</Label><Input value={phone} onChange={e => setPhone(e.target.value)} placeholder="(11) 99999-9999" autoComplete="tel" /></div></div><div className="space-y-2"><Label>Observações</Label><Textarea value={notes} onChange={e => setNotes(e.target.value)} placeholder="Alguma observação? (opcional)" rows={3} /></div></div>

            {serviceId && professionalId && date && time && <div className="rounded-xl border border-kendrah-purple/20 bg-kendrah-purple/5 p-4 space-y-1 text-sm"><p className="font-semibold mb-2">Resumo do agendamento</p><p><strong>Serviço:</strong> {services.find(s => s.id === serviceId)?.name}</p><p><strong>Profissional:</strong> {professionals.find(p => p.id === professionalId)?.name}</p><p><strong>Data:</strong> {format(new Date(`${date}T12:00:00`), 'dd/MM/yyyy')}</p><p><strong>Horário:</strong> {time}</p></div>}
            <Button type="submit" className="w-full h-12 bg-kendrah-purple hover:bg-kendrah-purple/90" disabled={submitting || loadingTimes || timesError}>{submitting ? 'Confirmando agendamento...' : 'Confirmar agendamento'}</Button>
          </form>
        </CardContent>
      </Card>
      <p className="text-center text-xs text-gray-300 mt-5">Agendamento online • KENDRAH</p>
    </div>
  </div>;
};

export default BookingSlugPage;
