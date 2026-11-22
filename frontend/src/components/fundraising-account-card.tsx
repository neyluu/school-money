import { CopyButton } from "@/components/copy-button"
import { Section } from "@/components/section"
import { formatIban } from "@/lib/iban"
import type { Wallet } from "@/lib/wallet"

function FundraisingAccountCard({ wallet }: { wallet: Wallet }) {
  return (
    <Section title="Rachunek zbiórki" description="Indywidualny numer IBAN zbiórki.">
      <div className="flex items-center justify-between gap-2">
        <span className="font-mono text-[0.8rem] tabular-nums">
          {formatIban(wallet.iban)}
        </span>
        <CopyButton
          value={wallet.iban}
          label="Kopiuj numer rachunku zbiórki"
          successTitle="Numer rachunku skopiowany."
          className="text-foreground/50"
        />
      </div>
    </Section>
  )
}

export { FundraisingAccountCard }
