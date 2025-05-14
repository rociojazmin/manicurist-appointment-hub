
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
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { profile } = useAuthContext();

  // Cargar citas desde la base de datos
  useEffect(() => {
    const fetchAppointments = async () => {
      if (!profile) return;

      setLoading(true);
      try {
        // Cargar todas las citas con información del servicio
        const { data, error } = await supabase
          .from("appointments")
          .select(`
            *,
            service:service_id(*)
          `)
          .eq("manicurist_id", profile.id)
          .order("appointment_date", { ascending: false });

        if (error) {
          console.error("Error fetching appointments:", error);
          toast({
            title: "Error",
            description: "No se pudieron cargar las citas",
            variant: "destructive",
          });
        } else {
          // Convertir los datos y asegurarse de que el tipo sea correcto
          const formattedAppointments = (data || []).map((appointment) => {
            // Asegurarse de que el status sea del tipo correcto
            const appointmentWithService = {
              ...appointment,
              status: appointment.status as AppointmentStatus,
              // Asegurar que service sea del tipo Service o manejarlo como nulo
              service: appointment.service && typeof appointment.service === 'object' 
                ? appointment.service as Service 
                : {} as Service,
            } as AppointmentWithService;
            
            return appointmentWithService;
          });

          setAppointments(formattedAppointments);
        }
      } catch (error) {
        console.error("Error:", error);
      } finally {
        setLoading(false);
      }
    };

    if (profile) {
      fetchAppointments();
    }
  }, [profile, toast]);

  // Filtrar citas por fecha y estado
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

    try {
      // Update en la base de datos
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

      // Actualizar estado local
      setAppointments((prev) =>
        prev.map((apt) => (apt.id === id ? { ...apt, status: newStatus } : apt))
      );

      // Si la cita seleccionada es la que se actualizó, actualizar también
      if (selectedAppointment?.id === id) {
        setSelectedAppointment({ ...selectedAppointment, status: newStatus });
      }

      const appointment = appointments.find((apt) => apt.id === id);
      toast({
        title: "Estado actualizado",
        description: `La cita de ${appointment?.client_name} ha sido ${
          newStatus === "confirmed"
            ? "confirmada"
            : newStatus === "cancelled"
            ? "cancelada"
            : newStatus === "completed"
            ? "completada"
            : "actualizada"
        }`,
      });
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const handleOpenDetails = (appointment: AppointmentWithService) => {
    setSelectedAppointment(appointment);
    setNotes(appointment.notes || "");
    setIsDetailsOpen(true);
  };

  const handleUpdateNotes = async () => {
    if (!selectedAppointment) return;

    try {
      // Actualizar notas en la base de datos
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

      // Actualizar estado local
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
    } catch (error) {
      console.error("Error:", error);
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
    loading,
    handleStatus,
    handleOpenDetails,
    handleUpdateNotes,
  };
};
