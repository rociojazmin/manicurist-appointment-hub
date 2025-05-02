
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import ServiceCard from "@/components/client/ServiceCard";
import { useBooking } from "@/contexts/BookingContext";
import { supabase } from "@/integrations/supabase/client";
import { Service } from "@/types/database";

const ServiceSelectionPage = () => {
  const navigate = useNavigate();
  const { selectedService, setSelectedService } = useBooking();
  const [loading, setLoading] = useState(true);
  const [services, setServices] = useState<Service[]>([]);
  const [selectedManicuristId, setSelectedManicuristId] = useState<string | null>(null);

  useEffect(() => {
    const loadServices = async () => {
      setLoading(true);

      try {
        // Primero obtenemos un manicurista (en una app real, el usuario seleccionaría uno)
        const { data: manicurists, error: manicuristsError } = await supabase
          .from('manicurists')
          .select('*')
          .limit(1);

        if (manicuristsError) {
          throw manicuristsError;
        }

        if (manicurists && manicurists.length > 0) {
          const manicuristId = manicurists[0].id;
          setSelectedManicuristId(manicuristId);

          // Luego obtenemos los servicios de ese manicurista
          const { data: servicesData, error: servicesError } = await supabase
            .from('services')
            .select('*')
            .eq('manicurist_id', manicuristId);

          if (servicesError) {
            throw servicesError;
          }

          setServices(servicesData as Service[]);
        }
      } catch (error) {
        console.error("Error loading services:", error);
      } finally {
        setLoading(false);
      }
    };

    loadServices();
  }, []);

  const handleContinue = () => {
    if (selectedService) {
      navigate('/calendar');
    }
  };

  const handleBack = () => {
    navigate('/');
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="container max-w-md mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Selecciona un Servicio</h1>
      <p className="text-muted-foreground mb-6">
        Elige el servicio que deseas reservar
      </p>

      <div className="grid gap-4 mb-8">
        {services.length > 0 ? (
          services.map((service) => (
            <ServiceCard
              key={service.id}
              name={service.name}
              price={service.price}
              duration={service.duration}
              description={service.description || ''}
              isSelected={selectedService?.id === service.id}
              onSelect={() => setSelectedService(service)}
            />
          ))
        ) : (
          <Card>
            <CardContent className="p-6">
              <p className="text-center text-muted-foreground">
                No hay servicios disponibles
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      <Separator className="my-6" />

      <div className="flex justify-between">
        <Button variant="outline" onClick={handleBack}>
          Volver
        </Button>
        <Button onClick={handleContinue} disabled={!selectedService}>
          Continuar
        </Button>
      </div>
    </div>
  );
};

export default ServiceSelectionPage;
