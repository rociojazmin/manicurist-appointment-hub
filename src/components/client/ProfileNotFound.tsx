
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const ProfileNotFound = () => {
  const navigate = useNavigate();
  
  return (
    <div className="text-center">
      <h1 className="text-2xl font-bold">Perfil no encontrado</h1>
      <p className="mt-4">No se encontró un perfil con ese nombre de usuario.</p>
      <Button className="mt-6" onClick={() => navigate("/")}>
        Volver al inicio
      </Button>
    </div>
  );
};

export default ProfileNotFound;
