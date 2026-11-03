import { CopyButton } from "@/components/copy-button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { formatIban } from "@/lib/iban"
import type { Wallet } from "@/lib/wallet"

function FundraisingAccountCard({ wallet }: { wallet: Wallet }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Rachunek</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-1">
        <span className="text-xs text-muted-foreground">
          Rachunek zbiórki (IBAN)
        </span>
        <div className="flex items-center justify-between gap-2">
          <span className="font-mono text-sm tabular-nums">
            {formatIban(wallet.iban)}
          </span>
          <CopyButton
            value={wallet.iban}
            label="Kopiuj numer rachunku zbiórki"
            successTitle="Numer rachunku skopiowany."
          />
        </div>
      </CardContent>
    </Card>
  )
}

export { FundraisingAccountCard }
