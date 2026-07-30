
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { toast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormDescription,
  FormMessage,
} from "@/components/ui/form";
import { User } from "@/types";

// Form validation schema
const profileFormSchema = z.object({
  name: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
  email: z.string().email("Email inválido"),
  phoneNumber: z.string().optional(),
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;

interface ProfileFormProps {
  user: User;
}

const ProfileForm = ({ user }: ProfileFormProps) => {
  // Profile form
  const profileForm = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      name: "",
      email: "",
      phoneNumber: "",
    },
    values: {
      name: user.name,
      email: user.email,
      phoneNumber: user.phoneNumber || "",
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
            ...user,
            ...values,
          });
        }, 600);
      });
    },
    onSuccess: () => {
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
    },
  });

  // Form submission handler
  const onSubmit = (data: ProfileFormValues) => {
    profileMutation.mutate(data);
  };

  return (
    <Form {...profileForm}>
      <form onSubmit={profileForm.handleSubmit(onSubmit)} className="space-y-6">
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
  );
};

export default ProfileForm;
