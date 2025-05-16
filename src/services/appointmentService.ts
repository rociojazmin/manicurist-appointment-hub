
import { supabase } from "@/integrations/supabase/client";
import { AppointmentStatus } from "@/types/database";
import { AppointmentWithService } from "@/components/admin/AppointmentCard";

// Fetch appointments from Supabase
export const fetchAppointments = async (userId: string) => {
  const { data, error } = await supabase
    .from("appointments")
    .select(`
      *,
      service:service_id(*)
    `)
    .eq("manicurist_id", userId)
    .neq("status", "cancelled")
    .order("appointment_date", { ascending: false });

  if (error) {
    throw error;
  }

  // Convert data and ensure correct type
  return (data || []).map((appointment) => {
    // Ensure status is of correct type
    const appointmentWithService = {
      ...appointment,
      status: appointment.status as AppointmentStatus,
      // Ensure service is of Service type or handle as null
      service: appointment.service && typeof appointment.service === 'object' 
        ? appointment.service 
        : {},
    } as AppointmentWithService;
    
    return appointmentWithService;
  });
};

// Update appointment status
export const updateAppointmentStatus = async (
  id: string,
  newStatus: AppointmentStatus
) => {
  const { error } = await supabase
    .from("appointments")
    .update({ 
      status: newStatus, 
      updated_at: new Date().toISOString() 
    })
    .eq("id", id);

  if (error) {
    throw error;
  }
};

// Update appointment notes
export const updateAppointmentNotes = async (
  id: string,
  notes: string
) => {
  const { error } = await supabase
    .from("appointments")
    .update({
      notes: notes,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);

  if (error) {
    throw error;
  }
};
