
import { Appointment, Service } from "@/types/database";
import AppointmentCard from "./AppointmentCard";

interface AppointmentListProps {
  appointments: Appointment[];
  services: Record<string, Service>;
  onOpenDetails: (appointment: Appointment) => void;
  onStatusChange: (id: string, status: any) => void;
  emptyMessage?: string;
  sortComparer?: (a: Appointment, b: Appointment) => number;
}

const AppointmentList = ({
  appointments,
  services,
  onOpenDetails,
  onStatusChange,
  emptyMessage = "No hay turnos disponibles",
  sortComparer
}: AppointmentListProps) => {
  const sortedAppointments = sortComparer
    ? [...appointments].sort(sortComparer)
    : appointments;

  return (
    <>
      {sortedAppointments.length > 0 ? (
        <div className="space-y-4">
          {sortedAppointments.map((appointment) => (
            <AppointmentCard
              key={appointment.id}
              appointment={appointment}
              serviceName={services[appointment.service_id || ""]?.name || "Servicio no encontrado"}
              onOpenDetails={onOpenDetails}
              onStatusChange={onStatusChange}
            />
          ))}
        </div>
      ) : (
        <p className="text-center py-8 text-muted-foreground">
          {emptyMessage}
        </p>
      )}
    </>
  );
};

export default AppointmentList;
