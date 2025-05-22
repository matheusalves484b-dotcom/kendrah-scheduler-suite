
import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { toast } from "@/hooks/use-toast";
import DashboardLayout from "@/components/Dashboard/DashboardLayout";
import DashboardHeader from "@/components/Dashboard/DashboardHeader";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormField, FormItem, FormLabel, FormControl, FormDescription, FormMessage } from "@/components/ui/form";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { User } from "@/types";

// Mock user data
const mockUser: User = {
  id: "1",
  name: "Prestador Demo",
  email: "demo@kendrah.com",
  phoneNumber: "11 98765-4321",
  createdAt: new Date("2023-01-01"),
  trialEndsAt: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000), // 10 days from now
  isSubscribed: false,
  whatsappNumber: "5511987654321"
};

// Form validation schemas
const profileFormSchema = z.object({
  name: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
  email: z.string().email("Email inválido"),
  phoneNumber: z.string().optional()
});

const integrationFormSchema = z.object({
  whatsappNumber: z.string()
    .min(10, "Número de WhatsApp deve ter pelo menos 10 dígitos")
    .optional()
    .or(z.literal(""))
});

const publicUrlFormSchema = z.object({
  slug: z.string().min(3, "URL deve ter pelo menos 3 caracteres")
    .regex(/^[a-z0-9-]+$/, "URL deve conter apenas letras minúsculas, números e hífens")
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;
type IntegrationFormValues = z.infer<typeof integrationFormSchema>;
type PublicUrlFormValues = z.infer<typeof publicUrlFormSchema>;

const SettingsPage = () => {
  const [activeTab, setActiveTab] = useState("profile");
  
  // Query to get user data
  const { data: user, isLoading } = useQuery({
    queryKey: ["userData"],
    queryFn: async () => {
      // This would be a real API call
      console.log("Fetching user data...");
      return mockUser;
    }
  });
  
  // Profile form
  const profileForm = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      name: "",
      email: "",
      phoneNumber: "",
    },
    values: user ? {
      name: user.name,
      email: user.email,
      phoneNumber: user.phoneNumber || "",
    } : undefined,
  });
  
  // Integration form
  const integrationForm = useForm<IntegrationFormValues>({
    resolver: zodResolver(integrationFormSchema),
    defaultValues: {
      whatsappNumber: "",
    },
    values: user ? {
      whatsappNumber: user.whatsappNumber || "",
    } : undefined,
  });
  
  // Public URL form
  const publicUrlForm = useForm<PublicUrlFormValues>({
    resolver: zodResolver(publicUrlFormSchema),
    defaultValues: {
      slug: "",
    },
    values: {
      slug: user?.id ? user.id.toLowerCase() : "",
    },
  });
  
  // Update profile mutation
  const profileMutation = useMutation({
    mutationFn: async (values: ProfileFormValues) => {
      // This would be a real API call
      console.log("Updating profile:", values);
      
      // Simulate API call
      return new Promise<User>((resolve) => {
        setTimeout(() => {
          resolve({
            ...mockUser,
            ...values
          });
        }, 600);
      });
    },
    onSuccess: (data) => {
      toast({
        title: "Perfil atualizado",
        description: "Seus dados foram atualizados com sucesso.",
      });
    },
    onError: (error) => {
      toast({
        title: "Erro",
        description: "Não foi possível atualizar seu perfil.",
        variant: "destructive",
      });
      console.error(error);
    }
  });
  
  // Update integrations mutation
  const integrationMutation = useMutation({
    mutationFn: async (values: IntegrationFormValues) => {
      // This would be a real API call
      console.log("Updating integrations:", values);
      
      // Simulate API call
      return new Promise<User>((resolve) => {
        setTimeout(() => {
          resolve({
            ...mockUser,
            whatsappNumber: values.whatsappNumber || undefined
          });
        }, 600);
      });
    },
    onSuccess: (data) => {
      toast({
        title: "Integrações atualizadas",
        description: "Suas configurações de integração foram atualizadas com sucesso.",
      });
    },
    onError: (error) => {
      toast({
        title: "Erro",
        description: "Não foi possível atualizar suas integrações.",
        variant: "destructive",
      });
      console.error(error);
    }
  });
  
  // Update public URL mutation
  const publicUrlMutation = useMutation({
    mutationFn: async (values: PublicUrlFormValues) => {
      // This would be a real API call
      console.log("Updating public URL:", values);
      
      // Simulate API call - ensure slug is always present
      return new Promise<{slug: string}>((resolve) => {
        setTimeout(() => {
          // Make sure slug is explicitly passed to resolve
          resolve({
            slug: values.slug
          });
        }, 600);
      });
    },
    onSuccess: (data) => {
      toast({
        title: "URL pública atualizada",
        description: "Sua URL de agendamentos foi atualizada com sucesso.",
      });
    },
    onError: (error) => {
      toast({
        title: "Erro",
        description: "Não foi possível atualizar sua URL pública.",
        variant: "destructive",
      });
      console.error(error);
    }
  });
  
  // Form submission handlers
  const onProfileSubmit = (data: ProfileFormValues) => {
    profileMutation.mutate(data);
  };
  
  const onIntegrationSubmit = (data: IntegrationFormValues) => {
    integrationMutation.mutate(data);
  };
  
  const onPublicUrlSubmit = (data: PublicUrlFormValues) => {
    publicUrlMutation.mutate(data);
  };
  
  // Generate booking URL
  const getBookingUrl = () => {
    const slug = publicUrlForm.getValues().slug;
    return `${window.location.origin}/agendar/${slug}`;
  };
  
  // Copy booking URL to clipboard
  const copyBookingUrl = () => {
    const url = getBookingUrl();
    navigator.clipboard.writeText(url);
    toast({
      title: "URL copiada",
      description: "Link de agendamento copiado para a área de transferência.",
    });
  };
  
  return (
    <DashboardLayout>
      <div className="container mx-auto py-8">
        <DashboardHeader
          title="Configurações"
          subtitle="Gerencie suas preferências e notificações"
        />

        {isLoading ? (
          <div className="flex justify-center items-center h-40">
            <p>Carregando configurações...</p>
          </div>
        ) : (
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="mb-6">
              <TabsTrigger value="profile">Perfil</TabsTrigger>
              <TabsTrigger value="integrations">WhatsApp</TabsTrigger>
              <TabsTrigger value="booking">Link de agendamento</TabsTrigger>
            </TabsList>

            {/* Profile tab */}
            <TabsContent value="profile">
              <Card>
                <CardHeader>
                  <CardTitle>Informações do perfil</CardTitle>
                  <CardDescription>
                    Atualize seus dados pessoais e de contato
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Form {...profileForm}>
                    <form onSubmit={profileForm.handleSubmit(onProfileSubmit)} className="space-y-6">
                      <FormField
                        control={profileForm.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Nome completo</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormDescription>
                              Seu nome será exibido para seus clientes
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={profileForm.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>E-mail</FormLabel>
                            <FormControl>
                              <Input type="email" {...field} />
                            </FormControl>
                            <FormDescription>
                              Este e-mail será usado para notificações e login
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={profileForm.control}
                        name="phoneNumber"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Telefone</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder="(00) 00000-0000" />
                            </FormControl>
                            <FormDescription>
                              Seu telefone de contato (opcional)
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div className="flex justify-end">
                        <Button 
                          type="submit"
                          className="bg-kendrah-purple hover:bg-kendrah-purple/90"
                          disabled={profileMutation.isPending}
                        >
                          {profileMutation.isPending ? "Salvando..." : "Salvar alterações"}
                        </Button>
                      </div>
                    </form>
                  </Form>
                </CardContent>
              </Card>
            </TabsContent>

            {/* WhatsApp tab (renamed from Integrations) */}
            <TabsContent value="integrations">
              <Card>
                <CardHeader>
                  <CardTitle>WhatsApp</CardTitle>
                  <CardDescription>
                    Configure suas notificações de WhatsApp
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Form {...integrationForm}>
                    <form onSubmit={integrationForm.handleSubmit(onIntegrationSubmit)} className="space-y-6">
                      <FormField
                        control={integrationForm.control}
                        name="whatsappNumber"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Número do WhatsApp</FormLabel>
                            <FormControl>
                              <Input 
                                {...field} 
                                placeholder="Ex: 5511999999999" 
                              />
                            </FormControl>
                            <FormDescription>
                              Formato internacional com código do país (ex: 5511999999999)
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div className="flex justify-end">
                        <Button 
                          type="submit"
                          className="bg-kendrah-purple hover:bg-kendrah-purple/90"
                          disabled={integrationMutation.isPending}
                        >
                          {integrationMutation.isPending ? "Salvando..." : "Salvar configurações"}
                        </Button>
                      </div>
                    </form>
                  </Form>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Booking URL tab */}
            <TabsContent value="booking">
              <Card>
                <CardHeader>
                  <CardTitle>Link de agendamento</CardTitle>
                  <CardDescription>
                    Personalize e compartilhe seu link de agendamentos online
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Form {...publicUrlForm}>
                    <form onSubmit={publicUrlForm.handleSubmit(onPublicUrlSubmit)} className="space-y-6">
                      <FormField
                        control={publicUrlForm.control}
                        name="slug"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Nome na URL</FormLabel>
                            <FormControl>
                              <div className="flex">
                                <span className="flex items-center px-3 rounded-l-md border border-r-0 bg-muted text-muted-foreground text-sm">
                                  {window.location.origin}/agendar/
                                </span>
                                <Input
                                  {...field}
                                  className="rounded-l-none"
                                  placeholder="seu-nome"
                                />
                              </div>
                            </FormControl>
                            <FormDescription>
                              Use apenas letras minúsculas, números e hífens
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div className="p-4 border rounded-md bg-muted/20">
                        <p className="font-medium mb-2">Seu link de agendamento</p>
                        <div className="flex items-center">
                          <code className="text-xs bg-white px-3 py-2 rounded border flex-1 truncate">
                            {getBookingUrl()}
                          </code>
                          <Button
                            type="button"
                            variant="outline"
                            className="ml-2"
                            onClick={copyBookingUrl}
                          >
                            Copiar
                          </Button>
                        </div>
                        <p className="text-sm text-muted-foreground mt-2">
                          Compartilhe este link com seus clientes para que eles possam agendar serviços com você.
                        </p>
                      </div>

                      <div className="flex justify-end">
                        <Button 
                          type="submit"
                          className="bg-kendrah-purple hover:bg-kendrah-purple/90"
                          disabled={publicUrlMutation.isPending}
                        >
                          {publicUrlMutation.isPending ? "Salvando..." : "Atualizar URL"}
                        </Button>
                      </div>
                    </form>
                  </Form>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        )}
      </div>
    </DashboardLayout>
  );
};

export default SettingsPage;
