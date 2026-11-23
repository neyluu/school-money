import * as React from "react"
import { Input } from "@/components/ui/input"
import type { InputMask } from "@/lib/input-rules"

function countCharacters(value: string): number {
  return value.replace(/\s/g, "").length
}

function findCaret(value: string, charactersAfter: number): number {
  let position = value.length
  let remaining = charactersAfter

  while (position > 0 && remaining > 0) {
    position -= 1
    if (!/\s/.test(value[position])) {
      remaining -= 1
    }
  }
  return position
}

function MaskedInput({
  value,
  mask,
  onValueChange,
  ...props
}: Omit<React.ComponentProps<typeof Input>, "value" | "onChange" | "ref"> & {
  value: string
  mask: InputMask
  onValueChange: (value: string) => void
}) {
  const inputRef = React.useRef<HTMLInputElement>(null)
  const caretRef = React.useRef<number | null>(null)
  const [, rerender] = React.useReducer((count: number) => count + 1, 0)

  React.useLayoutEffect(() => {
    if (caretRef.current == null) {
      return
    }
    inputRef.current?.setSelectionRange(caretRef.current, caretRef.current)
    caretRef.current = null
  })

  function handleChange(event: React.ChangeEvent<HTMLInputElement>) {
    let raw = event.target.value
    let caret = event.target.selectionEnd ?? raw.length
    let next = mask(raw)

    const removedLength = value.length - raw.length
    const removedOnlySpacing =
      removedLength > 0 &&
      next === value &&
      value.slice(caret, caret + removedLength).trim() === ""

    if (removedOnlySpacing) {
      const isForward =
        (event.nativeEvent as InputEvent).inputType === "deleteContentForward"
      const from = isForward ? caret : Math.max(0, caret - 1)
      const to = caret + removedLength + (isForward ? 1 : 0)
      raw = value.slice(0, from) + value.slice(to)
      caret = from
      next = mask(raw)
    }

    if (next == null) {
      const previousCaret = caret - (raw.length - value.length)
      caretRef.current = Math.min(value.length, Math.max(0, previousCaret))
      rerender()
      return
    }

    if (next !== event.target.value) {
      caretRef.current = findCaret(next, countCharacters(raw.slice(caret)))
      rerender()
    }
    if (next !== value) {
      onValueChange(next)
    }
  }

  return <Input {...props} ref={inputRef} value={value} onChange={handleChange} />
}

export { MaskedInput }
