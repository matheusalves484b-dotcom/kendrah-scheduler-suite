
import { useMutation } from "@tanstack/react-query";
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
const integrationFormSchema = z.object({
  whatsappNumber: z
    .string()
    .min(10, "Número de WhatsApp deve ter pelo menos 10 dígitos")
    .optional()
    .or(z.literal("")),
});

type IntegrationFormValues = z.infer<typeof integrationFormSchema>;

interface WhatsAppFormProps {
  user: User;
}

const WhatsAppForm = ({ user }: WhatsAppFormProps) => {
  // Integration form
  const integrationForm = useForm<IntegrationFormValues>({
    resolver: zodResolver(integrationFormSchema),
    defaultValues: {
      whatsappNumber: "",
    },
    values: {
      whatsappNumber: user.whatsappNumber || "",
    },
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
            ...user,
            whatsappNumber: values.whatsappNumber || undefined,
          });
        }, 600);
      });
    },
    onSuccess: () => {
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
    },
  });

  // Form submission handler
  const onSubmit = (data: IntegrationFormValues) => {
    integrationMutation.mutate(data);
  };

  return (
    <Form {...integrationForm}>
      <form onSubmit={integrationForm.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={integrationForm.control}
          name="whatsappNumber"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Número do WhatsApp</FormLabel>
              <FormControl>
                <Input {...field} placeholder="Ex: 5511999999999" />
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
  );
};

export default WhatsAppForm;
