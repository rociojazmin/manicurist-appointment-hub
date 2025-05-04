import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { format, isToday, isFuture, isPast, isAfter, isBefore } from "date-fns";
import { es } from "date-fns/locale";
import { Calendar } from "@/components/ui/calendar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { Appointment, Service, AppointmentStatus } from "@/types/database";
import { useAuthContext } from "@/contexts/AuthContext";

// Tipo para las citas con información del servicio
interface AppointmentWithService extends Appointment {
  service: Service;
}

const AppointmentsPage = () => {
  const [appointments, setAppointments] = useState<AppointmentWithService[]>(
    []
  );
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(
    new Date()
  );
  const [selectedAppointment, setSelectedAppointment] =
    useState<AppointmentWithService | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { profile } = useAuthContext();

  // Cargar citas desde la base de datos
  useEffect(() => {
    const fetchAppointments = async () => {
      if (!profile) return;

      setLoading(true);
      try {
        // Cargar todas las citas con información del servicio
        const { data, error } = await supabase
          .from("appointments")
          .select(
            `
            *,
            service:service_id(*)
          `
          )
          .eq("manicurist_id", profile.id)
          .order("appointment_date", { ascending: false });

        if (error) {
          console.error("Error fetching appointments:", error);
          toast({
            title: "Error",
            description: "No se pudieron cargar las citas",
            variant: "destructive",
          });
        } else {
          // Convertir los datos y asegurarse de que el tipo sea correcto
          const formattedAppointments = (data || []).map((appointment) => {
            // Asegurarse de que el status sea del tipo correcto
            return {
              ...appointment,
              status: appointment.status as AppointmentStatus,
              service: appointment.service as unknown as Service,
            } as AppointmentWithService;
          });

          setAppointments(formattedAppointments);
        }
      } catch (error) {
        console.error("Error:", error);
      } finally {
        setLoading(false);
      }
    };

    if (profile) {
      fetchAppointments();
    }
  }, [profile, toast]);

  // Filtrar citas por fecha y estado
  const todayAppointments = appointments.filter(
    (apt) =>
      format(new Date(apt.appointment_date), "yyyy-MM-dd") ===
      format(new Date(), "yyyy-MM-dd")
  );

  const upcomingAppointments = appointments.filter((apt) => {
    const aptDate = new Date(apt.appointment_date);
    return isFuture(aptDate) && !isToday(aptDate);
  });

  const pastAppointments = appointments.filter((apt) => {
    const aptDate = new Date(apt.appointment_date);
    return isPast(aptDate) && !isToday(aptDate);
  });

  const dateAppointments = selectedDate
    ? appointments.filter((apt) => {
        const aptDate = new Date(apt.appointment_date);
        return (
          aptDate.getDate() === selectedDate.getDate() &&
          aptDate.getMonth() === selectedDate.getMonth() &&
          aptDate.getFullYear() === selectedDate.getFullYear()
        );
      })
    : [];

  const handleStatus = async (id: string, newStatus: Appointment["status"]) => {
    if (!profile) return;

    try {
      const { error } = await supabase
        .from("appointments")
        .update({ status: newStatus, updated_at: new Date().toISOString() })
        .eq("id", id);

      if (error) {
        console.error("Error updating appointment status:", error);
        toast({
          title: "Error",
          description: "No se pudo actualizar el estado de la cita",
          variant: "destructive",
        });
        return;
      }

      // Actualizar estado local
      setAppointments((prev) =>
        prev.map((apt) => (apt.id === id ? { ...apt, status: newStatus } : apt))
      );

      // Si la cita seleccionada es la que se actualizó, actualizar también
      if (selectedAppointment?.id === id) {
        setSelectedAppointment({ ...selectedAppointment, status: newStatus });
      }

      const appointment = appointments.find((apt) => apt.id === id);
      toast({
        title: "Estado actualizado",
        description: `La cita de ${appointment?.client_name} ha sido ${
          newStatus === "confirmed"
            ? "confirmada"
            : newStatus === "cancelled"
            ? "cancelada"
            : newStatus === "completed"
            ? "completada"
            : "actualizada"
        }`,
      });
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const handleOpenDetails = (appointment: AppointmentWithService) => {
    setSelectedAppointment(appointment);
    setNotes(appointment.notes || "");
    setIsDetailsOpen(true);
  };

  const handleUpdateNotes = async () => {
    if (!selectedAppointment) return;

    try {
      // Actualizar notas en la base de datos
      const { error } = await supabase
        .from("appointments")
        .update({
          notes: notes,
          updated_at: new Date().toISOString(),
        })
        .eq("id", selectedAppointment.id);

      if (error) {
        console.error("Error updating appointment notes:", error);
        toast({
          title: "Error",
          description: "No se pudieron actualizar las notas",
          variant: "destructive",
        });
        return;
      }

      // Actualizar estado local
      setAppointments((prev) =>
        prev.map((apt) =>
          apt.id === selectedAppointment.id ? { ...apt, notes } : apt
        )
      );
      setIsDetailsOpen(false);

      toast({
        title: "Notas actualizadas",
        description: "Las notas de la cita han sido actualizadas correctamente",
      });
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const getStatusColor = (status: Appointment["status"]) => {
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

  const getStatusText = (status: Appointment["status"]) => {
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

  const renderAppointmentCard = (appointment: AppointmentWithService) => (
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
          onClick={() => handleOpenDetails(appointment)}
        >
          Detalles
        </Button>
        {appointment.status === "pending" && (
          <>
            <Button
              variant="outline"
              size="sm"
              className="text-green-600 border-green-600 hover:bg-green-50"
              onClick={() => handleStatus(appointment.id, "confirmed")}
            >
              Confirmar
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="text-red-600 border-red-600 hover:bg-red-50"
              onClick={() => handleStatus(appointment.id, "cancelled")}
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
            onClick={() => handleStatus(appointment.id, "completed")}
          >
            Completar
          </Button>
        )}
      </div>
    </div>
  );

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
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="md:col-span-1">
              <CardHeader>
                <CardTitle>Selecciona una Fecha</CardTitle>
                <CardDescription>
                  Visualiza los turnos para un día específico
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={setSelectedDate}
                  className="border rounded-md p-3 pointer-events-auto"
                  locale={es}
                />
                <div className="mt-4 space-y-2">
                  <p className="text-sm font-medium">
                    {selectedDate
                      ? format(selectedDate, "EEEE d 'de' MMMM 'de' yyyy", {
                          locale: es,
                        })
                      : "Ninguna fecha seleccionada"}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {dateAppointments.length}{" "}
                    {dateAppointments.length === 1 ? "turno" : "turnos"} para
                    esta fecha
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle>Turnos del Día</CardTitle>
                <CardDescription>
                  {selectedDate
                    ? `Turnos para el ${format(selectedDate, "d 'de' MMMM", {
                        locale: es,
                      })}`
                    : "Selecciona una fecha para ver los turnos"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {dateAppointments.length > 0 ? (
                  <div className="space-y-4">
                    {dateAppointments
                      .sort((a, b) =>
                        a.appointment_time.localeCompare(b.appointment_time)
                      )
                      .map(renderAppointmentCard)}
                  </div>
                ) : (
                  <p className="text-center py-8 text-muted-foreground">
                    No hay turnos agendados para esta fecha
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="today">
          <Card>
            <CardHeader>
              <CardTitle>Turnos de Hoy</CardTitle>
              <CardDescription>
                {format(new Date(), "EEEE d 'de' MMMM 'de' yyyy", {
                  locale: es,
                })}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {todayAppointments.length > 0 ? (
                <div className="space-y-4">
                  {todayAppointments
                    .sort((a, b) =>
                      a.appointment_time.localeCompare(b.appointment_time)
                    )
                    .map(renderAppointmentCard)}
                </div>
              ) : (
                <p className="text-center py-8 text-muted-foreground">
                  No hay turnos agendados para hoy
                </p>
              )}
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
              {upcomingAppointments.length > 0 ? (
                <div className="space-y-4">
                  {upcomingAppointments
                    .sort((a, b) => {
                      // Ordenar por fecha primero, luego por hora
                      const dateA = new Date(a.appointment_date);
                      const dateB = new Date(b.appointment_date);
                      if (dateA.getTime() !== dateB.getTime()) {
                        return dateA.getTime() - dateB.getTime();
                      }
                      return a.appointment_time.localeCompare(
                        b.appointment_time
                      );
                    })
                    .map(renderAppointmentCard)}
                </div>
              ) : (
                <p className="text-center py-8 text-muted-foreground">
                  No hay próximos turnos agendados
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="past">
          <Card>
            <CardHeader>
              <CardTitle>Turnos Anteriores</CardTitle>
              <CardDescription>Historial de turnos pasados</CardDescription>
            </CardHeader>
            <CardContent>
              {pastAppointments.length > 0 ? (
                <div className="space-y-4">
                  {pastAppointments
                    .sort((a, b) => {
                      // Ordenar por fecha desc, más recientes primero
                      const dateA = new Date(a.appointment_date);
                      const dateB = new Date(b.appointment_date);
                      if (dateA.getTime() !== dateB.getTime()) {
                        return dateB.getTime() - dateA.getTime();
                      }
                      return b.appointment_time.localeCompare(
                        a.appointment_time
                      );
                    })
                    .map(renderAppointmentCard)}
                </div>
              ) : (
                <p className="text-center py-8 text-muted-foreground">
                  No hay turnos anteriores
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Detalles del Turno</DialogTitle>
            <DialogDescription>
              Información completa del turno seleccionado
            </DialogDescription>
          </DialogHeader>
          {selectedAppointment && (
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm text-muted-foreground">
                    Cliente
                  </Label>
                  <p className="font-medium">
                    {selectedAppointment.client_name}
                  </p>
                </div>
                <div>
                  <Label className="text-sm text-muted-foreground">
                    Teléfono
                  </Label>
                  <p className="font-medium">
                    {selectedAppointment.client_phone}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm text-muted-foreground">
                    Servicio
                  </Label>
                  <p className="font-medium">
                    {selectedAppointment.service?.name ||
                      "Servicio no encontrado"}
                  </p>
                </div>
                <div>
                  <Label className="text-sm text-muted-foreground">
                    Estado
                  </Label>
                  <Badge
                    className={`mt-1 ${getStatusColor(
                      selectedAppointment.status
                    )}`}
                  >
                    {getStatusText(selectedAppointment.status)}
                  </Badge>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm text-muted-foreground">Fecha</Label>
                  <p className="font-medium">
                    {format(
                      new Date(selectedAppointment.appointment_date),
                      "d MMMM yyyy",
                      { locale: es }
                    )}
                  </p>
                </div>
                <div>
                  <Label className="text-sm text-muted-foreground">Hora</Label>
                  <p className="font-medium">
                    {selectedAppointment.appointment_time}
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="notes"
                  className="text-sm text-muted-foreground"
                >
                  Notas
                </Label>
                <Textarea
                  id="notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Añade notas sobre este turno..."
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDetailsOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleUpdateNotes}>Guardar Cambios</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AppointmentsPage;
