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
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { WorkingHours, Exception } from "@/types/database";
import { Loader2 } from "lucide-react";
import { parseISO } from "date-fns";

// Tipo para horarios por día
type DaySchedule = {
  enabled: boolean;
  startTime: string;
  endTime: string;
  breakStartTime: string;
  breakEndTime: string;
};

const INITIAL_SCHEDULE: Record<string, DaySchedule> = {
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

const DAYS_MAPPING: Record<string, string> = {
  monday: "Lunes",
  tuesday: "Martes",
  wednesday: "Miércoles",
  thursday: "Jueves",
  friday: "Viernes",
  saturday: "Sábado",
  sunday: "Domingo",
};

const DAY_NUMBER_MAPPING: Record<string, number> = {
  monday: 1,
  tuesday: 2,
  wednesday: 3,
  thursday: 4,
  friday: 5,
  saturday: 6,
  sunday: 0,
};

const NUMBER_TO_DAY_MAPPING: Record<number, string> = {
  1: "monday",
  2: "tuesday",
  3: "wednesday",
  4: "thursday",
  5: "friday",
  6: "saturday",
  0: "sunday",
};

const ScheduleSettingsPage = () => {
  const [schedule, setSchedule] =
    useState<Record<string, DaySchedule>>(INITIAL_SCHEDULE);
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

      // Convertir los datos de la base de datos a nuestro formato de horario
      if (data && data.length > 0) {
        const newSchedule = { ...INITIAL_SCHEDULE };

        data.forEach((workingHour: WorkingHours) => {
          const dayKey = NUMBER_TO_DAY_MAPPING[workingHour.day_of_week];
          if (dayKey) {
            newSchedule[dayKey] = {
              enabled: true,
              startTime: workingHour.start_time,
              endTime: workingHour.end_time,
              breakStartTime: "", // La tabla actual no almacena descansos
              breakEndTime: "", // La tabla actual no almacena descansos
            };
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

      // Convertir las fechas de string a objetos Date
      const exceptionsWithDates = (data || []).map((exception: Exception) => ({
        ...exception,
        date: new Date(exception.exception_date),
      }));

      setDisabledDays(exceptionsWithDates);
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
      // Formatear fecha para la base de datos (ISO string sin hora)
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

      // Agregamos la nueva excepción al estado local con la fecha como objeto Date
      const exceptionWithDate = {
        ...data,
        date: selectedDate,
      };

      setDisabledDays([...disabledDays, exceptionWithDate]);
      setSelectedDate(undefined);
      setDisabledReason("");
      setIsExceptionDialogOpen(false);

      toast({
        title: "Excepción agregada",
        description: `Se ha marcado el día ${format(
          selectedDate,
          "d 'de' MMMM 'de' yyyy",
          { locale: es }
        )} como no disponible`,
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
      // Primero eliminar todos los horarios existentes
      const { error: deleteError } = await supabase
        .from("working_hours")
        .delete()
        .eq("manicurist_id", user.id);

      if (deleteError) throw deleteError;

      // Crear un array para almacenar los nuevos horarios
      const workingHoursToInsert = Object.entries(schedule)
        .filter(([_, dayData]) => dayData.enabled)
        .map(([day, dayData]) => ({
          manicurist_id: user.id,
          day_of_week: DAY_NUMBER_MAPPING[day],
          start_time: dayData.startTime,
          end_time: dayData.endTime,
        }));

      // Insertar los nuevos horarios
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

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">
          Configuración de Horarios
        </h1>
        <p className="text-muted-foreground">
          Define tus horarios de atención y días no disponibles
        </p>
      </div>

      <Tabs defaultValue="weekly">
        <TabsList className="mb-4">
          <TabsTrigger value="weekly">Horario Semanal</TabsTrigger>
          <TabsTrigger value="exceptions">Excepciones</TabsTrigger>
        </TabsList>

        <TabsContent value="weekly">
          <Card>
            <CardHeader>
              <CardTitle>Horario de Atención Semanal</CardTitle>
              <CardDescription>
                Configura tus horarios regulares para cada día de la semana
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {Object.keys(schedule).map((day) => (
                  <div
                    key={day}
                    className="border-b pb-4 last:border-b-0 last:pb-0"
                  >
                    <div className="flex items-center space-x-2 mb-4">
                      <Checkbox
                        id={`enable-${day}`}
                        checked={schedule[day].enabled}
                        onCheckedChange={() => handleDayToggle(day)}
                      />
                      <Label
                        htmlFor={`enable-${day}`}
                        className="text-lg font-medium"
                      >
                        {DAYS_MAPPING[day]}
                      </Label>
                    </div>

                    {schedule[day].enabled && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                          <div>
                            <Label className="block mb-2">
                              Horario de Apertura
                            </Label>
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <Label
                                  htmlFor={`${day}-start`}
                                  className="text-sm"
                                >
                                  Desde
                                </Label>
                                <Input
                                  id={`${day}-start`}
                                  type="time"
                                  value={schedule[day].startTime}
                                  onChange={(e) =>
                                    handleScheduleChange(
                                      day,
                                      "startTime",
                                      e.target.value
                                    )
                                  }
                                />
                              </div>
                              <div>
                                <Label
                                  htmlFor={`${day}-end`}
                                  className="text-sm"
                                >
                                  Hasta
                                </Label>
                                <Input
                                  id={`${day}-end`}
                                  type="time"
                                  value={schedule[day].endTime}
                                  onChange={(e) =>
                                    handleScheduleChange(
                                      day,
                                      "endTime",
                                      e.target.value
                                    )
                                  }
                                />
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="space-y-4">
                          <div>
                            <Label className="block mb-2">
                              Descanso (opcional)
                            </Label>
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <Label
                                  htmlFor={`${day}-break-start`}
                                  className="text-sm"
                                >
                                  Desde
                                </Label>
                                <Input
                                  id={`${day}-break-start`}
                                  type="time"
                                  value={schedule[day].breakStartTime}
                                  onChange={(e) =>
                                    handleScheduleChange(
                                      day,
                                      "breakStartTime",
                                      e.target.value
                                    )
                                  }
                                />
                              </div>
                              <div>
                                <Label
                                  htmlFor={`${day}-break-end`}
                                  className="text-sm"
                                >
                                  Hasta
                                </Label>
                                <Input
                                  id={`${day}-break-end`}
                                  type="time"
                                  value={schedule[day].breakEndTime}
                                  onChange={(e) =>
                                    handleScheduleChange(
                                      day,
                                      "breakEndTime",
                                      e.target.value
                                    )
                                  }
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}

                <div className="flex justify-end">
                  <Button onClick={handleSaveSchedule}>
                    Guardar Configuración
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="exceptions">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Días No Disponibles</CardTitle>
                <CardDescription>
                  Marca fechas específicas como no disponibles (vacaciones,
                  feriados, etc.)
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Dialog
                  open={isExceptionDialogOpen}
                  onOpenChange={setIsExceptionDialogOpen}
                >
                  <DialogTrigger asChild>
                    <Button className="w-full mb-6">Agregar Excepción</Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Agregar Día No Disponible</DialogTitle>
                      <DialogDescription>
                        Selecciona la fecha y proporciona un motivo para
                        marcarla como no disponible
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div className="space-y-2">
                        <Label>Selecciona una fecha</Label>
                        <Calendar
                          mode="single"
                          selected={selectedDate}
                          onSelect={setSelectedDate}
                          className="border rounded-md p-3 pointer-events-auto"
                          locale={es}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="reason">Motivo</Label>
                        <Input
                          id="reason"
                          value={disabledReason}
                          onChange={(e) => setDisabledReason(e.target.value)}
                          placeholder="Ej: Vacaciones, capacitación, feriado..."
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button
                        variant="outline"
                        onClick={() => setIsExceptionDialogOpen(false)}
                      >
                        Cancelar
                      </Button>
                      <Button onClick={handleAddException}>Guardar</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>

                {disabledDays.length > 0 ? (
                  <div className="space-y-4">
                    {disabledDays.map((day) => (
                      <p className="font-medium">
                        {format(
                          parseISO(day.exception_date), // <- ahora parseISO
                          "d 'de' MMMM 'de' yyyy",
                          { locale: es }
                        )}
                      </p>
                    ))}
                  </div>
                ) : (
                  <p className="text-center py-8 text-muted-foreground">
                    No hay excepciones configuradas
                  </p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Vista Previa del Calendario</CardTitle>
                <CardDescription>
                  Visualiza tus días disponibles y no disponibles
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex justify-center">
                  <Calendar
                    mode="default"
                    disabled={isDateDisabled}
                    className="rounded-md border p-3 pointer-events-auto"
                    locale={es}
                  />
                </div>
                <div className="mt-6 space-y-2">
                  <div className="flex items-center">
                    <div className="w-4 h-4 rounded bg-gray-300 mr-2"></div>
                    <span className="text-sm">Días no disponibles</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-4 h-4 rounded bg-primary mr-2"></div>
                    <span className="text-sm">Fecha seleccionada</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ScheduleSettingsPage;
