
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useBooking } from "@/contexts/BookingContext";
import { format, addDays, isToday, isBefore, startOfDay } from "date-fns";
import { es } from "date-fns/locale";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import ClientLayout from "@/components/layouts/ClientLayout";

// Datos simulados de horarios disponibles
const AVAILABLE_TIMES = [
  "09:00", "09:30", "10:00", "10:30", "11:00", "11:30",
  "14:00", "14:30", "15:00", "15:30", "16:00", "16:30", "17:00"
];

// Días no disponibles (ej: domingos y algunos sábados)
const isDateUnavailable = (date: Date) => {
  const day = date.getDay();
  return day === 0 || (day === 6 && date.getDate() % 2 === 0); // Domingos y algunos sábados
};

const CalendarPage = () => {
  const { selectedService, selectedDate, selectedTime, setSelectedDate, setSelectedTime } = useBooking();
  const [availableTimes, setAvailableTimes] = useState<string[]>([]);
  const navigate = useNavigate();
  const { toast } = useToast();

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

  // Actualizar horarios disponibles cuando cambia la fecha
  useEffect(() => {
    if (selectedDate) {
      // Simulación: aleatoriamente quitar algunos horarios para simular reservas
      const randomAvailable = AVAILABLE_TIMES.filter(() => Math.random() > 0.3);
      setAvailableTimes(randomAvailable);
    } else {
      setAvailableTimes([]);
    }
  }, [selectedDate]);

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

  const disabledDays = {
    before: startOfDay(new Date()),
    after: addDays(new Date(), 30), // Permitir reservas hasta 30 días en el futuro
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
              <Calendar
                mode="single"
                selected={selectedDate || undefined}
                onSelect={handleDateSelect}
                disabled={(date) => 
                  isBefore(date, startOfDay(new Date())) || 
                  isDateUnavailable(date)
                }
                className="rounded-md border p-3 pointer-events-auto"
                locale={es}
              />
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
                          className={`time-slot ${selectedTime === time ? "selected" : ""}`}
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
