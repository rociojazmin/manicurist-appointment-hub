import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";
import { Manicurist } from "@/types/database";
import { User } from "@supabase/supabase-js";

export function useAuth() {
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Manicurist | null>(null);
  const navigate = useNavigate();

  // Redirigir si ya está logueado y tiene perfil
  useEffect(() => {
    if (user && profile) {
      navigate("/admin");
    }
  }, [user, profile, navigate]);

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setUser(session?.user ?? null);

      if (session?.user) {
        try {
          const { data: profileData, error } = await supabase
            .from("manicurists")
            .select("*")
            .eq("id", session.user.id)
            .single();

          if (error) {
            console.error("Error fetching manicurist profile:", error);
            setProfile(null);
          } else {
            setProfile(profileData);
          }
        } catch (error) {
          console.error("Error fetching manicurist profile:", error);
          setProfile(null);
        }
      } else {
        setProfile(null);
      }

      setIsLoading(false);
    });

    // Carga inicial
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      setUser(session?.user ?? null);

      if (session?.user) {
        const { data, error } = await supabase
          .from("manicurists")
          .select("*")
          .eq("id", session.user.id)
          .single();

        if (error) {
          console.error("Error fetching initial profile:", error);
        } else {
          setProfile(data);
        }
      }

      setIsLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) throw error;
      // redirección automática manejada por useEffect
    } catch (error: unknown) {
      if (error instanceof Error) {
        toast({
          title: "Error al iniciar sesión",
          description: error.message,
          variant: "destructive",
        });
      } else {
        console.error("Error desconocido:", error);
        toast({
          title: "Error desconocido",
          description: "Ocurrió un error inesperado al iniciar sesión",
          variant: "destructive",
        });
      }
    }
  };

  const register = async (email: string, password: string, name: string) => {
    try {
      const { error: signUpError, data } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name,
          },
        },
      });

      if (signUpError) throw signUpError;

      if (data.user) {
        const { error: profileError } = await supabase
          .from("manicurists")
          .insert({
            id: data.user.id,
            name: name,
            phone: null,
          });

        if (profileError) {
          console.error("Error creating manicurist profile:", profileError);
          toast({
            title: "Error al crear perfil",
            description:
              "Se creó la cuenta pero hubo un problema al crear el perfil",
            variant: "destructive",
          });
        }
      }

      toast({
        title: "Registro exitoso",
        description: "Por favor verifica tu email para confirmar tu cuenta.",
      });

      // La redirección se hará automáticamente si el usuario verifica el correo y se loguea
    } catch (error: unknown) {
      if (error instanceof Error) {
        toast({
          title: "Error al registrarse",
          description: error.message,
          variant: "destructive",
        });
      } else {
        console.error("Error desconocido:", error);
        toast({
          title: "Error desconocido",
          description: "Ocurrió un error inesperado al registrarse",
          variant: "destructive",
        });
      }
    }
  };

  const logout = async () => {
    await supabase.auth.signOut();
    navigate("/");
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
