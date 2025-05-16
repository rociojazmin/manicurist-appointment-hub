
import { format, isToday, isFuture, isPast } from "date-fns";
import { AppointmentWithService } from "@/components/admin/AppointmentCard";

// Filter appointments for today
export const getTodayAppointments = (appointments: AppointmentWithService[]) => {
  return appointments.filter(
    (apt) =>
      format(new Date(apt.appointment_date), "yyyy-MM-dd") ===
      format(new Date(), "yyyy-MM-dd")
  );
};

// Filter appointments for upcoming days (future dates, not today)
export const getUpcomingAppointments = (appointments: AppointmentWithService[]) => {
  return appointments.filter((apt) => {
    const aptDate = new Date(apt.appointment_date);
    return isFuture(aptDate) && !isToday(aptDate);
  });
};

// Filter appointments for past days (not today)
export const getPastAppointments = (appointments: AppointmentWithService[]) => {
  return appointments.filter((apt) => {
    const aptDate = new Date(apt.appointment_date);
    return isPast(aptDate) && !isToday(aptDate);
  });
};

// Filter appointments by specific date
export const getDateAppointments = (
  appointments: AppointmentWithService[],
  selectedDate: Date | undefined
) => {
  if (!selectedDate) return [];
  
  return appointments.filter((apt) => {
    const aptDate = new Date(apt.appointment_date);
    return (
      aptDate.getDate() === selectedDate.getDate() &&
      aptDate.getMonth() === selectedDate.getMonth() &&
      aptDate.getFullYear() === selectedDate.getFullYear()
    );
  });
};
