
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { es } from "date-fns/locale";

interface DateSelectorProps {
  selectedDate: Date | undefined;
  onSelectDate: (date: Date | undefined) => void;
  appointmentCount: number;
}

const DateSelector = ({ 
  selectedDate, 
  onSelectDate, 
  appointmentCount 
}: DateSelectorProps) => {
  return (
    <Card className="md:col-span-1">
      <CardHeader>
        <CardTitle>Selecciona una Fecha</CardTitle>
        <CardDescription>
          Visualiza los turnos para un día específico
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Calendar
          mode="single"
          selected={selectedDate}
          onSelect={onSelectDate}
          className="border rounded-md p-3 pointer-events-auto"
          locale={es}
        />
        <div className="mt-4 space-y-2">
          <p className="text-sm font-medium">
            {selectedDate 
              ? format(selectedDate, "EEEE d 'de' MMMM 'de' yyyy", { locale: es }) 
              : "Ninguna fecha seleccionada"}
          </p>
          <p className="text-sm text-muted-foreground">
            {appointmentCount} {appointmentCount === 1 ? "turno" : "turnos"} para esta fecha
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default DateSelector;
