import {
  HandCoins,
  LayoutDashboard,
  MessageCircle,
  ReceiptText,
  ShieldCheck,
  UsersRound,
  Baby,
  ChartColumn,
} from "lucide-react";

export type NavigationItem = {
  id: string;
  label: string;
  icon: React.ReactNode;
  href: string;
  badge?: number;
};

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
    id: "children",
    label: "Moje dzieci",
    icon: <Baby />,
    href: "/dashboard/children",
  },
  {
    id: "class",
    label: "Klasy",
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
];

export const adminNavigationItems: NavigationItem[] = [
  {
    id: "admin",
    label: "Panel administratora",
    icon: <ShieldCheck />,
    href: "/dashboard/admin",
  },
  {
    id: "chat",
    label: "Czat",
    icon: <MessageCircle />,
    href: "/dashboard/chat",
  },
];
