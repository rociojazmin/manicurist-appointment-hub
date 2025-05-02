
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Appointment, Service } from "@/types/database";

interface TodayAppointmentsProps {
  appointments: Appointment[];
  services: Record<string, Service>;
}

const TodayAppointments = ({ appointments, services }: TodayAppointmentsProps) => {
  const getStatusColor = (status: Appointment["status"]) => {
    switch (status) {
      case "confirmed": return "text-green-600 bg-green-100";
      case "pending": return "text-amber-600 bg-amber-100";
      case "cancelled": return "text-red-600 bg-red-100";
      case "completed": return "text-blue-600 bg-blue-100";
      default: return "";
    }
  };

  const getStatusText = (status: Appointment["status"]) => {
    switch (status) {
      case "confirmed": return "Confirmado";
      case "pending": return "Pendiente";
      case "cancelled": return "Cancelado";
      case "completed": return "Completado";
      default: return "";
    }
  };

  return (
    <Card className="col-span-4">
      <CardHeader>
        <CardTitle>Turnos de Hoy</CardTitle>
        <CardDescription>
          Listado de turnos programados para el día de hoy
        </CardDescription>
      </CardHeader>
      <CardContent>
        {appointments.length > 0 ? (
          <div className="space-y-4">
            {appointments.map((appointment) => (
              <div key={appointment.id} className="flex items-center justify-between p-4 rounded-lg border">
                <div>
                  <p className="font-medium">{appointment.client_name}</p>
                  <div className="flex space-x-4 text-sm text-muted-foreground">
                    <p>{services[appointment.service_id || '']?.name || 'Servicio no encontrado'}</p>
                    <p>{appointment.appointment_time}</p>
                  </div>
                </div>
                <div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(appointment.status)}`}>
                    {getStatusText(appointment.status)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-center py-8 text-muted-foreground">
            No hay turnos programados para hoy
          </p>
        )}
      </CardContent>
    </Card>
  );
};

export default TodayAppointments;
