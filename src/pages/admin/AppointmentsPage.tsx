import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { format, isToday, isFuture, isPast, addDays, isAfter, isBefore } from "date-fns";
import { es } from "date-fns/locale";
import { Calendar } from "@/components/ui/calendar";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { Badge } from "@/components/ui/badge";

// Tipo para una cita
type Appointment = {
  id: string;
  clientName: string;
  phone: string;
  service: string;
  date: Date;
  time: string;
  notes?: string;
  status: "pending" | "confirmed" | "cancelled" | "completed";
};

// Datos simulados de citas
const MOCK_APPOINTMENTS: Appointment[] = [
  {
    id: "1",
    clientName: "María García",
    phone: "1234567890",
    service: "Semipermanente",
    date: new Date(2025, 3, 28), // Hoy
    time: "10:00",
    status: "confirmed"
  },
  {
    id: "2",
    clientName: "Laura Pérez",
    phone: "2345678901",
    service: "Kapping",
    date: new Date(2025, 3, 28), // Hoy
    time: "14:30",
    notes: "Primera vez",
    status: "pending"
  },
  {
    id: "3",
    clientName: "Ana Rodríguez",
    phone: "3456789012",
    service: "Esculpidas",
    date: addDays(new Date(), 1), // Mañana
    time: "11:00",
    status: "confirmed"
  },
  {
    id: "4",
    clientName: "Gabriela López",
    phone: "4567890123",
    service: "Manicuría Tradicional",
    date: addDays(new Date(), 2), // Pasado mañana
    time: "16:00",
    status: "pending"
  },
  {
    id: "5",
    clientName: "Lucía Martínez",
    phone: "5678901234",
    service: "Pedicuría",
    date: addDays(new Date(), 3),
    time: "09:30",
    status: "pending"
  },
  {
    id: "6",
    clientName: "Carla Sánchez",
    phone: "6789012345",
    service: "Semipermanente",
    date: addDays(new Date(), -2), // Hace 2 días
    time: "15:00",
    status: "completed"
  }
];

const AppointmentsPage = () => {
  const [appointments, setAppointments] = useState<Appointment[]>(MOCK_APPOINTMENTS);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [notes, setNotes] = useState("");
  const { toast } = useToast();

  const todayAppointments = appointments.filter(apt => isToday(apt.date));
  const upcomingAppointments = appointments.filter(apt => isFuture(apt.date) && !isToday(apt.date));
  const pastAppointments = appointments.filter(apt => isPast(apt.date) && !isToday(apt.date));
  
  const dateAppointments = selectedDate 
    ? appointments.filter(apt => 
        apt.date.getDate() === selectedDate.getDate() &&
        apt.date.getMonth() === selectedDate.getMonth() &&
        apt.date.getFullYear() === selectedDate.getFullYear()
      )
    : [];

  const handleStatus = (id: string, newStatus: Appointment["status"]) => {
    const updatedAppointments = appointments.map(apt =>
      apt.id === id ? { ...apt, status: newStatus } : apt
    );
    setAppointments(updatedAppointments);

    const appointment = appointments.find(apt => apt.id === id);
    toast({
      title: "Estado actualizado",
      description: `La cita de ${appointment?.clientName} ha sido ${
        newStatus === "confirmed" ? "confirmada" : 
        newStatus === "cancelled" ? "cancelada" : "actualizada"
      }`
    });
  };

  const handleOpenDetails = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    setNotes(appointment.notes || "");
    setIsDetailsOpen(true);
  };

  const handleUpdateNotes = () => {
    if (!selectedAppointment) return;

    const updatedAppointments = appointments.map(apt =>
      apt.id === selectedAppointment.id ? { ...apt, notes } : apt
    );
    setAppointments(updatedAppointments);
    setIsDetailsOpen(false);

    toast({
      title: "Notas actualizadas",
      description: "Las notas de la cita han sido actualizadas correctamente"
    });
  };

  const getStatusColor = (status: Appointment["status"]) => {
    switch (status) {
      case "confirmed": return "bg-green-100 text-green-800";
      case "pending": return "bg-amber-100 text-amber-800";
      case "cancelled": return "bg-red-100 text-red-800";
      case "completed": return "bg-blue-100 text-blue-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusText = (status: Appointment["status"]) => {
    switch (status) {
      case "confirmed": return "Confirmado";
      case "pending": return "Pendiente";
      case "cancelled": return "Cancelado";
      case "completed": return "Completado";
      default: return status;
    }
  };

  const renderAppointmentCard = (appointment: Appointment) => (
    <div key={appointment.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="font-medium">{appointment.clientName}</h3>
          <p className="text-sm text-muted-foreground">{appointment.service}</p>
          <p className="text-sm text-muted-foreground">
            {format(appointment.date, "d MMM yyyy", { locale: es })} - {appointment.time}
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
      </div>
    </div>
  );

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
                    {selectedDate ? format(selectedDate, "EEEE d 'de' MMMM 'de' yyyy", { locale: es }) : "Ninguna fecha seleccionada"}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {dateAppointments.length} {dateAppointments.length === 1 ? "turno" : "turnos"} para esta fecha
                  </p>
                </div>
              </CardContent>
            </Card>

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
                {dateAppointments.length > 0 ? (
                  <div className="space-y-4">
                    {dateAppointments
                      .sort((a, b) => a.time.localeCompare(b.time))
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
                {format(new Date(), "EEEE d 'de' MMMM 'de' yyyy", { locale: es })}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {todayAppointments.length > 0 ? (
                <div className="space-y-4">
                  {todayAppointments
                    .sort((a, b) => a.time.localeCompare(b.time))
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
                    .sort((a, b) => a.date.getTime() - b.date.getTime())
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
              <CardDescription>
                Historial de turnos pasados
              </CardDescription>
            </CardHeader>
            <CardContent>
              {pastAppointments.length > 0 ? (
                <div className="space-y-4">
                  {pastAppointments
                    .sort((a, b) => b.date.getTime() - a.date.getTime())
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
                  <Label className="text-sm text-muted-foreground">Cliente</Label>
                  <p className="font-medium">{selectedAppointment.clientName}</p>
                </div>
                <div>
                  <Label className="text-sm text-muted-foreground">Teléfono</Label>
                  <p className="font-medium">{selectedAppointment.phone}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm text-muted-foreground">Servicio</Label>
                  <p className="font-medium">{selectedAppointment.service}</p>
                </div>
                <div>
                  <Label className="text-sm text-muted-foreground">Estado</Label>
                  <Badge className={`mt-1 ${getStatusColor(selectedAppointment.status)}`}>
                    {getStatusText(selectedAppointment.status)}
                  </Badge>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm text-muted-foreground">Fecha</Label>
                  <p className="font-medium">{format(selectedAppointment.date, "d MMMM yyyy", { locale: es })}</p>
                </div>
                <div>
                  <Label className="text-sm text-muted-foreground">Hora</Label>
                  <p className="font-medium">{selectedAppointment.time}</p>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="notes" className="text-sm text-muted-foreground">Notas</Label>
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
            <Button onClick={handleUpdateNotes}>
              Guardar Cambios
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AppointmentsPage;
