import { useMemo, useState } from 'react';
import { Copy, ExternalLink, Link2 } from 'lucide-react';
import Sidebar from '@/components/Dashboard/Sidebar';
import DashboardHeader from '@/components/Dashboard/DashboardHeader';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useProfile } from '@/hooks/useProfile';
import { toast } from '@/hooks/use-toast';

const PublicBookingPage = () => {
  const { profile, loading } = useProfile();
  const [copied, setCopied] = useState(false);

  const bookingUrl = useMemo(() => {
    if (!profile?.slug || typeof window === 'undefined') return '';
    return `${window.location.origin}/agendar/${profile.slug}`;
  }, [profile?.slug]);

  const handleCopy = async () => {
    if (!bookingUrl) return;
    try {
      await navigator.clipboard.writeText(bookingUrl);
      setCopied(true);
      toast({ title: 'Link copiado!', description: 'Agora você pode compartilhar seu link de agendamento.' });
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      toast({ title: 'Não foi possível copiar', description: 'Selecione e copie o link manualmente.', variant: 'destructive' });
    }
  };

  const handleOpen = () => {
    if (bookingUrl) window.open(bookingUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="flex min-h-screen bg-kendrah-gray/30">
      <Sidebar />
      <div className="flex-1 min-w-0 overflow-auto lg:pl-64 pt-14 lg:pt-0">
        <div className="p-4 sm:p-6 lg:p-8">
          <DashboardHeader
            title="Página de Agendamento"
            subtitle="Compartilhe seu link para que seus clientes possam agendar online"
          />

          <div className="max-w-3xl mx-auto mt-8">
            <Card>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-kendrah-purple/10 text-kendrah-purple">
                    <Link2 className="h-5 w-5" />
                  </div>
                  <div>
                    <CardTitle>Seu link de agendamento</CardTitle>
                    <p className="text-sm text-gray-500 mt-1">Envie este endereço pelo WhatsApp, Instagram ou redes sociais.</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {loading ? (
                  <div className="h-12 rounded-md bg-gray-100 animate-pulse" />
                ) : bookingUrl ? (
                  <>
                    <div className="flex flex-col sm:flex-row gap-2">
                      <div className="flex-1 rounded-md border bg-gray-50 px-4 py-3 text-sm break-all text-gray-700">
                        {bookingUrl}
                      </div>
                      <Button onClick={handleCopy} className="bg-kendrah-purple hover:bg-kendrah-purple/90 sm:min-w-32">
                        <Copy className="h-4 w-4 mr-2" />
                        {copied ? 'Copiado!' : 'Copiar link'}
                      </Button>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3">
                      <Button variant="outline" onClick={handleOpen} className="flex-1">
                        <ExternalLink className="h-4 w-4 mr-2" />
                        Abrir página de agendamento
                      </Button>
                      <Button variant="outline" onClick={handleCopy} className="flex-1">
                        <Link2 className="h-4 w-4 mr-2" />
                        Compartilhar link
                      </Button>
                    </div>

                    <div className="rounded-lg bg-kendrah-purple/5 border border-kendrah-purple/10 p-4">
                      <p className="font-medium text-gray-800">Como funciona?</p>
                      <p className="text-sm text-gray-600 mt-1">
                        Seus clientes acessam esse link, escolhem um serviço, uma data e um horário e preenchem os dados para confirmar o agendamento.
                      </p>
                    </div>
                  </>
                ) : (
                  <div className="rounded-lg border border-amber-200 bg-amber-50 p-5">
                    <p className="font-medium text-amber-900">Seu link ainda não está disponível.</p>
                    <p className="text-sm text-amber-800 mt-1">
                      Complete seu perfil para que o Kendrah possa gerar seu link personalizado.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PublicBookingPage;
