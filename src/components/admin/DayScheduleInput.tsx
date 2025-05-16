
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { DaySchedule, DAYS_MAPPING } from "@/hooks/useScheduleSettings";

interface DayScheduleInputProps {
  day: string;
  dayData: DaySchedule;
  onToggle: (day: string) => void;
  onChange: (day: string, field: string, value: string) => void;
}

export const DayScheduleInput = ({
  day,
  dayData,
  onToggle,
  onChange,
}: DayScheduleInputProps) => {
  return (
    <div className="border-b pb-4 last:border-b-0 last:pb-0">
      <div className="flex items-center space-x-2 mb-4">
        <Checkbox
          id={`enable-${day}`}
          checked={dayData.enabled}
          onCheckedChange={() => onToggle(day)}
        />
        <Label
          htmlFor={`enable-${day}`}
          className="text-lg font-medium"
        >
          {DAYS_MAPPING[day]}
        </Label>
      </div>

      {dayData.enabled && (
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
                    value={dayData.startTime}
                    onChange={(e) =>
                      onChange(day, "startTime", e.target.value)
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
                    value={dayData.endTime}
                    onChange={(e) =>
                      onChange(day, "endTime", e.target.value)
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
                    value={dayData.breakStartTime}
                    onChange={(e) =>
                      onChange(day, "breakStartTime", e.target.value)
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
                    value={dayData.breakEndTime}
                    onChange={(e) =>
                      onChange(day, "breakEndTime", e.target.value)
                    }
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
