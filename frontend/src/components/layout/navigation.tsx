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
    href: "/dashboard",
  },
  {
    id: "fundraisers",
    label: "Zbiórki",
    icon: <HandCoins />,
    href: "/dashboard/fundraisers",
  },
  {
    id: "class",
    label: "Klasa",
    icon: <UsersRound />,
    href: "/dashboard/class",
  },
  {
    id: "payments",
    label: "Płatności",
    icon: <ReceiptText />,
    href: "/dashboard/payments",
  },
  {
    id: "reports",
    label: "Raporty",
    icon: <ChartColumn />,
    href: "/dashboard/reports",
  },
  {
    id: "chat",
    label: "Czat",
    icon: <MessageCircle />,
    href: "/dashboard/chat",
  },
]
