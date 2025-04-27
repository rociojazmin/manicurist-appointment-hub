
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/components/ui/use-toast";

// Tipo para horarios por día
type DaySchedule = {
  enabled: boolean;
  startTime: string;
  endTime: string;
  breakStartTime: string;
  breakEndTime: string;
};

// Tipo para días inhabilitados
type DisabledDay = {
  date: Date;
  reason: string;
};

const INITIAL_SCHEDULE: Record<string, DaySchedule> = {
  monday: { enabled: true, startTime: "09:00", endTime: "18:00", breakStartTime: "13:00", breakEndTime: "14:00" },
  tuesday: { enabled: true, startTime: "09:00", endTime: "18:00", breakStartTime: "13:00", breakEndTime: "14:00" },
  wednesday: { enabled: true, startTime: "09:00", endTime: "18:00", breakStartTime: "13:00", breakEndTime: "14:00" },
  thursday: { enabled: true, startTime: "09:00", endTime: "18:00", breakStartTime: "13:00", breakEndTime: "14:00" },
  friday: { enabled: true, startTime: "09:00", endTime: "18:00", breakStartTime: "13:00", breakEndTime: "14:00" },
  saturday: { enabled: true, startTime: "10:00", endTime: "15:00", breakStartTime: "", breakEndTime: "" },
  sunday: { enabled: false, startTime: "", endTime: "", breakStartTime: "", breakEndTime: "" }
};

const DAYS_MAPPING: Record<string, string> = {
  monday: "Lunes",
  tuesday: "Martes",
  wednesday: "Miércoles",
  thursday: "Jueves",
  friday: "Viernes",
  saturday: "Sábado",
  sunday: "Domingo"
};

const ScheduleSettingsPage = () => {
  const [schedule, setSchedule] = useState<Record<string, DaySchedule>>(INITIAL_SCHEDULE);
  const [disabledDays, setDisabledDays] = useState<DisabledDay[]>([
    { date: new Date(2025, 4, 1), reason: "Día Feriado" },
    { date: new Date(2025, 4, 10), reason: "Capacitación" }
  ]);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [disabledReason, setDisabledReason] = useState("");
  const [isExceptionDialogOpen, setIsExceptionDialogOpen] = useState(false);
  const { toast } = useToast();

  const handleDayToggle = (day: string) => {
    setSchedule({
      ...schedule,
      [day]: {
        ...schedule[day],
        enabled: !schedule[day].enabled
      }
    });
  };

  const handleScheduleChange = (day: string, field: string, value: string) => {
    setSchedule({
      ...schedule,
      [day]: {
        ...schedule[day],
        [field]: value
      }
    });
  };

  const handleAddException = () => {
    if (!selectedDate || !disabledReason) {
      toast({
        title: "Error",
        description: "Por favor, selecciona una fecha y proporciona un motivo",
        variant: "destructive",
      });
      return;
    }

    const newDisabledDay: DisabledDay = {
      date: selectedDate,
      reason: disabledReason
    };

    setDisabledDays([...disabledDays, newDisabledDay]);
    setSelectedDate(undefined);
    setDisabledReason("");
    setIsExceptionDialogOpen(false);

    toast({
      title: "Excepción agregada",
      description: `Se ha marcado el día ${format(selectedDate, "d 'de' MMMM 'de' yyyy", { locale: es })} como no disponible`
    });
  };

  const handleRemoveException = (index: number) => {
    const newDisabledDays = [...disabledDays];
    newDisabledDays.splice(index, 1);
    setDisabledDays(newDisabledDays);

    toast({
      title: "Excepción eliminada",
      description: "Se ha eliminado la excepción correctamente"
    });
  };

  const handleSaveSchedule = () => {
    toast({
      title: "Configuración guardada",
      description: "Tu horario de atención ha sido actualizado correctamente"
    });
  };

  const isDateDisabled = (date: Date) => {
    return disabledDays.some(
      disabled => date.getDate() === disabled.date.getDate() &&
                 date.getMonth() === disabled.date.getMonth() &&
                 date.getFullYear() === disabled.date.getFullYear()
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Configuración de Horarios</h1>
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
                  <div key={day} className="border-b pb-4 last:border-b-0 last:pb-0">
                    <div className="flex items-center space-x-2 mb-4">
                      <Checkbox
                        id={`enable-${day}`}
                        checked={schedule[day].enabled}
                        onCheckedChange={() => handleDayToggle(day)}
                      />
                      <Label htmlFor={`enable-${day}`} className="text-lg font-medium">
                        {DAYS_MAPPING[day]}
                      </Label>
                    </div>
                    
                    {schedule[day].enabled && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                          <div>
                            <Label className="block mb-2">Horario de Apertura</Label>
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <Label htmlFor={`${day}-start`} className="text-sm">Desde</Label>
                                <Input
                                  id={`${day}-start`}
                                  type="time"
                                  value={schedule[day].startTime}
                                  onChange={(e) => handleScheduleChange(day, "startTime", e.target.value)}
                                />
                              </div>
                              <div>
                                <Label htmlFor={`${day}-end`} className="text-sm">Hasta</Label>
                                <Input
                                  id={`${day}-end`}
                                  type="time"
                                  value={schedule[day].endTime}
                                  onChange={(e) => handleScheduleChange(day, "endTime", e.target.value)}
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        <div className="space-y-4">
                          <div>
                            <Label className="block mb-2">Descanso (opcional)</Label>
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <Label htmlFor={`${day}-break-start`} className="text-sm">Desde</Label>
                                <Input
                                  id={`${day}-break-start`}
                                  type="time"
                                  value={schedule[day].breakStartTime}
                                  onChange={(e) => handleScheduleChange(day, "breakStartTime", e.target.value)}
                                />
                              </div>
                              <div>
                                <Label htmlFor={`${day}-break-end`} className="text-sm">Hasta</Label>
                                <Input
                                  id={`${day}-break-end`}
                                  type="time"
                                  value={schedule[day].breakEndTime}
                                  onChange={(e) => handleScheduleChange(day, "breakEndTime", e.target.value)}
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
                  Marca fechas específicas como no disponibles (vacaciones, feriados, etc.)
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Dialog open={isExceptionDialogOpen} onOpenChange={setIsExceptionDialogOpen}>
                  <DialogTrigger asChild>
                    <Button className="w-full mb-6">Agregar Excepción</Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Agregar Día No Disponible</DialogTitle>
                      <DialogDescription>
                        Selecciona la fecha y proporciona un motivo para marcarla como no disponible
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
                      <Button variant="outline" onClick={() => setIsExceptionDialogOpen(false)}>Cancelar</Button>
                      <Button onClick={handleAddException}>Guardar</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>

                {disabledDays.length > 0 ? (
                  <div className="space-y-4">
                    {disabledDays.map((day, index) => (
                      <div key={index} className="flex justify-between items-center p-3 border rounded-md">
                        <div>
                          <p className="font-medium">
                            {format(day.date, "d 'de' MMMM 'de' yyyy", { locale: es })}
                          </p>
                          <p className="text-sm text-muted-foreground">{day.reason}</p>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveException(index)}
                        >
                          Quitar
                        </Button>
                      </div>
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
