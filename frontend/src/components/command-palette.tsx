import * as React from "react"
import { Plus, ReceiptText, UserRound, Wallet } from "lucide-react"
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"

type PaletteItem = {
  group: "Zbiórki" | "Rodzice" | "Szybkie akcje"
  label: string
  hint?: string
  icon: React.ReactNode
}

// Mock catalogue until real search endpoints exist.
const ITEMS: PaletteItem[] = [
  { group: "Zbiórki", label: "Teatr „Pinokio”", icon: <ReceiptText /> },
  { group: "Zbiórki", label: "Wycieczka do zoo", icon: <ReceiptText /> },
  { group: "Zbiórki", label: "Prezenty świąteczne", icon: <ReceiptText /> },
  { group: "Rodzice", label: "Anna Kowalska", icon: <UserRound /> },
  { group: "Rodzice", label: "Marek Nowak", icon: <UserRound /> },
  {
    group: "Szybkie akcje",
    label: "Nowa zbiórka",
    hint: "Tworzy nową zbiórkę",
    icon: <Plus />,
  },
  {
    group: "Szybkie akcje",
    label: "Mój rachunek",
    hint: "Podgląd salda",
    icon: <Wallet />,
  },
]

const GROUPS: PaletteItem["group"][] = ["Zbiórki", "Rodzice", "Szybkie akcje"]

function CommandPalette({
  open,
  onOpenChange,
  onSelect,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSelect?: (item: Omit<PaletteItem, "icon">) => void
}) {
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
        onOpenChange(!open)
      } else if (!typing && event.key === "/") {
        event.preventDefault()
        onOpenChange(true)
      }
    }
    window.addEventListener("keydown", onKeyDown)
    return () => window.removeEventListener("keydown", onKeyDown)
  }, [open, onOpenChange])

  function handleSelect(item: PaletteItem) {
    onOpenChange(false)
    onSelect?.({ group: item.group, label: item.label, hint: item.hint })
  }

  return (
    <CommandDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Szukaj"
      description="Przeszukaj zbiórki, rodziców i szybkie akcje"
    >
      <CommandInput placeholder="Szukaj zbiórek, rodziców…" />
      <CommandList>
        <CommandEmpty>Brak wyników.</CommandEmpty>
        {GROUPS.map((group) => (
          <CommandGroup key={group} heading={group}>
            {ITEMS.filter((item) => item.group === group).map((item) => (
              <CommandItem
                key={`${group}-${item.label}`}
                value={`${group} ${item.label}`}
                onSelect={() => handleSelect(item)}
              >
                {item.icon}
                {item.label}
              </CommandItem>
            ))}
          </CommandGroup>
        ))}
      </CommandList>
    </CommandDialog>
  )
}

export { CommandPalette }
