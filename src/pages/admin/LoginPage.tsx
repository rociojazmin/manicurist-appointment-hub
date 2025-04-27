
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  // Si ya está autenticado, redirigir al dashboard
  if (isAuthenticated) {
    navigate("/admin");
    return null;
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast({
        title: "Error",
        description: "Por favor, ingresa email y contraseña",
        variant: "destructive",
      });
      return;
    }
    
    setIsLoading(true);
    
    try {
      await login(email, password);
      toast({
        title: "¡Bienvenida!",
        description: "Has iniciado sesión correctamente",
      });
      navigate("/admin");
    } catch (error) {
      toast({
        title: "Error de inicio de sesión",
        description: "Credenciales incorrectas. Intenta nuevamente.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-secondary bg-opacity-30 px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold">Panel de Administración</h1>
          <p className="text-muted-foreground mt-2">
            Inicia sesión para gestionar tus servicios y turnos
          </p>
        </div>
        
        <div className="bg-white rounded-xl shadow-md p-8">
          <form onSubmit={handleLogin}>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Ingresa tu email"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password">Contraseña</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Ingresa tu contraseña"
                />
              </div>
            </div>
            
            <Button
              type="submit"
              className="w-full mt-6"
              disabled={isLoading}
            >
              {isLoading ? "Iniciando sesión..." : "Iniciar Sesión"}
            </Button>
          </form>
          
          <div className="mt-6 pt-4 border-t text-center">
            <p className="text-sm text-muted-foreground">
              ¿No tienes una cuenta? Contacta al administrador del sistema.
            </p>
          </div>
        </div>
        
        <div className="mt-6 text-center">
          <Button
            variant="link"
            onClick={() => navigate("/")}
          >
            Volver al sitio principal
          </Button>
        </div>
        
        {/* Credenciales demo */}
        <div className="mt-8 p-4 bg-muted rounded-lg">
          <p className="text-sm text-center font-medium mb-2">Credenciales de demostración:</p>
          <p className="text-sm text-center text-muted-foreground">
            Email: admin@nailsalon.com<br />
            Contraseña: admin123
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
