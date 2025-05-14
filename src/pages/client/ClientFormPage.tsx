
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useBooking } from "@/contexts/BookingContext";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import ClientLayout from "@/components/layouts/ClientLayout";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";

const ClientFormPage = () => {
  const { selectedService, selectedDate, selectedTime, setClientInfo, selectedManicurist } =
    useBooking();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({
    name: false,
    phone: false,
  });

  // Verificar si se han seleccionado servicio, fecha y hora
  if (!selectedService || !selectedDate || !selectedTime) {
    navigate("/services");
    return null;
  }

  const validateForm = () => {
    const newErrors = {
      name: name.trim() === "",
      phone: phone.trim() === "" || !/^\d{10}$/.test(phone),
    };

    setErrors(newErrors);
    return !Object.values(newErrors).some((error) => error);
  };

  const checkAvailability = async () => {
    if (!selectedService || !selectedDate || !selectedTime) {
      return false;
    }

    try {
      const formattedDate = format(
        new Date(
          selectedDate.getFullYear(),
          selectedDate.getMonth(),
          selectedDate.getDate()
        ),
        "yyyy-MM-dd"
      );

      // Determinar qué ID de manicurista usar
      const manicuristId = selectedManicurist?.id || selectedService.manicurist_id;

      // Verificar si ya existe una cita en ese horario
      const { data, error } = await supabase
        .from("appointments")
        .select("*")
        .eq("manicurist_id", manicuristId)
        .eq("appointment_date", formattedDate)
        .eq("appointment_time", selectedTime)
        .neq("status", "cancelled"); // No considerar citas canceladas

      if (error) {
        console.error("Error al verificar disponibilidad:", error);
        return false;
      }

      // Si hay datos, significa que ya hay una cita en ese horario
      return data.length === 0;
    } catch (error) {
      console.error("Error inesperado:", error);
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (validateForm()) {
      setIsSubmitting(true);

      try {
        // Verificar disponibilidad antes de continuar
        const isAvailable = await checkAvailability();

        if (!isAvailable) {
          toast({
            title: "Horario no disponible",
            description:
              "El horario seleccionado ya no está disponible. Por favor, elige otro horario.",
            variant: "destructive",
          });
          navigate("/calendar"); // Redirigir al calendario para elegir otro horario
          return;
        }

        setClientInfo({
          name,
          phone,
          notes: notes.trim() || undefined,
        });

        navigate("/confirmation");
      } catch (error) {
        console.error("Error:", error);
        toast({
          title: "Error",
          description:
            "Ocurrió un error inesperado. Por favor, intenta nuevamente.",
          variant: "destructive",
        });
      } finally {
        setIsSubmitting(false);
      }
    } else {
      toast({
        title: "Error",
        description:
          "Por favor, completa correctamente todos los campos requeridos",
        variant: "destructive",
      });
    }
  };

  return (
    <ClientLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-lg mx-auto">
          <div className="mb-8">
            <h1 className="text-2xl md:text-3xl font-bold mb-4">
              Completa tus datos
            </h1>
            <p className="text-muted-foreground">
              Ingresa tu información de contacto para confirmar la reserva
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">
              Detalles de la reserva
            </h2>
            <div className="space-y-2 mb-6">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Servicio:</span>
                <span className="font-medium">{selectedService.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Fecha:</span>
                <span className="font-medium">
                  {format(selectedDate, "EEEE d 'de' MMMM", { locale: es })}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Hora:</span>
                <span className="font-medium">{selectedTime}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Duración:</span>
                <span className="font-medium">
                  {selectedService.duration} minutos
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Precio:</span>
                <span className="font-medium">${selectedService.price}</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6">
            <form onSubmit={handleSubmit}>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">
                    Nombre completo <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className={errors.name ? "border-destructive" : ""}
                    disabled={isSubmitting}
                  />
                  {errors.name && (
                    <p className="text-destructive text-sm">
                      Este campo es obligatorio
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">
                    Teléfono <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="Ingresa tu número de 10 dígitos"
                    className={errors.phone ? "border-destructive" : ""}
                    disabled={isSubmitting}
                  />
                  {errors.phone && (
                    <p className="text-destructive text-sm">
                      Ingresa un número de teléfono válido de 10 dígitos
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="notes">Notas adicionales (opcional)</Label>
                  <Textarea
                    id="notes"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Ej: Preferencias, alergias, etc."
                    disabled={isSubmitting}
                  />
                </div>
              </div>

              <div className="flex justify-between items-center mt-8">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate("/calendar")}
                  disabled={isSubmitting}
                >
                  Volver
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Procesando...
                    </>
                  ) : (
                    "Confirmar Reserva"
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </ClientLayout>
  );
};

export default ClientFormPage;
