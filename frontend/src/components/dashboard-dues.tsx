import { Link } from "react-router"
import { MoneyAmount } from "@/components/money-amount"
import { Section } from "@/components/section"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { daysUntil, formatDaysLeft } from "@/lib/dates"
import type { Due } from "@/lib/dashboard"
import { formatMoney } from "@/lib/money"

export type DashboardChild = {
  id: number
  firstName: string
  lastName: string
}

function initials(child: DashboardChild): string {
  return `${child.firstName.charAt(0)}${child.lastName.charAt(0)}`.toUpperCase()
}

function DueRow({ due, onPay }: { due: Due; onPay: (due: Due) => void }) {
  const days = daysUntil(due.endDate)
  const isPartial = due.paidAmount > 0

  return (
    <li className="flex flex-wrap items-center gap-x-4 gap-y-2 py-2">
      <div className="min-w-0 flex-1 basis-48">
        <Link
          to={`/dashboard/fundraisers/${due.fundraisingId}`}
          className="block truncate text-sm font-medium underline-offset-4 hover:underline"
        >
          {due.fundraisingName}
        </Link>
        <p className="text-xs text-muted-foreground">
          {isPartial
            ? `Wpłacono ${formatMoney(due.paidAmount)} z ${formatMoney(due.amountPerChild)}`
            : `Termin: ${formatDaysLeft(days).toLowerCase()}`}
        </p>
      </div>
      <MoneyAmount amount={due.remainingAmount} />
      <Button size="sm" onClick={() => onPay(due)}>
        Zapłać
      </Button>
    </li>
  )
}

function ChildDues({
  student,
  dues,
  onPay,
}: {
  student: DashboardChild
  dues: Due[]
  onPay: (due: Due) => void
}) {
  return (
    <li className="flex flex-col gap-2 py-4 first:pt-0 last:pb-0">
      <div className="flex items-center gap-3">
        <span
          aria-hidden
          className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-medium text-primary"
        >
          {initials(student)}
        </span>
        <p className="min-w-0 flex-1 truncate text-sm font-medium">
          {student.firstName} {student.lastName}
        </p>
        <Badge variant={dues.length > 0 ? "warning" : "success"}>
          {dues.length > 0 ? "Do zapłaty" : "Wszystko opłacone"}
        </Badge>
      </div>
      {dues.length > 0 ? (
        <ul className="flex flex-col pl-12">
          {dues.map((due) => (
            <DueRow key={due.fundraisingId} due={due} onPay={onPay} />
          ))}
        </ul>
      ) : null}
    </li>
  )
}

function DashboardDues({
  students,
  dues,
  onPay,
}: {
  students: DashboardChild[]
  dues: Due[]
  onPay: (due: Due) => void
}) {
  const waiting = dues.length

  return (
    <Section
      title="Do zapłaty"
      description={
        waiting > 0
          ? "Opłaty za Twoje dzieci w trwających zbiórkach."
          : "Nic nie czeka na wpłatę."
      }
    >
      <ul className="flex flex-col divide-y">
        {students.map((student) => (
          <ChildDues
            key={student.id}
            student={student}
            dues={dues.filter((due) => due.child.id === student.id)}
            onPay={onPay}
          />
        ))}
      </ul>
    </Section>
  )
}

export { DashboardDues }
