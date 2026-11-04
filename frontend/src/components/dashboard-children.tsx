import { Link } from "react-router"
import { CreditCard } from "lucide-react"
import { MoneyAmount } from "@/components/money-amount"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import type { Due } from "@/lib/dashboard"

export type DashboardChild = {
  id: number
  firstName: string
  lastName: string
}

function initials(child: DashboardChild): string {
  return `${child.firstName.charAt(0)}${child.lastName.charAt(0)}`.toUpperCase()
}

function ChildDuesCard({
  student,
  dues,
  onPay,
}: {
  student: DashboardChild
  dues: Due[]
  onPay: (due: Due) => void
}) {
  const hasDues = dues.length > 0

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-3">
          <span
            aria-hidden
            className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary"
          >
            {initials(student)}
          </span>
          <p className="min-w-0 flex-1 truncate font-medium">
            {student.firstName} {student.lastName}
          </p>
          <Badge variant={hasDues ? "warning" : "success"}>
            {hasDues ? "Do zapłaty" : "Wszystko opłacone"}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        {hasDues ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b text-xs text-muted-foreground">
                  <th className="py-2 pr-4 font-medium">Zbiórka</th>
                  <th className="py-2 text-right font-medium">Do zapłaty</th>
                </tr>
              </thead>
              <tbody>
                {dues.map((due) => (
                  <tr key={due.fundraisingId} className="border-b last:border-0">
                    <td className="py-2 pr-4">
                      <Link
                        to={`/dashboard/fundraisers/${due.fundraisingId}`}
                        className="underline-offset-4 hover:underline"
                      >
                        {due.fundraisingName}
                      </Link>
                    </td>
                    <td className="py-2 text-right">
                      <MoneyAmount amount={due.remainingAmount} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">
            Nie ma żadnych zaległych opłat za to dziecko.
          </p>
        )}
        {hasDues ? (
          <Button className="w-full" onClick={() => onPay(dues[0])}>
            <CreditCard />
            Zapłać za dziecko
          </Button>
        ) : null}
      </CardContent>
    </Card>
  )
}

function DashboardChildren({
  students,
  dues,
  onPay,
}: {
  students: DashboardChild[]
  dues: Due[]
  onPay: (due: Due) => void
}) {
  return (
    <div className="grid gap-4 md:grid-cols-2 md:items-start">
      {students.map((student) => (
        <ChildDuesCard
          key={student.id}
          student={student}
          dues={dues.filter((due) => due.child.id === student.id)}
          onPay={onPay}
        />
      ))}
    </div>
  )
}

export { DashboardChildren }
