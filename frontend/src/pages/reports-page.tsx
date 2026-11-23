import * as React from "react";
import { useNavigate } from "react-router";
import { FileDown } from "lucide-react";
import { DataState } from "@/components/data-state";
import { AppShell } from "@/components/layout/app-shell";
import { PageHeader } from "@/components/page-header";
import { Section } from "@/components/section";
import { SegmentedControl } from "@/components/segmented-control";
import type { SegmentedOption } from "@/components/segmented-control";
import { Button } from "@/components/ui/button";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast, Toaster } from "@/components/ui/toast";
import { useAsyncData } from "@/hooks/use-async-data";
import { ApiError } from "@/lib/api-client";
import { getChildren } from "@/lib/children";
import type { Child } from "@/lib/children";
import { getClasses } from "@/lib/classes";
import type { ClassSummary } from "@/lib/classes";
import { describeError } from "@/lib/error-messages";
import { downloadBlob } from "@/lib/download";
import { getFundraisings } from "@/lib/fundraising";
import type { FundraisingListItem } from "@/lib/fundraising";
import { downloadReport, reportFileName } from "@/lib/reports";
import type { ReportFormat, ReportSubject } from "@/lib/reports";

type Option = { value: string; label: string };

type ReportSources = {
  fundraisings: FundraisingListItem[];
  children: Child[];
  classes: ClassSummary[];
};

const SUBJECT_OPTIONS: SegmentedOption<ReportSubject>[] = [
  { value: "fundraising", label: "Zbiórka" },
  { value: "child", label: "Dziecko" },
  { value: "class", label: "Klasa" },
];

const FORMAT_OPTIONS: SegmentedOption<ReportFormat>[] = [
  { value: "PDF", label: "PDF" },
  { value: "CSV", label: "CSV (Excel)" },
];

const SUBJECT_HINTS: Record<ReportSubject, string> = {
  fundraising:
    "Wpłaty z płatnikiem i dzieckiem, zwroty, wypłaty i uzupełnienia.",
  child: "Wpłaty na zbiórki tego dziecka i ich zwroty.",
  class:
    "Wszystkie wpłaty, zwroty i ruchy ze zbiórek klasy. Dostępne dla skarbnika.",
};

const SUBJECT_LABELS: Record<ReportSubject, string> = {
  fundraising: "Zbiórka",
  child: "Dziecko",
  class: "Klasa",
};

function optionsFor(subject: ReportSubject, sources: ReportSources): Option[] {
  switch (subject) {
    case "fundraising":
      return sources.fundraisings.map((item) => ({
        value: String(item.id),
        label: item.name,
      }));
    case "child":
      return sources.children.map((item) => ({
        value: String(item.id),
        label: `${item.firstname} ${item.lastname}`,
      }));
    case "class":
      return sources.classes
        .filter((item) => item.isOwner)
        .map((item) => ({ value: String(item.id), label: item.name }));
  }
}

function ReportsPage() {
  const navigate = useNavigate();
  const load = React.useCallback(async (): Promise<ReportSources> => {
    const [fundraisings, children, classes] = await Promise.all([
      getFundraisings(),
      getChildren(),
      getClasses(),
    ]);
    return { fundraisings, children, classes };
  }, []);
  const { data, error, isLoading, reload } = useAsyncData(load);

  const [subject, setSubject] = React.useState<ReportSubject>("fundraising");
  const [targetId, setTargetId] = React.useState("");
  const [format, setFormat] = React.useState<ReportFormat>("PDF");
  const [from, setFrom] = React.useState("");
  const [to, setTo] = React.useState("");
  const [formError, setFormError] = React.useState<string | undefined>();
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const options = data != null ? optionsFor(subject, data) : [];

  function handleSubjectChange(value: ReportSubject) {
    setSubject(value);
    setTargetId("");
    setFormError(undefined);
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (isSubmitting) {
      return;
    }
    if (targetId === "") {
      setFormError("Wybierz, czego dotyczy raport.");
      return;
    }
    if (from !== "" && to !== "" && from > to) {
      setFormError("Data początkowa nie może być późniejsza niż końcowa.");
      return;
    }

    const request = {
      subject,
      id: Number(targetId),
      format,
      from,
      to,
    };

    setIsSubmitting(true);
    try {
      const blob = await downloadReport(request);
      downloadBlob(blob, reportFileName(request));
      toast.add({ title: "Raport gotowy do pobrania.", type: "success" });
    } catch (submitError) {
      if (submitError instanceof ApiError && submitError.status === 401) {
        navigate("/login", { replace: true });
        return;
      }
      if (submitError instanceof ApiError && submitError.status === 403) {
        toast.add({
          title: "Nie masz dostępu do tego raportu.",
          type: "error",
        });
      } else {
        toast.add({ title: describeError(submitError), type: "error" });
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <AppShell activeId="reports">
      <div className="flex flex-col gap-6">
        <PageHeader
          title="Raporty"
          description="Zestawienie wpłat, zwrotów i wypłat dla zbiórki, dziecka albo klasy."
        />
        <DataState
          isLoading={isLoading}
          hasError={error != null}
          isEmpty={false}
          emptyState={null}
          onRetry={reload}
        >
          <Section title="Nowy raport" description={SUBJECT_HINTS[subject]}>
            <form
              onSubmit={handleSubmit}
              noValidate
              className="flex flex-col gap-5"
            >
              <Field>
                <FieldLabel>Dotyczy</FieldLabel>
                <SegmentedControl<ReportSubject>
                  aria-label="Rodzaj raportu"
                  options={SUBJECT_OPTIONS}
                  value={subject}
                  onChange={handleSubjectChange}
                />
              </Field>

              <Field data-invalid={formError != null && targetId === ""}>
                <FieldLabel htmlFor="report-target">
                  {SUBJECT_LABELS[subject]}
                </FieldLabel>
                <Select
                  items={options}
                  value={targetId}
                  onValueChange={(value) => {
                    setTargetId(value ?? "");
                    setFormError(undefined);
                  }}
                >
                  <SelectTrigger
                    id="report-target"
                    className="w-full cursor-pointer"
                  >
                    <SelectValue
                      placeholder={
                        options.length > 0
                          ? "Wybierz"
                          : "Brak pozycji do wyboru"
                      }
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {options.map((option) => (
                      <SelectItem
                        key={option.value}
                        value={option.value}
                        className="cursor-pointer"
                      >
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>

              <div className="grid gap-4 sm:grid-cols-2">
                <Field>
                  <FieldLabel htmlFor="report-from">Od</FieldLabel>
                  <Input
                    id="report-from"
                    type="date"
                    value={from}
                    onChange={(event) => {
                      setFrom(event.target.value);
                      setFormError(undefined);
                    }}
                    className="cursor-pointer"
                  />
                </Field>
                <Field>
                  <FieldLabel htmlFor="report-to">Do</FieldLabel>
                  <Input
                    id="report-to"
                    type="date"
                    value={to}
                    onChange={(event) => {
                      setTo(event.target.value);
                      setFormError(undefined);
                    }}
                    className="cursor-pointer"
                  />
                </Field>
              </div>
              <p className="text-xs text-muted-foreground cursor-default">
                Zostaw oba pola puste, żeby wybrać cały okres trwania zbiórki.
                Daty obejmują dzień początkowy i końcowy.
              </p>

              <Field>
                <FieldLabel>Format</FieldLabel>
                <SegmentedControl<ReportFormat>
                  aria-label="Format raportu"
                  className="max-w-xs"
                  options={FORMAT_OPTIONS}
                  value={format}
                  onChange={setFormat}
                />
              </Field>

              {formError != null ? <FieldError>{formError}</FieldError> : null}

              <div className="flex justify-end">
                <Button type="submit" loading={isSubmitting}>
                  <FileDown />
                  Pobierz raport
                </Button>
              </div>
            </form>
          </Section>
        </DataState>
      </div>
      <Toaster />
    </AppShell>
  );
}

export { ReportsPage };
