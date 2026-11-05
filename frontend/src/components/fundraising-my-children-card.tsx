import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { formatMoney } from "@/lib/money"
import type { FundraisingChild } from "@/lib/fundraising"

function initials(student: FundraisingChild): string {
  return `${student.firstName.charAt(0)}${student.lastName.charAt(0)}`.toUpperCase()
}

function FundraisingMyChildrenCard({
  students,
  amountPerChild,
  canPay,
  onPay,
}: {
  students: FundraisingChild[]
  amountPerChild: number
  canPay: boolean
  onPay: (childId: number) => void
}) {
  const mine = students.filter((student) => student.isMine)

  if (mine.length === 0) {
    return null
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Moje dzieci</CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="flex flex-col gap-3">
          {mine.map((student) => {
            const isPartial = !student.isPaid && student.paidAmount > 0
            return (
              <li key={student.id} className="flex items-center gap-3">
                <span
                  aria-hidden
                  className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary"
                >
                  {initials(student)}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">
                    {student.firstName} {student.lastName}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {isPartial
                      ? `Wpłacono ${formatMoney(student.paidAmount)} z ${formatMoney(amountPerChild)}`
                      : formatMoney(amountPerChild)}
                  </p>
                </div>
                <Badge variant={student.isPaid ? "success" : "warning"}>
                  {student.isPaid ? "Opłacone" : "Do zapłaty"}
                </Badge>
                {!student.isPaid && canPay ? (
                  <Button onClick={() => onPay(student.id)}>Zapłać</Button>
                ) : null}
              </li>
            )
          })}
        </ul>
      </CardContent>
    </Card>
  )
}

export { FundraisingMyChildrenCard }
