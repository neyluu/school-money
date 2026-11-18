import * as React from "react"
import { Plus, ReceiptText, Search, UserRound } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"

export type PaletteGroup = "Zbiórki" | "Rodzice" | "Szybkie akcje"

export type PaletteItem = {
  id: string
  group: PaletteGroup
  label: string
  hint?: string
  /** Optional override; otherwise the group icon is used. */
  icon?: React.ReactNode
}

const GROUP_ICONS: Record<PaletteGroup, React.ReactNode> = {
  Zbiórki: <ReceiptText />,
  Rodzice: <UserRound />,
  "Szybkie akcje": <Plus />,
}

const GROUPS: PaletteGroup[] = ["Zbiórki", "Rodzice", "Szybkie akcje"]

function shortcutLabel(): string {
  if (typeof navigator !== "undefined" && /mac/i.test(navigator.platform)) {
    return "⌘K"
  }
  return "Ctrl+K"
}

function CommandPalette({
  items,
  onSelect,
}: {
  /** Catalogue to search, e.g. from the API. */
  items: PaletteItem[]
  onSelect?: (item: Omit<PaletteItem, "icon">) => void
}) {
  const [open, setOpen] = React.useState(false)

  React.useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      const target = event.target as HTMLElement | null
      const typing =
        target != null &&
        (target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.tagName === "SELECT" ||
          target.isContentEditable)
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault()
        setOpen((prev) => !prev)
      } else if (!typing && event.key === "/") {
        event.preventDefault()
        setOpen(true)
      }
    }
    window.addEventListener("keydown", onKeyDown)
    return () => window.removeEventListener("keydown", onKeyDown)
  }, [])

  function handleSelect(item: PaletteItem) {
    setOpen(false)
    onSelect?.({
      id: item.id,
      group: item.group,
      label: item.label,
      hint: item.hint,
    })
  }

  return (
    <>
      <Button variant="outline" onClick={() => setOpen(true)}>
        <Search />
        Szukaj
        <kbd className="rounded border bg-muted px-1 py-px text-[11px] font-medium text-muted-foreground opacity-70">
          {shortcutLabel()}
        </kbd>
      </Button>
      <CommandDialog
        open={open}
        onOpenChange={setOpen}
        title="Szukaj"
        description="Przeszukaj zbiórki, rodziców i szybkie akcje"
        className="bg-popover/80 rounded-lg! backdrop-blur-xl sm:max-w-lg"
      >
        <CommandInput placeholder="Szukaj zbiórek, rodziców…" />
        <CommandList>
          <CommandEmpty>Brak wyników.</CommandEmpty>
          {GROUPS.map((group) => (
            <CommandGroup key={group} heading={group}>
              {items
                .filter((item) => item.group === group)
                .map((item) => (
                  <CommandItem
                    key={item.id}
                    value={`${group} ${item.label}`}
                    onSelect={() => handleSelect(item)}
                  >
                    {item.icon ?? GROUP_ICONS[item.group]}
                    {item.label}
                  </CommandItem>
                ))}
            </CommandGroup>
          ))}
        </CommandList>
      </CommandDialog>
    </>
  )
}

export { CommandPalette }
