import { MoneyAmount } from "@/components/money-amount"
import {
  ResponsiveDialog,
  ResponsiveDialogContent,
  ResponsiveDialogDescription,
  ResponsiveDialogHeader,
  ResponsiveDialogTitle,
} from "@/components/responsive-dialog"
import { WithdrawForm } from "@/components/withdraw-form"

function WithdrawDialog({
  open,
  onOpenChange,
  balance,
  onCompleted,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  balance: number
  onCompleted: () => void
}) {
  return (
    <ResponsiveDialog open={open} onOpenChange={onOpenChange}>
      <ResponsiveDialogContent>
        <ResponsiveDialogHeader>
          <ResponsiveDialogTitle>Przelew zewnętrzny</ResponsiveDialogTitle>
          <ResponsiveDialogDescription>
            Przelew na zewnętrzny rachunek bankowy. Dostępne środki:{" "}
            <MoneyAmount amount={balance} className="text-sm" />
          </ResponsiveDialogDescription>
        </ResponsiveDialogHeader>
        <WithdrawForm
          balance={balance}
          onCancel={() => onOpenChange(false)}
          onCompleted={() => {
            onOpenChange(false)
            onCompleted()
          }}
        />
      </ResponsiveDialogContent>
    </ResponsiveDialog>
  )
}

export { WithdrawDialog }
