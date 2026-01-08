import { Skeleton } from '@/components/ui/skeleton';

export default function NutritionLoading() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Skeleton className="h-10 w-32" />
        <Skeleton className="h-10 w-32" />
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
        {/* Macro Chart */}
        <div className="col-span-4">
          <Skeleton className="h-[400px] rounded-xl" />
        </div>

        {/* Quick Actions */}
        <div className="col-span-3 space-y-6">
          <div className="grid gap-4">
            {[...Array(3)].map((_, i) => (
              <Skeleton key={i} className="h-32 rounded-xl" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}