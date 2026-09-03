import { useMemo, useState } from "react";
import { User, Mail, Phone, Search, CalendarDays, MessageCircle, Clock3, DollarSign, History, XCircle, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import DashboardLayout from "@/components/Dashboard/DashboardLayout";
import DashboardHeader from "@/components/Dashboard/DashboardHeader";
import NewAppointmentDialog from "@/components/Dashboard/Calendar/NewAppointmentDialog";
import { useAppointments } from "@/hooks/useAppointments";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { toast } from "sonner";

interface ClientAppointment {
  id: string;
  serviceName: string;
  servicePrice: number;
  start: Date;
  end: Date;
  status: string;
}

interface DerivedClient {
  key: string;
  name: string;
  email: string;
  phone: string;
  totalAppointments: number;
  completedAppointments: number;
  totalSpent: number;
  lastAppointment: Date;
  nextAppointment: Date | null;
  appointments: ClientAppointment[];
}

const getAppointmentPrice = (appointment: any) => {
  const raw = appointment.service_price;
  if (raw !== null && raw !== undefined && raw !== "") {
    const value = Number(raw);
    if (Number.isFinite(value)) return value;
  }
  return 0;
};

const ClientsPage = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState<DerivedClient | null>(null);
  const { appointments, loading } = useAppointments();

  const clients = useMemo<DerivedClient[]>(() => {
    const map = new Map<string, DerivedClient>();
    const now = new Date();

    appointments.forEach((appointment) => {
      const email = (appointment.customer_email || "").trim().toLowerCase();
      const phone = (appointment.customer_phone || "").replace(/\D/g, "");
      const key = email || phone || `${appointment.customer_name}`.trim().toLowerCase();
      if (!key) return;

      const start = new Date(appointment.start_time);
      const price = getAppointmentPrice(appointment);
      const existing = map.get(key);
      const item: ClientAppointment = {
        id: appointment.id,
        serviceName: appointment.service_name,
        servicePrice: price,
        start,
        end: new Date(appointment.end_time),
        status: appointment.status,
      };

      if (existing) {
        existing.totalAppointments += 1;
        existing.appointments.push(item);
        if (appointment.status === "completed") {
          existing.completedAppointments += 1;
          existing.totalSpent += price;
        }
        if (start > existing.lastAppointment) {
          existing.lastAppointment = start;
          existing.name = appointment.customer_name;
          existing.phone = appointment.customer_phone;
          existing.email = appointment.customer_email || existing.email;
        }
        if (appointment.status !== "cancelled" && start >= now && (!existing.nextAppointment || start < existing.nextAppointment)) {
          existing.nextAppointment = start;
        }
      } else {
        map.set(key, {
          key,
          name: appointment.customer_name,
          email: appointment.customer_email || "",
          phone: appointment.customer_phone || "",
          totalAppointments: 1,
          completedAppointments: appointment.status === "completed" ? 1 : 0,
          totalSpent: appointment.status === "completed" ? price : 0,
          lastAppointment: start,
          nextAppointment: appointment.status !== "cancelled" && start >= now ? start : null,
          appointments: [item],
        });
      }
    });

    return Array.from(map.values())
      .map((client) => ({
        ...client,
        appointments: [...client.appointments].sort((a, b) => b.start.getTime() - a.start.getTime()),
      }))
      .sort((a, b) => b.lastAppointment.getTime() - a.lastAppointment.getTime());
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

  const stats = useMemo(() => ({
    total: clients.length,
    appointments: clients.reduce((sum, client) => sum + client.totalAppointments, 0),
    completed: clients.reduce((sum, client) => sum + client.completedAppointments, 0),
    spent: clients.reduce((sum, client) => sum + client.totalSpent, 0),
  }), [clients]);

  const openWhatsApp = (phone?: string, name?: string) => {
    const normalized = (phone || "").replace(/\D/g, "");
    if (!normalized) {
      return toast.info(`O cliente ${name || ""} não possui telefone cadastrado.`);
    }
    const number = normalized.startsWith("55") ? normalized : `55${normalized}`;
    const message = encodeURIComponent(
      `Olá, ${name || "tudo bem"}! Aqui é do KENDRAH. Estou entrando em contato sobre o seu atendimento.`
    );
    window.location.href = `https://wa.me/${number}?text=${message}`;
  };

  const formatCurrency = (value: number) =>
    value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

  return (
    <DashboardLayout>
      <div className="container mx-auto px-4 py-6 sm:py-8">
        <DashboardHeader
          title="Clientes"
          subtitle="Histórico, contatos e relacionamento com seus clientes"
          actionLabel="Novo Agendamento"
          actionPath="#"
          onActionClick={() => setDialogOpen(true)}
        />

        <section className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
          <Card className="rounded-2xl border-border/60 shadow-sm">
            <CardContent className="p-4 sm:p-5">
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-kendrah-purple/10 text-kendrah-purple"><User className="h-5 w-5" /></span>
                <div><p className="text-xs text-muted-foreground">Clientes</p><p className="text-xl font-bold">{stats.total}</p></div>
              </div>
            </CardContent>
          </Card>
          <Card className="rounded-2xl border-border/60 shadow-sm">
            <CardContent className="p-4 sm:p-5">
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-kendrah-purple/10 text-kendrah-purple"><CalendarDays className="h-5 w-5" /></span>
                <div><p className="text-xs text-muted-foreground">Agendamentos</p><p className="text-xl font-bold">{stats.appointments}</p></div>
              </div>
            </CardContent>
          </Card>
          <Card className="rounded-2xl border-border/60 shadow-sm">
            <CardContent className="p-4 sm:p-5">
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-kendrah-purple/10 text-kendrah-purple"><CheckCircle2 className="h-5 w-5" /></span>
                <div><p className="text-xs text-muted-foreground">Concluídos</p><p className="text-xl font-bold">{stats.completed}</p></div>
              </div>
            </CardContent>
          </Card>
          <Card className="rounded-2xl border-border/60 shadow-sm">
            <CardContent className="p-4 sm:p-5">
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-kendrah-purple/10 text-kendrah-purple"><DollarSign className="h-5 w-5" /></span>
                <div><p className="text-xs text-muted-foreground">Total recebido</p><p className="text-lg font-bold sm:text-xl">{formatCurrency(stats.spent)}</p></div>
              </div>
            </CardContent>
          </Card>
        </section>

        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
          <Input
            className="h-11 rounded-xl pl-10"
            placeholder="Buscar por nome, e-mail ou telefone"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {loading ? (
          <div className="flex h-40 items-center justify-center"><p className="text-muted-foreground">Carregando clientes...</p></div>
        ) : filteredClients.length === 0 ? (
          <Card className="rounded-2xl">
            <CardContent className="p-6 text-center">
              {searchTerm ? (
                <p className="text-muted-foreground">Nenhum cliente encontrado para &quot;{searchTerm}&quot;. <Button variant="link" onClick={() => setSearchTerm("")}>Limpar busca</Button></p>
              ) : (
                <div className="py-8">
                  <User className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
                  <h3 className="mb-2 text-lg font-medium">Nenhum cliente ainda</h3>
                  <p className="mb-4 text-muted-foreground">Assim que alguém agendar pelo seu link — ou você criar um agendamento — o cliente aparece aqui.</p>
                  <Button className="bg-kendrah-purple hover:bg-kendrah-purple/90" onClick={() => setDialogOpen(true)}>Novo Agendamento</Button>
                </div>
              )}
            </CardContent>
          </Card>
        ) : (
          <>
            <div className="space-y-3 md:hidden">
              {filteredClients.map((client) => (
                <Card key={client.key} className="rounded-2xl border-border/60 shadow-sm">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="truncate font-semibold text-foreground">{client.name}</div>
                        <div className="truncate text-sm text-muted-foreground">{client.email || "Sem e-mail"}</div>
                      </div>
                      <Button variant="outline" size="sm" className="shrink-0" onClick={() => setSelectedClient(client)}><History className="mr-1.5 h-4 w-4" />Histórico</Button>
                    </div>
                    <div className="my-4 grid grid-cols-2 gap-3 text-sm">
                      <div><span className="block text-xs text-muted-foreground">Telefone</span><div className="mt-1 flex items-center gap-1"><Phone size={14} className="text-muted-foreground" />{client.phone || "—"}</div></div>
                      <div><span className="block text-xs text-muted-foreground">Atendimentos</span><div className="mt-1">{client.totalAppointments}</div></div>
                      <div><span className="block text-xs text-muted-foreground">Total recebido</span><div className="mt-1 font-semibold">{formatCurrency(client.totalSpent)}</div></div>
                      <div><span className="block text-xs text-muted-foreground">Último atendimento</span><div className="mt-1">{format(client.lastAppointment, "dd/MM/yyyy", { locale: ptBR })}</div></div>
                    </div>
                    {client.nextAppointment && <div className="mb-4 flex items-center gap-2 rounded-xl bg-kendrah-purple/5 p-3 text-sm"><Clock3 className="h-4 w-4 text-kendrah-purple" /><span>Próximo: <strong>{format(client.nextAppointment, "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}</strong></span></div>}
                    <Button className="w-full bg-green-600 text-white hover:bg-green-700" onClick={() => openWhatsApp(client.phone, client.name)}><MessageCircle className="mr-2 h-4 w-4" />WhatsApp</Button>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="hidden overflow-x-auto rounded-2xl border md:block">
              <table className="w-full min-w-[900px] text-sm">
                <thead className="bg-muted/50">
                  <tr>
                    <th className="px-4 py-3 text-left font-medium">Cliente</th>
                    <th className="px-4 py-3 text-left font-medium">Contato</th>
                    <th className="px-4 py-3 text-left font-medium">Atendimentos</th>
                    <th className="px-4 py-3 text-left font-medium">Total recebido</th>
                    <th className="px-4 py-3 text-left font-medium">Último atendimento</th>
                    <th className="px-4 py-3 text-left font-medium">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredClients.map((client) => (
                    <tr key={client.key} className="border-t hover:bg-muted/50">
                      <td className="px-4 py-3 font-medium text-foreground">{client.name}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1 text-muted-foreground"><Mail size={14} />{client.email || "—"}</div>
                        <div className="flex items-center gap-1 text-muted-foreground"><Phone size={14} />{client.phone || "—"}</div>
                      </td>
                      <td className="px-4 py-3">{client.totalAppointments}</td>
                      <td className="px-4 py-3 font-semibold">{formatCurrency(client.totalSpent)}</td>
                      <td className="px-4 py-3"><div className="flex items-center gap-1"><CalendarDays size={14} className="text-muted-foreground" />{format(client.lastAppointment, "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}</div></td>
                      <td className="px-4 py-3"><div className="flex gap-2"><Button variant="outline" size="sm" onClick={() => setSelectedClient(client)}><History className="mr-1.5 h-4 w-4" />Histórico</Button><Button variant="outline" size="sm" className="border-green-600 text-green-700 hover:bg-green-50" onClick={() => openWhatsApp(client.phone, client.name)}><MessageCircle className="mr-1 h-4 w-4" />WhatsApp</Button></div></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}

        <Dialog open={!!selectedClient} onOpenChange={(open) => !open && setSelectedClient(null)}>
          <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-2xl">
            {selectedClient && (
              <>
                <DialogHeader>
                  <DialogTitle className="text-xl">Histórico de {selectedClient.name}</DialogTitle>
                </DialogHeader>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                  <Card><CardContent className="p-3"><p className="text-xs text-muted-foreground">Agendamentos</p><p className="text-lg font-bold">{selectedClient.totalAppointments}</p></CardContent></Card>
                  <Card><CardContent className="p-3"><p className="text-xs text-muted-foreground">Concluídos</p><p className="text-lg font-bold">{selectedClient.completedAppointments}</p></CardContent></Card>
                  <Card><CardContent className="p-3"><p className="text-xs text-muted-foreground">Recebido</p><p className="text-lg font-bold">{formatCurrency(selectedClient.totalSpent)}</p></CardContent></Card>
                  <Card><CardContent className="p-3"><p className="text-xs text-muted-foreground">Ticket médio</p><p className="text-lg font-bold">{formatCurrency(selectedClient.completedAppointments ? selectedClient.totalSpent / selectedClient.completedAppointments : 0)}</p></CardContent></Card>
                </div>
                <div className="rounded-xl border p-4">
                  <div className="mb-3 flex flex-wrap gap-x-5 gap-y-2 text-sm text-muted-foreground">
                    {selectedClient.email && <span className="flex items-center gap-1"><Mail className="h-4 w-4" />{selectedClient.email}</span>}
                    {selectedClient.phone && <span className="flex items-center gap-1"><Phone className="h-4 w-4" />{selectedClient.phone}</span>}
                  </div>
                  <div className="space-y-3">
                    {selectedClient.appointments.map((item) => (
                      <div key={item.id} className="flex items-center justify-between gap-3 rounded-xl bg-muted/40 p-3">
                        <div className="min-w-0"><p className="font-semibold">{item.serviceName}</p><p className="text-sm text-muted-foreground">{format(item.start, "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}</p></div>
                        <div className="shrink-0 text-right"><p className="font-semibold">{formatCurrency(item.servicePrice)}</p><p className="text-xs text-muted-foreground">{item.status === "completed" ? "Concluído" : item.status === "cancelled" ? "Cancelado" : item.status === "confirmed" ? "Confirmado" : item.status}</p></div>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="flex flex-col gap-2 sm:flex-row">
                  <Button className="flex-1 bg-green-600 text-white hover:bg-green-700" onClick={() => openWhatsApp(selectedClient.phone, selectedClient.name)}><MessageCircle className="mr-2 h-4 w-4" />Entrar em contato pelo WhatsApp</Button>
                  <Button variant="outline" className="flex-1" onClick={() => { setSelectedClient(null); setDialogOpen(true); }}><CalendarDays className="mr-2 h-4 w-4" />Novo agendamento</Button>
                </div>
              </>
            )}
          </DialogContent>
        </Dialog>

        <NewAppointmentDialog open={dialogOpen} onOpenChange={setDialogOpen} />
      </div>
    </DashboardLayout>
  );
};

export default ClientsPage;
