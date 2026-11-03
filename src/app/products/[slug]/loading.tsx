export default function ProductLoading() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-8 py-8 space-y-12 animate-pulse">
      {/* Breadcrumb Skeleton */}
      <div className="h-4 w-48 bg-[#e8e8e8] rounded-[4px]" />

      {/* Main Grid Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Gallery Column */}
        <div className="lg:col-span-6 space-y-4">
          <div className="aspect-square w-full bg-[#f0f0f0] rounded-[10px]" />
          <div className="flex gap-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="w-20 h-20 bg-[#f0f0f0] rounded-[6px]" />
            ))}
          </div>
        </div>

        {/* Info Column */}
        <div className="lg:col-span-6 space-y-6">
          <div className="h-4 w-32 bg-[#e8e8e8] rounded-[4px]" />
          <div className="h-8 w-3/4 bg-[#e8e8e8] rounded-[6px]" />
          <div className="h-5 w-40 bg-[#e8e8e8] rounded-[4px]" />
          <div className="h-20 w-full bg-[#f8f8f8] rounded-[10px]" />
          <div className="h-10 w-full bg-[#e8e8e8] rounded-[6px]" />
          <div className="grid grid-cols-2 gap-3">
            <div className="h-12 bg-[#e8e8e8] rounded-full" />
            <div className="h-12 bg-[#333333] rounded-full" />
          </div>
        </div>
      </div>
    </div>
  );
}

