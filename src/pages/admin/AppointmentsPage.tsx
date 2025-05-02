
import { useState, useEffect } from "react";
import { Dialog } from "@/components/ui/dialog";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { format, isToday, isFuture, isPast } from "date-fns";
import { es } from "date-fns/locale";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Appointment, Service, AppointmentStatus } from "@/types/database";
import { useAuthContext } from "@/contexts/AuthContext";

// Import our new components
import AppointmentList from "@/components/admin/appointments/AppointmentList";
import AppointmentDetails from "@/components/admin/appointments/AppointmentDetails";
import DateSelector from "@/components/admin/appointments/DateSelector";

const AppointmentsPage = () => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [services, setServices] = useState<Record<string, Service>>({});
  const { toast } = useToast();
  const { profile } = useAuthContext();

  // Cargar citas desde la base de datos
  useEffect(() => {
    const fetchAppointments = async () => {
      if (!profile) return;

      setLoading(true);
      try {
        // Cargar todas las citas para este manicurista
        const { data, error } = await supabase
          .from('appointments')
          .select('*')
          .eq('manicurist_id', profile.id)
          .order('appointment_date', { ascending: false });
          
        if (error) {
          console.error('Error fetching appointments:', error);
          toast({
            title: "Error",
            description: "No se pudieron cargar las citas",
            variant: "destructive"
          });
        } else {
          // Fix the type issue by casting the data to the correct type
          setAppointments(data?.map(apt => ({
            ...apt,
            status: apt.status as AppointmentStatus
          })) || []);
        }
        
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
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setLoading(false);
      }
    };

    if (profile) {
      fetchAppointments();
    }
  }, [profile, toast]);

  // Filtrar citas por fecha y estado
  const todayAppointments = appointments.filter(apt => 
    format(new Date(apt.appointment_date), "yyyy-MM-dd") === format(new Date(), "yyyy-MM-dd")
  );
  
  const upcomingAppointments = appointments.filter(apt => {
    const aptDate = new Date(apt.appointment_date);
    return isFuture(aptDate) && !isToday(aptDate);
  });
  
  const pastAppointments = appointments.filter(apt => {
    const aptDate = new Date(apt.appointment_date);
    return isPast(aptDate) && !isToday(aptDate);
  });
  
  const dateAppointments = selectedDate 
    ? appointments.filter(apt => {
        const aptDate = new Date(apt.appointment_date);
        return aptDate.getDate() === selectedDate.getDate() &&
               aptDate.getMonth() === selectedDate.getMonth() &&
               aptDate.getFullYear() === selectedDate.getFullYear();
      })
    : [];

  const handleStatus = async (id: string, newStatus: AppointmentStatus) => {
    if (!profile) return;
    
    try {
      const { error } = await supabase
        .from('appointments')
        .update({ status: newStatus, updated_at: new Date().toISOString() })
        .eq('id', id);
        
      if (error) {
        console.error('Error updating appointment status:', error);
        toast({
          title: "Error",
          description: "No se pudo actualizar el estado de la cita",
          variant: "destructive"
        });
        return;
      }
      
      // Actualizar estado local
      const updatedAppointments = appointments.map(apt =>
        apt.id === id ? { ...apt, status: newStatus } : apt
      );
      setAppointments(updatedAppointments);
      
      // Si la cita seleccionada es la que se actualizó, actualizar también
      if (selectedAppointment?.id === id) {
        setSelectedAppointment({ ...selectedAppointment, status: newStatus });
      }

      const appointment = appointments.find(apt => apt.id === id);
      toast({
        title: "Estado actualizado",
        description: `La cita de ${appointment?.client_name} ha sido ${
          newStatus === "confirmed" ? "confirmada" : 
          newStatus === "cancelled" ? "cancelada" : 
          newStatus === "completed" ? "completada" : "actualizada"
        }`
      });
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleOpenDetails = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    setIsDetailsOpen(true);
  };

  const handleUpdateNotes = async (notes: string) => {
    if (!selectedAppointment) return;

    try {
      // Actualizar notas en la base de datos
      const { error } = await supabase
        .from('appointments')
        .update({ 
          notes: notes,
          updated_at: new Date().toISOString()
        })
        .eq('id', selectedAppointment.id);
        
      if (error) {
        console.error('Error updating appointment notes:', error);
        toast({
          title: "Error",
          description: "No se pudieron actualizar las notas",
          variant: "destructive"
        });
        return;
      }
      
      // Actualizar estado local
      const updatedAppointments = appointments.map(apt =>
        apt.id === selectedAppointment.id ? { ...apt, notes } : apt
      );
      setAppointments(updatedAppointments);
      setIsDetailsOpen(false);

      toast({
        title: "Notas actualizadas",
        description: "Las notas de la cita han sido actualizadas correctamente"
      });
    } catch (error) {
      console.error('Error:', error);
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
        <h1 className="text-2xl font-bold tracking-tight">Gestión de Turnos</h1>
        <p className="text-muted-foreground">
          Visualiza y administra todos los turnos agendados
        </p>
      </div>

      <Tabs defaultValue="all">
        <TabsList className="mb-4">
          <TabsTrigger value="all">Por Fecha</TabsTrigger>
          <TabsTrigger value="today">Hoy ({todayAppointments.length})</TabsTrigger>
          <TabsTrigger value="upcoming">Próximos ({upcomingAppointments.length})</TabsTrigger>
          <TabsTrigger value="past">Anteriores ({pastAppointments.length})</TabsTrigger>
        </TabsList>
        
        <TabsContent value="all">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <DateSelector 
              selectedDate={selectedDate}
              onSelectDate={setSelectedDate}
              appointmentCount={dateAppointments.length}
            />

            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle>Turnos del Día</CardTitle>
                <CardDescription>
                  {selectedDate 
                    ? `Turnos para el ${format(selectedDate, "d 'de' MMMM", { locale: es })}`
                    : "Selecciona una fecha para ver los turnos"
                  }
                </CardDescription>
              </CardHeader>
              <CardContent>
                <AppointmentList 
                  appointments={dateAppointments}
                  services={services}
                  onOpenDetails={handleOpenDetails}
                  onStatusChange={handleStatus}
                  emptyMessage="No hay turnos agendados para esta fecha"
                  sortComparer={(a, b) => a.appointment_time.localeCompare(b.appointment_time)}
                />
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="today">
          <Card>
            <CardHeader>
              <CardTitle>Turnos de Hoy</CardTitle>
              <CardDescription>
                {format(new Date(), "EEEE d 'de' MMMM 'de' yyyy", { locale: es })}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <AppointmentList 
                appointments={todayAppointments}
                services={services}
                onOpenDetails={handleOpenDetails}
                onStatusChange={handleStatus}
                emptyMessage="No hay turnos agendados para hoy"
                sortComparer={(a, b) => a.appointment_time.localeCompare(b.appointment_time)}
              />
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="upcoming">
          <Card>
            <CardHeader>
              <CardTitle>Próximos Turnos</CardTitle>
              <CardDescription>
                Turnos agendados para los próximos días
              </CardDescription>
            </CardHeader>
            <CardContent>
              <AppointmentList 
                appointments={upcomingAppointments}
                services={services}
                onOpenDetails={handleOpenDetails}
                onStatusChange={handleStatus}
                emptyMessage="No hay próximos turnos agendados"
                sortComparer={(a, b) => {
                  // Ordenar por fecha primero, luego por hora
                  const dateA = new Date(a.appointment_date);
                  const dateB = new Date(b.appointment_date);
                  if (dateA.getTime() !== dateB.getTime()) {
                    return dateA.getTime() - dateB.getTime();
                  }
                  return a.appointment_time.localeCompare(b.appointment_time);
                }}
              />
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="past">
          <Card>
            <CardHeader>
              <CardTitle>Turnos Anteriores</CardTitle>
              <CardDescription>
                Historial de turnos pasados
              </CardDescription>
            </CardHeader>
            <CardContent>
              <AppointmentList 
                appointments={pastAppointments}
                services={services}
                onOpenDetails={handleOpenDetails}
                onStatusChange={handleStatus}
                emptyMessage="No hay turnos anteriores"
                sortComparer={(a, b) => {
                  // Ordenar por fecha desc, más recientes primero
                  const dateA = new Date(a.appointment_date);
                  const dateB = new Date(b.appointment_date);
                  if (dateA.getTime() !== dateB.getTime()) {
                    return dateB.getTime() - dateA.getTime();
                  }
                  return b.appointment_time.localeCompare(a.appointment_time);
                }}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        {selectedAppointment && (
          <AppointmentDetails
            appointment={selectedAppointment}
            services={services}
            onSaveNotes={handleUpdateNotes}
            onClose={() => setIsDetailsOpen(false)}
          />
        )}
      </Dialog>
    </div>
  );
};

export default AppointmentsPage;
