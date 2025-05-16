
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";

const ProfileSkeleton = () => {
  return (
    <div className="bg-white shadow-md rounded-xl p-6 mb-8">
      <Skeleton className="h-8 w-1/3 mb-4" />
      <Skeleton className="h-5 w-1/4 mb-8" />
      <Separator className="my-6" />
      <Skeleton className="h-6 w-40 mb-6" />
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className="border rounded-lg p-4 h-40">
            <Skeleton className="h-6 w-2/3 mb-3" />
            <Skeleton className="h-4 w-1/2 mb-2" />
            <Skeleton className="h-4 w-1/3 mb-6" />
            <Skeleton className="h-8 w-full" />
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProfileSkeleton;
