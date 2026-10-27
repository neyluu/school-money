import * as React from "react"
import { useNavigate } from "react-router"
import { ApiError } from "@/lib/api-client"

type AsyncState<T> = {
  data: T | null
  error: ApiError | Error | null
  isLoading: boolean
}

function useAsyncData<T>(load: () => Promise<T>) {
  const navigate = useNavigate()
  const [state, setState] = React.useState<AsyncState<T>>({
    data: null,
    error: null,
    isLoading: true,
  })
  const [reloadKey, setReloadKey] = React.useState(0)

  React.useEffect(() => {
    let ignored = false
    load()
      .then((data) => {
        if (!ignored) {
          setState({ data, error: null, isLoading: false })
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
        setState({
          data: null,
          error: error instanceof Error ? error : new Error("Unknown error"),
          isLoading: false,
        })
      })
    return () => {
      ignored = true
    }
  }, [load, navigate, reloadKey])

  function reload() {
    setState((current) => ({ ...current, error: null, isLoading: true }))
    setReloadKey((current) => current + 1)
  }

  return { ...state, reload }
}

export { useAsyncData }
