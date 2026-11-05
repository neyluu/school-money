import * as React from "react"
import { ArrowUpRight } from "lucide-react"
import { DataState } from "@/components/data-state"
import { AppShell } from "@/components/layout/app-shell"
import { TopUpForm } from "@/components/top-up-form"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Toaster } from "@/components/ui/toast"
import { WalletCard } from "@/components/wallet-card"
import { WalletHistory } from "@/components/wallet-history"
import { WithdrawDialog } from "@/components/withdraw-dialog"
import { WithdrawForm } from "@/components/withdraw-form"
import { useAsyncData } from "@/hooks/use-async-data"
import { getWallet } from "@/lib/wallet"

function PaymentsPage() {
  const [isWithdrawOpen, setIsWithdrawOpen] = React.useState(false)
  const [refreshToken, setRefreshToken] = React.useState(0)
  const { data, error, isLoading, reload } = useAsyncData(getWallet)

  function handleCompleted() {
    reload()
    setRefreshToken((current) => current + 1)
  }

  return (
    <AppShell activeId="payments">
      <div className="flex flex-col gap-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex flex-col gap-1">
            <h1 className="text-2xl font-bold">Mój rachunek</h1>
            <p className="text-sm text-muted-foreground">
              Wirtualne środki w systemie
            </p>
          </div>
          {data != null ? (
            <Button onClick={() => setIsWithdrawOpen(true)}>
              <ArrowUpRight />
              Przelew zewnętrzny
            </Button>
          ) : null}
        </div>
        <DataState
          isLoading={isLoading && data == null}
          hasError={error != null && data == null}
          isEmpty={false}
          emptyState={null}
          onRetry={reload}
        >
          {data != null ? (
            <>
              <div className="grid gap-4 lg:grid-cols-3 lg:items-start">
                <WalletCard wallet={data} />
                <Card>
                  <CardHeader>
                    <CardTitle>Doładuj rachunek</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <TopUpForm onCompleted={handleCompleted} />
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle>Wypłata na konto zewnętrzne</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <WithdrawForm
                      balance={data.balance}
                      onCompleted={handleCompleted}
                    />
                  </CardContent>
                </Card>
              </div>
              <WalletHistory key={refreshToken} />
              <WithdrawDialog
                open={isWithdrawOpen}
                onOpenChange={setIsWithdrawOpen}
                balance={data.balance}
                onCompleted={handleCompleted}
              />
            </>
          ) : null}
        </DataState>
      </div>
      <Toaster />
    </AppShell>
  )
}

export { PaymentsPage }
