import { Skeleton } from '../ui/skeleton';

// Domain card skeleton loader
export const DomainCardSkeleton = () => (
  <div className="p-6 border rounded-lg">
    <Skeleton className="h-6 w-3/4 mb-3" />
    <Skeleton className="h-4 w-full mb-2" />
    <Skeleton className="h-4 w-2/3" />
  </div>
);

// Collection list skeleton loader
export const CollectionListSkeleton = () => (
  <div className="space-y-4">
    {Array.from({ length: 3 }).map((_, i) => (
      <div key={i} className="p-4 border rounded-lg">
        <Skeleton className="h-5 w-1/2 mb-2" />
        <Skeleton className="h-4 w-3/4" />
      </div>
    ))}
  </div>
);

// Contract list skeleton loader
export const ContractListSkeleton = () => (
  <div className="space-y-4">
    {Array.from({ length: 4 }).map((_, i) => (
      <div key={i} className="p-4 border rounded-lg">
        <div className="flex justify-between items-start mb-3">
          <Skeleton className="h-5 w-1/3" />
          <Skeleton className="h-5 w-16" />
        </div>
        <Skeleton className="h-4 w-full mb-2" />
        <Skeleton className="h-4 w-2/3 mb-3" />
        <div className="flex gap-2">
          <Skeleton className="h-6 w-16" />
          <Skeleton className="h-6 w-20" />
        </div>
      </div>
    ))}
  </div>
);

// Contract detail page skeleton loader
export const ContractDetailSkeleton = () => (
  <div className="grid grid-cols-1 lg:grid-cols-[70%_30%] gap-6">
    {/* Left column */}
    <div className="space-y-6">
      {/* Schema visualizer skeleton */}
      <div className="p-6 border rounded-lg">
        <Skeleton className="h-6 w-1/4 mb-4" />
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex justify-between items-center p-2 border rounded">
              <Skeleton className="h-4 w-1/3" />
              <Skeleton className="h-4 w-1/4" />
            </div>
          ))}
        </div>
      </div>

      {/* Contract info skeleton */}
      <div className="p-6 border rounded-lg">
        <Skeleton className="h-6 w-1/3 mb-4" />
        <div className="space-y-3">
          <div className="flex justify-between">
            <Skeleton className="h-4 w-1/4" />
            <Skeleton className="h-4 w-1/3" />
          </div>
          <div className="flex justify-between">
            <Skeleton className="h-4 w-1/4" />
            <Skeleton className="h-4 w-1/4" />
          </div>
          <div className="flex justify-between">
            <Skeleton className="h-4 w-1/4" />
            <Skeleton className="h-4 w-1/3" />
          </div>
        </div>
      </div>

      {/* Quality rules skeleton */}
      <div className="p-6 border rounded-lg">
        <Skeleton className="h-6 w-1/3 mb-4" />
        <div className="space-y-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-4 w-full" />
          ))}
        </div>
      </div>
    </div>

    {/* Right column */}
    <div className="space-y-6">
      {/* Data products skeleton */}
      <div className="p-4 border rounded-lg">
        <Skeleton className="h-5 w-1/2 mb-4" />
        <div className="space-y-3">
          {Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className="p-3 border rounded">
              <Skeleton className="h-4 w-3/4 mb-2" />
              <Skeleton className="h-3 w-1/2" />
            </div>
          ))}
        </div>
      </div>
    </div>
  </div>
);

// Product detail page skeleton loader
export const ProductDetailSkeleton = () => (
  <div className="grid grid-cols-1 lg:grid-cols-[70%_30%] gap-6">
    {/* Main content */}
    <div className="space-y-6">
      {/* Tabs skeleton */}
      <div className="border rounded-lg">
        <div className="flex border-b">
          <Skeleton className="h-10 w-24 m-1" />
          <Skeleton className="h-10 w-20 m-1" />
        </div>
        <div className="p-6">
          <Skeleton className="h-4 w-full mb-2" />
          <Skeleton className="h-4 w-3/4 mb-2" />
          <Skeleton className="h-4 w-5/6 mb-4" />
          <Skeleton className="h-32 w-full" />
        </div>
      </div>
    </div>

    {/* Sidebar */}
    <div className="space-y-4">
      {/* Deployments skeleton */}
      <div className="p-4 border rounded-lg">
        <Skeleton className="h-5 w-1/2 mb-3" />
        <div className="space-y-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex justify-between items-center">
              <Skeleton className="h-4 w-1/3" />
              <Skeleton className="h-4 w-16" />
            </div>
          ))}
        </div>
      </div>

      {/* Executions skeleton */}
      <div className="p-4 border rounded-lg">
        <Skeleton className="h-5 w-1/2 mb-3" />
        <div className="space-y-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex justify-between items-center">
              <Skeleton className="h-4 w-1/3" />
              <Skeleton className="h-4 w-16" />
            </div>
          ))}
        </div>
      </div>

      {/* Quality monitor skeleton */}
      <div className="p-4 border rounded-lg">
        <Skeleton className="h-5 w-1/2 mb-3" />
        <div className="space-y-2">
          {Array.from({ length: 2 }).map((_, i) => (
            <Skeleton key={i} className="h-4 w-full" />
          ))}
        </div>
      </div>
    </div>
  </div>
);

// Generic list skeleton loader
export const ListSkeleton = ({ count = 3 }: { count?: number }) => (
  <div className="space-y-3">
    {Array.from({ length: count }).map((_, i) => (
      <div key={i} className="p-4 border rounded-lg">
        <Skeleton className="h-5 w-1/2 mb-2" />
        <Skeleton className="h-4 w-3/4 mb-1" />
        <Skeleton className="h-4 w-1/3" />
      </div>
    ))}
  </div>
);

// Generic card skeleton loader
export const CardSkeleton = () => (
  <div className="p-4 border rounded-lg">
    <Skeleton className="h-5 w-2/3 mb-3" />
    <Skeleton className="h-4 w-full mb-2" />
    <Skeleton className="h-4 w-1/2" />
  </div>
);

// Dashboard metrics skeleton loaders
export const DashboardMetricsSkeleton = () => (
  <div className="space-y-4">
    {/* Main metric card skeleton */}
    <div className="rounded-lg border bg-card p-4 sm:p-6">
      <div className="flex items-center justify-between space-y-0 pb-2">
        <Skeleton className="h-3 sm:h-4 w-24 sm:w-32" />
        <Skeleton className="h-4 w-4 sm:h-5 sm:w-5 rounded" />
      </div>
      <div className="space-y-2">
        <Skeleton className="h-6 sm:h-8 w-16 sm:w-20" />
        <Skeleton className="h-3 w-32 sm:w-48" />
      </div>
    </div>

    {/* Sub-metrics grid skeleton */}
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="rounded-lg border bg-card p-4 sm:p-6">
          <div className="flex items-center justify-between space-y-0 pb-2">
            <Skeleton className="h-3 sm:h-4 w-20 sm:w-24" />
            <Skeleton className="h-4 w-4 sm:h-5 sm:w-5 rounded" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-6 sm:h-8 w-12 sm:w-16" />
            <Skeleton className="h-3 w-16 sm:w-20" />
          </div>
        </div>
      ))}
    </div>
  </div>
);

// Contracts metrics skeleton
export const ContractsMetricsSkeleton = () => (
  <div className="space-y-4">
    {/* Main card */}
    <div className="rounded-lg border bg-card p-4 sm:p-6">
      <div className="flex items-center justify-between space-y-0 pb-2">
        <Skeleton className="h-3 sm:h-4 w-32 sm:w-40" />
        <Skeleton className="h-4 w-4 sm:h-5 sm:w-5 rounded" />
      </div>
      <div className="space-y-2">
        <Skeleton className="h-6 sm:h-8 w-12 sm:w-16" />
        <Skeleton className="h-3 w-40 sm:w-56" />
      </div>
    </div>

    {/* Status distribution cards */}
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="rounded-lg border bg-card p-4 sm:p-6 border-l-4">
          <div className="flex items-center justify-between space-y-0 pb-2">
            <Skeleton className="h-3 sm:h-4 w-24 sm:w-28" />
            <Skeleton className="h-4 w-4 sm:h-5 sm:w-5 rounded" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-6 sm:h-8 w-10 sm:w-12" />
            <Skeleton className="h-3 w-16 sm:w-20" />
          </div>
        </div>
      ))}
    </div>
  </div>
);

// Products metrics skeleton
export const ProductsMetricsSkeleton = () => (
  <div className="space-y-4">
    {/* Main card */}
    <div className="rounded-lg border bg-card p-4 sm:p-6">
      <div className="flex items-center justify-between space-y-0 pb-2">
        <Skeleton className="h-3 sm:h-4 w-28 sm:w-36" />
        <Skeleton className="h-4 w-4 sm:h-5 sm:w-5 rounded" />
      </div>
      <div className="space-y-2">
        <Skeleton className="h-6 sm:h-8 w-12 sm:w-16" />
        <Skeleton className="h-3 w-48 sm:w-64" />
      </div>
    </div>

    {/* Environment distribution cards */}
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="rounded-lg border bg-card p-4 sm:p-6 border-l-4">
          <div className="flex items-center justify-between space-y-0 pb-2">
            <Skeleton className="h-3 sm:h-4 w-24 sm:w-32" />
            <Skeleton className="h-4 w-4 sm:h-5 sm:w-5 rounded" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-6 sm:h-8 w-10 sm:w-12" />
            <Skeleton className="h-3 w-16 sm:w-20" />
          </div>
        </div>
      ))}
    </div>
  </div>
);

// Users metrics skeleton
export const UsersMetricsSkeleton = () => (
  <div className="space-y-4">
    {/* Main card */}
    <div className="rounded-lg border bg-card p-4 sm:p-6">
      <div className="flex items-center justify-between space-y-0 pb-2">
        <Skeleton className="h-3 sm:h-4 w-20 sm:w-24" />
        <Skeleton className="h-4 w-4 sm:h-5 sm:w-5 rounded" />
      </div>
      <div className="space-y-2">
        <Skeleton className="h-6 sm:h-8 w-12 sm:w-16" />
        <Skeleton className="h-3 w-36 sm:w-48" />
      </div>
    </div>

    {/* Detail cards */}
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {Array.from({ length: 2 }).map((_, i) => (
        <div key={i} className="rounded-lg border bg-card p-4 sm:p-6 border-l-4">
          <div className="flex items-center justify-between space-y-0 pb-2">
            <Skeleton className="h-3 sm:h-4 w-24 sm:w-28" />
            <Skeleton className="h-4 w-4 sm:h-5 sm:w-5 rounded" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-6 sm:h-8 w-10 sm:w-12" />
            <Skeleton className="h-3 w-24 sm:w-32" />
          </div>
        </div>
      ))}
    </div>
  </div>
);