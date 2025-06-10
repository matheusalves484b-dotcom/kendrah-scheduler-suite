
import { Edit, Trash2, Clock, DollarSign } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import CopyBookingLink from "@/components/CopyBookingLink";
import { Service } from "@/types";

interface ServiceCardProps {
  service: Service;
  onEdit: (service: Service) => void;
  onDelete: (serviceId: string) => void;
}

const ServiceCard = ({ service, onEdit, onDelete }: ServiceCardProps) => {
  const handleDelete = () => {
    if (confirm("Tem certeza que deseja excluir este serviço?")) {
      onDelete(service.id);
    }
  };

  return (
    <Card className="overflow-hidden hover:shadow-md transition-shadow">
      <CardContent className="p-6">
        <div className="flex justify-between items-start mb-4">
          <h3 className="font-medium text-lg">{service.name}</h3>
          <div className="flex space-x-2">
            <Button
              size="icon"
              variant="ghost"
              className="h-8 w-8"
              onClick={() => onEdit(service)}
            >
              <Edit className="h-4 w-4" />
              <span className="sr-only">Editar</span>
            </Button>
            <Button
              size="icon"
              variant="ghost"
              className="h-8 w-8 hover:text-red-500"
              onClick={handleDelete}
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
  );
};

export default ServiceCard;
