import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useBooking } from "@/contexts/BookingContext";
import { es } from "date-fns/locale";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import ClientLayout from "@/components/layouts/ClientLayout";
import { supabase } from "@/integrations/supabase/client";
import {
  Appointment,
  WorkingHours,
  Service,
  Exception,
  AppointmentStatus,
} from "@/types/database";
import { useAuthContext } from "@/contexts/AuthContext";
import {
  format,
  addDays,
  isToday,
  isBefore,
  startOfDay,
  parseISO,
  parse,
  addMinutes,
} from "date-fns";

// Horarios base predeterminados si no hay configuración específica
const DEFAULT_TIMES = [
  "09:00",
  "09:30",
  "10:00",
  "10:30",
  "11:00",
  "11:30",
  "14:00",
  "14:30",
  "15:00",
  "15:30",
  "16:00",
  "16:30",
  "17:00",
];

const TIME_SLOT_INTERVAL = 30; // minutos entre cada slot de tiempo

const CalendarPage = () => {
  const {
    selectedService,
    selectedDate,
    selectedTime,
    selectedManicurist,
    setSelectedDate,
    setSelectedTime,
  } = useBooking();
  const [availableTimes, setAvailableTimes] = useState<string[]>([]);
  const [workingHours, setWorkingHours] = useState<WorkingHours[]>([]);
  const [unavailableDates, setUnavailableDates] = useState<Date[]>([]);
  const [isLoadingDates, setIsLoadingDates] = useState(true);
  const [exceptions, setExceptions] = useState<Exception[]>([]);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { profile } = useAuthContext();

  // Verificar si hay un servicio seleccionado
  useEffect(() => {
    if (!selectedService) {
      toast({
        title: "Error",
        description: "Por favor, selecciona un servicio primero",
        variant: "destructive",
      });
      navigate("/services");
    }
  }, [selectedService, navigate, toast]);

  // Cargar horarios de trabajo y excepciones
  useEffect(() => {
    const loadScheduleData = async () => {
      if (!selectedService) return;

      setIsLoadingDates(true);

      try {
        // Determinar qué ID de manicurista usar - del servicio seleccionado o del manicurista seleccionado
        const manicuristId = selectedManicurist?.id || selectedService.manicurist_id;
        
        // Cargar horarios de trabajo
        const { data: hoursData, error: hoursError } = await supabase
          .from("working_hours")
          .select("*")
          .eq("manicurist_id", manicuristId);

        if (hoursError) {
          console.error("Error fetching working hours:", hoursError);
        } else {
          console.log("Horarios de trabajo cargados:", hoursData);
          setWorkingHours(hoursData || []);
        }

        // Cargar fechas de excepción
        const { data: exceptionsData, error: exceptionsError } = await supabase
          .from("exceptions")
          .select("*")
          .eq("manicurist_id", manicuristId);

        if (exceptionsError) {
          console.error("Error fetching exceptions:", exceptionsError);
        } else {
          console.log("Excepciones cargadas:", exceptionsData);
          setExceptions(exceptionsData || []);

          const exceptionDates = (exceptionsData || []).map((ex) =>
            parseISO(ex.exception_date)
          );
          setUnavailableDates(exceptionDates);
        }
      } catch (error) {
        console.error("Error loading schedule data:", error);
      } finally {
        setIsLoadingDates(false);
      }
    };

    loadScheduleData();
  }, [selectedService, selectedManicurist]);

  // Función para verificar si un horario se superpone con citas existentes
  const isOverlapping = (
    timeSlot: string,
    appointments: Appointment[],
    serviceDuration: number
  ) => {
    // Convertir el slot de tiempo a una fecha y hora para facilitar los cálculos
    const [hours, minutes] = timeSlot.split(":").map(Number);
    const slotTime = new Date();
    slotTime.setHours(hours, minutes, 0, 0);

    // Calcular el tiempo final del servicio
    const slotEndTime = new Date(slotTime);
    slotEndTime.setMinutes(slotTime.getMinutes() + serviceDuration);

    for (const apt of appointments) {
      const [aptHours, aptMinutes] = apt.appointment_time
        .split(":")
        .map(Number);
      const aptTime = new Date();
      aptTime.setHours(aptHours, aptMinutes, 0, 0);

      // Obtener la duración del servicio de esta cita
      let aptServiceDuration = 0;
      if (
        apt.service_id &&
        selectedService &&
        apt.service_id === selectedService.id
      ) {
        aptServiceDuration = selectedService.duration;
      } else {
        // Si no podemos determinar la duración específica, usamos un valor por defecto
        aptServiceDuration = 60; // 1 hora por defecto
      }

      // Calcular el tiempo final de esta cita existente
      const aptEndTime = new Date(aptTime);
      aptEndTime.setMinutes(aptTime.getMinutes() + aptServiceDuration);

      // Verificar superposición
      // (inicio1 < fin2) && (fin1 > inicio2)
      if (
        (slotTime < aptEndTime && slotEndTime > aptTime) ||
        (aptTime < slotEndTime && aptEndTime > slotTime)
      ) {
        return true; // Hay superposición
      }
    }

    return false; // No hay superposición
  };

  // Actualizar horarios disponibles cuando cambia la fecha
  useEffect(() => {
    const updateAvailableTimes = async () => {
      if (!selectedDate || !selectedService) {
        setAvailableTimes([]);
        return;
      }

      try {
        // Obtener el día de la semana (0 = domingo, 1 = lunes, ..., 6 = sábado)
        const dayOfWeek = selectedDate.getDay();

        console.log("Día de la semana seleccionado:", dayOfWeek);
        console.log("Horarios de trabajo disponibles:", workingHours);

        // Verificar si el día seleccionado es una excepción
        const formattedDate = format(selectedDate, "yyyy-MM-dd");
        const isException = exceptions.some(
          (ex) => ex.exception_date === formattedDate
        );

        if (isException) {
          console.log(
            "El día seleccionado es una excepción, no hay horarios disponibles"
          );
          setAvailableTimes([]);
          return;
        }

        // Buscar si hay un horario configurado para este día
        const dayConfig = workingHours.find(
          (wh) => wh.day_of_week === dayOfWeek
        );

        let possibleTimes: string[] = [];

        if (dayConfig) {
          console.log("Configuración encontrada para este día:", dayConfig);
          // Si hay configuración para este día, generar los horarios entre start_time y end_time
          const startParts = dayConfig.start_time.split(":");
          const endParts = dayConfig.end_time.split(":");

          const startHour = parseInt(startParts[0]);
          const startMinute = parseInt(startParts[1]);
          const endHour = parseInt(endParts[0]);
          const endMinute = parseInt(endParts[1]);

          // Generar horarios cada 30 minutos
          for (let h = startHour; h <= endHour; h++) {
            for (let m = 0; m < 60; m += 30) {
              // Saltarse horarios antes de la hora de inicio o después de la hora de fin
              if (
                (h === startHour && m < startMinute) ||
                (h === endHour && m > endMinute)
              ) {
                continue;
              }

              const hour = h.toString().padStart(2, "0");
              const minute = m.toString().padStart(2, "0");
              possibleTimes.push(`${hour}:${minute}`);
            }
          }
        } else {
          console.log(
            "No hay configuración para este día, usando horarios predeterminados si corresponde"
          );
          // Si no hay configuración y no es domingo, usar horarios predeterminados
          if (dayOfWeek !== 0) {
            possibleTimes = [...DEFAULT_TIMES];
          } else {
            // Si es domingo y no hay configuración específica, no hay horarios disponibles
            possibleTimes = [];
          }
        }

        // Determinar qué ID de manicurista usar
        const manicuristId = selectedManicurist?.id || selectedService.manicurist_id;

        // Verificar citas existentes para ese día para eliminar horarios ya ocupados
        if (possibleTimes.length > 0) {
          const { data: appointmentsData, error } = await supabase
            .from("appointments")
            .select("*, service:service_id(*)")
            .eq("appointment_date", formattedDate)
            .eq("manicurist_id", manicuristId)
            .in("status", ["pending", "confirmed"]);

          if (error) {
            console.error("Error fetching appointments:", error);
          } else if (appointmentsData && appointmentsData.length > 0) {
            console.log("Citas existentes para este día:", appointmentsData);

            // Convertir los datos de las citas al tipo Appointment correcto
            const typedAppointments = appointmentsData.map(
              (apt) => ({
                ...apt,
                status: apt.status as AppointmentStatus, // Aquí aseguramos que status sea del tipo AppointmentStatus
              })
            );

            // Filtrar los horarios disponibles teniendo en cuenta la duración del servicio
            possibleTimes = possibleTimes.filter((time) => {
              // Verificar si este tiempo se superpone con alguna cita existente
              return !isOverlapping(
                time,
                typedAppointments,
                selectedService.duration
              );
            });

            // Además, necesitamos verificar que haya suficiente tiempo disponible para el servicio
            possibleTimes = possibleTimes.filter((time) => {
              // Convertir el slot de tiempo a una fecha y hora
              const [hours, minutes] = time.split(":").map(Number);
              const startTime = new Date();
              startTime.setHours(hours, minutes, 0, 0);

              // Calcular el tiempo final del servicio
              const endTime = new Date(startTime);
              endTime.setMinutes(
                startTime.getMinutes() + selectedService.duration
              );

              // Verificar si hay suficiente tiempo disponible hasta el final del día o hasta la próxima cita
              const endHour = dayConfig
                ? parseInt(dayConfig.end_time.split(":")[0])
                : 18; // Usar 18:00 como hora de cierre por defecto
              const endMinute = dayConfig
                ? parseInt(dayConfig.end_time.split(":")[1])
                : 0;

              const dayEndTime = new Date();
              dayEndTime.setHours(endHour, endMinute, 0, 0);

              return endTime <= dayEndTime;
            });
          }
        }

        console.log("Horarios disponibles finales:", possibleTimes);
        setAvailableTimes(possibleTimes);
      } catch (error) {
        console.error("Error updating available times:", error);
        setAvailableTimes([]);
      }
    };

    updateAvailableTimes();
  }, [selectedDate, selectedService, selectedManicurist, workingHours, exceptions]);

  const handleDateSelect = (date: Date | undefined) => {
    if (date) {
      setSelectedDate(date);
      setSelectedTime(null); // Resetear el tiempo seleccionado
    }
  };

  const handleTimeSelect = (time: string) => {
    setSelectedTime(time);
  };

  const handleContinue = () => {
    if (selectedDate && selectedTime) {
      navigate("/client-info");
    }
  };

  // Función para verificar si una fecha debe estar deshabilitada
  const isDateDisabled = (date: Date) => {
    // No permitir fechas pasadas
    if (isBefore(date, startOfDay(new Date()))) {
      return true;
    }

    // No permitir fechas muy lejanas (30 días)
    if (isBefore(addDays(new Date(), 30), date)) {
      return true;
    }

    // Verificar si es una fecha de excepción
    const isException = unavailableDates.some(
      (d) =>
        d.getDate() === date.getDate() &&
        d.getMonth() === date.getMonth() &&
        d.getFullYear() === date.getFullYear()
    );

    if (isException) {
      return true;
    }

    // Verificar si hay horarios de trabajo configurados para este día
    const dayOfWeek = date.getDay();
    const dayHasWorkingHours = workingHours.some(
      (wh) => wh.day_of_week === dayOfWeek
    );

    // Si no hay configuración para este día y es domingo, deshabilitar
    if (!dayHasWorkingHours && dayOfWeek === 0) {
      return true;
    }

    // Si hay configuración explícita, verificar si está habilitado
    if (workingHours.length > 0 && !dayHasWorkingHours) {
      return true; // Día no configurado como laboral
    }

    return false;
  };

  return (
    <ClientLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-2xl md:text-3xl font-bold mb-4">
              Selecciona Fecha y Hora
            </h1>
            <p className="text-muted-foreground">
              Elige el día y horario para tu servicio de {selectedService?.name}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-white rounded-xl shadow-md p-6">
              <h2 className="text-xl font-semibold mb-4">
                Selecciona una fecha
              </h2>
              {isLoadingDates ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
                </div>
              ) : (
                <Calendar
                  mode="single"
                  selected={selectedDate || undefined}
                  onSelect={handleDateSelect}
                  disabled={isDateDisabled}
                  className="rounded-md border p-3 pointer-events-auto"
                  locale={es}
                />
              )}
            </div>

            <div className="bg-white rounded-xl shadow-md p-6">
              <h2 className="text-xl font-semibold mb-4">
                Selecciona un horario
              </h2>
              {selectedDate ? (
                <>
                  <p className="mb-4 text-sm">
                    Horarios disponibles para el{" "}
                    <span className="font-medium">
                      {format(selectedDate, "EEEE d 'de' MMMM", { locale: es })}
                    </span>
                  </p>

                  {availableTimes.length > 0 ? (
                    <div className="grid grid-cols-3 gap-3">
                      {availableTimes.map((time) => (
                        <button
                          key={time}
                          className={`px-3 py-2 border rounded-md text-sm transition-colors
                            ${
                              selectedTime === time
                                ? "bg-primary text-white"
                                : "bg-background hover:bg-secondary"
                            }`}
                          onClick={() => handleTimeSelect(time)}
                        >
                          {time}
                        </button>
                      ))}
                    </div>
                  ) : (
                    <p className="text-muted-foreground text-center py-8">
                      No hay horarios disponibles para esta fecha
                    </p>
                  )}
                </>
              ) : (
                <p className="text-muted-foreground text-center py-8">
                  Selecciona una fecha para ver los horarios disponibles
                </p>
              )}
            </div>
          </div>

          <div className="flex justify-between items-center mt-8">
            <Button variant="outline" onClick={() => navigate("/services")}>
              Volver
            </Button>
            <Button
              onClick={handleContinue}
              disabled={!selectedDate || !selectedTime}
            >
              Continuar
            </Button>
          </div>
        </div>
      </div>
    </ClientLayout>
  );
};

export default CalendarPage;
