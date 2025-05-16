
import { useEffect } from "react";
import { useAuthContext } from "@/contexts/AuthContext";
import { useToast } from "@/components/ui/use-toast";
import { AppointmentStatus } from "@/types/database";
import { AppointmentWithService } from "@/components/admin/AppointmentCard";
import { useAppointmentState } from "./useAppointmentState";
import { 
  fetchAppointments, 
  updateAppointmentStatus, 
  updateAppointmentNotes 
} from "@/services/appointmentService";
import {
  getTodayAppointments,
  getUpcomingAppointments,
  getPastAppointments,
  getDateAppointments
} from "@/utils/appointmentUtils";

export const useAppointments = () => {
  const { toast } = useToast();
  const { profile } = useAuthContext();
  const {
    appointments,
    setAppointments,
    selectedDate,
    setSelectedDate,
    selectedAppointment,
    setSelectedAppointment,
    isDetailsOpen,
    setIsDetailsOpen,
    notes,
    setNotes,
    isFetching,
    setIsFetching,
    isUpdating,
    setIsUpdating,
  } = useAppointmentState();

  // Fetch appointments from database
  const loadAppointments = async () => {
    if (!profile) return;

    setIsFetching(true);
    try {
      const appointmentData = await fetchAppointments(profile.id);
      setAppointments(appointmentData);
      
      // If there's a selected appointment, update it with fresh data
      if (selectedAppointment) {
        const updatedSelectedAppointment = appointmentData.find(
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
    } catch (error) {
      console.error("Error fetching appointments:", error);
      toast({
        title: "Error",
        description: "No se pudieron cargar las citas",
        variant: "destructive",
      });
    } finally {
      setIsFetching(false);
    }
  };

  // Load appointments when profile changes
  useEffect(() => {
    if (profile) {
      loadAppointments();
    }
  }, [profile]);

  // Get filtered appointments
  const todayAppointments = getTodayAppointments(appointments);
  const upcomingAppointments = getUpcomingAppointments(appointments);
  const pastAppointments = getPastAppointments(appointments);
  const dateAppointments = getDateAppointments(appointments, selectedDate);

  const handleStatus = async (id: string, newStatus: AppointmentStatus) => {
    if (!profile) return;

    setIsUpdating(true);
    try {
      await updateAppointmentStatus(id, newStatus);

      const appointment = appointments.find((apt) => apt.id === id);

      // If we're cancelling, we'll remove from the list through loadAppointments
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
      await loadAppointments();
    } catch (error) {
      console.error("Error:", error);
      toast({
        title: "Error",
        description: "No se pudo actualizar el estado",
        variant: "destructive",
      });
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
      await updateAppointmentNotes(selectedAppointment.id, notes);

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
      await loadAppointments();
    } catch (error) {
      console.error("Error:", error);
      toast({
        title: "Error",
        description: "No se pudieron actualizar las notas",
        variant: "destructive",
      });
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
