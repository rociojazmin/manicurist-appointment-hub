
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import ServiceCard from "@/components/client/ServiceCard";
import { useBookingContext } from "@/contexts/BookingContext";
import { supabase } from "@/integrations/supabase/client";
import { Service } from "@/types/database";

const ServiceSelectionPage = () => {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const { selectedService, setSelectedService } = useBookingContext();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchServices = async () => {
      try {
        setLoading(true);
        // Fetch the manicurist ID first since we don't have authentication for clients
        const { data: manicurists, error: manicuristError } = await supabase
          .from('manicurists')
          .select('id')
          .limit(1);  // For now, just get the first one

        if (manicuristError || !manicurists || manicurists.length === 0) {
          console.error("Error fetching manicurist:", manicuristError);
          return;
        }

        const manicuristId = manicurists[0].id;

        // Then fetch services for this manicurist
        const { data, error } = await supabase
          .from('services')
          .select('*')
          .eq('manicurist_id', manicuristId);

        if (error) {
          console.error("Error fetching services:", error);
          return;
        }

        // Ensure we have the correct type
        const typedServices: Service[] = data || [];
        setServices(typedServices);
      } catch (error) {
        console.error("Error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchServices();
  }, []);

  const handleSelectService = (service: Service) => {
    setSelectedService(service);
  };

  const handleContinue = () => {
    if (selectedService) {
      navigate("/calendar");
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto max-w-4xl py-6">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-4xl py-6 px-4">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Selecciona un servicio</h1>
          <p className="text-muted-foreground">
            Elige el servicio que deseas agendar
          </p>
        </div>

        <Separator />

        <div className="grid grid-cols-1 gap-4">
          {services.map((service) => (
            <ServiceCard
              key={service.id}
              service={service}
              isSelected={selectedService?.id === service.id}
              onSelect={() => handleSelectService(service)}
            />
          ))}
        </div>

        {services.length === 0 && (
          <Card>
            <CardContent className="py-10">
              <p className="text-center text-muted-foreground">
                No hay servicios disponibles en este momento.
              </p>
            </CardContent>
          </Card>
        )}

        <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t flex justify-between">
          <Button variant="outline" onClick={() => navigate("/")}>
            Atrás
          </Button>
          <Button
            onClick={handleContinue}
            disabled={!selectedService}
          >
            Continuar
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ServiceSelectionPage;
