import {
  ChartColumn,
  HandCoins,
  LayoutDashboard,
  MessageCircle,
  ReceiptText,
  UsersRound,
} from "lucide-react"

export type NavigationItem = {
  id: string
  label: string
  icon: React.ReactNode
  href: string
  badge?: number
}

export const defaultNavigationItems: NavigationItem[] = [
  {
    id: "dashboard",
    label: "Pulpit",
    icon: <LayoutDashboard />,
    href: "/",
  },
  {
    id: "collections",
    label: "Zbiórki",
    icon: <HandCoins />,
    href: "/zbiorki",
  },
  {
    id: "class",
    label: "Klasa",
    icon: <UsersRound />,
    href: "/klasa",
  },
  {
    id: "payments",
    label: "Płatności",
    icon: <ReceiptText />,
    href: "/platnosci",
  },
  {
    id: "reports",
    label: "Raporty",
    icon: <ChartColumn />,
    href: "/raporty",
  },
  {
    id: "chat",
    label: "Czat",
    icon: <MessageCircle />,
    href: "/czat",
  },
]
