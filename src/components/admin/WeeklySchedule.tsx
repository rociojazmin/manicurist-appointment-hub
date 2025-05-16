
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { DayScheduleInput } from "./DayScheduleInput";
import { DaySchedule } from "@/hooks/useScheduleSettings";

interface WeeklyScheduleProps {
  schedule: Record<string, DaySchedule>;
  handleDayToggle: (day: string) => void;
  handleScheduleChange: (day: string, field: string, value: string) => void;
  handleSaveSchedule: () => Promise<void>;
}

export const WeeklySchedule = ({
  schedule,
  handleDayToggle,
  handleScheduleChange,
  handleSaveSchedule,
}: WeeklyScheduleProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Horario de Atención Semanal</CardTitle>
        <CardDescription>
          Configura tus horarios regulares para cada día de la semana
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {Object.entries(schedule).map(([day, dayData]) => (
            <DayScheduleInput
              key={day}
              day={day}
              dayData={dayData}
              onToggle={handleDayToggle}
              onChange={handleScheduleChange}
            />
          ))}

          <div className="flex justify-end">
            <Button onClick={handleSaveSchedule}>
              Guardar Configuración
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
