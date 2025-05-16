
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Service } from "@/types/database";
import { useBooking } from "@/contexts/BookingContext";

export const useServiceSelection = (services: Service[]) => {
  const [selectedServiceId, setSelectedServiceId] = useState<string | null>(null);
  const navigate = useNavigate();
  const { setSelectedService } = useBooking();

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

  return {
    selectedServiceId,
    handleServiceSelect,
    handleContinue
  };
};
