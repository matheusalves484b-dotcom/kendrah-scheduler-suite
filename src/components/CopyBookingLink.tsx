
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Copy, Check, ExternalLink } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface CopyBookingLinkProps {
  userId: string;
}

const CopyBookingLink = ({ userId }: CopyBookingLinkProps) => {
  const [copied, setCopied] = useState(false);
  const [slug, setSlug] = useState<string>('');
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    fetchUserSlug();
  }, [userId]);

  const fetchUserSlug = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('slug')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Error fetching user slug:', error);
        return;
      }

      if (data?.slug) {
        setSlug(data.slug);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };
  
  // Generate the booking link
  const bookingLink = slug ? `${window.location.origin}/agendar/${slug}` : '';
  
  const copyToClipboard = async () => {
    if (!bookingLink) return;
    
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
    if (bookingLink) {
      window.open(bookingLink, '_blank');
    }
  };

  if (loading) {
    return <div className="text-sm text-gray-500">Carregando...</div>;
  }

  if (!slug) {
    return <div className="text-sm text-gray-500">Slug não configurado</div>;
  }

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

      <div className="text-xs text-gray-500 max-w-xs truncate">
        {bookingLink}
      </div>
    </div>
  );
};

export default CopyBookingLink;
