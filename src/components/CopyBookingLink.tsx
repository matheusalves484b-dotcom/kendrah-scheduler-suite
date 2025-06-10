
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Copy, Check, ExternalLink } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface CopyBookingLinkProps {
  serviceId: string;
  serviceName: string;
}

const CopyBookingLink = ({ serviceId, serviceName }: CopyBookingLinkProps) => {
  const [copied, setCopied] = useState(false);
  
  // Generate the booking link
  const bookingLink = `${window.location.origin}/agendar/servico/${serviceId}`;
  
  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(bookingLink);
      setCopied(true);
      toast({
        title: "Link copiado!",
        description: "O link de agendamento foi copiado para a área de transferência.",
      });
      
      // Reset the icon after 2 seconds
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível copiar o link. Tente novamente.",
        variant: "destructive",
      });
    }
  };

  const openPreview = () => {
    window.open(bookingLink, '_blank');
  };

  return (
    <div className="flex items-center gap-2">
      <Button
        size="sm"
        variant="outline"
        onClick={copyToClipboard}
        className="flex items-center gap-2"
      >
        {copied ? (
          <Check className="h-4 w-4 text-green-600" />
        ) : (
          <Copy className="h-4 w-4" />
        )}
        {copied ? "Copiado!" : "Copiar link"}
      </Button>
      
      <Button
        size="sm"
        variant="ghost"
        onClick={openPreview}
        className="flex items-center gap-2"
        title="Visualizar página de agendamento"
      >
        <ExternalLink className="h-4 w-4" />
      </Button>
    </div>
  );
};

export default CopyBookingLink;
