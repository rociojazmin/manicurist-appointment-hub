
import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { AppointmentWithService } from "./AppointmentCard";
import AppointmentCard from "./AppointmentCard";

interface AppointmentListViewProps {
  title: string;
  description: string;
  appointments: AppointmentWithService[];
  emptyMessage: string;
  sortFunction?: (a: AppointmentWithService, b: AppointmentWithService) => number;
  onViewDetails: (appointment: AppointmentWithService) => void;
  onStatusChange: (id: string, status: AppointmentWithService["status"]) => void;
}

const AppointmentListView = ({
  title,
  description,
  appointments,
  emptyMessage,
  sortFunction,
  onViewDetails,
  onStatusChange,
}: AppointmentListViewProps) => {
  // Si no se proporciona una función de ordenamiento, usamos una por defecto
  const sortedAppointments = sortFunction 
    ? [...appointments].sort(sortFunction) 
    : appointments;

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        {appointments.length > 0 ? (
          <div className="space-y-4">
            {sortedAppointments.map((appointment) => (
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
            {emptyMessage}
          </p>
        )}
      </CardContent>
    </Card>
  );
};

export default AppointmentListView;
