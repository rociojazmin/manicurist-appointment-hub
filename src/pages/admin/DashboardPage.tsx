import { useState, useEffect } from "react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { Appointment, Service, AppointmentStatus } from "@/types/database";
import { useAuthContext } from "@/contexts/AuthContext";

const DashboardPage = () => {
  const [todayAppointments, setTodayAppointments] = useState<Appointment[]>([]);
  const [stats, setStats] = useState({
    pendingCount: 0,
    confirmedCount: 0,
    cancelledCount: 0,
    totalCount: 0,
    todayCount: 0
  });
  const [loading, setLoading] = useState(true);
  const [services, setServices] = useState<Record<string, Service>>({});
  const { profile } = useAuthContext();

  useEffect(() => {
    const fetchData = async () => {
      if (!profile) return;

      setLoading(true);
      try {
        // Obtener la fecha de hoy en formato YYYY-MM-DD
        const today = new Date();
        const formattedDate = format(today, "yyyy-MM-dd");
        
        // Cargar citas de hoy
        const { data: todayData, error: todayError } = await supabase
          .from('appointments')
          .select('*')
          .eq('manicurist_id', profile.id)
          .eq('appointment_date', formattedDate)
          .order('appointment_time', { ascending: true });
          
        if (todayError) {
          console.error('Error fetching today appointments:', todayError);
        } else {
          // Cast the status field to AppointmentStatus
          const formattedAppointments = (todayData || []).map(appointment => ({
            ...appointment,
            status: appointment.status as AppointmentStatus
          }));
          
          setTodayAppointments(formattedAppointments);
        }

        // Cargar estadísticas de citas
        // Pendientes
        const { count: pendingCount } = await supabase
          .from('appointments')
          .select('*', { count: 'exact', head: true })
          .eq('manicurist_id', profile.id)
          .eq('status', 'pending');

        // Confirmadas
        const { count: confirmedCount } = await supabase
          .from('appointments')
          .select('*', { count: 'exact', head: true })
          .eq('manicurist_id', profile.id)
          .eq('status', 'confirmed');

        // Canceladas
        const { count: cancelledCount } = await supabase
          .from('appointments')
          .select('*', { count: 'exact', head: true })
          .eq('manicurist_id', profile.id)
          .eq('status', 'cancelled');

        // Total (últimos 30 días)
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        const formattedThirtyDaysAgo = format(thirtyDaysAgo, "yyyy-MM-dd");
        
        const { count: totalCount } = await supabase
          .from('appointments')
          .select('*', { count: 'exact', head: true })
          .eq('manicurist_id', profile.id)
          .gte('appointment_date', formattedThirtyDaysAgo);

        // Cargar servicios para mostrar nombres
        const { data: servicesData, error: servicesError } = await supabase
          .from('services')
          .select('*')
          .eq('manicurist_id', profile.id);
          
        if (servicesError) {
          console.error('Error fetching services:', servicesError);
        } else {
          const servicesMap: Record<string, Service> = {};
          servicesData?.forEach(service => {
            servicesMap[service.id] = service;
          });
          setServices(servicesMap);
        }
        
        // Actualizar estadísticas
        setStats({
          pendingCount: pendingCount || 0,
          confirmedCount: confirmedCount || 0,
          cancelledCount: cancelledCount || 0,
          totalCount: totalCount || 0,
          todayCount: todayData?.length || 0
        });
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    if (profile) {
      fetchData();
    }
  }, [profile]);

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

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

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
              <path d="M22 21v-2a4 4 0 0 1 0 7.75" />
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
