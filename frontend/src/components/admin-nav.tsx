import { Link, useLocation } from "react-router";
import { cn } from "cn";

const LINKS = [
  { to: "/dashboard/admin", label: "Przegląd" },
  { to: "/dashboard/admin/users", label: "Użytkownicy" },
  { to: "/dashboard/admin/treasurers", label: "Skarbnicy" },
  { to: "/dashboard/admin/classes", label: "Klasy" },
  { to: "/dashboard/admin/fundraisings", label: "Zbiórki" },
  { to: "/dashboard/admin/reports", label: "Raporty" },
];

function AdminNav() {
  const { pathname } = useLocation();

  return (
    <nav
      aria-label="Panel administratora"
      className="flex w-full max-w-3xl flex-wrap gap-1 rounded-lg bg-muted p-1"
    >
      {LINKS.map((link) => {
        const active =
          link.to === "/dashboard/admin"
            ? pathname === link.to
            : pathname.startsWith(link.to);
        return (
          <Link
            key={link.to}
            to={link.to}
            aria-current={active ? "page" : undefined}
            className={cn(
              "flex-1 rounded-md px-3 py-1.5 text-center text-sm font-medium whitespace-nowrap transition-colors",
              active
                ? "bg-foreground text-background"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}

export { AdminNav };
