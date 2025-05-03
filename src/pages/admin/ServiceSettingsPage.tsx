
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Service } from "@/types/database";
import { Loader2 } from "lucide-react";

const ServiceSettingsPage = () => {
  const [services, setServices] = useState<Service[]>([]);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [currentService, setCurrentService] = useState<Service | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    duration: ""
  });
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      fetchServices();
    }
  }, [user]);

  const fetchServices = async () => {
    if (!user?.id) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("services")
        .select("*")
        .eq("manicurist_id", user.id);
        
      if (error) {
        throw error;
      }
      
      setServices(data || []);
    } catch (error: any) {
      console.error("Error fetching services:", error);
      toast({
        title: "Error",
        description: "No se pudieron cargar tus servicios. " + error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddService = async () => {
    // Validar formulario
    if (!formData.name || !formData.price || !formData.duration) {
      toast({
        title: "Error",
        description: "Por favor, completa todos los campos requeridos",
        variant: "destructive",
      });
      return;
    }

    if (!user?.id) {
      toast({
        title: "Error",
        description: "No se pudo identificar al usuario",
        variant: "destructive",
      });
      return;
    }
    
    try {
      const newService = {
        name: formData.name,
        description: formData.description || null,
        price: parseFloat(formData.price),
        duration: parseInt(formData.duration),
        manicurist_id: user.id
      };
      
      const { data, error } = await supabase
        .from("services")
        .insert(newService)
        .select()
        .single();
        
      if (error) throw error;
      
      setServices([...services, data]);
      setIsAddDialogOpen(false);
      resetForm();

      toast({
        title: "Servicio agregado",
        description: `El servicio ${newService.name} ha sido agregado correctamente`
      });
    } catch (error: any) {
      console.error("Error adding service:", error);
      toast({
        title: "Error",
        description: "No se pudo guardar el servicio. " + error.message,
        variant: "destructive",
      });
    }
  };

  const handleEditService = async () => {
    if (!currentService || !user?.id) return;

    // Validar formulario
    if (!formData.name || !formData.price || !formData.duration) {
      toast({
        title: "Error",
        description: "Por favor, completa todos los campos requeridos",
        variant: "destructive",
      });
      return;
    }

    try {
      const updatedService = {
        name: formData.name,
        description: formData.description || null,
        price: parseFloat(formData.price),
        duration: parseInt(formData.duration)
      };
      
      const { error } = await supabase
        .from("services")
        .update(updatedService)
        .eq("id", currentService.id)
        .eq("manicurist_id", user.id);
        
      if (error) throw error;
      
      const updatedServices = services.map(service => 
        service.id === currentService.id 
          ? { ...service, ...updatedService }
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
    } catch (error: any) {
      console.error("Error updating service:", error);
      toast({
        title: "Error",
        description: "No se pudo actualizar el servicio. " + error.message,
        variant: "destructive",
      });
    }
  };

  const handleToggleActive = async (id: string) => {
    if (!user?.id) return;
    
    try {
      const service = services.find(s => s.id === id);
      if (!service) return;
      
      // En esta implementación, eliminamos el servicio cuando se desactiva
      // Ya que no hay un campo "active" en el modelo de servicio
      const { error } = await supabase
        .from("services")
        .delete()
        .eq("id", id)
        .eq("manicurist_id", user.id);
        
      if (error) throw error;
      
      const updatedServices = services.filter(service => service.id !== id);
      setServices(updatedServices);
      
      toast({
        title: "Servicio eliminado",
        description: `El servicio ${service.name} ha sido eliminado correctamente`
      });
    } catch (error: any) {
      console.error("Error toggling service:", error);
      toast({
        title: "Error",
        description: "No se pudo eliminar el servicio. " + error.message,
        variant: "destructive",
      });
    }
  };

  const openEditDialog = (service: Service) => {
    setCurrentService(service);
    setFormData({
      name: service.name,
      description: service.description || "",
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

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

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
        {services.length > 0 ? (
          services.map((service) => (
            <Card key={service.id}>
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
                    Eliminar
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
          ))
        ) : (
          <div className="text-center p-8 border rounded-lg">
            <p className="text-muted-foreground">No has agregado ningún servicio aún.</p>
          </div>
        )}
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
