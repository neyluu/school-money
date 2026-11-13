import { Link } from "react-router"
import { AuthLogo } from "@/components/auth-layout"
import { LandingContainer } from "@/components/landing/landing-container"
import { Button } from "@/components/ui/button"

const NAVIGATION = [
  { href: "#jak-to-dziala", label: "Jak to działa" },
  { href: "#funkcje", label: "Funkcje" },
  { href: "#pytania", label: "FAQ" },
]

function LandingHeader() {
  return (
    <header className="sticky top-0 z-40 border-b bg-background/90 backdrop-blur">
      <LandingContainer className="flex h-16 items-center gap-6">
        <Link to="/" aria-label="SchoolMoney, strona główna">
          <AuthLogo />
        </Link>
        <nav aria-label="Sekcje strony" className="hidden md:block">
          <ul className="flex items-center gap-6 text-sm">
            {NAVIGATION.map((item) => (
              <li key={item.href}>
                <a
                  href={item.href}
                  className="text-muted-foreground transition-colors hover:text-foreground"
                >
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
        <div className="ml-auto flex items-center gap-2">
          <Button variant="ghost" render={<Link to="/login" />}>
            Zaloguj się
          </Button>
          <Button
            render={<Link to="/register" />}
            className="bg-foreground text-background hover:bg-foreground/90"
          >
            Załóż konto
          </Button>
        </div>
      </LandingContainer>
    </header>
  )
}

export { LandingHeader }
