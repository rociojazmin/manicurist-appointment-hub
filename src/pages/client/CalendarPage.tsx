
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useBooking } from "@/contexts/BookingContext";
import { format, addDays, isToday, isBefore, startOfDay } from "date-fns";
import { es } from "date-fns/locale";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import ClientLayout from "@/components/layouts/ClientLayout";
import { supabase } from "@/integrations/supabase/client";
import { Appointment, WorkingHours } from "@/types/database";
import { useAuthContext } from "@/contexts/AuthContext";

// Horarios base predeterminados si no hay configuración específica
const DEFAULT_TIMES = [
  "09:00", "09:30", "10:00", "10:30", "11:00", "11:30",
  "14:00", "14:30", "15:00", "15:30", "16:00", "16:30", "17:00"
];

// Días no disponibles (ej: domingos y algunos sábados)
const isDateUnavailable = async (date: Date, manicuristId: string | null) => {
  const day = date.getDay();
  
  // Verificar si existe una excepción para esta fecha
  if (manicuristId) {
    const formattedDate = format(date, "yyyy-MM-dd");
    const { data } = await supabase
      .from('exceptions')
      .select('*')
      .eq('manicurist_id', manicuristId)
      .eq('exception_date', formattedDate);
      
    if (data && data.length > 0) {
      return true; // Esta fecha es una excepción, no disponible
    }
  }
  
  // Por defecto, domingos no disponibles
  return day === 0;
};

const CalendarPage = () => {
  const { selectedService, selectedDate, selectedTime, setSelectedDate, setSelectedTime } = useBooking();
  const [availableTimes, setAvailableTimes] = useState<string[]>([]);
  const [workingHours, setWorkingHours] = useState<WorkingHours[]>([]);
  const [unavailableDates, setUnavailableDates] = useState<Date[]>([]);
  const [isLoadingDates, setIsLoadingDates] = useState(true);
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
        // Cargar horarios de trabajo
        const { data: hoursData, error: hoursError } = await supabase
          .from('working_hours')
          .select('*')
          .eq('manicurist_id', selectedService.manicurist_id);
          
        if (hoursError) {
          console.error('Error fetching working hours:', hoursError);
        } else {
          setWorkingHours(hoursData || []);
        }
        
        // Cargar fechas de excepción
        const { data: exceptionsData, error: exceptionsError } = await supabase
          .from('exceptions')
          .select('*')
          .eq('manicurist_id', selectedService.manicurist_id);
          
        if (exceptionsError) {
          console.error('Error fetching exceptions:', exceptionsError);
        } else {
          const exceptionDates = (exceptionsData || []).map(ex => new Date(ex.exception_date));
          setUnavailableDates(exceptionDates);
        }
      } catch (error) {
        console.error('Error loading schedule data:', error);
      } finally {
        setIsLoadingDates(false);
      }
    };
    
    loadScheduleData();
  }, [selectedService]);

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
        
        // Buscar si hay un horario configurado para este día
        const dayConfig = workingHours.find(wh => wh.day_of_week === dayOfWeek);
        
        let possibleTimes: string[] = [];
        
        if (dayConfig) {
          // Si hay configuración para este día, generar los horarios entre start_time y end_time
          const startParts = dayConfig.start_time.split(':');
          const endParts = dayConfig.end_time.split(':');
          
          const startHour = parseInt(startParts[0]);
          const startMinute = parseInt(startParts[1]);
          const endHour = parseInt(endParts[0]);
          const endMinute = parseInt(endParts[1]);
          
          // Generar horarios cada 30 minutos
          for (let h = startHour; h <= endHour; h++) {
            for (let m = 0; m < 60; m += 30) {
              // Saltarse horarios antes de la hora de inicio o después de la hora de fin
              if ((h === startHour && m < startMinute) || 
                  (h === endHour && m > endMinute)) {
                continue;
              }
              
              const hour = h.toString().padStart(2, '0');
              const minute = m.toString().padStart(2, '0');
              possibleTimes.push(`${hour}:${minute}`);
            }
          }
        } else {
          // Si no hay configuración, usar horarios predeterminados
          possibleTimes = [...DEFAULT_TIMES];
        }
        
        // Verificar citas existentes para ese día para eliminar horarios ya ocupados
        const formattedDate = format(selectedDate, "yyyy-MM-dd");
        
        const { data: appointments, error } = await supabase
          .from('appointments')
          .select('*')
          .eq('appointment_date', formattedDate)
          .eq('manicurist_id', selectedService.manicurist_id)
          .in('status', ['pending', 'confirmed']);
          
        if (error) {
          console.error('Error fetching appointments:', error);
        } else if (appointments && appointments.length > 0) {
          // Eliminar horarios ya reservados
          const bookedTimes = appointments.map(apt => apt.appointment_time);
          possibleTimes = possibleTimes.filter(time => !bookedTimes.includes(time));
        }
        
        setAvailableTimes(possibleTimes);
      } catch (error) {
        console.error('Error updating available times:', error);
        setAvailableTimes([]);
      }
    };
    
    updateAvailableTimes();
  }, [selectedDate, selectedService, workingHours]);

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

  const isDateDisabled = async (date: Date) => {
    // No permitir fechas pasadas
    if (isBefore(date, startOfDay(new Date()))) {
      return true;
    }
    
    // No permitir fechas muy lejanas (30 días)
    if (isBefore(addDays(new Date(), 30), date)) {
      return true;
    }
    
    // Verificar si es una fecha de excepción
    if (selectedService) {
      return await isDateUnavailable(date, selectedService.manicurist_id);
    }
    
    return false;
  };

  return (
    <ClientLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-2xl md:text-3xl font-bold mb-4">Selecciona Fecha y Hora</h1>
            <p className="text-muted-foreground">
              Elige el día y horario para tu servicio de {selectedService?.name}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-white rounded-xl shadow-md p-6">
              <h2 className="text-xl font-semibold mb-4">Selecciona una fecha</h2>
              {isLoadingDates ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
                </div>
              ) : (
                <Calendar
                  mode="single"
                  selected={selectedDate || undefined}
                  onSelect={handleDateSelect}
                  disabled={(date) => {
                    // Verificación básica para la UI
                    const day = date.getDay();
                    const isPastDate = isBefore(date, startOfDay(new Date()));
                    const isTooFar = isBefore(addDays(new Date(), 30), date);
                    const isException = unavailableDates.some(d => 
                      d.getDate() === date.getDate() && 
                      d.getMonth() === date.getMonth() && 
                      d.getFullYear() === date.getFullYear()
                    );
                    
                    // Por defecto, domingo no disponible
                    return isPastDate || isTooFar || day === 0 || isException;
                  }}
                  className="rounded-md border p-3 pointer-events-auto"
                  locale={es}
                />
              )}
            </div>

            <div className="bg-white rounded-xl shadow-md p-6">
              <h2 className="text-xl font-semibold mb-4">Selecciona un horario</h2>
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
                            ${selectedTime === time 
                              ? "bg-primary text-white" 
                              : "bg-background hover:bg-secondary"}`}
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
            <Button
              variant="outline"
              onClick={() => navigate("/services")}
            >
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
