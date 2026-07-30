
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Calendar, Clock, User, Mail, Phone, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Profile, Service, Appointment } from '@/types';
import { format, addDays, startOfDay, isBefore, isToday } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { z } from 'zod';

const bookingSchema = z.object({
  service: z.string().uuid({ message: "Selecione um serviço." }),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, { message: "Selecione uma data." }),
  time: z.string().regex(/^\d{2}:\d{2}$/, { message: "Selecione um horário." }),
  name: z.string().trim().min(2, { message: "Informe seu nome completo." }).max(100, { message: "Nome muito longo (máx. 100 caracteres)." }),
  email: z.string().trim().email({ message: "Informe um e-mail válido." }).max(255, { message: "E-mail muito longo." }),
  phone: z.string().trim().min(8, { message: "Informe um telefone válido." }).max(20, { message: "Telefone muito longo." })
    .refine((v) => {
      const digits = v.replace(/\D/g, '').length;
      return digits >= 8 && digits <= 15;
    }, { message: "Informe um telefone válido." }),
  notes: z.string().trim().max(1000, { message: "Observações muito longas (máx. 1000 caracteres)." }).optional(),
});

const BookingSlugPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  
  const [profile, setProfile] = useState<Profile | null>(null);
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [notFound, setNotFound] = useState(false);
  
  // Form state
  const [selectedService, setSelectedService] = useState<string>('');
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [notes, setNotes] = useState('');

  // Available times (simplified - in a real app you'd fetch from availability_slots)
  const allTimes = [
    '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
    '14:00', '14:30', '15:00', '15:30', '16:00', '16:30', '17:00'
  ];

  // Hide times already in the past when booking for today
  const availableTimes = allTimes.filter((time) => {
    if (!selectedDate) return true;
    return new Date(`${selectedDate}T${time}:00`).getTime() > Date.now();
  });

  // Generate next 30 days
  const availableDates = Array.from({ length: 30 }, (_, i) => {
    const date = addDays(startOfDay(new Date()), i);
    return {
      value: format(date, 'yyyy-MM-dd'),
      label: format(date, "EEEE, dd 'de' MMMM", { locale: ptBR }),
      date
    };
  }).filter(({ date }) => !isBefore(date, startOfDay(new Date())));

  useEffect(() => {
    if (slug) {
      fetchProfileAndServices();
    }
  }, [slug]);

  const fetchProfileAndServices = async () => {
    try {
      setLoading(true);
      
      // Fetch profile by slug
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('slug', slug)
        .single();

      if (profileError || !profileData) {
        setNotFound(true);
        return;
      }

      setProfile(profileData);

      // Fetch services for this profile
      const { data: servicesData, error: servicesError } = await supabase
        .from('services')
        .select('*')
        .eq('user_id', profileData.id)
        .order('name');

      if (servicesError) {
        console.error('Error fetching services:', servicesError);
        return;
      }

      setServices(servicesData || []);
    } catch (error) {
      console.error('Error:', error);
      setNotFound(true);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const parsed = bookingSchema.safeParse({
      service: selectedService,
      date: selectedDate,
      time: selectedTime,
      name: customerName,
      email: customerEmail,
      phone: customerPhone,
      notes,
    });

    if (!parsed.success) {
      toast({
        title: "Verifique os dados",
        description: parsed.error.issues[0].message,
        variant: "destructive",
      });
      return;
    }

    const startDateTime = new Date(`${parsed.data.date}T${parsed.data.time}:00`);
    if (startDateTime.getTime() <= Date.now()) {
      toast({
        title: "Horário inválido",
        description: "Escolha um horário no futuro.",
        variant: "destructive",
      });
      return;
    }

    setSubmitting(true);

    try {
      const selectedServiceData = services.find(s => s.id === selectedService);
      if (!selectedServiceData || !profile) return;

      const endDateTime = new Date(startDateTime.getTime() + selectedServiceData.duration * 60000);

      const appointmentData: Omit<Appointment, 'id' | 'created_at'> = {
        service_id: selectedService,
        service_name: selectedServiceData.name,
        customer_name: parsed.data.name,
        customer_email: parsed.data.email,
        customer_phone: parsed.data.phone,

        start_time: startDateTime.toISOString(),
        end_time: endDateTime.toISOString(),
        status: 'pending',
        notes: parsed.data.notes || undefined,
        user_id: profile.id,
      };

      const { error } = await supabase
        .from('appointments')
        .insert([appointmentData]);

      if (error) {
        throw error;
      }

      toast({
        title: "Agendamento confirmado!",
        description: "Seu agendamento foi realizado com sucesso. Você receberá uma confirmação em breve.",
      });

      // Reset form
      setSelectedService('');
      setSelectedDate('');
      setSelectedTime('');
      setCustomerName('');
      setCustomerEmail('');
      setCustomerPhone('');
      setNotes('');

    } catch (error) {
      console.error('Error creating appointment:', error);
      toast({
        title: "Erro",
        description: "Não foi possível realizar o agendamento. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-kendrah-purple to-kendrah-black flex items-center justify-center">
        <div className="text-white text-xl">Carregando...</div>
      </div>
    );
  }

  if (notFound) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-kendrah-purple to-kendrah-black flex items-center justify-center">
        <Card className="max-w-md mx-auto">
          <CardContent className="p-8 text-center">
            <h1 className="text-2xl font-bold mb-4">Link não encontrado</h1>
            <p className="text-gray-600 mb-6">Este link de agendamento não está disponível ou expirou.</p>
            <Button onClick={() => navigate('/')} className="bg-kendrah-purple hover:bg-kendrah-purple/90">
              Voltar ao início
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (services.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-kendrah-purple to-kendrah-black flex items-center justify-center">
        <Card className="max-w-md mx-auto">
          <CardContent className="p-8 text-center">
            <h1 className="text-2xl font-bold mb-4">{profile?.business_name}</h1>
            <p className="text-gray-600 mb-6">Nenhum serviço foi configurado ainda para este profissional.</p>
            <Button onClick={() => navigate('/')} className="bg-kendrah-purple hover:bg-kendrah-purple/90">
              Voltar ao início
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-kendrah-purple to-kendrah-black">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">
            {profile?.business_name || 'Agendamento Online'}
          </h1>
          <p className="text-gray-200">Escolha um serviço e agende seu horário</p>
          {profile?.whatsapp_number && (
            <div className="mt-4">
              <a
                href={`https://wa.me/${profile.whatsapp_number}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-green-400 hover:text-green-300"
              >
                <MessageSquare className="h-4 w-4" />
                WhatsApp: {profile.whatsapp_number}
              </a>
            </div>
          )}
        </div>

        {/* Booking Form */}
        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle className="text-2xl text-center">Novo Agendamento</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Service Selection */}
              <div className="space-y-2">
                <Label htmlFor="service">Serviço *</Label>
                <Select value={selectedService} onValueChange={setSelectedService}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um serviço" />
                  </SelectTrigger>
                  <SelectContent>
                    {services.map((service) => (
                      <SelectItem key={service.id} value={service.id}>
                        <div className="flex justify-between items-center w-full">
                          <span>{service.name}</span>
                          <div className="text-sm text-gray-500 ml-4">
                            {service.duration}min
                            {service.price && ` - R$ ${service.price.toFixed(2)}`}
                          </div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {selectedService && (
                  <div className="text-sm text-gray-600">
                    {services.find(s => s.id === selectedService)?.description}
                  </div>
                )}
              </div>

              {/* Date Selection */}
              <div className="space-y-2">
                <Label htmlFor="date">Data *</Label>
                <Select value={selectedDate} onValueChange={setSelectedDate}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione uma data" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableDates.map((date) => (
                      <SelectItem key={date.value} value={date.value}>
                        {date.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Time Selection */}
              <div className="space-y-2">
                <Label htmlFor="time">Horário *</Label>
                <Select value={selectedTime} onValueChange={setSelectedTime}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um horário" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableTimes.map((time) => (
                      <SelectItem key={time} value={time}>
                        {time}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Customer Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nome completo *</Label>
                  <Input
                    id="name"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="Seu nome completo"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Telefone *</Label>
                  <Input
                    id="phone"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    placeholder="(00) 00000-0000"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">E-mail *</Label>
                <Input
                  id="email"
                  type="email"
                  value={customerEmail}
                  onChange={(e) => setCustomerEmail(e.target.value)}
                  placeholder="seu@email.com"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Observações</Label>
                <Textarea
                  id="notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Alguma observação especial?"
                  rows={3}
                />
              </div>

              <Button
                type="submit"
                className="w-full bg-kendrah-purple hover:bg-kendrah-purple/90"
                disabled={submitting}
              >
                {submitting ? 'Agendando...' : 'Confirmar Agendamento'}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center mt-8 text-white/70">
          <p>Powered by Kendrah</p>
        </div>
      </div>
    </div>
  );
};

export default BookingSlugPage;
