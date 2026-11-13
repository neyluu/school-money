import { Link } from "react-router"
import { AuthLogo } from "@/components/auth-layout"
import { LandingContainer } from "@/components/landing/landing-container"

function LandingFooter() {
  return (
    <footer className="border-t">
      <LandingContainer className="flex flex-col gap-4 py-8 sm:flex-row sm:items-center">
        <AuthLogo />
        <nav aria-label="Konto" className="sm:ml-auto">
          <ul className="flex items-center gap-6 text-sm text-muted-foreground">
            <li>
              <Link to="/login" className="hover:text-foreground">
                Zaloguj się
              </Link>
            </li>
            <li>
              <Link to="/register" className="hover:text-foreground">
                Załóż konto
              </Link>
            </li>
          </ul>
        </nav>
        <p className="text-sm text-muted-foreground">© 2026 SchoolMoney</p>
      </LandingContainer>
    </footer>
  )
}

export { LandingFooter }
