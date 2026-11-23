import * as React from "react"

const CHECK_DELAYS_MS = [100, 500, 1000, 2000]
const AUTOFILL_SELECTOR = "input:-webkit-autofill"

function useAutofilled(formRef: React.RefObject<HTMLFormElement | null>): boolean {
  const [isAutofilled, setIsAutofilled] = React.useState(false)

  React.useEffect(() => {
    if (!CSS.supports(`selector(${AUTOFILL_SELECTOR})`)) {
      return
    }

    const timers = CHECK_DELAYS_MS.map((delay) =>
      window.setTimeout(() => {
        if (formRef.current?.querySelector(AUTOFILL_SELECTOR) != null) {
          setIsAutofilled(true)
        }
      }, delay)
    )
    return () => timers.forEach((timer) => window.clearTimeout(timer))
  }, [formRef])

  return isAutofilled
}

export { useAutofilled }
