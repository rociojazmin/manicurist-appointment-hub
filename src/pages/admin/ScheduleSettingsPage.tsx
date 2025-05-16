
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2 } from "lucide-react";
import { WeeklySchedule } from "@/components/admin/WeeklySchedule";
import { ExceptionsCalendar } from "@/components/admin/ExceptionsCalendar";
import { useScheduleSettings } from "@/hooks/useScheduleSettings";

const ScheduleSettingsPage = () => {
  const {
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
  } = useScheduleSettings();

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
          <WeeklySchedule 
            schedule={schedule}
            handleDayToggle={handleDayToggle}
            handleScheduleChange={handleScheduleChange}
            handleSaveSchedule={handleSaveSchedule}
          />
        </TabsContent>

        <TabsContent value="exceptions">
          <ExceptionsCalendar 
            disabledDays={disabledDays}
            selectedDate={selectedDate}
            setSelectedDate={setSelectedDate}
            disabledReason={disabledReason}
            setDisabledReason={setDisabledReason}
            isExceptionDialogOpen={isExceptionDialogOpen}
            setIsExceptionDialogOpen={setIsExceptionDialogOpen}
            handleAddException={handleAddException}
            handleRemoveException={handleRemoveException}
            isDateDisabled={isDateDisabled}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ScheduleSettingsPage;
