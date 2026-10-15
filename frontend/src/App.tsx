import { Link } from "react-router";
import { HandCoins, ReceiptText, UsersRound } from "lucide-react";
import { AuthLogo } from "@/components/auth-layout";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const FEATURES = [
  {
    icon: <HandCoins />,
    title: "Zbiórki w jednym miejscu",
    description:
      "Twórz zbiórki na wycieczki, prezenty i wydarzenia klasowe. Każda ma osobny rachunek i termin.",
  },
  {
    icon: <ReceiptText />,
    title: "Wpłaty bez gotówki",
    description:
      "Rodzice płacą online, a Ty widzisz każdą wpłatę od razu — bez liczenia kopert.",
  },
  {
    icon: <UsersRound />,
    title: "Przejrzystość dla rodziców",
    description:
      "Każdy widzi cel, zebraną kwotę i historię — zero nieporozumień na zebraniach.",
  },
];

function App() {
  return (
    <div className="flex min-h-dvh w-full flex-col bg-background">
      <header className="border-b">
        <div className="mx-auto flex h-16 w-full max-w-5xl items-center gap-2 px-4 md:px-6">
          <AuthLogo />
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
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-16 px-4 py-16 md:px-6 md:py-24">
        <section className="mx-auto flex max-w-2xl flex-col items-center gap-6 text-center">
          <h1 className="font-serif text-4xl leading-tight md:text-5xl">
            Zbiórki klasowe bez gotówki i arkuszy.
          </h1>
          <p className="max-w-xl text-muted-foreground">
            Jasne wpłaty, osobny rachunek każdej zbiórki, pełna przejrzystość
            dla rodziców.
          </p>
          <div className="flex flex-col items-center gap-2 sm:flex-row">
            <Button
              size="lg"
              render={<Link to="/register" />}
              className="bg-foreground text-background hover:bg-foreground/90"
            >
              Załóż konto
            </Button>
            <Button size="lg" variant="outline" render={<Link to="/login" />}>
              Zaloguj się
            </Button>
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-3">
          {FEATURES.map((feature) => (
            <Card key={feature.title}>
              <CardHeader>
                <span
                  aria-hidden
                  className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary [&_svg]:size-5"
                >
                  {feature.icon}
                </span>
                <CardTitle>{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  {feature.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </section>

        <section className="flex flex-col items-center gap-4 rounded-2xl bg-[#0F1115] p-10 text-center">
          <p className="max-w-md font-serif text-3xl leading-tight text-white">
            Zacznij pierwszą zbiórkę jeszcze dziś.
          </p>
          <Button
            size="lg"
            render={<Link to="/register" />}
            className="bg-white text-neutral-900 hover:bg-neutral-200"
          >
            Utwórz konto
          </Button>
        </section>
      </main>

      <footer className="border-t">
        <div className="mx-auto flex h-16 w-full max-w-5xl items-center gap-2 px-4 md:px-6">
          <AuthLogo />
          <p className="ml-auto text-sm text-muted-foreground">
            © 2026 SchoolMoney
          </p>
        </div>
      </footer>
    </div>
  );
}

export default App;
