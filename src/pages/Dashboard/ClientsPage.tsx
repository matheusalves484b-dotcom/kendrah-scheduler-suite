
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Edit, Trash2, User, Mail, Phone, Search } from "lucide-react";
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

// Client interface
interface Client {
  id: string;
  name: string;
  email: string;
  phone: string;
  userId: string;
  createdAt: Date;
}

// Mock clients for demonstration - would be replaced with real API calls
const mockClients: Client[] = [
  {
    id: "1",
    name: "Maria Silva",
    email: "maria@example.com",
    phone: "11 98765-4321",
    userId: "current-user",
    createdAt: new Date("2023-01-15")
  },
  {
    id: "2",
    name: "João Santos",
    email: "joao@example.com",
    phone: "11 91234-5678",
    userId: "current-user",
    createdAt: new Date("2023-02-20")
  }
];

// Form validation schema
const clientFormSchema = z.object({
  name: z.string().min(3, "Nome deve ter ao menos 3 caracteres"),
  email: z.string().email("E-mail inválido"),
  phone: z.string().min(8, "Telefone deve ter ao menos 8 dígitos")
});

type ClientFormValues = z.infer<typeof clientFormSchema>;

const ClientsPage = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const queryClient = useQueryClient();

  // Form setup
  const form = useForm<ClientFormValues>({
    resolver: zodResolver(clientFormSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: ""
    }
  });

  // Fetch clients
  const { data: clients = [], isLoading } = useQuery({
    queryKey: ["clients"],
    queryFn: async () => {
      // This would be a real API call
      console.log("Fetching clients...");
      return mockClients;
    }
  });

  // Filtered clients
  const filteredClients = clients.filter(client => {
    if (!searchTerm) return true;
    
    const searchLower = searchTerm.toLowerCase();
    return (
      client.name.toLowerCase().includes(searchLower) || 
      client.email.toLowerCase().includes(searchLower) ||
      client.phone.includes(searchTerm)
    );
  });

  // Create or update client mutation
  const mutation = useMutation({
    mutationFn: async (values: ClientFormValues) => {
      // This would be a real API call
      console.log("Saving client:", values);
      
      // Simulate API call
      return new Promise<Client>((resolve) => {
        setTimeout(() => {
          if (editingClient) {
            resolve({
              ...editingClient,
              ...values
            });
          } else {
            resolve({
              id: `${Date.now()}`,
              userId: "current-user",
              createdAt: new Date(),
              ...values
            });
          }
        }, 500);
      });
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["clients"] });
      toast({
        title: editingClient ? "Cliente atualizado" : "Cliente adicionado",
        description: `${data.name} foi ${editingClient ? "atualizado" : "adicionado"} com sucesso.`,
      });
      closeDialog();
    },
    onError: (error) => {
      toast({
        title: "Erro",
        description: `Não foi possível ${editingClient ? "atualizar" : "adicionar"} o cliente.`,
        variant: "destructive",
      });
      console.error(error);
    }
  });

  // Delete client mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      // This would be a real API call
      console.log(`Deleting client with ID: ${id}`);
      
      // Simulate API call
      return new Promise<void>((resolve) => {
        setTimeout(() => {
          resolve();
        }, 500);
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["clients"] });
      toast({
        title: "Cliente removido",
        description: "O cliente foi removido com sucesso.",
      });
    },
    onError: (error) => {
      toast({
        title: "Erro",
        description: "Não foi possível remover o cliente.",
        variant: "destructive",
      });
      console.error(error);
    }
  });

  const openDialog = (client?: Client) => {
    if (client) {
      setEditingClient(client);
      form.reset({
        name: client.name,
        email: client.email,
        phone: client.phone
      });
    } else {
      setEditingClient(null);
      form.reset({
        name: "",
        email: "",
        phone: ""
      });
    }
    setIsDialogOpen(true);
  };

  const closeDialog = () => {
    setIsDialogOpen(false);
    setEditingClient(null);
    form.reset();
  };

  const onSubmit = (values: ClientFormValues) => {
    mutation.mutate(values);
  };

  const handleDelete = (clientId: string) => {
    if (confirm("Tem certeza que deseja remover este cliente?")) {
      deleteMutation.mutate(clientId);
    }
  };

  return (
    <DashboardLayout>
      <div className="container mx-auto py-8">
        <DashboardHeader
          title="Clientes"
          subtitle="Gerencie seus clientes e seus contatos"
          actionLabel="Novo Cliente"
          actionPath="#"
          onActionClick={() => openDialog()}
        />

        {/* Search bar */}
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
          <Input
            className="pl-10"
            placeholder="Buscar cliente por nome, email ou telefone"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center h-40">
            <p>Carregando clientes...</p>
          </div>
        ) : filteredClients.length === 0 ? (
          <Card>
            <CardContent className="p-6 text-center">
              {searchTerm ? (
                <p className="text-muted-foreground">
                  Nenhum cliente encontrado para "{searchTerm}". 
                  <Button variant="link" onClick={() => setSearchTerm("")}>Limpar busca</Button>
                </p>
              ) : (
                <div className="py-8">
                  <User className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-2">Nenhum cliente cadastrado</h3>
                  <p className="text-muted-foreground mb-4">
                    Adicione seu primeiro cliente para começar a agendar atendimentos.
                  </p>
                  <Button 
                    className="bg-kendrah-purple hover:bg-kendrah-purple/90"
                    onClick={() => openDialog()}
                  >
                    <Plus className="mr-2" size={16} />
                    Novo Cliente
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="overflow-hidden rounded-lg border">
            <table className="w-full text-sm">
              <thead className="bg-muted/50">
                <tr>
                  <th className="py-3 px-4 text-left font-medium">Nome</th>
                  <th className="py-3 px-4 text-left font-medium hidden sm:table-cell">Email</th>
                  <th className="py-3 px-4 text-left font-medium">Telefone</th>
                  <th className="py-3 px-4 text-right font-medium">Ações</th>
                </tr>
              </thead>
              <tbody>
                {filteredClients.map((client) => (
                  <tr key={client.id} className="border-t hover:bg-muted/50">
                    <td className="py-3 px-4">{client.name}</td>
                    <td className="py-3 px-4 hidden sm:table-cell">{client.email}</td>
                    <td className="py-3 px-4">{client.phone}</td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex justify-end gap-2">
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => openDialog(client)}
                        >
                          <Edit size={16} />
                          <span className="sr-only">Editar</span>
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon"
                          className="hover:text-red-500"
                          onClick={() => handleDelete(client.id)}
                        >
                          <Trash2 size={16} />
                          <span className="sr-only">Excluir</span>
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Client dialog */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>
                {editingClient ? "Editar Cliente" : "Novo Cliente"}
              </DialogTitle>
            </DialogHeader>

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nome completo*</FormLabel>
                      <FormControl>
                        <Input placeholder="Nome do cliente" {...field} />
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
                        <Input 
                          type="email" 
                          placeholder="email@exemplo.com" 
                          {...field} 
                        />
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
                      <FormLabel>Telefone (WhatsApp)*</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="(00) 00000-0000"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

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
                    {mutation.isPending ? "Salvando..." : (editingClient ? "Atualizar" : "Adicionar cliente")}
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

export default ClientsPage;
