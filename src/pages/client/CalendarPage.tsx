// Fix imports and code to use the correct Service type
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { useBookingContext } from "@/contexts/BookingContext";
import { useMediaQuery } from "@/hooks/use-mobile";
import { supabase } from "@/integrations/supabase/client";
import { Appointment, Service as ServiceType, WorkingHours } from "@/types/database";

const CalendarPage = () => {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();
  const [selectedTime, setSelectedTime] = useState<string | undefined>();
  const [availableDays, setAvailableDays] = useState<number[]>([]);
  const [availableHours, setAvailableHours] = useState<string[]>([]);
  const [workingHours, setWorkingHours] = useState<WorkingHours[]>([]);
  const [exceptions, setExceptions] = useState<string[]>([]);
  const [bookedTimes, setBookedTimes] = useState<string[]>([]);
  const navigate = useNavigate();
  const isMobile = useMediaQuery(768);
  const { selectedService, setSelectedDate: setBookingDate, setSelectedTime: setBookingTime } = useBookingContext();

  // Fetch available dates and hours
  useEffect(() => {
    const fetchAvailability = async () => {
      if (!selectedService) {
        navigate("/services");
        return;
      }

      try {
        // Fetch working hours for the manicurist
        const { data: workingHoursData, error: workingHoursError } = await supabase
          .from('working_hours')
          .select('*')
          .eq('manicurist_id', selectedService.manicurist_id);

        if (workingHoursError) {
          console.error("Error fetching working hours:", workingHoursError);
          return;
        }

        // Fetch exceptions (unavailable dates)
        const { data: exceptionsData, error: exceptionsError } = await supabase
          .from('exceptions')
          .select('exception_date')
          .eq('manicurist_id', selectedService.manicurist_id);

        if (exceptionsError) {
          console.error("Error fetching exceptions:", exceptionsError);
          return;
        }

        // Fetch all existing appointments for the manicurist
        const { data: appointmentsData, error: appointmentsError } = await supabase
          .from('appointments')
          .select('*')
          .eq('manicurist_id', selectedService.manicurist_id)
          .eq('status', 'confirmed')
          .order('appointment_date', { ascending: true });

        if (appointmentsError) {
          console.error("Error fetching appointments:", appointmentsError);
          return;
        }

        // Configure available days based on the working schedule
        const availableDays = workingHoursData.map(day => day.day_of_week);
        setAvailableDays(availableDays);
        
        // Process exceptions to disable specific dates
        const formattedExceptions = exceptionsData.map(ex => ex.exception_date);
        setExceptions(formattedExceptions);

        // Process appointments to block booked times
        const formattedBookedTimes = appointmentsData.map(appt => ({
          date: appt.appointment_date,
          time: appt.appointment_time
        }));
        setBookedTimes(formattedBookedTimes);
        setWorkingHours(workingHoursData);

      } catch (error) {
        console.error("Error fetching availability data:", error);
      }
    };

    fetchAvailability();
  }, [selectedService, navigate]);

  const handleDateSelect = (date: Date | undefined) => {
    setSelectedDate(date);
    setSelectedTime(undefined); // Reset selected time when date changes
  };

  const isDayAvailable = (date: Date) => {
    const dayOfWeek = date.getDay() === 0 ? 7 : date.getDay(); // Convert Sunday to 7
    const formattedDate = format(date, "yyyy-MM-dd");
    
    // Check if the day is in the availableDays array and not in exceptions
    return availableDays.includes(dayOfWeek) && !exceptions.includes(formattedDate);
  };

  const handleTimeSelect = (time: string) => {
    setSelectedTime(time);
  };

  const isTimeSlotBooked = (date: Date, time: string) => {
    const formattedDate = format(date, "yyyy-MM-dd");
    return bookedTimes.some(appt => appt.date === formattedDate && appt.time === time);
  };

  const handleContinue = () => {
    if (selectedDate && selectedTime) {
      setBookingDate(selectedDate);
      setBookingTime(selectedTime);
      navigate("/client-info");
    }
  };

  // Generate available time slots based on selected date
  const generateTimeSlots = () => {
    if (!selectedDate) return [];
    
    // Get day of week (0 is Sunday in JS, but we need 1-7 with 1 being Monday)
    const dayOfWeek = selectedDate.getDay() === 0 ? 7 : selectedDate.getDay();
    
    // Find working hours for the selected day
    const daySchedule = workingHours.find(day => day.day_of_week === dayOfWeek);
    if (!daySchedule) return [];
    
    // Convert start and end times to minutes since midnight
    const [startHour, startMinute] = daySchedule.start_time.split(':').map(Number);
    const [endHour, endMinute] = daySchedule.end_time.split(':').map(Number);
    const startTimeInMinutes = startHour * 60 + startMinute;
    const endTimeInMinutes = endHour * 60 + endMinute;
    
    // Calculate service duration in minutes
    const serviceDuration = selectedService?.duration || 60;
    
    const timeSlots = [];
    let currentTime = startTimeInMinutes;
    
    while (currentTime + serviceDuration <= endTimeInMinutes) {
      const hour = Math.floor(currentTime / 60);
      const minute = currentTime % 60;
      
      // Format time as HH:mm
      const formattedTime = `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
      
      // Check if the time slot is booked
      if (!isTimeSlotBooked(selectedDate, formattedTime)) {
        timeSlots.push(formattedTime);
      }
      
      currentTime += 30; // Increment by 30 minutes
    }
    
    return timeSlots;
  };

  const timeSlots = generateTimeSlots();

  return (
    <>
      <div className="container mx-auto max-w-4xl py-6 px-4">
        <div className="space-y-6">
          <div>
            <h1 className="text-2xl font-bold">
              {isMobile ? "Selecciona fecha y hora" : "Selecciona fecha y hora"}
            </h1>
            <p className="text-muted-foreground">
              {isMobile
                ? "Por favor, elige la fecha y hora para tu cita."
                : "Por favor, elige la fecha y hora para tu cita."}
            </p>
          </div>

          <Card>
            <CardContent className="grid gap-6">
              <h2 className="text-lg font-semibold">
                {isMobile ? "Elige una fecha:" : "Elige una fecha:"}
              </h2>
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={handleDateSelect}
                disabled={(!selectedService) ? undefined : (date) => !isDayAvailable(date)}
                locale={es}
              />
            </CardContent>
          </Card>

          {selectedDate && (
            <Card>
              <CardContent className="grid gap-6">
                <h2 className="text-lg font-semibold">
                  {isMobile ? "Elige una hora:" : "Elige una hora:"}
                </h2>
                {timeSlots.length > 0 ? (
                  <RadioGroup onValueChange={handleTimeSelect} className="grid grid-cols-3 gap-2">
                    {timeSlots.map((time) => (
                      <div key={time} className="flex items-center space-x-2">
                        <RadioGroupItem value={time} id={time} className="peer h-5 w-5" />
                        <Label htmlFor={time} className="cursor-pointer peer-checked:font-semibold">
                          {time}
                        </Label>
                      </div>
                    ))}
                  </RadioGroup>
                ) : (
                  <p className="text-muted-foreground">No hay horarios disponibles para este día.</p>
                )}
              </CardContent>
            </Card>
          )}

          {selectedDate && selectedTime && (
            <div className="rounded-md border p-4">
              <p className="text-sm font-medium">
                Fecha seleccionada: {selectedDate ? format(selectedDate, "PPP", { locale: es }) : "Ninguna"}
              </p>
              <p className="text-sm font-medium">
                Hora seleccionada: {selectedTime || "Ninguna"}
              </p>
            </div>
          )}
        </div>
      </div>
      
      {/* Bottom navigation buttons */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t flex justify-between">
        <Button variant="outline" onClick={() => navigate("/services")}>
          Atrás
        </Button>
        <Button 
          onClick={handleContinue} 
          disabled={!selectedDate || !selectedTime}
        >
          Continuar
        </Button>
      </div>
    </>
  );
};

export default CalendarPage;
