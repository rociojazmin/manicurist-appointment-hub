
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/components/ui/use-toast";

// Tipo para un servicio
type Service = {
  id: string;
  name: string;
  description: string;
  price: number;
  duration: number;
  active: boolean;
};

// Datos simulados iniciales
const INITIAL_SERVICES: Service[] = [
  {
    id: "1",
    name: "Manicuría Tradicional",
    description: "Servicio básico de manicuría con esmalte tradicional",
    price: 25,
    duration: 30,
    active: true
  },
  {
    id: "2",
    name: "Kapping",
    description: "Capa protectora para fortalecer y alargar tus uñas naturales",
    price: 35,
    duration: 45,
    active: true
  },
  {
    id: "3",
    name: "Semipermanente",
    description: "Esmaltado duradero que no daña tus uñas",
    price: 40,
    duration: 45,
    active: true
  },
  {
    id: "4",
    name: "Esculpidas",
    description: "Uñas artificiales de gel o acrílico para un look perfecto",
    price: 60,
    duration: 90,
    active: true
  },
  {
    id: "5",
    name: "Pedicuría",
    description: "Cuidado completo para tus pies",
    price: 30,
    duration: 40,
    active: true
  }
];

const ServiceSettingsPage = () => {
  const [services, setServices] = useState<Service[]>(INITIAL_SERVICES);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [currentService, setCurrentService] = useState<Service | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    duration: ""
  });
  const { toast } = useToast();

  const handleAddService = () => {
    // Validar formulario
    if (!formData.name || !formData.price || !formData.duration) {
      toast({
        title: "Error",
        description: "Por favor, completa todos los campos requeridos",
        variant: "destructive",
      });
      return;
    }

    const newService: Service = {
      id: Date.now().toString(),
      name: formData.name,
      description: formData.description,
      price: parseFloat(formData.price),
      duration: parseInt(formData.duration),
      active: true
    };

    setServices([...services, newService]);
    setIsAddDialogOpen(false);
    resetForm();

    toast({
      title: "Servicio agregado",
      description: `El servicio ${newService.name} ha sido agregado correctamente`
    });
  };

  const handleEditService = () => {
    if (!currentService) return;

    // Validar formulario
    if (!formData.name || !formData.price || !formData.duration) {
      toast({
        title: "Error",
        description: "Por favor, completa todos los campos requeridos",
        variant: "destructive",
      });
      return;
    }

    const updatedServices = services.map(service => 
      service.id === currentService.id 
        ? {
            ...service,
            name: formData.name,
            description: formData.description,
            price: parseFloat(formData.price),
            duration: parseInt(formData.duration)
          }
        : service
    );

    setServices(updatedServices);
    setIsEditDialogOpen(false);
    setCurrentService(null);
    resetForm();

    toast({
      title: "Servicio actualizado",
      description: `El servicio ${formData.name} ha sido actualizado correctamente`
    });
  };

  const handleToggleActive = (id: string) => {
    const updatedServices = services.map(service => 
      service.id === id 
        ? { ...service, active: !service.active }
        : service
    );

    setServices(updatedServices);
    
    const service = services.find(s => s.id === id);
    
    toast({
      title: service?.active ? "Servicio desactivado" : "Servicio activado",
      description: `El servicio ${service?.name} ha sido ${service?.active ? "desactivado" : "activado"} correctamente`
    });
  };

  const openEditDialog = (service: Service) => {
    setCurrentService(service);
    setFormData({
      name: service.name,
      description: service.description,
      price: service.price.toString(),
      duration: service.duration.toString()
    });
    setIsEditDialogOpen(true);
  };

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      price: "",
      duration: ""
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Gestión de Servicios</h1>
          <p className="text-muted-foreground">
            Administra los servicios que ofreces a tus clientes
          </p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>Agregar Servicio</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Agregar Nuevo Servicio</DialogTitle>
              <DialogDescription>
                Ingresa los detalles del nuevo servicio que deseas ofrecer
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nombre del Servicio</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Descripción</Label>
                <Input
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="price">Precio ($)</Label>
                  <Input
                    id="price"
                    type="number"
                    value={formData.price}
                    onChange={(e) => setFormData({...formData, price: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="duration">Duración (min)</Label>
                  <Input
                    id="duration"
                    type="number"
                    value={formData.duration}
                    onChange={(e) => setFormData({...formData, duration: e.target.value})}
                  />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>Cancelar</Button>
              <Button onClick={handleAddService}>Guardar</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4">
        {services.map((service) => (
          <Card key={service.id} className={!service.active ? "opacity-60" : ""}>
            <CardHeader className="pb-2">
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle>{service.name}</CardTitle>
                  <CardDescription>{service.description}</CardDescription>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleToggleActive(service.id)}
                >
                  {service.active ? "Desactivar" : "Activar"}
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium">Precio</p>
                  <p className="text-2xl font-bold">${service.price}</p>
                </div>
                <div>
                  <p className="text-sm font-medium">Duración</p>
                  <p className="text-2xl font-bold">{service.duration} min</p>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => openEditDialog(service)}
              >
                Editar Servicio
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Servicio</DialogTitle>
            <DialogDescription>
              Actualiza los detalles del servicio seleccionado
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name">Nombre del Servicio</Label>
              <Input
                id="edit-name"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-description">Descripción</Label>
              <Input
                id="edit-description"
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-price">Precio ($)</Label>
                <Input
                  id="edit-price"
                  type="number"
                  value={formData.price}
                  onChange={(e) => setFormData({...formData, price: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-duration">Duración (min)</Label>
                <Input
                  id="edit-duration"
                  type="number"
                  value={formData.duration}
                  onChange={(e) => setFormData({...formData, duration: e.target.value})}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>Cancelar</Button>
            <Button onClick={handleEditService}>Guardar Cambios</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ServiceSettingsPage;
