
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

  useEffect(() => {
    // Set up auth state listener FIRST
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("Auth state changed:", event, session?.user?.email);
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

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log("Initial session check:", session?.user?.email);
      setUser(session?.user ?? null);

      if (session?.user) {
        // Fetch user profile on initial load
        supabase
          .from("manicurists")
          .select("*")
          .eq("id", session.user.id)
          .single()
          .then(({ data, error }) => {
            if (error) {
              console.error("Error fetching initial profile:", error);
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
    setIsLoading(true);
    try {
      console.log("Attempting login for:", email);
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        throw error;
      }

      console.log("Login successful:", data?.user?.email);
      toast({
        title: "Inicio de sesión exitoso",
        description: "Bienvenido/a de nuevo",
      });
      navigate("/admin");
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error("Log in Error:", error.message);
        toast({
          title: "Error",
          description: error.message,
          variant: "destructive",
        });
      } else {
        console.error("Unexpected error", error);
        toast({
          title: "Error al iniciar sesión",
          description: "No se pudo inicar sesión. Por favor, intente denuevo",
          variant: "destructive",
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (email: string, password: string, name: string) => {
    setIsLoading(true);
    try {
      console.log("Attempting registration for:", email);
      
      // Step 1: Sign up the user
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

      console.log("Registration successful:", data?.user?.email);

      // Step 2: After successful registration, create profile in the manicurists table
      if (data.user) {
        console.log("Creating profile for:", data.user.id);
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
            description: "Se creó la cuenta pero hubo un problema al crear el perfil",
            variant: "destructive",
          });
          // Even if there's an error with profile creation, we'll still navigate to admin
        }
        
        // If we reach this point, registration was successful
        toast({
          title: "Registro exitoso",
          description: "Se ha creado su cuenta correctamente",
        });
        
        // Navigate to admin dashboard after successful registration
        navigate("/admin");
      }
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error("Sign up Error:", error.message);
        
        // Handle specific error cases
        if (error.message.includes("already registered")) {
          toast({
            title: "Error de registro",
            description: "Este email ya está registrado. Por favor inicie sesión.",
            variant: "destructive",
          });
        } else {
          toast({
            title: "Error",
            description: error.message,
            variant: "destructive",
          });
        }
      } else {
        console.error("Unexpected error", error);
        toast({
          title: "Error al registrarse",
          description: "No se pudo registrarse. Por favor, intente denuevo",
          variant: "destructive",
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      await supabase.auth.signOut();
      toast({
        title: "Sesión cerrada",
        description: "Ha cerrado sesión correctamente",
      });
      navigate("/");
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error("Sign out Error:", error.message);
        toast({
          title: "Error",
          description: error.message,
          variant: "destructive",
        });
      } else {
        console.error("Unexpected error", error);
        toast({
          title: "Error al cerrar sesión",
          description: "No se pudo cerrar sesión. Por favor, intente denuevo",
          variant: "destructive",
        });
      }
    }
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
