import { Skeleton } from "@/components/ui/skeleton";

const LoadingHabits = () => {
  return (
    <div className="flex flex-col gap-4">
      <Skeleton className="h-28 rounded-lg border border-border" />
      <Skeleton className="h-40 rounded-lg border border-border" />
      <Skeleton className="h-40 rounded-lg border border-border" />
    </div>
  );
};

export default LoadingHabits;
