import * as React from "react"
import { DataState } from "@/components/data-state"
import { AppShell } from "@/components/layout/app-shell"
import { PageHeader } from "@/components/page-header"
import { TopUpForm } from "@/components/top-up-form"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Toaster } from "@/components/ui/toast"
import { WalletCard } from "@/components/wallet-card"
import { WalletHistory } from "@/components/wallet-history"
import { WithdrawForm } from "@/components/withdraw-form"
import { useAsyncData } from "@/hooks/use-async-data"
import { formatMoney } from "@/lib/money"
import { getWallet } from "@/lib/wallet"

function PaymentsPage() {
  const [refreshToken, setRefreshToken] = React.useState(0)
  const { data, error, isLoading, reload } = useAsyncData(getWallet)

  function handleCompleted() {
    reload()
    setRefreshToken((current) => current + 1)
  }

  return (
    <AppShell activeId="payments">
      <div className="flex flex-col gap-6">
        <PageHeader
          title="Mój rachunek"
          description="To wirtualne środki w systemie. Doładowanie i przelew zewnętrzny są symulowane."
        />
        <DataState
          isLoading={isLoading && data == null}
          hasError={error != null && data == null}
          isEmpty={false}
          emptyState={null}
          onRetry={reload}
        >
          {data != null ? (
            <>
              <div className="grid gap-6 lg:grid-cols-2 lg:items-start">
                <WalletCard wallet={data} />
                <Card>
                  <CardContent>
                    <Tabs defaultValue="top-up">
                      <TabsList>
                        <TabsTrigger value="top-up">Doładuj</TabsTrigger>
                        <TabsTrigger value="withdraw">Wypłać</TabsTrigger>
                      </TabsList>
                      <TabsContent
                        value="top-up"
                        className="flex flex-col gap-4 pt-4"
                      >
                        <p className="text-sm text-muted-foreground">
                          Symulacja przelewu przychodzącego na Twój rachunek.
                        </p>
                        <TopUpForm onCompleted={handleCompleted} />
                      </TabsContent>
                      <TabsContent
                        value="withdraw"
                        className="flex flex-col gap-4 pt-4"
                      >
                        <p className="text-sm text-muted-foreground">
                          Przelew na zewnętrzny rachunek bankowy. Możesz wypłacić
                          do {formatMoney(data.balance)}.
                        </p>
                        <WithdrawForm
                          balance={data.balance}
                          onCompleted={handleCompleted}
                        />
                      </TabsContent>
                    </Tabs>
                  </CardContent>
                </Card>
              </div>
              <WalletHistory key={refreshToken} />
            </>
          ) : null}
        </DataState>
      </div>
      <Toaster />
    </AppShell>
  )
}

export { PaymentsPage }
