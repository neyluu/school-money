import * as React from "react"
import { useNavigate } from "react-router"
import { toast } from "@/components/ui/toast"
import { ApiError } from "@/lib/api-client"

const DEFAULT_PAGE_SIZE = 20

function usePagedList<T extends { id: number }>(
  load: (page: number, size: number) => Promise<T[]>,
  pageSize = DEFAULT_PAGE_SIZE
) {
  const navigate = useNavigate()
  const [items, setItems] = React.useState<T[]>([])
  const [hasMore, setHasMore] = React.useState(false)
  const [isLoading, setIsLoading] = React.useState(true)
  const [isLoadingMore, setIsLoadingMore] = React.useState(false)
  const [failed, setFailed] = React.useState(false)
  const [reloadKey, setReloadKey] = React.useState(0)
  const nextPage = React.useRef(1)

  React.useEffect(() => {
    let ignored = false
    load(0, pageSize)
      .then((first) => {
        if (!ignored) {
          nextPage.current = 1
          setItems(first)
          setHasMore(first.length === pageSize)
          setFailed(false)
          setIsLoading(false)
        }
      })
      .catch((error: unknown) => {
        if (ignored) {
          return
        }
        if (error instanceof ApiError && error.status === 401) {
          navigate("/login", { replace: true })
          return
        }
        setFailed(true)
        setIsLoading(false)
      })
    return () => {
      ignored = true
    }
  }, [load, pageSize, navigate, reloadKey])

  async function loadMore() {
    if (isLoadingMore) {
      return
    }

    setIsLoadingMore(true)
    try {
      const next = await load(nextPage.current, pageSize)
      nextPage.current += 1
      setItems((current) => {
        const knownIds = new Set(current.map((item) => item.id))
        return [...current, ...next.filter((item) => !knownIds.has(item.id))]
      })
      setHasMore(next.length === pageSize)
    } catch (error) {
      if (error instanceof ApiError && error.status === 401) {
        navigate("/login", { replace: true })
        return
      }
      toast.add({
        title: "Nie udało się wczytać kolejnych pozycji.",
        type: "error",
      })
    } finally {
      setIsLoadingMore(false)
    }
  }

  function reload() {
    setFailed(false)
    setIsLoading(true)
    setReloadKey((current) => current + 1)
  }

  return { items, hasMore, isLoading, isLoadingMore, failed, loadMore, reload }
}

export { usePagedList }
