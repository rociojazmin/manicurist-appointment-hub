
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { parseISO } from "date-fns";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Exception } from "@/types/database";

interface ExceptionsCalendarProps {
  disabledDays: Exception[];
  selectedDate: Date | undefined;
  setSelectedDate: (date: Date | undefined) => void;
  disabledReason: string;
  setDisabledReason: (reason: string) => void;
  isExceptionDialogOpen: boolean;
  setIsExceptionDialogOpen: (open: boolean) => void;
  handleAddException: () => Promise<void>;
  handleRemoveException: (id: string) => Promise<void>;
  isDateDisabled: (date: Date) => boolean;
}

export const ExceptionsCalendar = ({
  disabledDays,
  selectedDate,
  setSelectedDate,
  disabledReason,
  setDisabledReason,
  isExceptionDialogOpen,
  setIsExceptionDialogOpen,
  handleAddException,
  handleRemoveException,
  isDateDisabled,
}: ExceptionsCalendarProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Días No Disponibles</CardTitle>
          <CardDescription>
            Marca fechas específicas como no disponibles (vacaciones, feriados, etc.)
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
                <div key={day.id} className="flex justify-between items-center">
                  <p className="font-medium">
                    {format(
                      parseISO(day.exception_date),
                      "d 'de' MMMM 'de' yyyy",
                      { locale: es }
                    )}
                  </p>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => handleRemoveException(day.id)}
                    className="text-destructive hover:text-destructive/90"
                  >
                    Eliminar
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
  );
};
