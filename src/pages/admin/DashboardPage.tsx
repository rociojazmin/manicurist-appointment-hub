
import { useState, useEffect } from "react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

// Tipos
type Appointment = {
  id: string;
  clientName: string;
  service: string;
  date: Date;
  time: string;
  status: "pending" | "confirmed" | "cancelled";
};

// Datos simulados
const TODAY_APPOINTMENTS: Appointment[] = [
  {
    id: "1",
    clientName: "María García",
    service: "Semipermanente",
    date: new Date(),
    time: "10:00",
    status: "confirmed"
  },
  {
    id: "2",
    clientName: "Laura Pérez",
    service: "Kapping",
    date: new Date(),
    time: "11:30",
    status: "pending"
  },
  {
    id: "3",
    clientName: "Ana Rodríguez",
    service: "Esculpidas",
    date: new Date(),
    time: "14:00",
    status: "confirmed"
  }
];

const DashboardPage = () => {
  const [todayAppointments, setTodayAppointments] = useState<Appointment[]>([]);
  const [stats, setStats] = useState({
    pendingCount: 0,
    confirmedCount: 0,
    cancelledCount: 0,
    totalCount: 0,
    todayCount: 0
  });

  useEffect(() => {
    // Simulamos la carga de datos
    setTimeout(() => {
      setTodayAppointments(TODAY_APPOINTMENTS);
      setStats({
        pendingCount: 5,
        confirmedCount: 12,
        cancelledCount: 2,
        totalCount: 19,
        todayCount: TODAY_APPOINTMENTS.length
      });
    }, 500);
  }, []);

  const getStatusColor = (status: Appointment["status"]) => {
    switch (status) {
      case "confirmed": return "text-green-600 bg-green-100";
      case "pending": return "text-amber-600 bg-amber-100";
      case "cancelled": return "text-red-600 bg-red-100";
      default: return "";
    }
  };

  const getStatusText = (status: Appointment["status"]) => {
    switch (status) {
      case "confirmed": return "Confirmado";
      case "pending": return "Pendiente";
      case "cancelled": return "Cancelado";
      default: return "";
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Panel de Control</h1>
        <p className="text-muted-foreground">
          Bienvenida a tu panel de administración de turnos
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Turnos de Hoy
            </CardTitle>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              className="h-4 w-4 text-muted-foreground"
            >
              <rect width="20" height="14" x="2" y="5" rx="2" />
              <path d="M2 10h20" />
            </svg>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.todayCount}</div>
            <p className="text-xs text-muted-foreground">
              {format(new Date(), "EEEE d 'de' MMMM", { locale: es })}
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Turnos Pendientes
            </CardTitle>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              className="h-4 w-4 text-muted-foreground"
            >
              <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
            </svg>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pendingCount}</div>
            <p className="text-xs text-muted-foreground">
              Esperando confirmación
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Turnos Confirmados
            </CardTitle>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              className="h-4 w-4 text-muted-foreground"
            >
              <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
            </svg>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.confirmedCount}</div>
            <p className="text-xs text-muted-foreground">
              Próximas citas
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total de Turnos
            </CardTitle>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              className="h-4 w-4 text-muted-foreground"
            >
              <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalCount}</div>
            <p className="text-xs text-muted-foreground">
              En los últimos 30 días
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Turnos de Hoy</CardTitle>
            <CardDescription>
              Listado de turnos programados para el día de hoy
            </CardDescription>
          </CardHeader>
          <CardContent>
            {todayAppointments.length > 0 ? (
              <div className="space-y-4">
                {todayAppointments.map((appointment) => (
                  <div key={appointment.id} className="flex items-center justify-between p-4 rounded-lg border">
                    <div>
                      <p className="font-medium">{appointment.clientName}</p>
                      <div className="flex space-x-4 text-sm text-muted-foreground">
                        <p>{appointment.service}</p>
                        <p>{appointment.time}</p>
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
        
        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Acciones Rápidas</CardTitle>
            <CardDescription>
              Gestiona tus servicios y horarios
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="bg-secondary p-4 rounded-lg">
                <h3 className="font-medium mb-2">Configuración de Horarios</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Define tus horarios de atención y días disponibles para las próximas semanas.
                </p>
                <div className="flex justify-end">
                  <a href="/admin/schedule" className="text-sm font-medium text-primary hover:underline">
                    Configurar →
                  </a>
                </div>
              </div>
              
              <div className="bg-secondary p-4 rounded-lg">
                <h3 className="font-medium mb-2">Gestión de Servicios</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Administra los servicios que ofreces, precios y duración.
                </p>
                <div className="flex justify-end">
                  <a href="/admin/services" className="text-sm font-medium text-primary hover:underline">
                    Gestionar →
                  </a>
                </div>
              </div>
              
              <div className="bg-secondary p-4 rounded-lg">
                <h3 className="font-medium mb-2">Ver Todos los Turnos</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Consulta, confirma o cancela los turnos agendados.
                </p>
                <div className="flex justify-end">
                  <a href="/admin/appointments" className="text-sm font-medium text-primary hover:underline">
                    Ver Turnos →
                  </a>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DashboardPage;
