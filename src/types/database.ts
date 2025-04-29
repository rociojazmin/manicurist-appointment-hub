
export type AppointmentStatus = 'pending' | 'confirmed' | 'cancelled' | 'completed';

export interface Manicurist {
  id: string;
  name: string;
  phone: string | null;
  created_at: string;
  updated_at: string;
  email?: string; // Email is optional
}

export interface Service {
  id: string;
  manicurist_id: string;
  name: string;
  price: number;
  duration: number;
  created_at: string;
  updated_at: string;
}

export interface WorkingHours {
  id: string;
  manicurist_id: string;
  day_of_week: number;
  start_time: string;
  end_time: string;
}

export interface Exception {
  id: string;
  manicurist_id: string;
  exception_date: string;
}

export interface Appointment {
  id: string;
  client_name: string;
  client_phone: string;
  manicurist_id: string;
  service_id: string;
  appointment_date: string;
  appointment_time: string;
  notes: string | null;
  status: AppointmentStatus;
  created_at: string;
  updated_at: string;
}
