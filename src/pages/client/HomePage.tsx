
import { useNavigate } from "react-router-dom";
import ClientLayout from "@/components/layouts/ClientLayout";
import { Button } from "@/components/ui/button";

const HomePage = () => {
  const navigate = useNavigate();

  return (
    <ClientLayout>
      <section className="relative overflow-hidden">
        <div className="gradient-noise h-64 md:h-96" />
        <div className="container mx-auto px-4 py-12 md:py-24 -mt-16 md:-mt-32 relative z-10">
          <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg p-8 md:p-12 max-w-3xl mx-auto border border-white/20">
            <h1 className="text-3xl md:text-4xl font-bold text-center mb-6">
              Reserva tu turno de manicuría
            </h1>
            <p className="text-center text-muted-foreground mb-8">
              Agenda fácilmente tu próximo servicio de manicuría en pocos pasos
            </p>
            <div className="flex justify-center">
              <Button 
                size="lg" 
                className="font-medium text-lg"
                onClick={() => navigate('/services')}
              >
                Reservar Ahora
              </Button>
            </div>
          </div>
        </div>
      </section>

      <section className="container mx-auto px-4 py-16">
        <h2 className="text-2xl md:text-3xl font-semibold text-center mb-12">
          Nuestros Servicios
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
          <div className="service-card">
            <h3 className="service-card__title">Manicuría Tradicional</h3>
            <p className="text-muted-foreground mb-4">Servicio básico de manicuría con esmalte tradicional</p>
            <p className="font-medium text-primary">Desde $25</p>
          </div>
          <div className="service-card">
            <h3 className="service-card__title">Kapping</h3>
            <p className="text-muted-foreground mb-4">Capa protectora para fortalecer y alargar tus uñas naturales</p>
            <p className="font-medium text-primary">Desde $35</p>
          </div>
          <div className="service-card">
            <h3 className="service-card__title">Semipermanente</h3>
            <p className="text-muted-foreground mb-4">Esmaltado duradero que no daña tus uñas</p>
            <p className="font-medium text-primary">Desde $40</p>
          </div>
          <div className="service-card">
            <h3 className="service-card__title">Esculpidas</h3>
            <p className="text-muted-foreground mb-4">Uñas artificiales de gel o acrílico para un look perfecto</p>
            <p className="font-medium text-primary">Desde $60</p>
          </div>
          <div className="service-card">
            <h3 className="service-card__title">Pedicuría</h3>
            <p className="text-muted-foreground mb-4">Cuidado completo para tus pies</p>
            <p className="font-medium text-primary">Desde $30</p>
          </div>
          <div className="service-card">
            <h3 className="service-card__title">Diseños</h3>
            <p className="text-muted-foreground mb-4">Arte y decoraciones personalizadas para tus uñas</p>
            <p className="font-medium text-primary">Desde $15</p>
          </div>
        </div>
      </section>

      <section className="fancy-gradient py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl md:text-3xl font-semibold text-center mb-8">
            ¿Por qué elegirnos?
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-white/80 backdrop-blur-sm rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4 shadow-md">
                <span className="text-primary text-2xl">✓</span>
              </div>
              <h3 className="text-xl font-medium mb-2">Profesionales Expertas</h3>
              <p className="text-muted-foreground">Manicuristas con años de experiencia y capacitación constante</p>
            </div>
            <div className="text-center">
              <div className="bg-white/80 backdrop-blur-sm rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4 shadow-md">
                <span className="text-primary text-2xl">✓</span>
              </div>
              <h3 className="text-xl font-medium mb-2">Productos Premium</h3>
              <p className="text-muted-foreground">Utilizamos marcas de alta calidad para resultados duraderos</p>
            </div>
            <div className="text-center">
              <div className="bg-white/80 backdrop-blur-sm rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4 shadow-md">
                <span className="text-primary text-2xl">✓</span>
              </div>
              <h3 className="text-xl font-medium mb-2">Higiene Garantizada</h3>
              <p className="text-muted-foreground">Instrumentos esterilizados y ambiente limpio para tu seguridad</p>
            </div>
          </div>
        </div>
      </section>

      <section className="container mx-auto px-4 py-16 text-center">
        <h2 className="text-2xl md:text-3xl font-semibold mb-6">
          ¿Lista para lucir uñas perfectas?
        </h2>
        <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">
          Agenda tu cita hoy mismo y déjanos consentir tus manos con los mejores tratamientos
        </p>
        <Button 
          size="lg" 
          className="font-medium"
          onClick={() => navigate('/services')}
        >
          Reservar mi Turno
        </Button>
      </section>
    </ClientLayout>
  );
};

export default HomePage;
