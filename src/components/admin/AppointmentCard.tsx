
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Appointment, AppointmentStatus, Service } from "@/types/database";

// Tipo para las citas con información del servicio
export interface AppointmentWithService extends Appointment {
  service: Service;
}

interface AppointmentCardProps {
  appointment: AppointmentWithService;
  onViewDetails: (appointment: AppointmentWithService) => void;
  onStatusChange: (id: string, status: AppointmentStatus) => void;
}

export const getStatusColor = (status: AppointmentStatus) => {
  switch (status) {
    case "confirmed":
      return "bg-green-100 text-green-800";
    case "pending":
      return "bg-amber-100 text-amber-800";
    case "cancelled":
      return "bg-red-100 text-red-800";
    case "completed":
      return "bg-blue-100 text-blue-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

export const getStatusText = (status: AppointmentStatus) => {
  switch (status) {
    case "confirmed":
      return "Confirmado";
    case "pending":
      return "Pendiente";
    case "cancelled":
      return "Cancelado";
    case "completed":
      return "Completado";
    default:
      return status;
  }
};

const AppointmentCard = ({ appointment, onViewDetails, onStatusChange }: AppointmentCardProps) => {
  return (
    <div
      key={appointment.id}
      className="border rounded-lg p-4 hover:shadow-md transition-shadow"
    >
      <div className="flex justify-between items-start">
        <div>
          <h3 className="font-medium">{appointment.client_name}</h3>
          <p className="text-sm text-muted-foreground">
            {appointment.service?.name || "Servicio no encontrado"}
          </p>
          <p className="text-sm text-muted-foreground">
            {format(new Date(appointment.appointment_date), "d MMM yyyy", {
              locale: es,
            })}{" "}
            - {appointment.appointment_time}
          </p>
        </div>
        <Badge className={getStatusColor(appointment.status)}>
          {getStatusText(appointment.status)}
        </Badge>
      </div>
      <div className="mt-4 flex space-x-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onViewDetails(appointment)}
        >
          Detalles
        </Button>
        
        {/* Only show action buttons for pending status */}
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
        
        {/* Remove the completed button for confirmed appointments */}
      </div>
    </div>
  );
};

export default AppointmentCard;
