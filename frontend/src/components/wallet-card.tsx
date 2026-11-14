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
      className="flex min-h-56 flex-col justify-between gap-8 rounded-xl bg-[#0F1115] p-6 text-white"
      {...props}
    >
      <div className="flex flex-col gap-2">
        <span className="text-sm text-neutral-400">Dostępne środki</span>
        <MoneyAmount inverse amount={wallet.balance} className="text-4xl" />
      </div>
      <div className="flex items-center justify-between gap-3 border-t border-white/10 pt-4">
        <div className="flex min-w-0 flex-col gap-1">
          <span className="text-xs text-neutral-400">Numer rachunku</span>
          <span className="font-mono text-sm tabular-nums">
            {formatIban(wallet.iban)}
          </span>
        </div>
        <CopyButton
          value={wallet.iban}
          label="Kopiuj numer rachunku"
          successTitle="Numer rachunku skopiowany."
          className="text-neutral-300 hover:bg-white/10 hover:text-white"
        />
      </div>
    </div>
  )
}

export { WalletCard }
