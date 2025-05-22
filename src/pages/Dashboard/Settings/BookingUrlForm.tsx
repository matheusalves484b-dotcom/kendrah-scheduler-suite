
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
const publicUrlFormSchema = z.object({
  slug: z
    .string()
    .min(3, "URL deve ter pelo menos 3 caracteres")
    .regex(/^[a-z0-9-]+$/, "URL deve conter apenas letras minúsculas, números e hífens"),
});

type PublicUrlFormValues = z.infer<typeof publicUrlFormSchema>;

interface BookingUrlFormProps {
  user: User;
}

const BookingUrlForm = ({ user }: BookingUrlFormProps) => {
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

  // Update public URL mutation
  const publicUrlMutation = useMutation({
    mutationFn: async (values: PublicUrlFormValues) => {
      // This would be a real API call
      console.log("Updating public URL:", values);
      
      // Simulate API call - ensure slug is always present
      return new Promise<{ slug: string }>((resolve) => {
        setTimeout(() => {
          // Make sure slug is explicitly passed to resolve
          resolve({
            slug: values.slug,
          });
        }, 600);
      });
    },
    onSuccess: () => {
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
    },
  });

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

  // Form submission handler
  const onSubmit = (data: PublicUrlFormValues) => {
    publicUrlMutation.mutate(data);
  };

  return (
    <Form {...publicUrlForm}>
      <form onSubmit={publicUrlForm.handleSubmit(onSubmit)} className="space-y-6">
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
                  <Input {...field} className="rounded-l-none" placeholder="seu-nome" />
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
            <Button type="button" variant="outline" className="ml-2" onClick={copyBookingUrl}>
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
  );
};

export default BookingUrlForm;
