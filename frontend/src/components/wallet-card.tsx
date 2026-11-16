import { CopyButton } from "@/components/copy-button"
import { MoneyAmount } from "@/components/money-amount"
import { formatIban } from "@/lib/iban"
import type { Wallet } from "@/lib/wallet"

function WalletCard({
  wallet,
  ...props
}: React.ComponentProps<"div"> & { wallet: Wallet }) {
  return (
    <div
      className="flex min-h-56 flex-col justify-between gap-8 rounded-xl bg-primary/10 ring-1 ring-primary/25 p-6 text-foreground"
      {...props}
    >
      <div className="flex flex-col gap-2">
        <span className="text-sm text-foreground/75">Dostępne środki</span>
        <MoneyAmount amount={wallet.balance} className="text-4xl" />
      </div>
      <div className="flex items-center justify-between gap-3 border-t border-white/10 pt-4">
        <div className="flex min-w-0 flex-col gap-1">
          <span className="text-xs text-foreground/50">Numer rachunku</span>
          <span className="font-mono text-sm tabular-nums">
            {formatIban(wallet.iban)}
          </span>
        </div>
        <CopyButton
          value={wallet.iban}
          label="Kopiuj numer rachunku"
          successTitle="Numer rachunku skopiowany."
          className="text-foreground/50 hover:text-foreground/75"
        />
      </div>
    </div>
  )
}

export { WalletCard }
