
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { WorkingHours, Exception } from "@/types/database";
import { useAuth } from "@/hooks/useAuth";
import { parseISO } from "date-fns";

// Type for daily schedule
export type DaySchedule = {
  enabled: boolean;
  startTime: string;
  endTime: string;
  breakStartTime: string;
  breakEndTime: string;
};

export const INITIAL_SCHEDULE: Record<string, DaySchedule> = {
  monday: {
    enabled: true,
    startTime: "09:00",
    endTime: "18:00",
    breakStartTime: "13:00",
    breakEndTime: "14:00",
  },
  tuesday: {
    enabled: true,
    startTime: "09:00",
    endTime: "18:00",
    breakStartTime: "13:00",
    breakEndTime: "14:00",
  },
  wednesday: {
    enabled: true,
    startTime: "09:00",
    endTime: "18:00",
    breakStartTime: "13:00",
    breakEndTime: "14:00",
  },
  thursday: {
    enabled: true,
    startTime: "09:00",
    endTime: "18:00",
    breakStartTime: "13:00",
    breakEndTime: "14:00",
  },
  friday: {
    enabled: true,
    startTime: "09:00",
    endTime: "18:00",
    breakStartTime: "13:00",
    breakEndTime: "14:00",
  },
  saturday: {
    enabled: true,
    startTime: "10:00",
    endTime: "15:00",
    breakStartTime: "",
    breakEndTime: "",
  },
  sunday: {
    enabled: false,
    startTime: "",
    endTime: "",
    breakStartTime: "",
    breakEndTime: "",
  },
};

export const DAYS_MAPPING: Record<string, string> = {
  monday: "Lunes",
  tuesday: "Martes",
  wednesday: "Miércoles",
  thursday: "Jueves",
  friday: "Viernes",
  saturday: "Sábado",
  sunday: "Domingo",
};

export const DAY_NUMBER_MAPPING: Record<string, number> = {
  monday: 1,
  tuesday: 2,
  wednesday: 3,
  thursday: 4,
  friday: 5,
  saturday: 6,
  sunday: 0,
};

export const NUMBER_TO_DAY_MAPPING: Record<number, string> = {
  1: "monday",
  2: "tuesday",
  3: "wednesday",
  4: "thursday",
  5: "friday",
  6: "saturday",
  0: "sunday",
};

export const useScheduleSettings = () => {
  const [schedule, setSchedule] = useState<Record<string, DaySchedule>>(INITIAL_SCHEDULE);
  const [disabledDays, setDisabledDays] = useState<Exception[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [disabledReason, setDisabledReason] = useState("");
  const [isExceptionDialogOpen, setIsExceptionDialogOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      fetchWorkingHours();
      fetchExceptions();
    }
  }, [user]);

  const fetchWorkingHours = async () => {
    if (!user?.id) return;

    try {
      const { data, error } = await supabase
        .from("working_hours")
        .select("*")
        .eq("manicurist_id", user.id);

      if (error) throw error;

      // Convert database data to our schedule format
      if (data && data.length > 0) {
        const newSchedule = { ...INITIAL_SCHEDULE };

        data.forEach((workingHour: WorkingHours) => {
          const dayKey = NUMBER_TO_DAY_MAPPING[workingHour.day_of_week];
          if (dayKey) {
            newSchedule[dayKey] = {
              enabled: true,
              startTime: workingHour.start_time,
              endTime: workingHour.end_time,
              breakStartTime: newSchedule[dayKey].breakStartTime,
              breakEndTime: newSchedule[dayKey].breakEndTime,
            };
          }
        });

        // Set days without records as disabled
        Object.keys(NUMBER_TO_DAY_MAPPING).forEach(dayNumber => {
          const dayKey = NUMBER_TO_DAY_MAPPING[parseInt(dayNumber)];
          const found = data.some((wh: WorkingHours) => wh.day_of_week === parseInt(dayNumber));
          if (!found && dayKey) {
            newSchedule[dayKey].enabled = false;
          }
        });

        setSchedule(newSchedule);
      }
    } catch (error: unknown) {
      console.error("Error fetching working hours:", error);

      const errorMessage =
        error instanceof Error ? error.message : "Ocurrió un error inesperado";

      toast({
        title: "Error",
        description:
          "No se pudieron cargar tus horarios de trabajo. " + errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchExceptions = async () => {
    if (!user?.id) return;

    try {
      const { data, error } = await supabase
        .from("exceptions")
        .select("*")
        .eq("manicurist_id", user.id);

      if (error) throw error;

      setDisabledDays(data || []);
    } catch (error: unknown) {
      console.error("Error fetching exceptions:", error);

      const errorMessage =
        error instanceof Error ? error.message : "Ocurrió un error inesperado";

      toast({
        title: "Error",
        description: "No se pudieron cargar tus excepciones.  " + errorMessage,
        variant: "destructive",
      });
    }
  };

  const handleDayToggle = (day: string) => {
    setSchedule({
      ...schedule,
      [day]: {
        ...schedule[day],
        enabled: !schedule[day].enabled,
      },
    });
  };

  const handleScheduleChange = (day: string, field: string, value: string) => {
    setSchedule({
      ...schedule,
      [day]: {
        ...schedule[day],
        [field]: value,
      },
    });
  };

  const handleAddException = async () => {
    if (!selectedDate || !disabledReason) {
      toast({
        title: "Error",
        description: "Por favor, selecciona una fecha y proporciona un motivo",
        variant: "destructive",
      });
      return;
    }

    if (!user?.id) {
      toast({
        title: "Error",
        description: "No se pudo identificar al usuario",
        variant: "destructive",
      });
      return;
    }

    try {
      // Format date for database (ISO string without time)
      const formattedDate = selectedDate.toISOString().split("T")[0];

      const newException = {
        manicurist_id: user.id,
        exception_date: formattedDate,
      };

      const { data, error } = await supabase
        .from("exceptions")
        .insert(newException)
        .select()
        .single();

      if (error) throw error;

      setDisabledDays([...disabledDays, data]);
      setSelectedDate(undefined);
      setDisabledReason("");
      setIsExceptionDialogOpen(false);

      toast({
        title: "Excepción agregada",
        description: `Se ha marcado el día ${selectedDate.toLocaleDateString('es-ES', {
          day: 'numeric',
          month: 'long',
          year: 'numeric'
        })} como no disponible`,
      });
    } catch (error: unknown) {
      console.error("Error adding exception:", error);

      const errorMessage =
        error instanceof Error ? error.message : "Ocurrió un error inesperado";

      toast({
        title: "Error",
        description: "No se pudo guardar la excepción.  " + errorMessage,
        variant: "destructive",
      });
    }
  };

  const handleRemoveException = async (id: string) => {
    if (!user?.id) return;

    try {
      const { error } = await supabase
        .from("exceptions")
        .delete()
        .eq("id", id)
        .eq("manicurist_id", user.id);

      if (error) throw error;

      const updatedExceptions = disabledDays.filter((day) => day.id !== id);
      setDisabledDays(updatedExceptions);

      toast({
        title: "Excepción eliminada",
        description: "Se ha eliminado la excepción correctamente",
      });
    } catch (error: unknown) {
      console.error("Error removing exception:", error);

      const errorMessage =
        error instanceof Error ? error.message : "Ocurrió un error inesperado";

      toast({
        title: "Error",
        description: "No se pudo eliminar la excepción. " + errorMessage,
        variant: "destructive",
      });
    }
  };

  const handleSaveSchedule = async () => {
    if (!user?.id) {
      toast({
        title: "Error",
        description: "No se pudo identificar al usuario",
        variant: "destructive",
      });
      return;
    }

    try {
      // First delete all existing schedules
      const { error: deleteError } = await supabase
        .from("working_hours")
        .delete()
        .eq("manicurist_id", user.id);

      if (deleteError) throw deleteError;

      // Create array to store new schedules
      const workingHoursToInsert = Object.entries(schedule)
        .filter(([_, dayData]) => dayData.enabled)
        .map(([day, dayData]) => ({
          manicurist_id: user.id,
          day_of_week: DAY_NUMBER_MAPPING[day],
          start_time: dayData.startTime,
          end_time: dayData.endTime,
        }));

      // Insert new schedules
      if (workingHoursToInsert.length > 0) {
        const { error: insertError } = await supabase
          .from("working_hours")
          .insert(workingHoursToInsert);

        if (insertError) throw insertError;
      }

      toast({
        title: "Configuración guardada",
        description: "Tu horario de atención ha sido actualizado correctamente",
      });
    } catch (error: unknown) {
      console.error("Error saving schedule:", error);

      const errorMessage =
        error instanceof Error ? error.message : "Ocurrió un error inesperado";

      toast({
        title: "Error",
        description: "No se pudo guardar la configuración " + errorMessage,
        variant: "destructive",
      });
    }
  };

  const isDateDisabled = (date: Date) => {
    return disabledDays.some((disabled) => {
      const disabledDate = parseISO(disabled.exception_date);

      return (
        date.getDate() === disabledDate.getDate() &&
        date.getMonth() === disabledDate.getMonth() &&
        date.getFullYear() === disabledDate.getFullYear()
      );
    });
  };

  return {
    schedule,
    disabledDays,
    selectedDate,
    setSelectedDate,
    disabledReason,
    setDisabledReason,
    isExceptionDialogOpen,
    setIsExceptionDialogOpen,
    loading,
    handleDayToggle,
    handleScheduleChange,
    handleAddException,
    handleRemoveException,
    handleSaveSchedule,
    isDateDisabled,
  };
};
