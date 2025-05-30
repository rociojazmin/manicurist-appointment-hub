
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useBooking } from "@/contexts/BookingContext";
import ClientLayout from "@/components/layouts/ClientLayout";
import ServiceCard from "@/components/client/ServiceCard";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { Service } from "@/types/database";
import { useToast } from "@/components/ui/use-toast";
import { useAuthContext } from "@/contexts/AuthContext";
import { Skeleton } from "@/components/ui/skeleton";
import { Loader2 } from "lucide-react";

const ServiceSelectionPage = () => {
  const { selectedService, setSelectedService } = useBooking();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { profile } = useAuthContext();
  const [localSelectedService, setLocalSelectedService] = useState<string | null>(
    selectedService?.id || null
  );
  const [services, setServices] = useState<Service[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Cargar servicios desde la base de datos
  useEffect(() => {
    const fetchServices = async () => {
      setIsLoading(true);
      try {
        // Si tenemos un perfil de manicurista, obtener sus servicios
        // Si no, obtener todos los servicios
        const query = profile 
          ? supabase.from('services').select('*').eq('manicurist_id', profile.id)
          : supabase.from('services').select('*');
        
        const { data, error } = await query;
        
        if (error) {
          console.error('Error fetching services:', error);
          toast({
            title: "Error al cargar servicios",
            description: "No se pudieron cargar los servicios. Por favor, inténtelo de nuevo.",
            variant: "destructive"
          });
          setServices([]);
        } else {
          setServices(data || []);
        }
      } catch (error) {
        console.error('Error:', error);
        setServices([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchServices();
  }, [toast, profile]);

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
      const service = services.find((s) => s.id === localSelectedService);
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

          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 mb-8">
              {[1, 2, 3].map((i) => (
                <div key={i} className="border rounded-lg p-6 h-48">
                  <Skeleton className="h-7 w-3/4 mb-4" />
                  <Skeleton className="h-5 w-1/2 mb-2" />
                  <Skeleton className="h-5 w-1/3 mb-4" />
                  <Skeleton className="h-9 w-full mt-auto" />
                </div>
              ))}
            </div>
          ) : services.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 mb-8">
              {services.map((service) => (
                <ServiceCard
                  key={service.id}
                  id={service.id}
                  name={service.name}
                  description={service.description || ""}
                  price={service.price}
                  duration={service.duration}
                  selected={localSelectedService === service.id}
                  onClick={() => handleServiceSelect(service.id)}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground">
                No hay servicios disponibles en este momento.
              </p>
            </div>
          )}

          <div className="flex justify-between items-center mt-8">
            <Button
              variant="outline"
              onClick={() => navigate("/")}
            >
              Volver
            </Button>
            <Button
              onClick={handleContinue}
              disabled={!localSelectedService || services.length === 0}
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
