
import { useState } from 'react';
import { useAuthContext } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2 } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

export default function LoginPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [errors, setErrors] = useState<{email?: string, password?: string, name?: string}>({});
  const { login, register, isAuthLoading } = useAuthContext();
  const { toast } = useToast();

  const validateForm = () => {
    const newErrors: {email?: string, password?: string, name?: string} = {};
    let isValid = true;

    if (!email) {
      newErrors.email = 'El email es requerido';
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'El email no es válido';
      isValid = false;
    }

    if (!password) {
      newErrors.password = 'La contraseña es requerida';
      isValid = false;
    } else if (password.length < 6) {
      newErrors.password = 'La contraseña debe tener al menos 6 caracteres';
      isValid = false;
    }

    if (!isLogin && !name) {
      newErrors.name = 'El nombre es requerido';
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    try {
      if (isLogin) {
        await login(email, password);
      } else {
        await register(email, password, name);
      }
    } catch (error) {
      // Any unhandled errors will be caught here
      console.error("Form submission error:", error);
      toast({
        title: "Error",
        description: "Ha ocurrido un error inesperado. Por favor, intente nuevamente.",
        variant: "destructive",
      });
    }
  };

  const toggleMode = () => {
    setIsLogin(!isLogin);
    setErrors({});
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-lg shadow-md">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            {isLogin ? 'Iniciar sesión' : 'Registrarse'}
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            {isLogin 
              ? 'Accede a tu cuenta para gestionar tus citas' 
              : 'Crea una cuenta para empezar a gestionar tus citas'}
          </p>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md -space-y-px">
            {!isLogin && (
              <div className="mb-4">
                <Label htmlFor="name">Nombre</Label>
                <Input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className={errors.name ? "border-red-500" : ""}
                  disabled={isAuthLoading}
                />
                {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
              </div>
            )}
            
            <div className="mb-4">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={errors.email ? "border-red-500" : ""}
                disabled={isAuthLoading}
              />
              {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
            </div>
            
            <div className="mb-4">
              <Label htmlFor="password">Contraseña</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={errors.password ? "border-red-500" : ""}
                disabled={isAuthLoading}
              />
              {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
            </div>
          </div>

          <div>
            <Button 
              type="submit" 
              className="w-full" 
              disabled={isAuthLoading}
            >
              {isAuthLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {isLogin ? 'Iniciando sesión...' : 'Registrando...'}
                </>
              ) : (
                isLogin ? 'Iniciar sesión' : 'Registrarse'
              )}
            </Button>
          </div>
        </form>

        <div className="text-center">
          <Button
            variant="link"
            onClick={toggleMode}
            className="text-sm"
            disabled={isAuthLoading}
          >
            {isLogin
              ? '¿No tienes una cuenta? Regístrate'
              : '¿Ya tienes una cuenta? Inicia sesión'}
          </Button>
        </div>
      </div>
    </div>
  );
}
