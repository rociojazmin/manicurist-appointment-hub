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
        await supabase.from("manicurists").insert({
          id: user.id,
          name,
          phone: null,
        });
        setProfile({
          id: user.id,
          name,
          phone: null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });
      } else if (profileData) {
        setProfile(profileData);
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
      setIsLoading(false);
    });

    // Initial session check
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        await syncProfile(session.user);
      }
      setIsLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
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
      setIsLoading(false);
    }
  };

  const register = async (email: string, password: string, name: string) => {
    setIsLoading(true);
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
      setIsLoading(false);
    }
  };

  const logout = async () => {
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
