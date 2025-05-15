
export interface User {
  id: string;
  name: string;
  email: string;
  phoneNumber?: string;
  createdAt: Date;
  trialEndsAt: Date;
  isSubscribed: boolean;
  webhookUrl?: string;
  whatsappNumber?: string;
}

export interface Service {
  id: string;
  name: string;
  description?: string;
  duration: number; // in minutes
  price?: number;
  userId: string;
}

export interface Appointment {
  id: string;
  serviceId: string;
  serviceName: string;
  customerId: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  startTime: Date;
  endTime: Date;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  notes?: string;
  createdAt: Date;
  userId: string;
}

export interface TimeSlot {
  id: string;
  userId: string;
  dayOfWeek: number; // 0-6, where 0 is Sunday
  startTime: string; // HH:MM format
  endTime: string; // HH:MM format
  isAvailable: boolean;
}

export interface CalendarEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  resource?: any;
}
