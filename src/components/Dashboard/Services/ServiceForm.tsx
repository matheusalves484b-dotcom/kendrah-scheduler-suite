
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { DialogFooter } from "@/components/ui/dialog";
import { UseFormReturn } from "react-hook-form";
import * as z from "zod";

export const serviceFormSchema = z.object({
  name: z.string().min(3, "Nome deve ter ao menos 3 caracteres"),
  description: z.string().optional(),
  duration: z.coerce.number().min(5, "Duração mínima de 5 minutos"),
  price: z.coerce.number().min(0, "Preço não pode ser negativo")
});

export type ServiceFormValues = z.infer<typeof serviceFormSchema>;

interface ServiceFormProps {
  form: UseFormReturn<ServiceFormValues>;
  onSubmit: (values: ServiceFormValues) => void;
  onCancel: () => void;
  isLoading: boolean;
  isEditing: boolean;
}

const ServiceForm = ({ form, onSubmit, onCancel, isLoading, isEditing }: ServiceFormProps) => {
  return (
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
            onClick={onCancel}
            disabled={isLoading}
          >
            Cancelar
          </Button>
          <Button 
            type="submit"
            className="bg-kendrah-purple hover:bg-kendrah-purple/90"
            disabled={isLoading}
          >
            {isLoading ? "Salvando..." : (isEditing ? "Atualizar" : "Criar serviço")}
          </Button>
        </DialogFooter>
      </form>
    </Form>
  );
};

export default ServiceForm;
