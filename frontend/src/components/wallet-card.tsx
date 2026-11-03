import { CopyButton } from "@/components/copy-button"
import { MoneyAmount } from "@/components/money-amount"
import { Card, CardContent } from "@/components/ui/card"
import { formatIban } from "@/lib/iban"
import type { Wallet } from "@/lib/wallet"

function WalletCard({
  wallet,
  ...props
}: Omit<React.ComponentProps<typeof Card>, "variant"> & {
  wallet: Wallet
}) {
  return (
    <Card variant="dark" {...props}>
      <CardContent className="flex flex-col gap-4">
        <div className="flex flex-col gap-1">
          <span className="text-sm text-muted-foreground">Saldo</span>
          <MoneyAmount amount={wallet.balance} className="text-3xl" />
        </div>
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
      </CardContent>
    </Card>
  )
}

export { WalletCard }
