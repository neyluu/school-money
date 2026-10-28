import * as React from "react"
import { useParams } from "react-router"
import { HandCoins } from "lucide-react"
import { DataState } from "@/components/data-state"
import { EmptyState } from "@/components/empty-state"
import { FundraisingInvoicesTab } from "@/components/fundraising-invoices-tab"
import { FundraisingPaymentsTab } from "@/components/fundraising-payments-tab"
import { FundraisingSummaryCard } from "@/components/fundraising-summary-card"
import { FundraisingWithdrawalsTab } from "@/components/fundraising-withdrawals-tab"
import { FundraisingWithdrawDialog } from "@/components/fundraising-withdraw-dialog"
import { AppShell } from "@/components/layout/app-shell"
import { PayDialog } from "@/components/pay-dialog"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Toaster } from "@/components/ui/toast"
import { useAsyncData } from "@/hooks/use-async-data"
import { ApiError } from "@/lib/api-client"
import { getFundraisingSummary } from "@/lib/fundraising"
import type { FundraisingSummary } from "@/lib/fundraising"

type ActiveDialog = "pay" | "withdraw" | null

function isOpenForPayments(summary: FundraisingSummary): boolean {
  const now = Date.now()
  return (
    summary.status === "ACTIVE" &&
    !summary.isBlocked &&
    now >= new Date(summary.startAt).getTime() &&
    now < new Date(summary.endAt).getTime()
  )
}

function FundraisingDetailsPage() {
  const params = useParams()
  const fundraisingId = Number(params.fundraisingId)
  const [activeDialog, setActiveDialog] = React.useState<ActiveDialog>(null)
  const [refreshToken, setRefreshToken] = React.useState(0)

  const load = React.useCallback(
    () => getFundraisingSummary(fundraisingId),
    [fundraisingId]
  )
  const { data, error, isLoading, reload } = useAsyncData(load)

  const isUnavailable =
    error instanceof ApiError && (error.status === 404 || error.status === 403)

  function handleCompleted() {
    reload()
    setRefreshToken((current) => current + 1)
  }

  function handleDialogChange(dialog: Exclude<ActiveDialog, null>) {
    return (open: boolean) => setActiveDialog(open ? dialog : null)
  }

  function renderActions(summary: FundraisingSummary) {
    const canPay = isOpenForPayments(summary)
    const canWithdraw =
      summary.isOwner && summary.status === "ACTIVE" && !summary.isBlocked

    if (!canPay && !canWithdraw) {
      return undefined
    }

    return (
      <>
        {canPay ? (
          <Button onClick={() => setActiveDialog("pay")}>Zapłać</Button>
        ) : null}
        {canWithdraw ? (
          <Button variant="outline" onClick={() => setActiveDialog("withdraw")}>
            Wypłać ze zbiórki
          </Button>
        ) : null}
      </>
    )
  }

  return (
    <AppShell activeId="fundraisers">
      <div className="flex flex-col gap-6">
        {Number.isInteger(fundraisingId) && !isUnavailable ? (
          <DataState
            isLoading={isLoading && data == null}
            hasError={error != null}
            isEmpty={data == null}
            onRetry={reload}
            emptyState={null}
          >
            {data != null ? (
              <>
                <FundraisingSummaryCard
                  summary={data}
                  actions={renderActions(data)}
                />
                <Card>
                  <CardContent>
                    <Tabs defaultValue="payments">
                      <TabsList>
                        <TabsTrigger value="payments">Wpłaty</TabsTrigger>
                        <TabsTrigger value="withdrawals">Wypłaty</TabsTrigger>
                        <TabsTrigger value="invoices">Faktury</TabsTrigger>
                      </TabsList>
                      <TabsContent value="payments" className="pt-4">
                        <FundraisingPaymentsTab
                          key={refreshToken}
                          fundraisingId={data.id}
                        />
                      </TabsContent>
                      <TabsContent value="withdrawals" className="pt-4">
                        <FundraisingWithdrawalsTab
                          key={refreshToken}
                          fundraisingId={data.id}
                        />
                      </TabsContent>
                      <TabsContent value="invoices" className="pt-4">
                        <FundraisingInvoicesTab
                          key={refreshToken}
                          fundraisingId={data.id}
                        />
                      </TabsContent>
                    </Tabs>
                  </CardContent>
                </Card>
                <PayDialog
                  open={activeDialog === "pay"}
                  onOpenChange={handleDialogChange("pay")}
                  fundraisingId={data.id}
                  fundraisingName={data.name}
                  onCompleted={handleCompleted}
                />
                <FundraisingWithdrawDialog
                  open={activeDialog === "withdraw"}
                  onOpenChange={handleDialogChange("withdraw")}
                  fundraisingId={data.id}
                  balance={data.walletBalance}
                  onCompleted={handleCompleted}
                />
              </>
            ) : null}
          </DataState>
        ) : (
          <Card>
            <CardContent>
              <EmptyState
                icon={<HandCoins />}
                title="Nie znaleziono zbiórki"
                description="Zbiórka nie istnieje albo nie masz do niej dostępu."
              />
            </CardContent>
          </Card>
        )}
      </div>
      <Toaster />
    </AppShell>
  )
}

export { FundraisingDetailsPage }
