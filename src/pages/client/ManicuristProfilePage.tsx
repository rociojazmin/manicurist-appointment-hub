
import { useParams } from "react-router-dom";
import ClientLayout from "@/components/layouts/ClientLayout";
import { Separator } from "@/components/ui/separator";
import { useManicuristProfile } from "@/hooks/useManicuristProfile";
import { useServiceSelection } from "@/hooks/useServiceSelection";
import ProfileSkeleton from "@/components/client/ProfileSkeleton";
import ProfileNotFound from "@/components/client/ProfileNotFound";
import ServicesList from "@/components/client/ServicesList";

const ManicuristProfilePage = () => {
  const { username } = useParams<{ username: string }>();
  const { manicurist, services, isLoading } = useManicuristProfile(username);
  const { selectedServiceId, handleServiceSelect, handleContinue } = useServiceSelection(services);

  if (isLoading) {
    return (
      <ClientLayout>
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            <ProfileSkeleton />
          </div>
        </div>
      </ClientLayout>
    );
  }

  if (!manicurist) {
    return (
      <ClientLayout>
        <div className="container mx-auto px-4 py-12">
          <ProfileNotFound />
        </div>
      </ClientLayout>
    );
  }

  return (
    <ClientLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white shadow-md rounded-xl p-6 mb-8">
            <h1 className="text-2xl md:text-3xl font-bold">
              {manicurist.name}
            </h1>
            {manicurist.phone && (
              <p className="text-muted-foreground mt-2">
                Teléfono: {manicurist.phone}
              </p>
            )}
            <Separator className="my-6" />
            <div className="prose">
              <h2 className="text-xl font-semibold mb-4">Servicios disponibles</h2>
            </div>

            <ServicesList 
              services={services}
              selectedServiceId={selectedServiceId}
              onSelectService={handleServiceSelect}
              onContinue={handleContinue}
            />
          </div>
        </div>
      </div>
    </ClientLayout>
  );
};

export default ManicuristProfilePage;
