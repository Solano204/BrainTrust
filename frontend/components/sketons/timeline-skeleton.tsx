// components/timeline/timeline-skeleton.tsx
import { Card } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

export function TimelineSectionSkeleton() {
  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Skeleton className="h-5 w-5 rounded" />
            <Skeleton className="h-7 w-48 rounded" />
          </div>
          <Skeleton className="h-4 w-64 rounded" />
        </div>
        <Skeleton className="h-9 w-24 rounded" />
      </div>

      <div className="space-y-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="p-4 rounded-lg border">
            <div className="flex items-start gap-4">
              {/* Icon Skeleton */}
              <Skeleton className="h-10 w-10 rounded-lg" />
              
              {/* Content Skeleton */}
              <div className="flex-1 space-y-3">
                <div className="flex items-start justify-between">
                  <Skeleton className="h-5 w-3/4 rounded" />
                  <Skeleton className="h-6 w-20 rounded-full" />
                </div>
                <Skeleton className="h-4 w-1/2 rounded" />
                <div className="flex items-center gap-2">
                  <Skeleton className="h-3 w-3 rounded" />
                  <Skeleton className="h-3 w-32 rounded" />
                </div>
              </div>

              {/* Action Skeleton */}
              <Skeleton className="h-8 w-8 rounded" />
            </div>
          </div>
        ))}
      </div>
    </Card>
  )
}