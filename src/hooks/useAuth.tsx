
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";
import { Manicurist } from "@/types/database";
import { User } from "@supabase/supabase-js";

// Función para generar un username basado en el nombre
const generateUsername = (name: string): string => {
  // Convertir a minúsculas y eliminar espacios y caracteres especiales
  return name.toLowerCase()
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "") // Remover acentos
    .replace(/[^a-z0-9]/g, "");
};

export function useAuth() {
  const [isAuthLoading, setIsAuthLoading] = useState(false);
  const [isSessionLoading, setIsSessionLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Manicurist | null>(null);
  const navigate = useNavigate();

  // Helper: fetch or create profile for logged user
  const syncProfile = async (user: User) => {
    try {
      const { data: profileData, error: selectError } = await supabase
        .from("manicurists")
        .select("*")
        .eq("id", user.id)
        .single();

      // No profile exists → create it
      if (selectError && selectError.code === "PGRST116") {
        const name = user.user_metadata?.name || "";
        const username = generateUsername(name);
        
        await supabase.from("manicurists").insert({
          id: user.id,
          name,
          phone: null,
          username,
        });
        
        setProfile({
          id: user.id,
          name,
          phone: null,
          username,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });
      } else if (profileData) {
        // Si no tiene username, generarlo y actualizar
        if (!profileData.username) {
          const username = generateUsername(profileData.name);
          
          await supabase
            .from("manicurists")
            .update({ username })
            .eq("id", user.id);
            
          setProfile({
            ...profileData,
            username
          });
        } else {
          setProfile(profileData);
        }
      } else {
        console.error("Error syncing profile:", selectError);
        setProfile(null);
      }
    } catch (err) {
      console.error("Unexpected error syncing profile:", err);
      setProfile(null);
    }
  };

  useEffect(() => {
    // Listen to auth state changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        await syncProfile(session.user);
      } else {
        setProfile(null);
      }
      setIsSessionLoading(false);
    });

    // Initial session check
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        await syncProfile(session.user);
      }
      setIsSessionLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const login = async (email: string, password: string) => {
    setIsAuthLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) throw error;
      toast({
        title: "Inicio de sesión exitoso",
        description: "Bienvenido/a de nuevo",
      });
      navigate("/admin");
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "Error inesperado";
      toast({
        title: "Error de inicio",
        description: message,
        variant: "destructive",
      });
      console.error("Login error:", error);
    } finally {
      setIsAuthLoading(false);
    }
  };

  const register = async (email: string, password: string, name: string) => {
    setIsAuthLoading(true);
    try {
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { name } },
      });

      if (signUpError) throw signUpError;

      // En producción, confirmación de e-mail obliga a esperar
      if (!data.session) {
        toast({ title: "Revisa tu e‑mail para confirmar la cuenta" });
        return;
      }

      toast({ title: "Registro exitoso", description: "¡Bienvenido!" });
      navigate("/admin");
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "Error inesperado";
      toast({
        title: "Error de registro",
        description: message,
        variant: "destructive",
      });
      console.error("Register error:", error);
    } finally {
      setIsAuthLoading(false);
    }
  };

  const logout = async () => {
    setIsAuthLoading(true);
    try {
      await supabase.auth.signOut();
      toast({ title: "Sesión cerrada" });
      navigate("/");
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "Error inesperado";
      toast({
        title: "Error al cerrar sesión",
        description: message,
        variant: "destructive",
      });
      console.error("Logout error:", error);
    } finally {
      setIsAuthLoading(false);
    }
  };

  return {
    user,
    profile,
    isSessionLoading,
    isAuthLoading,
    login,
    register,
    logout,
  };
}
