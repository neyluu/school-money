import { Badge } from "./components/ui/badge";
import { FileUpload } from "./components/file-upload";
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
import { Drama, Tent } from "lucide-react";
import { CollectionCard } from "./components/collection-card";
import { Skeleton } from "./components/ui/skeleton";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "./components/ui/tabs";
import { Textarea } from "./components/ui/textarea";
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
    </main>
  );
}

export default App;
