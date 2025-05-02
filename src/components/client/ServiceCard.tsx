
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils"; // Asumiendo que tienes esta función de utilidad

export interface ServiceCardProps {
  name: string;
  price: number;
  duration: number;
  description?: string;
  isSelected: boolean;
  onSelect: () => void;
}

const ServiceCard = ({ 
  name, 
  price, 
  duration, 
  description, 
  isSelected, 
  onSelect 
}: ServiceCardProps) => {
  return (
    <Card 
      className={`cursor-pointer transition-all ${
        isSelected 
          ? 'border-2 border-primary shadow-md'
          : 'hover:border-primary/50'
      }`}
      onClick={onSelect}
    >
      <CardContent className="p-4">
        <div className="flex justify-between items-start gap-4">
          <div className="flex-1">
            <h3 className="font-medium mb-1">{name}</h3>
            {description && (
              <p className="text-sm text-muted-foreground mb-2">{description}</p>
            )}
            <span className="text-sm text-muted-foreground">
              Duración: {duration} minutos
            </span>
          </div>
          <div className="text-right">
            <p className="font-medium">{formatCurrency(price)}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ServiceCard;
