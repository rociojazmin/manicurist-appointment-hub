
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';
import { Manicurist } from '@/types/database';

export function useAuth() {
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<Manicurist | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setUser(session?.user ?? null);
        
        if (session?.user) {
          try {
            const { data: profileData, error } = await supabase
              .from('manicurists')
              .select('*')
              .eq('id', session.user.id)
              .single();
              
            if (error) {
              console.error('Error fetching manicurist profile:', error);
              setProfile(null);
            } else {
              // Como ya hemos ajustado el tipo Manicurist para que coincida con la estructura de la base de datos,
              // ahora podemos asignar directamente sin conversión de tipo
              setProfile(profileData);
            }
          } catch (error) {
            console.error('Error fetching manicurist profile:', error);
            setProfile(null);
          }
        } else {
          setProfile(null);
        }
        
        setIsLoading(false);
      }
    );

    // Initial session check
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      
      if (session?.user) {
        // Fetch user profile on initial load
        supabase
          .from('manicurists')
          .select('*')
          .eq('id', session.user.id)
          .single()
          .then(({ data, error }) => {
            if (error) {
              console.error('Error fetching initial profile:', error);
            } else {
              setProfile(data);
            }
            setIsLoading(false);
          });
      } else {
        setIsLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      navigate('/admin');
    } catch (error: any) {
      toast({
        title: "Error al iniciar sesión",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const register = async (email: string, password: string, name: string) => {
    try {
      const { error: signUpError, data } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name
          }
        }
      });
      
      if (signUpError) throw signUpError;
      
      // Después de registrarse con éxito, crear perfil en la tabla manicurists
      if (data.user) {
        const { error: profileError } = await supabase
          .from('manicurists')
          .insert({
            id: data.user.id,
            name: name,
            phone: null,
          });
          
        if (profileError) {
          console.error("Error creating manicurist profile:", profileError);
          toast({
            title: "Error al crear perfil",
            description: "Se creó la cuenta pero hubo un problema al crear el perfil",
            variant: "destructive"
          });
        }
      }
      
      toast({
        title: "Registro exitoso",
        description: "Por favor verifica tu email para confirmar tu cuenta."
      });
    } catch (error: any) {
      toast({
        title: "Error al registrarse",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const logout = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  return {
    user,
    profile,
    isLoading,
    login,
    register,
    logout,
  };
}
