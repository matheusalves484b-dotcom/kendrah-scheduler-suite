
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

export interface Profile {
  id: string;
  business_name?: string;
  business_logo_url?: string;
  whatsapp_number?: string;
  slug?: string;
  created_at: string;
  updated_at: string;
}

export interface Service {
  id: string;
  name: string;
  description?: string;
  duration: number; // in minutes
  price?: number;
  user_id: string;
  created_at: string;
  updated_at: string;
}

export interface Appointment {
  id: string;
  service_id: string;
  service_name: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  start_time: string;
  end_time: string;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  notes?: string;
  user_id: string;
  created_at: string;
}

export interface TimeSlot {
  id: string;
  userId: string;
  dayOfWeek: number; // 0-6, where 0 is Sunday
  startTime: string; // HH:MM format
  endTime: string; // HH:MM format
  isAvailable: boolean;
}

export interface AvailabilitySlot {
  id: string;
  user_id: string;
  day_of_week: number; // 0-6, where 0 is Sunday
  start_time: string; // HH:MM format
  end_time: string; // HH:MM format
  is_available: boolean;
  created_at: string;
}

export interface CalendarEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  resource?: any;
}

export interface Client {
  id: string;
  name: string;
  email: string;
  phone: string;
  userId: string;
  createdAt: Date;
}
