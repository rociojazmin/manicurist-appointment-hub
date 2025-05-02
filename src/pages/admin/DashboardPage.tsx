
import { useState, useEffect } from "react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { supabase } from "@/integrations/supabase/client";
import { Appointment, Service, AppointmentStatus } from "@/types/database";
import { useAuthContext } from "@/contexts/AuthContext";
import StatCards from "@/components/admin/dashboard/StatCards";
import TodayAppointments from "@/components/admin/dashboard/TodayAppointments";
import QuickActions from "@/components/admin/dashboard/QuickActions";

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
  const formattedDate = format(new Date(), "EEEE d 'de' MMMM", { locale: es });

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
          // Fix type issue by casting status to AppointmentStatus
          setTodayAppointments(todayData?.map(apt => ({
            ...apt,
            status: apt.status as AppointmentStatus
          })) || []);
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

      <StatCards stats={stats} formattedDate={formattedDate} />

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <TodayAppointments appointments={todayAppointments} services={services} />
        <QuickActions />
      </div>
    </div>
  );
};

export default DashboardPage;
