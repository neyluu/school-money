import * as React from "react"
import { getFundraisingLogo } from "@/lib/fundraising-management"

function useFundraisingLogo(fundraisingId: number, reloadKey = 0): string | null {
  const [url, setUrl] = React.useState<string | null>(null)

  React.useEffect(() => {
    let ignored = false
    let objectUrl: string | null = null

    getFundraisingLogo(fundraisingId)
      .then((blob) => {
        if (!ignored) {
          objectUrl = URL.createObjectURL(blob)
          setUrl(objectUrl)
        }
      })
      .catch(() => {
        if (!ignored) {
          setUrl(null)
        }
      })

    return () => {
      ignored = true
      if (objectUrl != null) {
        URL.revokeObjectURL(objectUrl)
      }
    }
  }, [fundraisingId, reloadKey])

  return url
}

export { useFundraisingLogo }
