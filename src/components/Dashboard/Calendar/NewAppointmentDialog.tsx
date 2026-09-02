import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { toast } from '@/hooks/use-toast';
import { Service } from '@/types';
import { getWorkspaceOwnerId } from '@/hooks/useWorkspace';

interface NewAppointmentDialogProps { open: boolean; onOpenChange: (open: boolean) => void; onCreated?: () => void; }

const NewAppointmentDialog = ({ open, onOpenChange, onCreated }: NewAppointmentDialogProps) => {
  const [services, setServices] = useState<Service[]>([]);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ serviceId: '', name: '', email: '', phone: '', date: '', time: '', notes: '' });

  useEffect(() => {
    if (!open) return;
    const loadServices = async () => {
      const ownerId = await getWorkspaceOwnerId();
      if (!ownerId) return;
      const { data } = await supabase.from('services').select('*').eq('user_id', ownerId).order('name');
      setServices((data || []) as Service[]);
    };
    loadServices();
  }, [open]);

  const handleChange = (field: string, value: string) => setForm((prev) => ({ ...prev, [field]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const service = services.find((s) => s.id === form.serviceId);
    if (!service) { toast({ title: 'Selecione um serviço', variant: 'destructive' }); return; }
    if (!form.name.trim() || !form.email.trim() || !form.phone.trim() || !form.date || !form.time) { toast({ title: 'Preencha todos os campos obrigatórios', variant: 'destructive' }); return; }
    setSaving(true);
    try {
      const ownerId = await getWorkspaceOwnerId();
      if (!ownerId) throw new Error('Sessão expirada. Faça login novamente.');
      const start = new Date(`${form.date}T${form.time}:00`);
      const end = new Date(start.getTime() + service.duration * 60000);
      const { error } = await supabase.from('appointments').insert({ user_id: ownerId, service_id: service.id, service_name: service.name, customer_name: form.name.trim(), customer_email: form.email.trim(), customer_phone: form.phone.trim(), start_time: start.toISOString(), end_time: end.toISOString(), status: 'confirmed', notes: form.notes.trim() || null });
      if (error) {
        if (error.message.includes('APPOINTMENT_CONFLICT')) { toast({ title: 'Horário ocupado', description: 'Já existe um agendamento nesse horário. Escolha outro.', variant: 'destructive' }); return; }
        throw error;
      }
      toast({ title: 'Agendamento criado', description: `${form.name} foi agendado com sucesso.` });
      setForm({ serviceId: '', name: '', email: '', phone: '', date: '', time: '', notes: '' });
      onCreated?.(); onOpenChange(false);
    } catch (err: any) {
      toast({ title: 'Erro ao criar agendamento', description: err.message || 'Tente novamente.', variant: 'destructive' });
    } finally { setSaving(false); }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[520px] max-h-[90vh] overflow-y-auto">
        <DialogHeader><DialogTitle>Novo Agendamento</DialogTitle><DialogDescription>Crie um agendamento manualmente para o seu cliente.</DialogDescription></DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2"><Label htmlFor="service">Serviço*</Label><select id="service" className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm" value={form.serviceId} onChange={(e) => handleChange('serviceId', e.target.value)}><option value="">Selecione um serviço</option>{services.map((s) => <option key={s.id} value={s.id}>{s.name} ({s.duration} min)</option>)}</select>{services.length === 0 && <p className="text-xs text-muted-foreground">Cadastre um serviço antes de criar agendamentos.</p>}</div>
          <div className="space-y-2"><Label htmlFor="name">Nome do cliente*</Label><Input id="name" value={form.name} onChange={(e) => handleChange('name', e.target.value)} placeholder="Nome completo" /></div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4"><div className="space-y-2"><Label htmlFor="email">E-mail*</Label><Input id="email" type="email" value={form.email} onChange={(e) => handleChange('email', e.target.value)} placeholder="cliente@email.com" /></div><div className="space-y-2"><Label htmlFor="phone">WhatsApp*</Label><Input id="phone" value={form.phone} onChange={(e) => handleChange('phone', e.target.value)} placeholder="(11) 99999-9999" /></div></div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4"><div className="space-y-2"><Label htmlFor="date">Data*</Label><Input id="date" type="date" value={form.date} onChange={(e) => handleChange('date', e.target.value)} /></div><div className="space-y-2"><Label htmlFor="time">Horário*</Label><Input id="time" type="time" value={form.time} onChange={(e) => handleChange('time', e.target.value)} /></div></div>
          <div className="space-y-2"><Label htmlFor="notes">Observações</Label><Textarea id="notes" value={form.notes} onChange={(e) => handleChange('notes', e.target.value)} placeholder="Opcional" rows={3} /></div>
          <DialogFooter className="gap-2"><Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={saving}>Cancelar</Button><Button type="submit" className="bg-kendrah-purple hover:bg-kendrah-purple/90" disabled={saving}>{saving ? 'Salvando...' : 'Criar agendamento'}</Button></DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
export default NewAppointmentDialog;
