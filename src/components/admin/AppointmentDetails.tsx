
import React from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { AppointmentWithService, getStatusColor, getStatusText } from "./AppointmentCard";

interface AppointmentDetailsProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  selectedAppointment: AppointmentWithService | null;
  notes: string;
  onNotesChange: (notes: string) => void;
  onUpdateNotes: () => void;
}

const AppointmentDetails = ({
  isOpen,
  onOpenChange,
  selectedAppointment,
  notes,
  onNotesChange,
  onUpdateNotes
}: AppointmentDetailsProps) => {
  if (!selectedAppointment) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Detalles del Turno</DialogTitle>
          <DialogDescription>
            Información completa del turno seleccionado
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-sm text-muted-foreground">
                Cliente
              </Label>
              <p className="font-medium">
                {selectedAppointment.client_name}
              </p>
            </div>
            <div>
              <Label className="text-sm text-muted-foreground">
                Teléfono
              </Label>
              <p className="font-medium">
                {selectedAppointment.client_phone}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-sm text-muted-foreground">
                Servicio
              </Label>
              <p className="font-medium">
                {selectedAppointment.service?.name ||
                  "Servicio no encontrado"}
              </p>
            </div>
            <div>
              <Label className="text-sm text-muted-foreground">
                Estado
              </Label>
              <Badge
                className={`mt-1 ${getStatusColor(
                  selectedAppointment.status
                )}`}
              >
                {getStatusText(selectedAppointment.status)}
              </Badge>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-sm text-muted-foreground">Fecha</Label>
              <p className="font-medium">
                {format(
                  new Date(selectedAppointment.appointment_date),
                  "d MMMM yyyy",
                  { locale: es }
                )}
              </p>
            </div>
            <div>
              <Label className="text-sm text-muted-foreground">Hora</Label>
              <p className="font-medium">
                {selectedAppointment.appointment_time}
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <Label
              htmlFor="notes"
              className="text-sm text-muted-foreground"
            >
              Notas
            </Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => onNotesChange(e.target.value)}
              placeholder="Añade notas sobre este turno..."
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={onUpdateNotes}>Guardar Cambios</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AppointmentDetails;
