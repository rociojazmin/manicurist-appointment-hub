
import { useState } from "react";
import { AppointmentWithService } from "@/components/admin/AppointmentCard";

export const useAppointmentState = () => {
  const [appointments, setAppointments] = useState<AppointmentWithService[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [selectedAppointment, setSelectedAppointment] = useState<AppointmentWithService | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [notes, setNotes] = useState("");
  const [isFetching, setIsFetching] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  
  return {
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
  };
};
