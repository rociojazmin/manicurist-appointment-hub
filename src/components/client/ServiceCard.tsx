
import { cn } from "@/lib/utils";

interface ServiceCardProps {
  id: string;
  name: string;
  description?: string;  // Make description optional
  price: number;
  duration: number;
  selected?: boolean;
  onClick: () => void;
}

const ServiceCard = ({
  id,
  name,
  description = "",  // Default to empty string
  price,
  duration,
  selected = false,
  onClick,
}: ServiceCardProps) => {
  return (
    <div 
      className={cn(
        "service-card group cursor-pointer p-4 bg-background border rounded-lg transition-all hover:shadow-md",
        selected && "ring-2 ring-primary ring-offset-2 ring-offset-background"
      )}
      onClick={onClick}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-secondary/5 opacity-0 group-hover:opacity-100 transition-opacity" />
      <h3 className="font-medium text-lg text-center">{name}</h3>
      {description && (
        <p className="text-sm text-muted-foreground text-center mt-2 mb-4">{description}</p>
      )}
      <div className="mt-auto flex justify-between items-center">
        <span className="font-medium text-foreground">${price}</span>
        <span className="text-sm text-muted-foreground">{duration} min</span>
      </div>
    </div>
  );
};

export default ServiceCard;
