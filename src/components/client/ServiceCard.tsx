
import { cn } from "@/lib/utils";

interface ServiceCardProps {
  id: string;
  name: string;
  description: string;
  price: number;
  duration: number;
  selected?: boolean;
  onClick: () => void;
}

const ServiceCard = ({
  id,
  name,
  description,
  price,
  duration,
  selected = false,
  onClick,
}: ServiceCardProps) => {
  return (
    <div 
      className={cn(
        "service-card", 
        selected && "border-2 border-primary"
      )}
      onClick={onClick}
    >
      <h3 className="service-card__title">{name}</h3>
      <p className="text-sm text-muted-foreground text-center mt-2 mb-4">{description}</p>
      <div className="mt-auto flex justify-between items-center">
        <span className="font-medium text-foreground">${price}</span>
        <span className="text-sm text-muted-foreground">{duration} min</span>
      </div>
    </div>
  );
};

export default ServiceCard;
