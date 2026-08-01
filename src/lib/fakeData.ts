
import { User, Service, Appointment, TimeSlot } from '../types';
import { addDays, addMinutes, setHours, setMinutes } from 'date-fns';

// Helper function to generate a random ID
const generateId = () => Math.random().toString(36).substring(2, 15);

// Trial end date (7 days from now)
const trialEndDate = addDays(new Date(), 7);

// Mock user data
export const currentUser: User = {
  id: generateId(),
  name: 'João Silva',
  email: 'joao.silva@exemplo.com',
  phoneNumber: '(11) 98765-4321',
  createdAt: new Date(),
  trialEndsAt: trialEndDate,
  isSubscribed: false,
  webhookUrl: 'https://hooks.zapier.com/hooks/catch/123456/abcdef/',
  whatsappNumber: '5511987654321'
};

// Mock services
export const services: Service[] = [
  {
    id: generateId(),
    name: 'Consulta Inicial',
    description: 'Primeira consulta para avaliação e planejamento',
    duration: 60, // 60 minutes
    price: 150,
    user_id: currentUser.id,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: generateId(),
    name: 'Sessão de Acompanhamento',
    description: 'Sessão para acompanhamento e ajustes',
    duration: 45, // 45 minutes
    price: 120,
    user_id: currentUser.id,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: generateId(),
    name: 'Sessão Express',
    description: 'Consulta rápida para dúvidas específicas',
    duration: 30, // 30 minutes
    price: 80,
    user_id: currentUser.id,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
];

// Helper function to create appointment dates
const createAppointmentDate = (dayOffset: number, hour: number, minute: number) => {
  const date = addDays(new Date(), dayOffset);
  return setMinutes(setHours(date, hour), minute);
};

// Mock appointments
export const appointments: Appointment[] = [
  {
    id: generateId(),
    service_id: services[0].id,
    service_name: services[0].name,
    customer_name: 'Maria Oliveira',
    customer_email: 'maria@exemplo.com',
    customer_phone: '(11) 91234-5678',
    start_time: createAppointmentDate(1, 10, 0).toISOString(), // Tomorrow at 10:00
    end_time: createAppointmentDate(1, 11, 0).toISOString(),  // Tomorrow at 11:00
    status: 'confirmed',
    notes: 'Cliente nova, primeira sessão',
    user_id: currentUser.id,
    created_at: new Date().toISOString()
  },
  {
    id: generateId(),
    service_id: services[1].id,
    service_name: services[1].name,
    customer_name: 'Carlos Santos',
    customer_email: 'carlos@exemplo.com',
    customer_phone: '(11) 98877-6655',
    start_time: createAppointmentDate(2, 14, 0).toISOString(), // Day after tomorrow at 14:00
    end_time: createAppointmentDate(2, 14, 45).toISOString(),  // Day after tomorrow at 14:45
    status: 'confirmed',
    user_id: currentUser.id,
    created_at: new Date().toISOString()
  },
  {
    id: generateId(),
    service_id: services[2].id,
    service_name: services[2].name,
    customer_name: 'Ana Pereira',
    customer_email: 'ana@exemplo.com',
    customer_phone: '(11) 97788-9900',
    start_time: createAppointmentDate(0, 16, 0).toISOString(), // Today at 16:00
    end_time: createAppointmentDate(0, 16, 30).toISOString(),  // Today at 16:30
    status: 'pending',
    user_id: currentUser.id,
    created_at: new Date().toISOString()
  },
  {
    id: generateId(),
    service_id: services[0].id,
    service_name: services[0].name,
    customer_name: 'Roberto Almeida',
    customer_email: 'roberto@exemplo.com',
    customer_phone: '(11) 92233-4455',
    start_time: createAppointmentDate(3, 11, 0).toISOString(), // 3 days from now at 11:00
    end_time: createAppointmentDate(3, 12, 0).toISOString(),  // 3 days from now at 12:00
    status: 'confirmed',
    user_id: currentUser.id,
    created_at: new Date().toISOString()
  }
];

// Convert appointments to calendar events
export const calendarEvents = appointments.map(appointment => ({
  id: appointment.id,
  title: `${appointment.customer_name} - ${appointment.service_name}`,
  start: new Date(appointment.start_time),
  end: new Date(appointment.end_time),
  resource: appointment
}));

// Mock available time slots
export const timeSlots: TimeSlot[] = [
  // Monday (1)
  { id: generateId(), userId: currentUser.id, dayOfWeek: 1, startTime: '09:00', endTime: '17:00', isAvailable: true },
  // Tuesday (2)
  { id: generateId(), userId: currentUser.id, dayOfWeek: 2, startTime: '09:00', endTime: '17:00', isAvailable: true },
  // Wednesday (3)
  { id: generateId(), userId: currentUser.id, dayOfWeek: 3, startTime: '09:00', endTime: '17:00', isAvailable: true },
  // Thursday (4)
  { id: generateId(), userId: currentUser.id, dayOfWeek: 4, startTime: '09:00', endTime: '17:00', isAvailable: true },
  // Friday (5)
  { id: generateId(), userId: currentUser.id, dayOfWeek: 5, startTime: '09:00', endTime: '17:00', isAvailable: true },
  // Saturday (6) - Half day
  { id: generateId(), userId: currentUser.id, dayOfWeek: 6, startTime: '09:00', endTime: '13:00', isAvailable: true },
  // Sunday (0) - Closed
  { id: generateId(), userId: currentUser.id, dayOfWeek: 0, startTime: '00:00', endTime: '00:00', isAvailable: false },
];
