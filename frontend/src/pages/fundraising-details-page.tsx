import * as React from "react"
import { useParams } from "react-router"
import { HandCoins } from "lucide-react"
import { DataState } from "@/components/data-state"
import { EmptyState } from "@/components/empty-state"
import { FundraisingInvoicesTab } from "@/components/fundraising-invoices-tab"
import { FundraisingPaymentsTab } from "@/components/fundraising-payments-tab"
import { FundraisingSummaryCard } from "@/components/fundraising-summary-card"
import { FundraisingWithdrawalsTab } from "@/components/fundraising-withdrawals-tab"
import { AppShell } from "@/components/layout/app-shell"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Toaster } from "@/components/ui/toast"
import { useAsyncData } from "@/hooks/use-async-data"
import { ApiError } from "@/lib/api-client"
import { getFundraisingSummary } from "@/lib/fundraising"

function FundraisingDetailsPage() {
  const params = useParams()
  const fundraisingId = Number(params.fundraisingId)

  const load = React.useCallback(
    () => getFundraisingSummary(fundraisingId),
    [fundraisingId]
  )
  const { data, error, isLoading, reload } = useAsyncData(load)

  const isUnavailable =
    error instanceof ApiError && (error.status === 404 || error.status === 403)

  return (
    <AppShell activeId="fundraisers">
      <div className="flex flex-col gap-6">
        {Number.isInteger(fundraisingId) && !isUnavailable ? (
          <DataState
            isLoading={isLoading}
            hasError={error != null}
            isEmpty={data == null}
            onRetry={reload}
            emptyState={null}
          >
            {data != null ? (
              <>
                <FundraisingSummaryCard summary={data} />
                <Card>
                  <CardContent>
                    <Tabs defaultValue="payments">
                      <TabsList>
                        <TabsTrigger value="payments">Wpłaty</TabsTrigger>
                        <TabsTrigger value="withdrawals">Wypłaty</TabsTrigger>
                        <TabsTrigger value="invoices">Faktury</TabsTrigger>
                      </TabsList>
                      <TabsContent value="payments" className="pt-4">
                        <FundraisingPaymentsTab fundraisingId={data.id} />
                      </TabsContent>
                      <TabsContent value="withdrawals" className="pt-4">
                        <FundraisingWithdrawalsTab fundraisingId={data.id} />
                      </TabsContent>
                      <TabsContent value="invoices" className="pt-4">
                        <FundraisingInvoicesTab fundraisingId={data.id} />
                      </TabsContent>
                    </Tabs>
                  </CardContent>
                </Card>
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
