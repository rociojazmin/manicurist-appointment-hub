
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useBooking } from "@/contexts/BookingContext";
import ClientLayout from "@/components/layouts/ClientLayout";
import ServiceCard from "@/components/client/ServiceCard";
import { Button } from "@/components/ui/button";

// Datos simulados de servicios
const SERVICES = [
  {
    id: "1",
    name: "Manicuría Tradicional",
    description: "Servicio básico de manicuría con esmalte tradicional",
    price: 25,
    duration: 30
  },
  {
    id: "2",
    name: "Kapping",
    description: "Capa protectora para fortalecer y alargar tus uñas naturales",
    price: 35,
    duration: 45
  },
  {
    id: "3",
    name: "Semipermanente",
    description: "Esmaltado duradero que no daña tus uñas",
    price: 40,
    duration: 45
  },
  {
    id: "4",
    name: "Esculpidas",
    description: "Uñas artificiales de gel o acrílico para un look perfecto",
    price: 60,
    duration: 90
  },
  {
    id: "5",
    name: "Pedicuría",
    description: "Cuidado completo para tus pies",
    price: 30,
    duration: 40
  }
];

const ServiceSelectionPage = () => {
  const { selectedService, setSelectedService } = useBooking();
  const navigate = useNavigate();
  const [localSelectedService, setLocalSelectedService] = useState<string | null>(
    selectedService?.id || null
  );

  useEffect(() => {
    if (selectedService) {
      setLocalSelectedService(selectedService.id);
    }
  }, [selectedService]);

  const handleServiceSelect = (serviceId: string) => {
    setLocalSelectedService(serviceId);
  };

  const handleContinue = () => {
    if (localSelectedService) {
      const service = SERVICES.find((s) => s.id === localSelectedService);
      if (service) {
        setSelectedService(service);
        navigate("/calendar");
      }
    }
  };

  return (
    <ClientLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-2xl md:text-3xl font-bold mb-4">Selecciona un Servicio</h1>
            <p className="text-muted-foreground">
              Elige el servicio que deseas reservar para continuar con tu reserva
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 mb-8">
            {SERVICES.map((service) => (
              <ServiceCard
                key={service.id}
                id={service.id}
                name={service.name}
                description={service.description}
                price={service.price}
                duration={service.duration}
                selected={localSelectedService === service.id}
                onClick={() => handleServiceSelect(service.id)}
              />
            ))}
          </div>

          <div className="flex justify-between items-center mt-8">
            <Button
              variant="outline"
              onClick={() => navigate("/")}
            >
              Volver
            </Button>
            <Button
              onClick={handleContinue}
              disabled={!localSelectedService}
            >
              Continuar
            </Button>
          </div>
        </div>
      </div>
    </ClientLayout>
  );
};

export default ServiceSelectionPage;
