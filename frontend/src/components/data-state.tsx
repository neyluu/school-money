import { TriangleAlert } from "lucide-react"
import { EmptyState } from "@/components/empty-state"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"

function DataState({
  isLoading,
  hasError,
  isEmpty,
  emptyState,
  onRetry,
  children,
}: {
  isLoading: boolean
  hasError: boolean
  isEmpty: boolean
  emptyState: React.ReactNode
  onRetry: () => void
  children: React.ReactNode
}) {
  if (isLoading) {
    return (
      <div className="flex flex-col gap-2">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
      </div>
    )
  }

  if (hasError) {
    return (
      <EmptyState
        icon={<TriangleAlert />}
        title="Nie udało się wczytać danych"
        description="Sprawdź połączenie i spróbuj ponownie."
        action={<Button onClick={onRetry}>Spróbuj ponownie</Button>}
      />
    )
  }

  if (isEmpty) {
    return emptyState
  }

  return children
}

export { DataState }
