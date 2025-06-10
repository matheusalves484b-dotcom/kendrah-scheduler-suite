
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import ServiceForm, { serviceFormSchema, ServiceFormValues } from "./ServiceForm";
import { Service } from "@/types";

interface ServiceDialogProps {
  isOpen: boolean;
  onClose: () => void;
  editingService: Service | null;
  onSubmit: (values: ServiceFormValues) => void;
  isLoading: boolean;
}

const ServiceDialog = ({ isOpen, onClose, editingService, onSubmit, isLoading }: ServiceDialogProps) => {
  const form = useForm<ServiceFormValues>({
    resolver: zodResolver(serviceFormSchema),
    defaultValues: {
      name: editingService?.name || "",
      description: editingService?.description || "",
      duration: editingService?.duration || 60,
      price: editingService?.price || 0
    }
  });

  const handleClose = () => {
    onClose();
    form.reset();
  };

  const handleSubmit = (values: ServiceFormValues) => {
    onSubmit(values);
  };

  // Reset form when editing service changes
  React.useEffect(() => {
    if (editingService) {
      form.reset({
        name: editingService.name,
        description: editingService.description || "",
        duration: editingService.duration,
        price: editingService.price || 0
      });
    } else {
      form.reset({
        name: "",
        description: "",
        duration: 60,
        price: 0
      });
    }
  }, [editingService, form]);

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {editingService ? "Editar Serviço" : "Novo Serviço"}
          </DialogTitle>
        </DialogHeader>

        <ServiceForm
          form={form}
          onSubmit={handleSubmit}
          onCancel={handleClose}
          isLoading={isLoading}
          isEditing={!!editingService}
        />
      </DialogContent>
    </Dialog>
  );
};

export default ServiceDialog;
