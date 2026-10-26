import { ArrowDownToLine, ArrowUpFromLine } from "lucide-react"
import { CopyButton } from "@/components/copy-button"
import { MoneyAmount } from "@/components/money-amount"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { formatIban } from "@/lib/iban"
import type { Wallet } from "@/lib/wallet"

function WalletCard({
  wallet,
  onTopUp,
  onWithdraw,
  ...props
}: Omit<React.ComponentProps<typeof Card>, "variant"> & {
  wallet: Wallet
  onTopUp: () => void
  onWithdraw: () => void
}) {
  return (
    <Card variant="dark" {...props}>
      <CardHeader>
        <CardTitle>Mój rachunek</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <div className="flex flex-col gap-1">
          <span className="text-xs text-muted-foreground">
            Dostępne środki
          </span>
          <MoneyAmount amount={wallet.balance} className="text-3xl" />
        </div>
        <div className="flex flex-col gap-1">
          <span className="text-xs text-muted-foreground">Numer rachunku</span>
          <div className="flex items-center justify-between gap-2">
            <span className="font-mono text-sm tabular-nums">
              {formatIban(wallet.iban)}
            </span>
            <CopyButton
              value={wallet.iban}
              label="Kopiuj numer rachunku"
              successTitle="Numer rachunku skopiowany."
            />
          </div>
        </div>
      </CardContent>
      <CardFooter className="gap-2">
        <Button onClick={onTopUp}>
          <ArrowDownToLine />
          Doładuj konto
        </Button>
        <Button variant="outline" onClick={onWithdraw}>
          <ArrowUpFromLine />
          Wypłać środki
        </Button>
      </CardFooter>
    </Card>
  )
}

export { WalletCard }
