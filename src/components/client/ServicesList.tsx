
import { Service } from "@/types/database";
import { Button } from "@/components/ui/button";
import ServiceCard from "@/components/client/ServiceCard";

interface ServicesListProps {
  services: Service[];
  selectedServiceId: string | null;
  onSelectService: (id: string) => void;
  onContinue: () => void;
}

const ServicesList = ({
  services,
  selectedServiceId,
  onSelectService,
  onContinue,
}: ServicesListProps) => {
  if (services.length === 0) {
    return (
      <p className="text-center text-muted-foreground py-6">
        Esta manicurista no tiene servicios disponibles actualmente.
      </p>
    );
  }

  return (
    <>
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
            onClick={() => onSelectService(service.id)}
          />
        ))}
      </div>

      <div className="mt-8">
        <Button
          onClick={onContinue}
          disabled={!selectedServiceId || services.length === 0}
        >
          Reservar turno
        </Button>
      </div>
    </>
  );
};

export default ServicesList;
