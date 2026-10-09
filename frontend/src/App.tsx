import { Badge } from "./components/ui/badge";
import type { PaletteItem } from "./components/command-palette";
import { CommandPalette } from "./components/command-palette";
import { EmptyState } from "./components/empty-state";
import { FileUpload } from "./components/file-upload";
import {
  BellRing,
  Drama,
  MoreHorizontal,
  Pencil,
  Tent,
  UserMinus,
  Wallet,
} from "lucide-react";
import { Button } from "./components/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardHeader,
  CardTitle,
} from "./components/ui/card";
import { Field, FieldError, FieldLabel } from "./components/ui/field";
import { Input } from "./components/ui/input";
import {
  Progress,
  ProgressIndicator,
  ProgressOverlay,
  ProgressTrack,
} from "./components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./components/ui/select";
import { Separator } from "./components/ui/separator";
import { CollectionCard } from "./components/collection-card";
import { Skeleton } from "./components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./components/ui/tabs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./components/ui/dropdown-menu";
import { Textarea } from "./components/ui/textarea";
import { toast, Toaster } from "./components/ui/toast";
import { MoneyAmount } from "./components/money-amount";
import { FundsRatioBar } from "./components/funds-ratio-bar";
import {
  ResponsiveDialog,
  ResponsiveDialogContent,
  ResponsiveDialogDescription,
  ResponsiveDialogHeader,
  ResponsiveDialogTitle,
  ResponsiveDialogTrigger,
} from "./components/responsive-dialog";

// Mock catalogue until real search endpoints exist.
const mockPaletteItems: PaletteItem[] = [
  { id: "zbiorka-pinokio", group: "Zbiórki", label: "Teatr „Pinokio”" },
  { id: "zbiorka-zoo", group: "Zbiórki", label: "Wycieczka do zoo" },
  { id: "zbiorka-prezenty", group: "Zbiórki", label: "Prezenty świąteczne" },
  { id: "rodzic-kowalska", group: "Rodzice", label: "Anna Kowalska" },
  { id: "rodzic-nowak", group: "Rodzice", label: "Marek Nowak" },
  {
    id: "akcja-nowa-zbiorka",
    group: "Szybkie akcje",
    label: "Nowa zbiórka",
    hint: "Tworzy nową zbiórkę",
  },
  {
    id: "akcja-rachunek",
    group: "Szybkie akcje",
    label: "Mój rachunek",
    hint: "Podgląd salda",
  },
];

function DemoSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="flex flex-col gap-3">
      <h2 className="text-lg">{title}</h2>
      <div className="flex flex-wrap items-center gap-2">{children}</div>
    </section>
  );
}

function App() {
  return (
    <main className="mx-auto flex w-full max-w-3xl flex-col gap-8 p-6">
      <h1 className="text-2xl">Demo komponentów UI</h1>

      <DemoSection title="Przyciski">
        <Button>Zapłać</Button>
        <Button variant="outline">Anuluj</Button>
        <Button variant="destructive">Usuń</Button>
        <Button loading>Zapisywanie…</Button>
      </DemoSection>

      <Separator />

      <DemoSection title="Statusy">
        <Badge variant="success">Opłacone</Badge>
        <Badge variant="warning">Oczekuje</Badge>
        <Badge variant="danger">Odrzucone</Badge>
        <Badge variant="neutral">Planowana</Badge>
      </DemoSection>

      <Separator />

      <DemoSection title="Karty">
        <Card className="w-72">
          <CardHeader>
            <CardTitle>Dzieci w klasie</CardTitle>
            <CardAction>
              <Button variant="outline">Dodaj rodzica</Button>
            </CardAction>
          </CardHeader>
          <CardContent>24 dzieci</CardContent>
        </Card>
        <Card variant="dark" className="w-72">
          <CardHeader>
            <CardTitle>Mój rachunek</CardTitle>
          </CardHeader>
          <CardContent>
            <MoneyAmount amount={1240} />
          </CardContent>
        </Card>
      </DemoSection>

      <Separator />

      <DemoSection title="Pola formularza">
        <Field>
          <FieldLabel htmlFor="demo-email">E-mail</FieldLabel>
          <Input id="demo-email" placeholder="jan@przyklad.pl" />
        </Field>
        <Field data-invalid>
          <FieldLabel htmlFor="demo-hint">Kod klasy</FieldLabel>
          <Input id="demo-hint" aria-invalid placeholder="3B-X7KQ2" />
          <FieldError>Nie znaleziono klasy o tym kodzie.</FieldError>
        </Field>
        <Field>
          <FieldLabel htmlFor="demo-opis">Krótki opis</FieldLabel>
          <Textarea id="demo-opis" placeholder="Cel zbiórki…" />
        </Field>
        <Field>
          <FieldLabel>Źródło</FieldLabel>
          <Select>
            <SelectTrigger>
              <SelectValue placeholder="Wybierz" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="konto">Mój rachunek</SelectItem>
            </SelectContent>
          </Select>
        </Field>
      </DemoSection>

      <Separator />

      <DemoSection title="Pieniądze">
        <MoneyAmount amount={1240} />
        <MoneyAmount amount={-400} />
      </DemoSection>

      <DemoSection title="Wpływy i wydatki">
        <FundsRatioBar moneyIn={1240} moneyOut={400} />
      </DemoSection>

      <Separator />

      <DemoSection title="Zakładki">
        <Tabs defaultValue="ostatnie" className="w-full">
          <TabsList>
            <TabsTrigger value="ostatnie">Ostatnie</TabsTrigger>
            <TabsTrigger value="wplaty">Wpłaty</TabsTrigger>
            <TabsTrigger value="wyplaty">Wypłaty</TabsTrigger>
          </TabsList>
          <TabsContent value="ostatnie">Historia transakcji</TabsContent>
          <TabsContent value="wplaty">Lista wpłat</TabsContent>
          <TabsContent value="wyplaty">Lista wypłat</TabsContent>
        </Tabs>
      </DemoSection>

      <Separator />

      <DemoSection title="Pasek postępu">
        <Progress value={62} className="w-full">
          <ProgressTrack className="h-5">
            <ProgressIndicator />
            <ProgressOverlay>15/30 wpłat</ProgressOverlay>
          </ProgressTrack>
        </Progress>
      </DemoSection>

      <Separator />

      <DemoSection title="Szkielet ładowania">
        <Skeleton className="h-4 w-40" />
      </DemoSection>

      <Separator />

      <DemoSection title="Okno modalne">
        <ResponsiveDialog>
          <ResponsiveDialogTrigger>Otwórz podgląd</ResponsiveDialogTrigger>
          <ResponsiveDialogContent>
            <ResponsiveDialogHeader>
              <ResponsiveDialogTitle>Zamknąć zbiórkę?</ResponsiveDialogTitle>
              <ResponsiveDialogDescription>
                Nadwyżka wróci na konta rodziców.
              </ResponsiveDialogDescription>
            </ResponsiveDialogHeader>
            <Button>Zamknij i zwróć</Button>
          </ResponsiveDialogContent>
        </ResponsiveDialog>
      </DemoSection>

      <Separator />

      <DemoSection title="Karty zbiórek">
        <CollectionCard
          icon={<Drama />}
          title="Wyjście do teatru „Pinokio”"
          dueDate="2026-05-15"
          collected={1250}
          target={2000}
          status="active"
        />
        <CollectionCard
          icon={<Tent />}
          title="Zielona szkoła"
          dueDate="2026-03-20"
          collected={2000}
          target={2000}
          status="closed"
        />
      </DemoSection>

      <Separator />

      <DemoSection title="Przesyłanie plików">
        <FileUpload />
      </DemoSection>

      <Separator />

      <DemoSection title="Szybkie wyszukiwanie">
        <CommandPalette
          items={mockPaletteItems}
          onSelect={(item) => console.log("Wybrano:", item)}
        />
      </DemoSection>

      <Separator />

      <DemoSection title="Pusty stan">
        <Card className="w-full">
          <CardContent>
            <EmptyState
              icon={<Wallet />}
              title="Brak zbiórek"
              description="Utwórz pierwszą zbiórkę, aby zacząć zbierać wpłaty od rodziców."
              action={<Button>Nowa zbiórka</Button>}
            />
          </CardContent>
        </Card>
      </DemoSection>

      <Separator />

      <DemoSection title="Menu akcji">
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <Button variant="ghost" size="icon" aria-label="Akcje wiersza" />
            }
          >
            <MoreHorizontal />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem>
              <Pencil />
              Edytuj
            </DropdownMenuItem>
            <DropdownMenuItem>
              <BellRing />
              Przypomnij
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem variant="destructive">
              <UserMinus />
              Wypisz ucznia
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </DemoSection>

      <DemoSection title="Powiadomienia">
        <Button
          variant="outline"
          onClick={() =>
            toast.add({
              title: "Wpłata przyjęta",
              description: "120,00 zł · Teatr „Pinokio”",
              type: "success",
            })
          }
        >
          Sukces
        </Button>
        <Button
          variant="outline"
          onClick={() =>
            toast.add({
              title: "Nie udało się zapisać",
              description: "Spróbuj ponownie za chwilę.",
              type: "error",
            })
          }
        >
          Błąd
        </Button>
        <Button
          variant="outline"
          onClick={() =>
            toast.add({
              title: "Nowa wiadomość",
              description: "Skarbnik napisał na czacie klasy.",
              type: "info",
            })
          }
        >
          Info
        </Button>
      </DemoSection>
      <Separator />
      <Toaster />
    </main>
  );
}

export default App;
