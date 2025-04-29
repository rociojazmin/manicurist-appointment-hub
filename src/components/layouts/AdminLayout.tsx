
import { Outlet, Link, useNavigate, useLocation } from "react-router-dom";
import { useAuthContext } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Calendar, Settings, User, LogOut } from "lucide-react";

const AdminLayout = () => {
  const { logout } = useAuthContext();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate("/admin/login");
  };

  return (
    <div className="flex flex-col min-h-screen">
      <header className="bg-primary text-primary-foreground py-4 px-6">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-xl font-semibold">Panel de Administración</h1>
          <Button variant="ghost" onClick={handleLogout}>
            <LogOut className="h-5 w-5 mr-2" />
            Salir
          </Button>
        </div>
      </header>
      
      <div className="flex flex-col md:flex-row flex-1">
        <nav className="bg-secondary p-4 md:w-64">
          <ul className="space-y-2">
            <li>
              <Link 
                to="/admin" 
                className={`flex items-center p-3 rounded-lg ${location.pathname === "/admin" ? "bg-primary text-primary-foreground" : "hover:bg-secondary-foreground/10"}`}
              >
                <User className="h-5 w-5 mr-3" />
                Dashboard
              </Link>
            </li>
            <li>
              <Link 
                to="/admin/services" 
                className={`flex items-center p-3 rounded-lg ${location.pathname === "/admin/services" ? "bg-primary text-primary-foreground" : "hover:bg-secondary-foreground/10"}`}
              >
                <Settings className="h-5 w-5 mr-3" />
                Servicios
              </Link>
            </li>
            <li>
              <Link 
                to="/admin/schedule" 
                className={`flex items-center p-3 rounded-lg ${location.pathname === "/admin/schedule" ? "bg-primary text-primary-foreground" : "hover:bg-secondary-foreground/10"}`}
              >
                <Calendar className="h-5 w-5 mr-3" />
                Horarios
              </Link>
            </li>
            <li>
              <Link 
                to="/admin/appointments" 
                className={`flex items-center p-3 rounded-lg ${location.pathname === "/admin/appointments" ? "bg-primary text-primary-foreground" : "hover:bg-secondary-foreground/10"}`}
              >
                <Calendar className="h-5 w-5 mr-3" />
                Turnos
              </Link>
            </li>
          </ul>
        </nav>
        
        <main className="flex-1 p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
