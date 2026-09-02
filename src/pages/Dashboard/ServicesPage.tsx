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
import { supabase } from "@/integrations/supabase/client";
import { getWorkspaceOwnerId } from "@/hooks/useWorkspace";

const ServicesPage = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const queryClient = useQueryClient();

  const { data: services = [], isLoading } = useQuery({
    queryKey: ["services"],
    queryFn: async () => {
      const ownerId = await getWorkspaceOwnerId();
      if (!ownerId) throw new Error('Not authenticated');
      const { data, error } = await supabase.from('services').select('*').eq('user_id', ownerId).order('created_at', { ascending: false });
      if (error) throw error;
      return data as Service[];
    }
  });

  const mutation = useMutation({
    mutationFn: async (values: ServiceFormValues) => {
      const ownerId = await getWorkspaceOwnerId();
      if (!ownerId) throw new Error('Not authenticated');
      const serviceData = { name: values.name, description: values.description || null, duration: values.duration, price: values.price || null, user_id: ownerId };
      if (editingService) {
        const { data, error } = await supabase.from('services').update(serviceData).eq('id', editingService.id).select().single();
        if (error) throw error;
        return data as Service;
      }
      const { data, error } = await supabase.from('services').insert([serviceData]).select().single();
      if (error) throw error;
      return data as Service;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["services"] });
      toast({ title: editingService ? "Serviço atualizado" : "Serviço criado", description: `${data.name} foi ${editingService ? "atualizado" : "criado"} com sucesso.` });
      closeDialog();
    },
    onError: (error: any) => {
      toast({ title: "Erro", description: `Não foi possível ${editingService ? "atualizar" : "criar"} o serviço.`, variant: "destructive" });
      console.error(error);
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('services').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["services"] });
      toast({ title: "Serviço excluído", description: "O serviço foi excluído com sucesso." });
    },
    onError: (error: any) => {
      toast({ title: "Erro", description: "Não foi possível excluir o serviço.", variant: "destructive" });
      console.error(error);
    }
  });

  const openDialog = (service?: Service) => { setEditingService(service || null); setIsDialogOpen(true); };
  const closeDialog = () => { setIsDialogOpen(false); setEditingService(null); };

  return (
    <DashboardLayout>
      <div className="container mx-auto px-4 py-6 sm:py-8">
        <DashboardHeader title="Serviços" subtitle="Gerencie os serviços que você oferece aos seus clientes" actionLabel="Novo Serviço" actionPath="#" onActionClick={() => openDialog()} />
        {isLoading ? <div className="flex justify-center items-center h-40"><p>Carregando serviços...</p></div> : <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"><AddServiceCard onAddService={() => openDialog()} />{services.map((service) => <ServiceCard key={service.id} service={service} onEdit={openDialog} onDelete={(id) => deleteMutation.mutate(id)} />)}</div>}
        <ServiceDialog isOpen={isDialogOpen} onClose={closeDialog} editingService={editingService} onSubmit={(values) => mutation.mutate(values)} isLoading={mutation.isPending} />
      </div>
    </DashboardLayout>
  );
};

export default ServicesPage;
