export const OfferCardSkeleton = () => (
  <div className="bg-white rounded-xl overflow-hidden shadow-lg">
    {/* Image skeleton - exact same aspect ratio as real cards (500x400) */}
    <div className="w-full aspect-video bg-gray-200" />

    {/* Content skeleton */}
    <div className="p-4">
      <div className="h-5 bg-gray-200 rounded w-3/4 mb-3" />
      <div className="h-4 bg-gray-200 rounded w-1/2 mb-4" />
      <div className="h-10 bg-gray-200 rounded-full w-full" />
    </div>
  </div>
);

export const OffersLoadingSkeleton = () => (
  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
    <div className="h-10 bg-gray-200 rounded w-1/3 mx-auto mb-12" />
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {[1, 2, 3].map((i) => (
        <OfferCardSkeleton key={i} />
      ))}
    </div>
  </div>
);
