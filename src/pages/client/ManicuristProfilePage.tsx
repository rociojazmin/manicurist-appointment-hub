
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Manicurist, Service } from "@/types/database";
import ClientLayout from "@/components/layouts/ClientLayout";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/components/ui/use-toast";
import ServiceCard from "@/components/client/ServiceCard";
import { Loader2 } from "lucide-react";
import { useBooking } from "@/contexts/BookingContext";

const ManicuristProfilePage = () => {
  const { username } = useParams<{ username: string }>();
  const [manicurist, setManicurist] = useState<Manicurist | null>(null);
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedServiceId, setSelectedServiceId] = useState<string | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { setSelectedService } = useBooking();

  useEffect(() => {
    const fetchManicuristProfile = async () => {
      setLoading(true);
      try {
        // Buscar el perfil de la manicurista por username
        const { data: manicuristData, error: manicuristError } = await supabase
          .from("manicurists")
          .select("*")
          .eq("username", username)
          .single();

        if (manicuristError) {
          console.error("Error fetching manicurist:", manicuristError);
          toast({
            title: "Manicurista no encontrada",
            description: "No se encontró un perfil con ese nombre de usuario",
            variant: "destructive",
          });
          navigate("/");
          return;
        }

        setManicurist(manicuristData);

        // Buscar los servicios de la manicurista
        const { data: servicesData, error: servicesError } = await supabase
          .from("services")
          .select("*")
          .eq("manicurist_id", manicuristData.id);

        if (servicesError) {
          console.error("Error fetching services:", servicesError);
          toast({
            title: "Error",
            description: "No se pudieron cargar los servicios",
            variant: "destructive",
          });
          setServices([]);
        } else {
          setServices(servicesData || []);
        }
      } catch (error) {
        console.error("Unexpected error:", error);
        toast({
          title: "Error",
          description: "Ocurrió un error inesperado",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    if (username) {
      fetchManicuristProfile();
    }
  }, [username, navigate, toast]);

  const handleServiceSelect = (serviceId: string) => {
    setSelectedServiceId(serviceId);
  };

  const handleContinue = () => {
    if (selectedServiceId) {
      const service = services.find((s) => s.id === selectedServiceId);
      if (service) {
        setSelectedService(service);
        navigate("/calendar");
      }
    }
  };

  if (loading) {
    return (
      <ClientLayout>
        <div className="container mx-auto px-4 py-12 flex justify-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
        </div>
      </ClientLayout>
    );
  }

  if (!manicurist) {
    return (
      <ClientLayout>
        <div className="container mx-auto px-4 py-12">
          <div className="text-center">
            <h1 className="text-2xl font-bold">Perfil no encontrado</h1>
            <p className="mt-4">No se encontró un perfil con ese nombre de usuario.</p>
            <Button className="mt-6" onClick={() => navigate("/")}>
              Volver al inicio
            </Button>
          </div>
        </div>
      </ClientLayout>
    );
  }

  return (
    <ClientLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white shadow-md rounded-xl p-6 mb-8">
            <h1 className="text-2xl md:text-3xl font-bold">
              {manicurist.name}
            </h1>
            {manicurist.phone && (
              <p className="text-muted-foreground mt-2">
                Teléfono: {manicurist.phone}
              </p>
            )}
            <Separator className="my-6" />
            <div className="prose">
              <h2 className="text-xl font-semibold mb-4">Servicios disponibles</h2>
            </div>

            {services.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 mt-6">
                {services.map((service) => (
                  <ServiceCard
                    key={service.id}
                    id={service.id}
                    name={service.name}
                    description={service.description || ""}
                    price={service.price}
                    duration={service.duration}
                    selected={selectedServiceId === service.id}
                    onClick={() => handleServiceSelect(service.id)}
                  />
                ))}
              </div>
            ) : (
              <p className="text-center text-muted-foreground py-6">
                Esta manicurista no tiene servicios disponibles actualmente.
              </p>
            )}

            <div className="mt-8">
              <Button
                onClick={handleContinue}
                disabled={!selectedServiceId || services.length === 0}
              >
                Reservar turno
              </Button>
            </div>
          </div>
        </div>
      </div>
    </ClientLayout>
  );
};

export default ManicuristProfilePage;
