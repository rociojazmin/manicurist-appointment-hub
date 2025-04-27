
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";

interface ClientLayoutProps {
  children: React.ReactNode;
  className?: string;
}

const ClientLayout = ({ children, className }: ClientLayoutProps) => {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <header className="bg-white shadow-sm py-4">
        <div className="container mx-auto px-4 flex justify-between items-center">
          <Link to="/" className="text-2xl font-semibold text-primary">
            NailsBooking
          </Link>
          <nav className="hidden md:block">
            <ul className="flex space-x-6">
              <li>
                <Link to="/" className="hover:text-primary transition-colors">
                  Inicio
                </Link>
              </li>
              <li>
                <Link to="/services" className="hover:text-primary transition-colors">
                  Servicios
                </Link>
              </li>
              <li>
                <Link to="/admin/login" className="hover:text-primary transition-colors">
                  Admin
                </Link>
              </li>
            </ul>
          </nav>
        </div>
      </header>
      
      <main className={cn("flex-1", className)}>
        {children}
      </main>
      
      <footer className="bg-white shadow-sm py-6 mt-auto">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>© 2025 NailsBooking. Todos los derechos reservados.</p>
        </div>
      </footer>
    </div>
  );
};

export default ClientLayout;
