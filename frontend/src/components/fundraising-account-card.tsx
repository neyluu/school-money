import { CopyButton } from "@/components/copy-button"
import { Section } from "@/components/section"
import { formatIban } from "@/lib/iban"
import type { Wallet } from "@/lib/wallet"

function FundraisingAccountCard({ wallet }: { wallet: Wallet }) {
  return (
    <Section title="Rachunek zbiórki" description="Pod ten numer można wpłacać na zbiórkę.">
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
    </Section>
  )
}

export { FundraisingAccountCard }
