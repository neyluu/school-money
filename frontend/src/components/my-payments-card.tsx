import { ReceiptText } from "lucide-react"
import { EmptyState } from "@/components/empty-state"
import { MoneyAmount } from "@/components/money-amount"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { WalletContribution } from "@/lib/wallet"

const dateFormatter = new Intl.DateTimeFormat("pl-PL", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
})

function MyPaymentsCard({
  contributions,
}: {
  contributions: WalletContribution[]
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Moje płatności</CardTitle>
      </CardHeader>
      <CardContent>
        {contributions.length === 0 ? (
          <EmptyState
            icon={<ReceiptText />}
            title="Brak płatności"
            description="Twoje wpłaty na zbiórki pojawią się tutaj."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b text-xs text-muted-foreground">
                  <th className="py-2 pr-4 font-medium">Data</th>
                  <th className="py-2 pr-4 font-medium">Zbiórka</th>
                  <th className="py-2 pr-4 font-medium">Dziecko</th>
                  <th className="py-2 text-right font-medium">Kwota</th>
                </tr>
              </thead>
              <tbody>
                {contributions.map((contribution) => (
                  <tr key={contribution.id} className="border-b last:border-0">
                    <td className="py-3 pr-4 whitespace-nowrap text-muted-foreground">
                      {dateFormatter.format(new Date(contribution.createdAt))}
                    </td>
                    <td className="py-3 pr-4">{contribution.fundraisingName}</td>
                    <td className="py-3 pr-4">
                      {contribution.child.firstName} {contribution.child.lastName}
                    </td>
                    <td className="py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {contribution.refunded ? (
                          <Badge variant="neutral">Zwrócona</Badge>
                        ) : null}
                        <MoneyAmount amount={contribution.amount} />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export { MyPaymentsCard }
