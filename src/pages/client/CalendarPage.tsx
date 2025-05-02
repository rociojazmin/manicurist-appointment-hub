
import { useState, useEffect } from "react";
import { format, addDays, setHours, setMinutes, isBefore } from "date-fns";
import { es } from "date-fns/locale";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/components/ui/use-toast";
import { useBooking } from "@/contexts/BookingContext";
import { supabase } from "@/integrations/supabase/client";

// Definir tipo para los slots horarios
type TimeSlot = {
  date: string;
  time: string;
};

const CalendarPage = () => {
  const navigate = useNavigate();
  const [date, setDate] = useState<Date | undefined>(addDays(new Date(), 1));
  const [availableTimes, setAvailableTimes] = useState<TimeSlot[]>([]);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const { selectedService, selectedDate, selectedTime: contextSelectedTime, setSelectedDate, setSelectedTime } = useBooking();

  // Buscar horarios disponibles cuando cambia la fecha seleccionada
  useEffect(() => {
    if (!date || !selectedService) return;

    const fetchAvailableTimes = async () => {
      setLoading(true);
      setSelectedTime(null);
      
      try {
        const formattedDate = format(date, "yyyy-MM-dd");
        
        // En una app real, esto debería verificar la disponibilidad del manicurista,
        // considerando su horario, excepciones y citas existentes.
        // Por ahora, generaremos tiempos ficticios.
        
        const startHour = 9; // 9 AM
        const endHour = 18; // 6 PM
        const duration = selectedService.duration; // en minutos
        const slots: TimeSlot[] = [];
        
        // Crear slots cada 'duration' minutos
        for (let hour = startHour; hour < endHour; hour++) {
          for (let minute = 0; minute < 60; minute += duration) {
            const timeSlot = setMinutes(setHours(new Date(), hour), minute);
            
            // No agregar horarios pasados si es hoy
            if (format(date, "yyyy-MM-dd") === format(new Date(), "yyyy-MM-dd") && 
                isBefore(timeSlot, new Date())) {
              continue;
            }
            
            slots.push({ 
              date: formattedDate,
              time: format(timeSlot, "HH:mm") 
            });
          }
        }
        
        // Simular verificar conflictos con citas existentes
        const { data: appointments } = await supabase
          .from('appointments')
          .select('appointment_time')
          .eq('appointment_date', formattedDate)
          .eq('manicurist_id', selectedService.manicurist_id);
          
        const bookedTimes = appointments?.map(apt => apt.appointment_time) || [];
        
        // Filtrar horarios ya reservados
        const availableSlots = slots.filter(slot => 
          !bookedTimes.includes(slot.time)
        );
        
        setAvailableTimes(availableSlots);
      } catch (error) {
        console.error("Error fetching available times:", error);
        toast({
          title: "Error",
          description: "No se pudieron cargar los horarios disponibles.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchAvailableTimes();
  }, [date, selectedService, toast]);

  // Guardar fecha y hora seleccionadas en el contexto y avanzar
  const handleContinue = () => {
    if (date && selectedTime) {
      setSelectedDate(date);
      setSelectedTime(selectedTime);
      navigate('/client-info');
    }
  };

  const handleBack = () => {
    navigate('/services');
  };

  const handleSelectTime = (time: string) => {
    setSelectedTime(time);
  };

  // Si no hay servicio seleccionado, redirigir a la selección de servicio
  useEffect(() => {
    if (!selectedService) {
      navigate('/services');
    }
  }, [selectedService, navigate]);

  return (
    <div className="container max-w-md mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Selecciona Fecha y Hora</h1>
      
      <div className="mb-8">
        <Calendar
          mode="single"
          selected={date}
          onSelect={setDate}
          disabled={(date) => {
            // Deshabilitar fechas pasadas y más de 30 días en el futuro
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const thirtyDaysLater = addDays(today, 30);
            return date ? isBefore(date, today) || isBefore(thirtyDaysLater, date) : false;
          }}
          locale={es}
          className="rounded-md border shadow p-3 w-full mb-4"
        />
      </div>

      <h2 className="text-lg font-medium mb-4">Horarios Disponibles</h2>
      <div className="grid grid-cols-2 gap-2 mb-8">
        {loading ? (
          <p className="col-span-2 text-center py-4">Cargando horarios...</p>
        ) : availableTimes.length > 0 ? (
          availableTimes.map((slot, index) => (
            <Button
              key={index}
              variant={selectedTime === slot.time ? "default" : "outline"}
              onClick={() => handleSelectTime(slot.time)}
              className="text-center"
            >
              {slot.time}
            </Button>
          ))
        ) : (
          <p className="col-span-2 text-center py-4 text-muted-foreground">
            No hay horarios disponibles para esta fecha.
          </p>
        )}
      </div>

      <Separator className="my-6" />

      <div className="flex justify-between">
        <Button variant="outline" onClick={handleBack}>
          Volver
        </Button>
        <Button onClick={handleContinue} disabled={!selectedTime}>
          Continuar
        </Button>
      </div>
    </div>
  );
};

export default CalendarPage;
