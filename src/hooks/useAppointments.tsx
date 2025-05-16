
import { useState, useEffect } from "react";
import { useAuthContext } from "@/contexts/AuthContext";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Appointment, AppointmentStatus, Service } from "@/types/database";
import { format, isToday, isFuture, isPast } from "date-fns";
import { AppointmentWithService } from "@/components/admin/AppointmentCard";

export const useAppointments = () => {
  const [appointments, setAppointments] = useState<AppointmentWithService[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [selectedAppointment, setSelectedAppointment] = useState<AppointmentWithService | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [notes, setNotes] = useState("");
  const [isFetching, setIsFetching] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const { toast } = useToast();
  const { profile } = useAuthContext();

  // Fetch appointments from database
  const fetchAppointments = async () => {
    if (!profile) return;

    setIsFetching(true);
    try {
      // Load all appointments with service information
      const { data, error } = await supabase
        .from("appointments")
        .select(`
          *,
          service:service_id(*)
        `)
        .eq("manicurist_id", profile.id)
        .neq("status", "cancelled") // Filter out cancelled appointments
        .order("appointment_date", { ascending: false });

      if (error) {
        console.error("Error fetching appointments:", error);
        toast({
          title: "Error",
          description: "No se pudieron cargar las citas",
          variant: "destructive",
        });
      } else {
        // Convert data and ensure correct type
        const formattedAppointments = (data || []).map((appointment) => {
          // Ensure status is of correct type
          const appointmentWithService = {
            ...appointment,
            status: appointment.status as AppointmentStatus,
            // Ensure service is of Service type or handle as null
            service: appointment.service && typeof appointment.service === 'object' 
              ? appointment.service as Service 
              : {} as Service,
          } as AppointmentWithService;
          
          return appointmentWithService;
        });

        setAppointments(formattedAppointments);
        
        // If there's a selected appointment, update it with fresh data
        if (selectedAppointment) {
          const updatedSelectedAppointment = formattedAppointments.find(
            apt => apt.id === selectedAppointment.id
          );
          if (updatedSelectedAppointment) {
            setSelectedAppointment(updatedSelectedAppointment);
          } else {
            // If the appointment is no longer in the list (was cancelled), close the details modal
            setIsDetailsOpen(false);
            setSelectedAppointment(null);
          }
        }
      }
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setIsFetching(false);
    }
  };

  // Load appointments when profile changes
  useEffect(() => {
    if (profile) {
      fetchAppointments();
    }
  }, [profile]);

  // Filter appointments by date and status
  const todayAppointments = appointments.filter(
    (apt) =>
      format(new Date(apt.appointment_date), "yyyy-MM-dd") ===
      format(new Date(), "yyyy-MM-dd")
  );

  const upcomingAppointments = appointments.filter((apt) => {
    const aptDate = new Date(apt.appointment_date);
    return isFuture(aptDate) && !isToday(aptDate);
  });

  const pastAppointments = appointments.filter((apt) => {
    const aptDate = new Date(apt.appointment_date);
    return isPast(aptDate) && !isToday(aptDate);
  });

  const dateAppointments = selectedDate
    ? appointments.filter((apt) => {
        const aptDate = new Date(apt.appointment_date);
        return (
          aptDate.getDate() === selectedDate.getDate() &&
          aptDate.getMonth() === selectedDate.getMonth() &&
          aptDate.getFullYear() === selectedDate.getFullYear()
        );
      })
    : [];

  const handleStatus = async (id: string, newStatus: AppointmentStatus) => {
    if (!profile) return;

    setIsUpdating(true);
    try {
      // Update in database
      const { error } = await supabase
        .from("appointments")
        .update({ 
          status: newStatus, 
          updated_at: new Date().toISOString() 
        })
        .eq("id", id);

      if (error) {
        console.error("Error updating appointment status:", error);
        toast({
          title: "Error",
          description: "No se pudo actualizar el estado de la cita",
          variant: "destructive",
        });
        return;
      }

      const appointment = appointments.find((apt) => apt.id === id);

      // If we're cancelling, we'll remove from the list through fetchAppointments
      if (newStatus === "cancelled") {
        toast({
          title: "Cita Cancelada",
          description: `La cita de ${appointment?.client_name} ha sido cancelada`,
        });
      } else {
        // For other status changes, update local state
        setAppointments((prev) =>
          prev.map((apt) => (apt.id === id ? { ...apt, status: newStatus } : apt))
        );

        // If the selected appointment is the one being updated, update it as well
        if (selectedAppointment?.id === id) {
          setSelectedAppointment({ ...selectedAppointment, status: newStatus });
        }

        toast({
          title: "Estado actualizado",
          description: `La cita de ${appointment?.client_name} ha sido ${
            newStatus === "confirmed"
              ? "confirmada"
              : newStatus === "completed"
              ? "completada"
              : "actualizada"
          }`,
        });
      }
      
      // Fetch updated appointments to ensure data consistency
      await fetchAppointments();
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleOpenDetails = (appointment: AppointmentWithService) => {
    setSelectedAppointment(appointment);
    setNotes(appointment.notes || "");
    setIsDetailsOpen(true);
  };

  const handleUpdateNotes = async () => {
    if (!selectedAppointment) return;

    setIsUpdating(true);
    try {
      // Update notes in database
      const { error } = await supabase
        .from("appointments")
        .update({
          notes: notes,
          updated_at: new Date().toISOString(),
        })
        .eq("id", selectedAppointment.id);

      if (error) {
        console.error("Error updating appointment notes:", error);
        toast({
          title: "Error",
          description: "No se pudieron actualizar las notas",
          variant: "destructive",
        });
        return;
      }

      // Update local state
      setAppointments((prev) =>
        prev.map((apt) =>
          apt.id === selectedAppointment.id ? { ...apt, notes } : apt
        )
      );
      setIsDetailsOpen(false);

      toast({
        title: "Notas actualizadas",
        description: "Las notas de la cita han sido actualizadas correctamente",
      });
      
      // Fetch updated appointments to ensure data consistency
      await fetchAppointments();
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setIsUpdating(false);
    }
  };

  return {
    appointments,
    todayAppointments,
    upcomingAppointments,
    pastAppointments,
    dateAppointments,
    selectedDate,
    setSelectedDate,
    selectedAppointment,
    setSelectedAppointment,
    isDetailsOpen,
    setIsDetailsOpen,
    notes,
    setNotes,
    isFetching,
    isUpdating,
    handleStatus,
    handleOpenDetails,
    handleUpdateNotes,
  };
};
