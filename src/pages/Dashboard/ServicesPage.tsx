
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { X, Plus, Edit, Trash2, Clock, DollarSign } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { toast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import DashboardLayout from "@/components/Dashboard/DashboardLayout";
import DashboardHeader from "@/components/Dashboard/DashboardHeader";
import CopyBookingLink from "@/components/CopyBookingLink";
import { Service } from "@/types";

// Mock services for demonstration - would be replaced with real API calls
const mockServices: Service[] = [
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
const serviceFormSchema = z.object({
  name: z.string().min(3, "Nome deve ter ao menos 3 caracteres"),
  description: z.string().optional(),
  duration: z.coerce.number().min(5, "Duração mínima de 5 minutos"),
  price: z.coerce.number().min(0, "Preço não pode ser negativo")
});

type ServiceFormValues = z.infer<typeof serviceFormSchema>;

const ServicesPage = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const queryClient = useQueryClient();

  // Form setup
  const form = useForm<ServiceFormValues>({
    resolver: zodResolver(serviceFormSchema),
    defaultValues: {
      name: "",
      description: "",
      duration: 60,
      price: 0
    }
  });

  // Fetch services
  const { data: services = [], isLoading } = useQuery({
    queryKey: ["services"],
    queryFn: async () => {
      // This would be a real API call
      console.log("Fetching services...");
      return mockServices;
    }
  });

  // Create or update service mutation
  const mutation = useMutation({
    mutationFn: async (values: ServiceFormValues) => {
      // This would be a real API call
      console.log("Saving service:", values);
      
      // Simulate API call
      return new Promise<Service>((resolve) => {
        setTimeout(() => {
          if (editingService) {
            resolve({
              ...editingService,
              ...values,
              // Ensure required fields are present
              name: values.name,
              duration: values.duration
            });
          } else {
            resolve({
              id: `${Date.now()}`,
              userId: "current-user",
              name: values.name,
              description: values.description,
              duration: values.duration,
              price: values.price
            });
          }
        }, 500);
      });
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["services"] });
      toast({
        title: editingService ? "Serviço atualizado" : "Serviço criado",
        description: `${data.name} foi ${editingService ? "atualizado" : "criado"} com sucesso.`,
      });
      closeDialog();
    },
    onError: (error) => {
      toast({
        title: "Erro",
        description: `Não foi possível ${editingService ? "atualizar" : "criar"} o serviço.`,
        variant: "destructive",
      });
      console.error(error);
    }
  });

  // Delete service mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      // This would be a real API call
      console.log(`Deleting service with ID: ${id}`);
      
      // Simulate API call
      return new Promise<void>((resolve) => {
        setTimeout(() => {
          resolve();
        }, 500);
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["services"] });
      toast({
        title: "Serviço excluído",
        description: "O serviço foi excluído com sucesso.",
      });
    },
    onError: (error) => {
      toast({
        title: "Erro",
        description: "Não foi possível excluir o serviço.",
        variant: "destructive",
      });
      console.error(error);
    }
  });

  const openDialog = (service?: Service) => {
    if (service) {
      setEditingService(service);
      form.reset({
        name: service.name,
        description: service.description || "",
        duration: service.duration,
        price: service.price || 0
      });
    } else {
      setEditingService(null);
      form.reset({
        name: "",
        description: "",
        duration: 60,
        price: 0
      });
    }
    setIsDialogOpen(true);
  };

  const closeDialog = () => {
    setIsDialogOpen(false);
    setEditingService(null);
    form.reset();
  };

  const onSubmit = (values: ServiceFormValues) => {
    mutation.mutate(values);
  };

  const handleDelete = (serviceId: string) => {
    if (confirm("Tem certeza que deseja excluir este serviço?")) {
      deleteMutation.mutate(serviceId);
    }
  };

  return (
    <DashboardLayout>
      <div className="container mx-auto py-8">
        <DashboardHeader
          title="Serviços"
          subtitle="Gerencie os serviços que você oferece aos seus clientes"
          actionLabel="Novo Serviço"
          actionPath="#"
          onActionClick={() => openDialog()}
        />

        {isLoading ? (
          <div className="flex justify-center items-center h-40">
            <p>Carregando serviços...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Add service card */}
            <Card className="border-dashed border-2 cursor-pointer hover:bg-gray-50 transition-colors">
              <CardContent className="p-6 flex flex-col items-center justify-center h-full min-h-[200px]" onClick={() => openDialog()}>
                <div className="w-12 h-12 rounded-full bg-kendrah-purple/10 flex items-center justify-center mb-4">
                  <Plus className="text-kendrah-purple" />
                </div>
                <h3 className="font-medium text-lg mb-2">Novo Serviço</h3>
                <p className="text-muted-foreground text-sm text-center">
                  Clique para cadastrar um novo serviço ou atendimento
                </p>
              </CardContent>
            </Card>

            {/* Service cards */}
            {services.map((service) => (
              <Card key={service.id} className="overflow-hidden hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="font-medium text-lg">{service.name}</h3>
                    <div className="flex space-x-2">
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8"
                        onClick={() => openDialog(service)}
                      >
                        <Edit className="h-4 w-4" />
                        <span className="sr-only">Editar</span>
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8 hover:text-red-500"
                        onClick={() => handleDelete(service.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                        <span className="sr-only">Excluir</span>
                      </Button>
                    </div>
                  </div>

                  {service.description && (
                    <p className="text-muted-foreground text-sm mb-4">
                      {service.description}
                    </p>
                  )}

                  <div className="flex items-center gap-4 text-sm mb-4">
                    <div className="flex items-center">
                      <Clock className="h-4 w-4 mr-1 text-muted-foreground" />
                      <span>{service.duration} min</span>
                    </div>
                    {service.price !== undefined && (
                      <div className="flex items-center">
                        <DollarSign className="h-4 w-4 mr-1 text-muted-foreground" />
                        <span>R$ {service.price}</span>
                      </div>
                    )}
                  </div>

                  {/* Booking link section */}
                  <div className="border-t pt-4">
                    <div className="flex flex-col gap-2">
                      <span className="text-xs text-muted-foreground">Link de agendamento:</span>
                      <CopyBookingLink 
                        serviceId={service.id} 
                        serviceName={service.name} 
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Service dialog */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle className="flex items-center">
                {editingService ? "Editar Serviço" : "Novo Serviço"}
              </DialogTitle>
            </DialogHeader>

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nome do serviço*</FormLabel>
                      <FormControl>
                        <Input placeholder="Ex: Consulta padrão" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Descrição (opcional)</FormLabel>
                      <FormControl>
                        <Input placeholder="Ex: Sessão de 50 minutos" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="duration"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Duração (minutos)*</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min={5}
                            step={5}
                            placeholder="60"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="price"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Preço (R$)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min={0}
                            step={0.01}
                            placeholder="0.00"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <DialogFooter className="gap-2 mt-6">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={closeDialog}
                    disabled={mutation.isPending}
                  >
                    Cancelar
                  </Button>
                  <Button 
                    type="submit"
                    className="bg-kendrah-purple hover:bg-kendrah-purple/90"
                    disabled={mutation.isPending}
                  >
                    {mutation.isPending ? "Salvando..." : (editingService ? "Atualizar" : "Criar serviço")}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
};

export default ServicesPage;
