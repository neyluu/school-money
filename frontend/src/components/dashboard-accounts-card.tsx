import { Link } from "react-router"
import { Plus } from "lucide-react"
import { MoneyAmount } from "@/components/money-amount"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { OwnedFundraising } from "@/lib/dashboard"
import type { Wallet } from "@/lib/wallet"

const MAX_FUNDRAISINGS = 5

function lastDigits(iban: string | null): string {
  return iban != null ? `•••• ${iban.slice(-4)}` : "brak rachunku"
}

function AccountRow({
  to,
  name,
  iban,
  balance,
  chipClassName,
}: {
  to: string
  name: string
  iban: string | null
  balance: number
  chipClassName: string
}) {
  return (
    <li>
      <Link
        to={to}
        className="flex items-center gap-3 rounded-lg p-1 transition-colors hover:bg-muted"
      >
        <span
          aria-hidden
          className={`h-8 w-10 shrink-0 rounded-md ${chipClassName}`}
        />
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium">{name}</p>
          <p className="text-xs text-muted-foreground tabular-nums">
            {lastDigits(iban)}
          </p>
        </div>
        <MoneyAmount amount={balance} />
      </Link>
    </li>
  )
}

function DashboardAccountsCard({
  wallet,
  fundraisings,
  canCreate,
}: {
  wallet: Wallet
  fundraisings: OwnedFundraising[]
  canCreate: boolean
}) {
  const shown = [...fundraisings]
    .sort((a, b) => Number(b.status === "ACTIVE") - Number(a.status === "ACTIVE"))
    .slice(0, MAX_FUNDRAISINGS)

  return (
    <Card>
      <CardHeader>
        <CardTitle>Rachunki</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <ul className="flex flex-col gap-2">
          <AccountRow
            to="/dashboard/payments"
            name="Mój rachunek"
            iban={wallet.iban}
            balance={wallet.balance}
            chipClassName="bg-primary"
          />
          {shown.map((fundraising) => (
            <AccountRow
              key={fundraising.id}
              to={`/dashboard/fundraisers/${fundraising.id}`}
              name={fundraising.name}
              iban={fundraising.iban}
              balance={fundraising.walletBalance}
              chipClassName={
                fundraising.status === "ACTIVE" ? "bg-success" : "bg-muted"
              }
            />
          ))}
        </ul>
        {canCreate ? (
          <Button
            variant="outline"
            render={<Link to="/dashboard/fundraisers/new" />}
          >
            <Plus />
            Nowa zbiórka
          </Button>
        ) : null}
      </CardContent>
    </Card>
  )
}

export { DashboardAccountsCard }
