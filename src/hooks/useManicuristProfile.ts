
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Manicurist, Service } from "@/types/database";
import { useToast } from "@/components/ui/use-toast";
import { useBooking } from "@/contexts/BookingContext";
import { useNavigate } from "react-router-dom";

export const useManicuristProfile = (username: string | undefined) => {
  const [manicurist, setManicurist] = useState<Manicurist | null>(null);
  const [services, setServices] = useState<Service[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { setSelectedManicurist } = useBooking();

  useEffect(() => {
    const fetchManicuristProfile = async () => {
      if (!username) return;
      
      setIsLoading(true);
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
        setSelectedManicurist(manicuristData);

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
        setIsLoading(false);
      }
    };

    fetchManicuristProfile();
  }, [username, navigate, toast, setSelectedManicurist]);

  return {
    manicurist,
    services,
    isLoading
  };
};
