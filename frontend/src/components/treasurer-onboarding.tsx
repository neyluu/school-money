import * as React from "react";
import { Link } from "react-router";
import { Circle, CircleCheck } from "lucide-react";
import { CreateClassDialog } from "@/components/classes/create-class-dialog";
import { CopyButton } from "@/components/copy-button";
import { Section } from "@/components/section";
import { Button } from "@/components/ui/button";
import {
  Progress,
  ProgressIndicator,
  ProgressTrack,
} from "@/components/ui/progress";
import { usePolling } from "@/hooks/use-polling";
import { getClassDetails, getPendingMemberships } from "@/lib/class-management";
import { getClasses } from "@/lib/classes";
import type { ClassSummary } from "@/lib/classes";
import { getOwnedFundraisings } from "@/lib/dashboard";

const POLL_INTERVAL_MS = 10000;
const CONTROL_HEIGHT = "h-9";
const CONTROL_RADIUS = "rounded-lg";
const ROLE_KEY = "sm.accountRole";
const DONE_KEY_PREFIX = "sm.onboardingDone.";

type Snapshot = {
  ownedClass: ClassSummary | undefined;
  fundraisingsCount: number;
  accessCode: string | undefined;
  pendingCount: number;
};

type Step = {
  title: string;
  description: string;
  done: boolean;
  action?: React.ReactNode;
  alwaysShown?: React.ReactNode;
};

function pluralRequests(count: number): string {
  if (count === 1) {
    return "1 zgłoszenie";
  }
  const lastDigit = count % 10;
  const lastTwo = count % 100;
  if (lastDigit >= 2 && lastDigit <= 4 && (lastTwo < 12 || lastTwo > 14)) {
    return `${count} zgłoszenia`;
  }
  return `${count} zgłoszeń`;
}

function isDone(classId: number): boolean {
  return localStorage.getItem(`${DONE_KEY_PREFIX}${classId}`) === "1";
}

function finishOnboarding(classId: number): void {
  localStorage.removeItem(ROLE_KEY);
  localStorage.setItem(`${DONE_KEY_PREFIX}${classId}`, "1");
}

function StepIcon({ done }: { done: boolean }) {
  return done ? (
    <CircleCheck
      key="done"
      aria-label="Zrobione"
      role="img"
      className="size-5 shrink-0 self-start text-success motion-safe:animate-in motion-safe:zoom-in-50 motion-safe:duration-300"
    />
  ) : (
    <Circle
      key="todo"
      aria-label="Do zrobienia"
      role="img"
      className="size-5 shrink-0 self-start text-muted-foreground motion-safe:animate-in motion-safe:fade-in-0 motion-safe:duration-300"
    />
  );
}

function AccessCodeAction({ code }: { code: string }) {
  return (
    <div
      className={`flex items-center gap-2 border bg-background pl-3 motion-safe:animate-in motion-safe:fade-in-0 motion-safe:slide-in-from-right-2 motion-safe:duration-300 ${CONTROL_HEIGHT} ${CONTROL_RADIUS}`}
    >
      <span className="font-mono text-base tracking-widest">{code}</span>
      <CopyButton
        value={code}
        label="Kopiuj kod klasy"
        successTitle="Kod klasy skopiowany."
        className={`${CONTROL_HEIGHT} ${CONTROL_RADIUS} px-2`}
      />
    </div>
  );
}

async function loadSnapshot(): Promise<Snapshot> {
  const [classes, fundraisings] = await Promise.all([
    getClasses(),
    getOwnedFundraisings(),
  ]);
  const ownedClass = classes.find((item) => item.isOwner);
  const activeFundraisingsCount = fundraisings.filter(
    (item) => !item.isBlocked && !item.isClassBlocked
  ).length;

  if (ownedClass == null) {
    return {
      ownedClass: undefined,
      fundraisingsCount: activeFundraisingsCount,
      accessCode: undefined,
      pendingCount: 0,
    };
  }

  const [details, pending] = await Promise.all([
    getClassDetails(ownedClass.id),
    getPendingMemberships(ownedClass.id),
  ]);

  return {
    ownedClass,
    fundraisingsCount: activeFundraisingsCount,
    accessCode: details.accessCode,
    pendingCount: pending.length,
  };
}

function TreasurerOnboarding({
  onChanged,
}: {
  ownedClass?: ClassSummary | undefined;
  fundraisingsCount?: number;
  onChanged: () => void;
}) {
  const [snapshot, setSnapshot] = React.useState<Snapshot | null>(null);
  const hadClassRef = React.useRef<boolean | null>(null);
  const onChangedRef = React.useRef(onChanged);

  React.useEffect(() => {
    onChangedRef.current = onChanged;
  }, [onChanged]);

  const refresh = React.useCallback(async () => {
    try {
      const next = await loadSnapshot();
      const hasClass = next.ownedClass != null;

      if (hadClassRef.current !== null && hadClassRef.current !== hasClass) {
        onChangedRef.current();
      }
      hadClassRef.current = hasClass;

      setSnapshot(next);
    } catch {
      // Zostajemy przy ostatnim znanym stanie, kolejny tick spróbuje ponownie.
    }
  }, []);

  usePolling(refresh, POLL_INTERVAL_MS, true);

  if (snapshot == null) {
    return null;
  }

  const { ownedClass, fundraisingsCount, accessCode, pendingCount } = snapshot;
  const hasClass = ownedClass != null;

  if (hasClass && isDone(ownedClass.id)) {
    return null;
  }

  const hasMembers = hasClass && ownedClass.childrenCount + pendingCount > 0;
  const approved = hasMembers && pendingCount === 0;

  const steps: Step[] = [
    {
      title: "Załóż klasę",
      description: "Podaj nazwę, szkołę i miasto. Dostaniesz kod dla rodziców.",
      done: hasClass,
      action: hasClass ? undefined : (
        <CreateClassDialog onCreated={() => void refresh()} />
      ),
    },
    {
      title: "Przekaż kod rodzicom",
      description:
        "Wyślij go w wiadomości albo na grupie. Rodzic wpisuje kod i wybiera swoje dziecko.",
      done: hasMembers,
      alwaysShown:
        accessCode != null ? <AccessCodeAction code={accessCode} /> : undefined,
    },
    {
      title: "Zatwierdź zgłoszenia",
      description:
        pendingCount > 0
          ? `Czeka ${pluralRequests(pendingCount)} od rodziców.`
          : "Zgłoszenia rodziców pojawią się w szczegółach klasy.",
      done: approved,
      action:
        hasClass && pendingCount > 0 ? (
          <Button
            size="sm"
            className={`${CONTROL_HEIGHT} ${CONTROL_RADIUS}`}
            render={<Link to={`/dashboard/class/${ownedClass.id}`} />}
          >
            Zobacz zgłoszenia
          </Button>
        ) : undefined,
    },
    {
      title: "Utwórz pierwszą zbiórkę",
      description:
        "Ustal cel, termin i kwotę od dziecka. Rodzice mogą wpłacać od razu.",
      done: fundraisingsCount > 0,
      action:
        hasClass && !ownedClass.isBlocked && fundraisingsCount === 0 ? (
          <Button
            size="sm"
            className={`${CONTROL_HEIGHT} ${CONTROL_RADIUS}`}
            render={<Link to="/dashboard/fundraisers/new" />}
          >
            Utwórz zbiórkę
          </Button>
        ) : undefined,
    },
  ];

  const doneCount = steps.filter((step) => step.done).length;
  if (doneCount === steps.length) {
    if (hasClass) {
      finishOnboarding(ownedClass.id);
    }
    return null;
  }

  const currentIndex = steps.findIndex((step) => !step.done);
  const percent = (doneCount / steps.length) * 100;

  return (
    <Section
      title="Skonfiguruj klasę"
      description="Gdy wszystkie kroki będą zrobione, ten widok zniknie."
      action={
        <span className="text-sm tabular-nums text-muted-foreground">
          {doneCount} z {steps.length}
        </span>
      }
    >
      <div className="flex flex-col gap-5">
        <Progress value={percent}>
          <ProgressTrack className="h-2">
            <ProgressIndicator />
          </ProgressTrack>
        </Progress>

        <ol className="flex flex-col gap-2">
          {steps.map((step, index) => {
            const isCurrent = index === currentIndex;
            const stepDone = step.done;
            const action = step.alwaysShown ?? (isCurrent ? step.action : null);
            return (
              <li
                key={step.title}
                className={
                  "flex flex-wrap items-center gap-3 rounded-lg p-3 transition-[background-color,opacity] duration-500 ease-out " +
                  (isCurrent
                    ? "bg-muted motion-safe:animate-in motion-safe:fade-in-0 motion-safe:duration-500"
                    : stepDone
                      ? "opacity-70"
                      : "")
                }
              >
                <StepIcon done={stepDone} />
                <div className="min-w-0 flex-1 basis-56">
                  <p className="text-sm font-medium">
                    <span className="mr-2 tabular-nums text-muted-foreground">
                      {index + 1}.
                    </span>
                    {step.title}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {step.description}
                  </p>
                </div>
                {action}
              </li>
            );
          })}
        </ol>
      </div>
    </Section>
  );
}

export { TreasurerOnboarding };
