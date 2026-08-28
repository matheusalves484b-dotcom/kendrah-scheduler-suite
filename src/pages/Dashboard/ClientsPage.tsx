import { useMemo, useState } from "react";
import { User, Mail, Phone, Search, CalendarDays, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import DashboardLayout from "@/components/Dashboard/DashboardLayout";
import DashboardHeader from "@/components/Dashboard/DashboardHeader";
import NewAppointmentDialog from "@/components/Dashboard/Calendar/NewAppointmentDialog";
import { useAppointments } from "@/hooks/useAppointments";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { toast } from "sonner";

interface DerivedClient {
  key: string;
  name: string;
  email: string;
  phone: string;
  totalAppointments: number;
  lastAppointment: Date;
}

const ClientsPage = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const { appointments, loading } = useAppointments();

  const clients = useMemo<DerivedClient[]>(() => {
    const map = new Map<string, DerivedClient>();

    appointments.forEach((appointment) => {
      const key = (appointment.customer_email || appointment.customer_phone).toLowerCase();
      const start = new Date(appointment.start_time);
      const existing = map.get(key);

      if (existing) {
        existing.totalAppointments += 1;
        if (start > existing.lastAppointment) {
          existing.lastAppointment = start;
          existing.name = appointment.customer_name;
          existing.phone = appointment.customer_phone;
        }
      } else {
        map.set(key, {
          key,
          name: appointment.customer_name,
          email: appointment.customer_email,
          phone: appointment.customer_phone,
          totalAppointments: 1,
          lastAppointment: start,
        });
      }
    });

    return Array.from(map.values()).sort(
      (a, b) => b.lastAppointment.getTime() - a.lastAppointment.getTime()
    );
  }, [appointments]);

  const filteredClients = clients.filter((client) => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (
      client.name.toLowerCase().includes(term) ||
      client.email.toLowerCase().includes(term) ||
      client.phone.includes(searchTerm)
    );
  });

  const openWhatsApp = (phone?: string, name?: string) => {
    const normalized = (phone || "").replace(/\D/g, "");
    if (!normalized) {
      return toast.info(`O cliente ${name || ""} não possui telefone cadastrado.`);
    }
    const number = normalized.startsWith("55") ? normalized : `55${normalized}`;
    const message = encodeURIComponent(
      `Olá, ${name || "tudo bem"}! Aqui é do KENDRAH. Estou entrando em contato sobre o seu agendamento.`
    );
    window.location.href = `https://wa.me/${number}?text=${message}`;
  };

  return (
    <DashboardLayout>
      <div className="container mx-auto px-4 py-6 sm:py-8">
        <DashboardHeader
          title="Clientes"
          subtitle="Todos os clientes que já agendaram com você"
          actionLabel="Novo Agendamento"
          actionPath="#"
          onActionClick={() => setDialogOpen(true)}
        />

        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
          <Input
            className="pl-10"
            placeholder="Buscar cliente por nome, email ou telefone"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-40">
            <p>Carregando clientes...</p>
          </div>
        ) : filteredClients.length === 0 ? (
          <Card>
            <CardContent className="p-6 text-center">
              {searchTerm ? (
                <p className="text-muted-foreground">
                  Nenhum cliente encontrado para &quot;{searchTerm}&quot;.
                  <Button variant="link" onClick={() => setSearchTerm("")}>Limpar busca</Button>
                </p>
              ) : (
                <div className="py-8">
                  <User className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-2">Nenhum cliente ainda</h3>
                  <p className="text-muted-foreground mb-4">
                    Assim que alguém agendar pelo seu link — ou você criar um agendamento — o cliente aparece aqui.
                  </p>
                  <Button
                    className="bg-kendrah-purple hover:bg-kendrah-purple/90"
                    onClick={() => setDialogOpen(true)}
                  >
                    Novo Agendamento
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        ) : (
          <>
            {/* Mobile cards */}
            <div className="space-y-3 md:hidden">
              {filteredClients.map((client) => (
                <Card key={client.key}>
                  <CardContent className="p-4">
                    <div className="font-semibold text-gray-900">{client.name}</div>
                    <div className="mb-3 text-sm text-gray-500">{client.email}</div>
                    <div className="grid grid-cols-2 gap-2 text-sm mb-4">
                      <div>
                        <span className="text-gray-500 block text-xs">Telefone</span>
                        <div className="flex items-center gap-1">
                          <Phone size={14} className="text-muted-foreground" />
                          {client.phone || "—"}
                        </div>
                      </div>
                      <div>
                        <span className="text-gray-500 block text-xs">Agendamentos</span>
                        <div>{client.totalAppointments}</div>
                      </div>
                      <div className="col-span-2">
                        <span className="text-gray-500 block text-xs">Último atendimento</span>
                        <div className="flex items-center gap-1">
                          <CalendarDays size={14} className="text-muted-foreground" />
                          {format(client.lastAppointment, "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                        </div>
                      </div>
                    </div>
                    <Button
                      className="w-full bg-green-600 hover:bg-green-700 text-white"
                      onClick={() => openWhatsApp(client.phone, client.name)}
                    >
                      <MessageCircle className="h-4 w-4 mr-2" /> WhatsApp
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Desktop table */}
            <div className="hidden md:block overflow-x-auto rounded-lg border">
              <table className="w-full min-w-[640px] text-sm">
                <thead className="bg-muted/50">
                  <tr>
                    <th className="py-3 px-4 text-left font-medium">Nome</th>
                    <th className="py-3 px-4 text-left font-medium">Contato</th>
                    <th className="py-3 px-4 text-left font-medium">Agendamentos</th>
                    <th className="py-3 px-4 text-left font-medium">Último atendimento</th>
                    <th className="py-3 px-4 text-left font-medium">WhatsApp</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredClients.map((client) => (
                    <tr key={client.key} className="border-t hover:bg-muted/50">
                      <td className="py-3 px-4 font-medium">{client.name}</td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1 text-muted-foreground">
                          <Mail size={14} /> {client.email}
                        </div>
                        <div className="flex items-center gap-1 text-muted-foreground">
                          <Phone size={14} /> {client.phone}
                        </div>
                      </td>
                      <td className="py-3 px-4">{client.totalAppointments}</td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1">
                          <CalendarDays size={14} className="text-muted-foreground" />
                          {format(client.lastAppointment, "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <Button
                          variant="outline"
                          size="sm"
                          className="border-green-600 text-green-700 hover:bg-green-50"
                          onClick={() => openWhatsApp(client.phone, client.name)}
                        >
                          <MessageCircle className="h-4 w-4 mr-1" /> WhatsApp
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}

        <NewAppointmentDialog open={dialogOpen} onOpenChange={setDialogOpen} />
      </div>
    </DashboardLayout>
  );
};

export default ClientsPage;
