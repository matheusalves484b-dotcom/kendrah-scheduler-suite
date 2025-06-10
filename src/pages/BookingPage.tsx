
import { useState, useEffect } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { toast } from '@/hooks/use-toast';
import { Clock, DollarSign } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

// Mock service data - would be replaced with real API call
const mockServices = [
  {
    id: "1",
    name: "Consulta padrão",
    description: "Sessão de 50 minutos",
    duration: 50,
    price: 120,
    userId: "current-user"
  },
  {
    id: "2", 
    name: "Sessão estendida",
    description: "Sessão de 90 minutos",
    duration: 90,
    price: 200,
    userId: "current-user"
  }
];

// Form validation schema
const bookingFormSchema = z.object({
  name: z.string().min(2, "Nome deve ter ao menos 2 caracteres"),
  email: z.string().email("E-mail inválido"),
  phone: z.string().min(10, "Telefone deve ter ao menos 10 dígitos"),
  date: z.string().min(1, "Selecione uma data"),
  time: z.string().min(1, "Selecione um horário")
});

type BookingFormValues = z.infer<typeof bookingFormSchema>;

const BookingPage = () => {
  const { serviceId } = useParams();
  const [searchParams] = useSearchParams();
  const [service, setService] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Available time slots (mock data)
  const timeSlots = [
    "09:00", "10:00", "11:00", "14:00", "15:00", "16:00", "17:00"
  ];

  // Form setup
  const form = useForm<BookingFormValues>({
    resolver: zodResolver(bookingFormSchema),
    defaultValues: {
      name: searchParams.get('name') || "",
      email: searchParams.get('email') || "",
      phone: searchParams.get('phone') || "",
      date: "",
      time: ""
    }
  });

  useEffect(() => {
    // Fetch service data based on serviceId
    const fetchService = () => {
      const foundService = mockServices.find(s => s.id === serviceId);
      setService(foundService);
      setIsLoading(false);
    };

    fetchService();
  }, [serviceId]);

  const onSubmit = async (values: BookingFormValues) => {
    try {
      // This would be a real API call to create the appointment
      console.log("Creating appointment:", { ...values, serviceId });
      
      toast({
        title: "Agendamento realizado!",
        description: `Seu agendamento para ${service?.name} foi confirmado.`,
      });
      
      // Reset form
      form.reset();
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível realizar o agendamento. Tente novamente.",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <p>Carregando...</p>
        </div>
        <Footer />
      </div>
    );
  }

  if (!service) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Serviço não encontrado</h1>
            <p className="text-gray-600">O serviço que você está procurando não existe ou foi removido.</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="flex-1 py-12">
        <div className="container mx-auto px-6 max-w-2xl">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-kendrah-purple mb-2">
              Agendar {service.name}
            </h1>
            <p className="text-gray-600">
              Preencha os dados abaixo para agendar seu horário
            </p>
          </div>

          {/* Service info card */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>{service.name}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {service.description && (
                  <p className="text-gray-600">{service.description}</p>
                )}
                <div className="flex items-center gap-4 text-sm">
                  <div className="flex items-center">
                    <Clock className="h-4 w-4 mr-1 text-gray-500" />
                    <span>{service.duration} min</span>
                  </div>
                  {service.price && (
                    <div className="flex items-center">
                      <DollarSign className="h-4 w-4 mr-1 text-gray-500" />
                      <span>R$ {service.price}</span>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Booking form */}
          <Card>
            <CardHeader>
              <CardTitle>Dados do agendamento</CardTitle>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nome completo*</FormLabel>
                        <FormControl>
                          <Input placeholder="Seu nome completo" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>E-mail*</FormLabel>
                        <FormControl>
                          <Input type="email" placeholder="seu@email.com" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Telefone*</FormLabel>
                        <FormControl>
                          <Input placeholder="(11) 99999-9999" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="date"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Data*</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="time"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Horário*</FormLabel>
                        <FormControl>
                          <select 
                            {...field} 
                            className="w-full p-2 border border-gray-300 rounded-md"
                          >
                            <option value="">Selecione um horário</option>
                            {timeSlots.map((time) => (
                              <option key={time} value={time}>
                                {time}
                              </option>
                            ))}
                          </select>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button 
                    type="submit"
                    className="w-full bg-kendrah-purple hover:bg-kendrah-purple/90"
                  >
                    Confirmar Agendamento
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default BookingPage;
