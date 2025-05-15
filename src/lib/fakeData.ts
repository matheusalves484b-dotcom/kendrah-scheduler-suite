
import { User, Service, Appointment, TimeSlot } from '../types';
import { addDays, addMinutes, setHours, setMinutes } from 'date-fns';

// Helper function to generate a random ID
const generateId = () => Math.random().toString(36).substring(2, 15);

// Trial end date (14 days from now)
const trialEndDate = addDays(new Date(), 14);

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
    userId: currentUser.id
  },
  {
    id: generateId(),
    name: 'Sessão de Acompanhamento',
    description: 'Sessão para acompanhamento e ajustes',
    duration: 45, // 45 minutes
    price: 120,
    userId: currentUser.id
  },
  {
    id: generateId(),
    name: 'Sessão Express',
    description: 'Consulta rápida para dúvidas específicas',
    duration: 30, // 30 minutes
    price: 80,
    userId: currentUser.id
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
    serviceId: services[0].id,
    serviceName: services[0].name,
    customerId: generateId(),
    customerName: 'Maria Oliveira',
    customerEmail: 'maria@exemplo.com',
    customerPhone: '(11) 91234-5678',
    startTime: createAppointmentDate(1, 10, 0), // Tomorrow at 10:00
    endTime: createAppointmentDate(1, 11, 0),  // Tomorrow at 11:00
    status: 'confirmed',
    notes: 'Cliente nova, primeira sessão',
    createdAt: new Date(),
    userId: currentUser.id
  },
  {
    id: generateId(),
    serviceId: services[1].id,
    serviceName: services[1].name,
    customerId: generateId(),
    customerName: 'Carlos Santos',
    customerEmail: 'carlos@exemplo.com',
    customerPhone: '(11) 98877-6655',
    startTime: createAppointmentDate(2, 14, 0), // Day after tomorrow at 14:00
    endTime: createAppointmentDate(2, 14, 45),  // Day after tomorrow at 14:45
    status: 'confirmed',
    createdAt: new Date(),
    userId: currentUser.id
  },
  {
    id: generateId(),
    serviceId: services[2].id,
    serviceName: services[2].name,
    customerId: generateId(),
    customerName: 'Ana Pereira',
    customerEmail: 'ana@exemplo.com',
    customerPhone: '(11) 97788-9900',
    startTime: createAppointmentDate(0, 16, 0), // Today at 16:00
    endTime: createAppointmentDate(0, 16, 30),  // Today at 16:30
    status: 'pending',
    createdAt: new Date(),
    userId: currentUser.id
  },
  {
    id: generateId(),
    serviceId: services[0].id,
    serviceName: services[0].name,
    customerId: generateId(),
    customerName: 'Roberto Almeida',
    customerEmail: 'roberto@exemplo.com',
    customerPhone: '(11) 92233-4455',
    startTime: createAppointmentDate(3, 11, 0), // 3 days from now at 11:00
    endTime: createAppointmentDate(3, 12, 0),  // 3 days from now at 12:00
    status: 'confirmed',
    createdAt: new Date(),
    userId: currentUser.id
  }
];

// Convert appointments to calendar events
export const calendarEvents = appointments.map(appointment => ({
  id: appointment.id,
  title: `${appointment.customerName} - ${appointment.serviceName}`,
  start: appointment.startTime,
  end: appointment.endTime,
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
