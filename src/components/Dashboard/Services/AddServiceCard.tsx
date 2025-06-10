
import { Plus } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface AddServiceCardProps {
  onAddService: () => void;
}

const AddServiceCard = ({ onAddService }: AddServiceCardProps) => {
  return (
    <Card className="border-dashed border-2 cursor-pointer hover:bg-gray-50 transition-colors">
      <CardContent 
        className="p-6 flex flex-col items-center justify-center h-full min-h-[200px]" 
        onClick={onAddService}
      >
        <div className="w-12 h-12 rounded-full bg-kendrah-purple/10 flex items-center justify-center mb-4">
          <Plus className="text-kendrah-purple" />
        </div>
        <h3 className="font-medium text-lg mb-2">Novo Serviço</h3>
        <p className="text-muted-foreground text-sm text-center">
          Clique para cadastrar um novo serviço ou atendimento
        </p>
      </CardContent>
    </Card>
  );
};

export default AddServiceCard;
