
import { useState, useEffect } from "react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { supabase } from "@/integrations/supabase/client";
import { useAuthContext } from "@/contexts/AuthContext";
import { Appointment, Service } from "@/types/database";
import { Calendar } from "@/components/ui/calendar";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar as CalendarIcon, Loader2, Phone, Clock, ArrowRight } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

type AppointmentWithService = Appointment & {
  service: Service;
};

const statusColors: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800",
  confirmed: "bg-green-100 text-green-800",
  cancelled: "bg-red-100 text-red-800",
  completed: "bg-blue-100 text-blue-800",
};

const statusTranslations: Record<string, string> = {
  pending: "Pendiente",
  confirmed: "Confirmado",
  cancelled: "Cancelado",
  completed: "Completado",
};

const AppointmentsPage = () => {
  const { profile, isLoading: isProfileLoading } = useAuthContext();
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [appointments, setAppointments] = useState<AppointmentWithService[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [view, setView] = useState<"day" | "week" | "all">("day");
  const { toast } = useToast();

  useEffect(() => {
    const loadAppointments = async () => {
      if (!profile?.id) return;
      
      try {
        setIsLoading(true);
        
        let query = supabase
          .from("appointments")
          .select("*, service:service_id(*)") 
          .eq("manicurist_id", profile.id);
        
        if (view === "day") {
          const formattedDate = format(selectedDate, "yyyy-MM-dd");
          query = query.eq("appointment_date", formattedDate);
        } else if (view === "week") {
          // Obtener fechas de la semana
          const startOfWeek = new Date(selectedDate);
          startOfWeek.setDate(selectedDate.getDate() - selectedDate.getDay());
          
          const endOfWeek = new Date(startOfWeek);
          endOfWeek.setDate(startOfWeek.getDate() + 6);
          
          const startFormatted = format(startOfWeek, "yyyy-MM-dd");
          const endFormatted = format(endOfWeek, "yyyy-MM-dd");
          
          query = query
            .gte("appointment_date", startFormatted)
            .lte("appointment_date", endFormatted);
        }
        
        const { data, error } = await query.order("appointment_date", { ascending: true })
          .order("appointment_time", { ascending: true });
        
        if (error) {
          throw error;
        }
        
        setAppointments(data as AppointmentWithService[]);
      } catch (error) {
        console.error("Error al cargar citas:", error);
        toast({
          title: "Error",
          description: "No se pudieron cargar las citas",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    if (!isProfileLoading) {
      loadAppointments();
    }
  }, [profile, selectedDate, view, isProfileLoading, toast]);

  const updateAppointmentStatus = async (id: string, status: string) => {
    try {
      const { error } = await supabase
        .from("appointments")
        .update({ status })
        .eq("id", id);
      
      if (error) throw error;
      
      // Actualizar el estado local
      setAppointments(prev => 
        prev.map(apt => apt.id === id ? { ...apt, status } : apt)
      );
      
      toast({
        title: "Estado actualizado",
        description: `La cita ha sido marcada como ${statusTranslations[status].toLowerCase()}`,
      });
    } catch (error) {
      console.error("Error al actualizar el estado:", error);
      toast({
        title: "Error",
        description: "No se pudo actualizar el estado de la cita",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="container mx-auto p-4">
      <div className="flex flex-col space-y-8">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Citas</h2>
          <p className="text-muted-foreground">
            Administra tus citas y gestiona tu agenda
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="col-span-1">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CalendarIcon className="h-5 w-5" />
                <span>Calendario</span>
              </CardTitle>
              <CardDescription>Selecciona una fecha para ver tus citas</CardDescription>
            </CardHeader>
            <CardContent>
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={(date) => date && setSelectedDate(date)}
                className="rounded-md border"
                locale={es}
              />
            </CardContent>
            <CardFooter className="flex flex-col gap-4">
              <Select value={view} onValueChange={(value) => setView(value as "day" | "week" | "all")}>
                <SelectTrigger>
                  <SelectValue placeholder="Ver por" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="day">Día</SelectItem>
                  <SelectItem value="week">Semana</SelectItem>
                  <SelectItem value="all">Todas</SelectItem>
                </SelectContent>
              </Select>
            </CardFooter>
          </Card>

          <div className="col-span-1 md:col-span-3">
            <Tabs defaultValue="upcoming">
              <div className="flex items-center justify-between">
                <TabsList>
                  <TabsTrigger value="upcoming">Próximas</TabsTrigger>
                  <TabsTrigger value="all">Todas</TabsTrigger>
                </TabsList>
                <div className="text-sm text-muted-foreground">
                  {view === "day" && `Citas para el ${format(selectedDate, "d 'de' MMMM", { locale: es })}`}
                  {view === "week" && "Citas de la semana"}
                  {view === "all" && "Todas las citas"}
                </div>
              </div>
              
              <TabsContent value="upcoming" className="mt-4">
                {isLoading ? (
                  <div className="flex justify-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  </div>
                ) : appointments.length === 0 ? (
                  <div className="text-center py-12">
                    <p className="text-muted-foreground">No hay citas programadas para esta fecha</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-4">
                    {appointments
                      .filter(apt => ["pending", "confirmed"].includes(apt.status))
                      .map((apt) => (
                        <AppointmentCard 
                          key={apt.id} 
                          appointment={apt} 
                          onStatusUpdate={updateAppointmentStatus} 
                        />
                      ))}
                  </div>
                )}
              </TabsContent>
              
              <TabsContent value="all" className="mt-4">
                {isLoading ? (
                  <div className="flex justify-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  </div>
                ) : appointments.length === 0 ? (
                  <div className="text-center py-12">
                    <p className="text-muted-foreground">No hay citas registradas</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-4">
                    {appointments.map((apt) => (
                      <AppointmentCard 
                        key={apt.id} 
                        appointment={apt} 
                        onStatusUpdate={updateAppointmentStatus} 
                      />
                    ))}
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
};

interface AppointmentCardProps {
  appointment: AppointmentWithService;
  onStatusUpdate: (id: string, status: string) => void;
}

const AppointmentCard = ({ appointment, onStatusUpdate }: AppointmentCardProps) => {
  // Formatear la fecha para mostrarla de forma más legible
  const displayDate = format(
    new Date(appointment.appointment_date), 
    "EEEE, d 'de' MMMM", 
    { locale: es }
  );
  
  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <CardTitle>{appointment.client_name}</CardTitle>
          <Badge className={statusColors[appointment.status]}>
            {statusTranslations[appointment.status]}
          </Badge>
        </div>
        <CardDescription className="flex items-center gap-1">
          <Phone className="h-3 w-3" />
          <span>{appointment.client_phone}</span>
        </CardDescription>
      </CardHeader>
      <CardContent className="pb-2">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm font-medium text-muted-foreground">Servicio</p>
            <p>{appointment.service?.name || "No disponible"}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">Precio</p>
            <p>${appointment.service?.price || "N/A"}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">Fecha</p>
            <p>{displayDate}</p>
          </div>
          <div className="flex items-center gap-1">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <p>{appointment.appointment_time}</p>
            <ArrowRight className="h-3 w-3 text-muted-foreground mx-1" />
            <p>{calculateEndTime(appointment.appointment_time, appointment.service?.duration || 0)}</p>
          </div>
        </div>
        
        {appointment.notes && (
          <div className="mt-4">
            <p className="text-sm font-medium text-muted-foreground">Notas</p>
            <p className="text-sm">{appointment.notes}</p>
          </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-end gap-2">
        {appointment.status === "pending" && (
          <>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => onStatusUpdate(appointment.id, "cancelled")}
            >
              Cancelar
            </Button>
            <Button 
              size="sm"
              onClick={() => onStatusUpdate(appointment.id, "confirmed")}
            >
              Confirmar
            </Button>
          </>
        )}
        
        {appointment.status === "confirmed" && (
          <>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => onStatusUpdate(appointment.id, "cancelled")}
            >
              Cancelar
            </Button>
            <Button 
              size="sm"
              onClick={() => onStatusUpdate(appointment.id, "completed")}
            >
              Completar
            </Button>
          </>
        )}
        
        {appointment.status === "cancelled" && (
          <Button 
            size="sm"
            onClick={() => onStatusUpdate(appointment.id, "confirmed")}
          >
            Reactivar
          </Button>
        )}
        
        {appointment.status === "completed" && (
          <Button 
            variant="outline" 
            size="sm"
            disabled
          >
            Completada
          </Button>
        )}
      </CardFooter>
    </Card>
  );
};

// Función para calcular la hora de finalización basada en la duración del servicio
const calculateEndTime = (startTime: string, durationMinutes: number): string => {
  const [hours, minutes] = startTime.split(":").map(Number);
  
  const startDate = new Date();
  startDate.setHours(hours, minutes, 0, 0);
  
  const endDate = new Date(startDate.getTime() + durationMinutes * 60000);
  
  const endHours = endDate.getHours().toString().padStart(2, "0");
  const endMinutes = endDate.getMinutes().toString().padStart(2, "0");
  
  return `${endHours}:${endMinutes}`;
};

export default AppointmentsPage;
