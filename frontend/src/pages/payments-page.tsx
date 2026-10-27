import * as React from "react"
import { useNavigate } from "react-router"
import { Wallet as WalletIcon } from "lucide-react"
import { EmptyState } from "@/components/empty-state"
import { AppShell } from "@/components/layout/app-shell"
import { TopUpDialog } from "@/components/top-up-dialog"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Toaster } from "@/components/ui/toast"
import { WalletCard } from "@/components/wallet-card"
import { WithdrawDialog } from "@/components/withdraw-dialog"
import { ApiError } from "@/lib/api-client"
import { getWallet } from "@/lib/wallet"
import type { Wallet } from "@/lib/wallet"

type ActiveDialog = "topUp" | "withdraw" | null

function PaymentsPage() {
  const navigate = useNavigate()
  const [wallet, setWallet] = React.useState<Wallet | null>(null)
  const [isLoading, setIsLoading] = React.useState(true)
  const [loadFailed, setLoadFailed] = React.useState(false)
  const [reloadKey, setReloadKey] = React.useState(0)
  const [activeDialog, setActiveDialog] = React.useState<ActiveDialog>(null)

  React.useEffect(() => {
    let ignored = false
    getWallet()
      .then((loaded) => {
        if (!ignored) {
          setWallet(loaded)
          setLoadFailed(false)
          setIsLoading(false)
        }
      })
      .catch((error: unknown) => {
        if (ignored) {
          return
        }
        if (error instanceof ApiError && error.status === 401) {
          navigate("/login", { replace: true })
          return
        }
        setLoadFailed(true)
        setIsLoading(false)
      })
    return () => {
      ignored = true
    }
  }, [navigate, reloadKey])

  function reloadWallet() {
    setReloadKey((current) => current + 1)
  }

  function handleDialogChange(dialog: Exclude<ActiveDialog, null>) {
    return (open: boolean) => setActiveDialog(open ? dialog : null)
  }

  return (
    <AppShell activeId="payments">
      <div className="flex flex-col gap-6">
        <h1 className="text-2xl font-bold">Płatności</h1>
        {isLoading ? (
          <Skeleton className="h-52 w-full max-w-xl rounded-xl" />
        ) : wallet != null ? (
          <>
            <WalletCard
              wallet={wallet}
              onTopUp={() => setActiveDialog("topUp")}
              onWithdraw={() => setActiveDialog("withdraw")}
              className="w-full max-w-xl"
            />
            <TopUpDialog
              open={activeDialog === "topUp"}
              onOpenChange={handleDialogChange("topUp")}
              onCompleted={reloadWallet}
            />
            <WithdrawDialog
              open={activeDialog === "withdraw"}
              onOpenChange={handleDialogChange("withdraw")}
              balance={wallet.balance}
              onCompleted={reloadWallet}
            />
          </>
        ) : loadFailed ? (
          <Card className="w-full max-w-xl">
            <CardContent>
              <EmptyState
                icon={<WalletIcon />}
                title="Nie udało się wczytać rachunku"
                description="Sprawdź połączenie i spróbuj ponownie."
                action={<Button onClick={reloadWallet}>Spróbuj ponownie</Button>}
              />
            </CardContent>
          </Card>
        ) : null}
      </div>
      <Toaster />
    </AppShell>
  )
}

export { PaymentsPage }
