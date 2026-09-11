type SkeletonProps = {
  className?: string;
};

function Pulse({ className = "" }: SkeletonProps) {
  return <div aria-hidden="true" className={`animate-pulse rounded-md bg-surface-muted ${className}`} />;
}

export function AuctionCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-lg border border-border-default bg-surface-primary shadow-[0_10px_28px_rgb(4_18_43_/_0.06)]" data-testid="auction-card-skeleton">
      <Pulse className="aspect-[16/10] w-full rounded-none" />
      <div className="space-y-4 p-5">
        <Pulse className="h-3 w-20" />
        <Pulse className="h-7 w-4/5" />
        <div className="grid grid-cols-2 gap-3">
          <Pulse className="h-4" />
          <Pulse className="h-4" />
          <Pulse className="col-span-2 h-4 w-3/4" />
        </div>
        <div className="border-t border-border-default pt-4">
          <Pulse className="h-3 w-24" />
          <Pulse className="mt-2 h-7 w-1/2" />
        </div>
        <Pulse className="h-11 w-full" />
      </div>
    </div>
  );
}

export function AuctionCardGridSkeleton({
  count = 6,
  label,
}: {
  count?: number;
  label: string;
}) {
  return (
    <div aria-label={label} className="grid gap-5 md:grid-cols-2 xl:grid-cols-3" role="status">
      {Array.from({ length: count }, (_, index) => <AuctionCardSkeleton key={index} />)}
    </div>
  );
}

export function FeaturedAuctionSkeleton({ label }: { label: string }) {
  return (
    <div aria-label={label} className="overflow-hidden rounded-lg border border-border-default bg-white" role="status">
      <div className="grid min-h-[26rem] lg:grid-cols-[1.15fr_0.85fr]">
        <Pulse className="min-h-72 rounded-none" />
        <div className="space-y-5 p-6 md:p-8">
          <Pulse className="h-3 w-24" />
          <Pulse className="h-9 w-4/5" />
          <Pulse className="h-4 w-full" />
          <Pulse className="h-4 w-3/4" />
          <div className="grid grid-cols-2 gap-3 pt-3">
            <Pulse className="h-16" />
            <Pulse className="h-16" />
          </div>
          <Pulse className="h-12 w-full" />
        </div>
      </div>
    </div>
  );
}

export function MetricGridSkeleton({
  announce = true,
  count = 4,
  label,
}: {
  announce?: boolean;
  count?: number;
  label: string;
}) {
  return (
    <div
      aria-label={announce ? label : undefined}
      className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4"
      role={announce ? "status" : undefined}
    >
      {Array.from({ length: count }, (_, index) => (
        <div className="rounded-md border border-border-default bg-white p-4" key={index}>
          <Pulse className="h-3 w-2/3" />
          <Pulse className="mt-3 h-7 w-1/2" />
        </div>
      ))}
    </div>
  );
}

export function TabsAndListSkeleton({
  label,
  rows = 6,
  tabs = 3,
}: {
  label: string;
  rows?: number;
  tabs?: number;
}) {
  return (
    <div aria-label={label} className="space-y-4" role="status">
      {tabs > 0 ? (
        <div className="flex gap-3 rounded-lg border border-border-default bg-white p-4">
          {Array.from({ length: tabs }, (_, index) => <Pulse className="h-9 w-24" key={index} />)}
        </div>
      ) : null}
      <div className="overflow-hidden rounded-lg border border-border-default bg-white">
        {Array.from({ length: rows }, (_, index) => (
          <div className="flex items-center gap-4 border-b border-border-default p-4 last:border-b-0" key={index}>
            <Pulse className="size-11 shrink-0 rounded-full" />
            <div className="min-w-0 flex-1 space-y-2">
              <Pulse className="h-4 w-2/3" />
              <Pulse className="h-3 w-1/3" />
            </div>
            <Pulse className="h-7 w-20" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function DashboardTableSkeleton({
  columns = 5,
  label,
  rows = 8,
  showMetrics = true,
}: {
  columns?: number;
  label: string;
  rows?: number;
  showMetrics?: boolean;
}) {
  return (
    <div aria-label={label} className="space-y-5" role="status">
      {showMetrics ? <MetricGridSkeleton announce={false} count={Math.min(columns, 5)} label={label} /> : null}
      <div className="flex flex-wrap gap-3 rounded-lg border border-border-default bg-white p-4">
        <Pulse className="h-11 min-w-56 flex-1" />
        <Pulse className="h-11 w-40" />
      </div>
      <div className="overflow-hidden rounded-lg border border-border-default bg-white">
        <div className="grid gap-4 border-b border-border-default bg-surface-muted p-4" style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}>
          {Array.from({ length: columns }, (_, index) => <Pulse className="h-3" key={index} />)}
        </div>
        {Array.from({ length: rows }, (_, row) => (
          <div className="grid gap-4 border-b border-border-default p-4 last:border-b-0" key={row} style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}>
            {Array.from({ length: columns }, (_, column) => <Pulse className="h-4" key={column} />)}
          </div>
        ))}
      </div>
    </div>
  );
}

export function AuctionDetailSkeleton({ label }: { label: string }) {
  return (
    <div aria-label={label} className="mx-auto w-full max-w-7xl px-[var(--content-gutter)] py-8 md:py-12" role="status">
      <Pulse className="h-4 w-40" />
      <div className="mt-6 grid gap-7 lg:grid-cols-[minmax(0,1.35fr)_minmax(20rem,0.65fr)]">
        <div className="space-y-5">
          <Pulse className="aspect-[16/10] w-full" />
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {Array.from({ length: 4 }, (_, index) => <Pulse className="h-20" key={index} />)}
          </div>
        </div>
        <div className="space-y-5 rounded-lg border border-border-default bg-white p-6">
          <Pulse className="h-3 w-24" />
          <Pulse className="h-9 w-5/6" />
          <Pulse className="h-5 w-1/2" />
          <Pulse className="h-16 w-full" />
          <Pulse className="h-12 w-full" />
          <Pulse className="h-12 w-full" />
        </div>
      </div>
    </div>
  );
}
