
import { Badge } from "@/components/ui/badge";
import { AppointmentStatus } from "@/types/database";

interface StatusBadgeProps {
  status: AppointmentStatus;
}

const StatusBadge = ({ status }: StatusBadgeProps) => {
  const getStatusColor = (status: AppointmentStatus) => {
    switch (status) {
      case "confirmed": return "bg-green-100 text-green-800";
      case "pending": return "bg-amber-100 text-amber-800";
      case "cancelled": return "bg-red-100 text-red-800";
      case "completed": return "bg-blue-100 text-blue-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusText = (status: AppointmentStatus) => {
    switch (status) {
      case "confirmed": return "Confirmado";
      case "pending": return "Pendiente";
      case "cancelled": return "Cancelado";
      case "completed": return "Completado";
      default: return status;
    }
  };

  return (
    <Badge className={getStatusColor(status)}>
      {getStatusText(status)}
    </Badge>
  );
};

export default StatusBadge;
