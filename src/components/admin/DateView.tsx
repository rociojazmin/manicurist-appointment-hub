
import React from "react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Calendar } from "@/components/ui/calendar";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { AppointmentWithService } from "./AppointmentCard";
import AppointmentCard from "./AppointmentCard";

interface DateViewProps {
  selectedDate: Date | undefined;
  onDateSelect: (date: Date | undefined) => void;
  dateAppointments: AppointmentWithService[];
  onViewDetails: (appointment: AppointmentWithService) => void;
  onStatusChange: (id: string, status: AppointmentWithService["status"]) => void;
}

const DateView = ({
  selectedDate,
  onDateSelect,
  dateAppointments,
  onViewDetails,
  onStatusChange
}: DateViewProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
            onSelect={onDateSelect}
            className="border rounded-md p-3 pointer-events-auto"
            locale={es}
          />
          <div className="mt-4 space-y-2">
            <p className="text-sm font-medium">
              {selectedDate
                ? format(selectedDate, "EEEE d 'de' MMMM 'de' yyyy", {
                    locale: es,
                  })
                : "Ninguna fecha seleccionada"}
            </p>
            <p className="text-sm text-muted-foreground">
              {dateAppointments.length}{" "}
              {dateAppointments.length === 1 ? "turno" : "turnos"} para
              esta fecha
            </p>
          </div>
        </CardContent>
      </Card>

      <Card className="md:col-span-2">
        <CardHeader>
          <CardTitle>Turnos del Día</CardTitle>
          <CardDescription>
            {selectedDate
              ? `Turnos para el ${format(selectedDate, "d 'de' MMMM", {
                  locale: es,
                })}`
              : "Selecciona una fecha para ver los turnos"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {dateAppointments.length > 0 ? (
            <div className="space-y-4">
              {dateAppointments
                .sort((a, b) =>
                  a.appointment_time.localeCompare(b.appointment_time)
                )
                .map((appointment) => (
                  <AppointmentCard
                    key={appointment.id}
                    appointment={appointment}
                    onViewDetails={onViewDetails}
                    onStatusChange={onStatusChange}
                  />
                ))}
            </div>
          ) : (
            <p className="text-center py-8 text-muted-foreground">
              No hay turnos agendados para esta fecha
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default DateView;
