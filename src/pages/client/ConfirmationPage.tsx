
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useBooking } from "@/contexts/BookingContext";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import { CheckCircle } from "lucide-react";
import ClientLayout from "@/components/layouts/ClientLayout";

const ConfirmationPage = () => {
  const { selectedService, selectedDate, selectedTime, clientInfo, resetBooking } = useBooking();
  const navigate = useNavigate();

  // Verificar si hay información completa
  useEffect(() => {
    if (!selectedService || !selectedDate || !selectedTime || !clientInfo) {
      navigate("/");
    }
  }, [selectedService, selectedDate, selectedTime, clientInfo, navigate]);

  if (!selectedService || !selectedDate || !selectedTime || !clientInfo) {
    return null;
  }

  const handleNewReservation = () => {
    resetBooking();
    navigate("/");
  };

  const formattedDate = format(selectedDate, "EEEE d 'de' MMMM 'de' yyyy", { locale: es });

  return (
    <ClientLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-md mx-auto">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
              <CheckCircle className="h-10 w-10 text-green-600" />
            </div>
            <h1 className="text-2xl md:text-3xl font-bold mb-2">¡Reserva Confirmada!</h1>
            <p className="text-muted-foreground">
              Tu turno ha sido reservado exitosamente
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6 mb-8">
            <h2 className="text-xl font-semibold mb-4">Detalles de tu reserva</h2>
            <div className="space-y-4">
              <div className="border-b pb-3">
                <h3 className="text-sm font-medium text-muted-foreground mb-1">Servicio</h3>
                <p className="font-medium">{selectedService.name}</p>
              </div>
              <div className="border-b pb-3">
                <h3 className="text-sm font-medium text-muted-foreground mb-1">Fecha y Hora</h3>
                <p className="font-medium">{formattedDate}, {selectedTime}</p>
              </div>
              <div className="border-b pb-3">
                <h3 className="text-sm font-medium text-muted-foreground mb-1">Duración Estimada</h3>
                <p className="font-medium">{selectedService.duration} minutos</p>
              </div>
              <div className="border-b pb-3">
                <h3 className="text-sm font-medium text-muted-foreground mb-1">Precio</h3>
                <p className="font-medium">${selectedService.price}</p>
              </div>
              <div className="border-b pb-3">
                <h3 className="text-sm font-medium text-muted-foreground mb-1">Cliente</h3>
                <p className="font-medium">{clientInfo.name}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-1">Teléfono</h3>
                <p className="font-medium">{clientInfo.phone}</p>
              </div>
              {clientInfo.notes && (
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-1">Notas</h3>
                  <p className="font-medium">{clientInfo.notes}</p>
                </div>
              )}
            </div>
          </div>

          <div className="bg-secondary bg-opacity-50 rounded-xl p-6 mb-8">
            <h3 className="font-medium mb-2">Recordatorio</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Te recomendamos llegar 5 minutos antes de tu cita. Si necesitas cancelar o 
              reprogramar, por favor hazlo con al menos 24 horas de anticipación.
            </p>
            <p className="text-sm text-muted-foreground">
              Para cualquier consulta, comunícate al teléfono: <span className="font-medium">123-456-7890</span>
            </p>
          </div>

          <div className="text-center">
            <Button onClick={handleNewReservation}>
              Hacer otra reserva
            </Button>
          </div>
        </div>
      </div>
    </ClientLayout>
  );
};

export default ConfirmationPage;
