
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { useAppointments } from "@/hooks/useAppointments";
import AppointmentDetails from "@/components/admin/AppointmentDetails";
import DateView from "@/components/admin/DateView";
import AppointmentListView from "@/components/admin/AppointmentListView";

const AppointmentsPage = () => {
  const {
    todayAppointments,
    upcomingAppointments,
    pastAppointments,
    dateAppointments,
    selectedDate,
    setSelectedDate,
    isDetailsOpen,
    setIsDetailsOpen,
    selectedAppointment,
    notes,
    setNotes,
    loading,
    handleStatus,
    handleOpenDetails,
    handleUpdateNotes,
  } = useAppointments();

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
          <TabsTrigger value="today">
            Hoy ({todayAppointments.length})
          </TabsTrigger>
          <TabsTrigger value="upcoming">
            Próximos ({upcomingAppointments.length})
          </TabsTrigger>
          <TabsTrigger value="past">
            Anteriores ({pastAppointments.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all">
          <DateView
            selectedDate={selectedDate}
            onDateSelect={setSelectedDate}
            dateAppointments={dateAppointments}
            onViewDetails={handleOpenDetails}
            onStatusChange={handleStatus}
          />
        </TabsContent>

        <TabsContent value="today">
          <AppointmentListView
            title="Turnos de Hoy"
            description={format(new Date(), "EEEE d 'de' MMMM 'de' yyyy", {
              locale: es,
            })}
            appointments={todayAppointments}
            emptyMessage="No hay turnos agendados para hoy"
            sortFunction={(a, b) => a.appointment_time.localeCompare(b.appointment_time)}
            onViewDetails={handleOpenDetails}
            onStatusChange={handleStatus}
          />
        </TabsContent>

        <TabsContent value="upcoming">
          <AppointmentListView
            title="Próximos Turnos"
            description="Turnos agendados para los próximos días"
            appointments={upcomingAppointments}
            emptyMessage="No hay próximos turnos agendados"
            sortFunction={(a, b) => {
              // Ordenar por fecha primero, luego por hora
              const dateA = new Date(a.appointment_date);
              const dateB = new Date(b.appointment_date);
              if (dateA.getTime() !== dateB.getTime()) {
                return dateA.getTime() - dateB.getTime();
              }
              return a.appointment_time.localeCompare(b.appointment_time);
            }}
            onViewDetails={handleOpenDetails}
            onStatusChange={handleStatus}
          />
        </TabsContent>

        <TabsContent value="past">
          <AppointmentListView
            title="Turnos Anteriores"
            description="Historial de turnos pasados"
            appointments={pastAppointments}
            emptyMessage="No hay turnos anteriores"
            sortFunction={(a, b) => {
              // Ordenar por fecha desc, más recientes primero
              const dateA = new Date(a.appointment_date);
              const dateB = new Date(b.appointment_date);
              if (dateA.getTime() !== dateB.getTime()) {
                return dateB.getTime() - dateA.getTime();
              }
              return b.appointment_time.localeCompare(a.appointment_time);
            }}
            onViewDetails={handleOpenDetails}
            onStatusChange={handleStatus}
          />
        </TabsContent>
      </Tabs>

      <AppointmentDetails
        isOpen={isDetailsOpen}
        onOpenChange={setIsDetailsOpen}
        selectedAppointment={selectedAppointment}
        notes={notes}
        onNotesChange={setNotes}
        onUpdateNotes={handleUpdateNotes}
      />
    </div>
  );
};

export default AppointmentsPage;
