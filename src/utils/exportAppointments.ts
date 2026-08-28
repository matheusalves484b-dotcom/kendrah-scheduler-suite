import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export type ExportAppointment = {
  customer_name: string;
  customer_email?: string;
  service_name: string;
  start: Date | string;
  end: Date | string;
  status: string;
};

const escapeCsv = (value: string) => `"${String(value ?? '').replace(/"/g, '""')}"`;

export const exportAppointmentsCSV = (appointments: ExportAppointment[]) => {
  const headers = ['Cliente', 'E-mail', 'Serviço', 'Data', 'Horário', 'Status'];
  const rows = appointments.map((a) => [
    a.customer_name,
    a.customer_email ?? '',
    a.service_name,
    format(new Date(a.start), 'dd/MM/yyyy'),
    `${format(new Date(a.start), 'HH:mm')} - ${format(new Date(a.end), 'HH:mm')}`,
    a.status === 'confirmed' ? 'Confirmado' : a.status === 'pending' ? 'Pendente' : a.status === 'cancelled' ? 'Cancelado' : 'Concluído',
  ]);

  const csv = [headers, ...rows].map((row) => row.map(escapeCsv).join(';')).join('\n');
  const blob = new Blob([`\uFEFF${csv}`], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `clientes-${format(new Date(), 'yyyy-MM')}.csv`;
  link.click();
  URL.revokeObjectURL(url);
};

export const exportAppointmentsPDF = (appointments: ExportAppointment[]) => {
  const month = format(new Date(), 'MMMM yyyy', { locale: ptBR });
  const rows = appointments.map((a) => `
    <tr><td>${a.customer_name}</td><td>${a.customer_email ?? ''}</td><td>${a.service_name}</td><td>${format(new Date(a.start), 'dd/MM/yyyy')}</td><td>${format(new Date(a.start), 'HH:mm')} - ${format(new Date(a.end), 'HH:mm')}</td><td>${a.status}</td></tr>
  `).join('');

  const win = window.open('', '_blank', 'width=1000,height=800');
  if (!win) return;
  win.document.write(`<!doctype html><html><head><title>Clientes - ${month}</title><style>body{font-family:Arial,sans-serif;padding:32px;color:#222}h1{margin-bottom:4px}p{color:#666}table{width:100%;border-collapse:collapse;margin-top:24px}th,td{border:1px solid #ddd;padding:9px;text-align:left;font-size:12px}th{background:#f5f5f5}@media print{body{padding:0}}</style></head><body><h1>KENDRAH - Clientes do mês</h1><p>${month} • ${appointments.length} agendamento(s)</p><table><thead><tr><th>Cliente</th><th>E-mail</th><th>Serviço</th><th>Data</th><th>Horário</th><th>Status</th></tr></thead><tbody>${rows}</tbody></table><script>window.onload=()=>window.print();</script></body></html>`);
  win.document.close();
};
