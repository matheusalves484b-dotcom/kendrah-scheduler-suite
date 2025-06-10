
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "@/hooks/use-toast";
import DashboardLayout from "@/components/Dashboard/DashboardLayout";
import DashboardHeader from "@/components/Dashboard/DashboardHeader";
import ServiceCard from "@/components/Dashboard/Services/ServiceCard";
import AddServiceCard from "@/components/Dashboard/Services/AddServiceCard";
import ServiceDialog from "@/components/Dashboard/Services/ServiceDialog";
import { ServiceFormValues } from "@/components/Dashboard/Services/ServiceForm";
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

const ServicesPage = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const queryClient = useQueryClient();

  // Fetch services
  const { data: services = [], isLoading } = useQuery({
    queryKey: ["services"],
    queryFn: async () => {
      console.log("Fetching services...");
      return mockServices;
    }
  });

  // Create or update service mutation
  const mutation = useMutation({
    mutationFn: async (values: ServiceFormValues) => {
      console.log("Saving service:", values);
      
      return new Promise<Service>((resolve) => {
        setTimeout(() => {
          if (editingService) {
            resolve({
              ...editingService,
              ...values,
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
      console.log(`Deleting service with ID: ${id}`);
      
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
    setEditingService(service || null);
    setIsDialogOpen(true);
  };

  const closeDialog = () => {
    setIsDialogOpen(false);
    setEditingService(null);
  };

  const handleSubmit = (values: ServiceFormValues) => {
    mutation.mutate(values);
  };

  const handleDelete = (serviceId: string) => {
    deleteMutation.mutate(serviceId);
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
            <AddServiceCard onAddService={() => openDialog()} />
            
            {services.map((service) => (
              <ServiceCard
                key={service.id}
                service={service}
                onEdit={openDialog}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}

        <ServiceDialog
          isOpen={isDialogOpen}
          onClose={closeDialog}
          editingService={editingService}
          onSubmit={handleSubmit}
          isLoading={mutation.isPending}
        />
      </div>
    </DashboardLayout>
  );
};

export default ServicesPage;
