
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "react-router-dom";

const QuickActions = () => {
  return (
    <Card className="col-span-3">
      <CardHeader>
        <CardTitle>Acciones Rápidas</CardTitle>
        <CardDescription>
          Gestiona tus servicios y horarios
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="bg-secondary p-4 rounded-lg">
            <h3 className="font-medium mb-2">Configuración de Horarios</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Define tus horarios de atención y días disponibles para las próximas semanas.
            </p>
            <div className="flex justify-end">
              <Link to="/admin/schedule" className="text-sm font-medium text-primary hover:underline">
                Configurar →
              </Link>
            </div>
          </div>
          
          <div className="bg-secondary p-4 rounded-lg">
            <h3 className="font-medium mb-2">Gestión de Servicios</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Administra los servicios que ofreces, precios y duración.
            </p>
            <div className="flex justify-end">
              <Link to="/admin/services" className="text-sm font-medium text-primary hover:underline">
                Gestionar →
              </Link>
            </div>
          </div>
          
          <div className="bg-secondary p-4 rounded-lg">
            <h3 className="font-medium mb-2">Ver Todos los Turnos</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Consulta, confirma o cancela los turnos agendados.
            </p>
            <div className="flex justify-end">
              <Link to="/admin/appointments" className="text-sm font-medium text-primary hover:underline">
                Ver Turnos →
              </Link>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default QuickActions;
