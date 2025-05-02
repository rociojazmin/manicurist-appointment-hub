
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import StatusBadge from "./StatusBadge";
import { Appointment, Service } from "@/types/database";

interface AppointmentDetailsProps {
  appointment: Appointment;
  services: Record<string, Service>;
  onSaveNotes: (notes: string) => void;
  onClose: () => void;
}

const AppointmentDetails = ({ 
  appointment, 
  services, 
  onSaveNotes, 
  onClose 
}: AppointmentDetailsProps) => {
  const [notes, setNotes] = useState(appointment.notes || "");
  
  return (
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
            <Label className="text-sm text-muted-foreground">Cliente</Label>
            <p className="font-medium">{appointment.client_name}</p>
          </div>
          <div>
            <Label className="text-sm text-muted-foreground">Teléfono</Label>
            <p className="font-medium">{appointment.client_phone}</p>
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label className="text-sm text-muted-foreground">Servicio</Label>
            <p className="font-medium">
              {services[appointment.service_id || '']?.name || 'Servicio no encontrado'}
            </p>
          </div>
          <div>
            <Label className="text-sm text-muted-foreground">Estado</Label>
            <div className="mt-1">
              <StatusBadge status={appointment.status} />
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label className="text-sm text-muted-foreground">Fecha</Label>
            <p className="font-medium">
              {format(new Date(appointment.appointment_date), "d MMMM yyyy", { locale: es })}
            </p>
          </div>
          <div>
            <Label className="text-sm text-muted-foreground">Hora</Label>
            <p className="font-medium">{appointment.appointment_time}</p>
          </div>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="notes" className="text-sm text-muted-foreground">Notas</Label>
          <Textarea
            id="notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Añade notas sobre este turno..."
          />
        </div>
      </div>
      <DialogFooter>
        <Button variant="outline" onClick={onClose}>
          Cancelar
        </Button>
        <Button onClick={() => onSaveNotes(notes)}>
          Guardar Cambios
        </Button>
      </DialogFooter>
    </DialogContent>
  );
};

export default AppointmentDetails;
