
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import StatusBadge from "./StatusBadge";
import { Appointment, Service, AppointmentStatus } from "@/types/database";

interface AppointmentCardProps {
  appointment: Appointment;
  serviceName: string;
  onOpenDetails: (appointment: Appointment) => void;
  onStatusChange: (id: string, status: AppointmentStatus) => void;
}

const AppointmentCard = ({ 
  appointment, 
  serviceName, 
  onOpenDetails, 
  onStatusChange 
}: AppointmentCardProps) => {
  return (
    <div key={appointment.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="font-medium">{appointment.client_name}</h3>
          <p className="text-sm text-muted-foreground">{serviceName}</p>
          <p className="text-sm text-muted-foreground">
            {format(new Date(appointment.appointment_date), "d MMM yyyy", { locale: es })} - {appointment.appointment_time}
          </p>
        </div>
        <StatusBadge status={appointment.status} />
      </div>
      <div className="mt-4 flex space-x-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onOpenDetails(appointment)}
        >
          Detalles
        </Button>
        {appointment.status === "pending" && (
          <>
            <Button
              variant="outline"
              size="sm"
              className="text-green-600 border-green-600 hover:bg-green-50"
              onClick={() => onStatusChange(appointment.id, "confirmed")}
            >
              Confirmar
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="text-red-600 border-red-600 hover:bg-red-50"
              onClick={() => onStatusChange(appointment.id, "cancelled")}
            >
              Cancelar
            </Button>
          </>
        )}
        {appointment.status === "confirmed" && (
          <Button
            variant="outline"
            size="sm"
            className="text-blue-600 border-blue-600 hover:bg-blue-50"
            onClick={() => onStatusChange(appointment.id, "completed")}
          >
            Completar
          </Button>
        )}
      </div>
    </div>
  );
};

export default AppointmentCard;
