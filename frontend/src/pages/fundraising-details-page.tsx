import * as React from "react"
import { Link, useParams } from "react-router"
import { HandCoins, Pencil, Plus, UsersRound } from "lucide-react"
import { AddInvoiceDialog } from "@/components/add-invoice-dialog"
import { CloseFundraisingDialog } from "@/components/close-fundraising-dialog"
import { DataState } from "@/components/data-state"
import { EmptyState } from "@/components/empty-state"
import { FundraisingAccountCard } from "@/components/fundraising-account-card"
import { FundraisingHeader } from "@/components/fundraising-header"
import { FundraisingInvoicesTab } from "@/components/fundraising-invoices-tab"
import { FundraisingMyChildrenCard } from "@/components/fundraising-my-children-card"
import { FundraisingPaymentsTab } from "@/components/fundraising-payments-tab"
import { FundraisingProgressCard } from "@/components/fundraising-progress-card"
import { FundraisingStats } from "@/components/fundraising-stats"
import { FundraisingWithdrawalsTab } from "@/components/fundraising-withdrawals-tab"
import { FundraisingWithdrawDialog } from "@/components/fundraising-withdraw-dialog"
import { AppShell } from "@/components/layout/app-shell"
import { PayDialog } from "@/components/pay-dialog"
import type { PayPreselect } from "@/components/pay-dialog"
import { ReplenishDialog } from "@/components/replenish-dialog"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Toaster } from "@/components/ui/toast"
import { useAsyncData } from "@/hooks/use-async-data"
import { ApiError } from "@/lib/api-client"
import {
  getFundraisingChildren,
  getFundraisingSummary,
  getFundraisingWallet,
} from "@/lib/fundraising"
import type { FundraisingChild, FundraisingSummary } from "@/lib/fundraising"
import type { Wallet } from "@/lib/wallet"

type ActiveDialog = "pay" | "withdraw" | "invoice" | "close" | "replenish" | null

function FundraisingDetailsContent({
  summary,
  students,
  wallet,
  refreshToken,
  onCompleted,
}: {
  summary: FundraisingSummary
  students: FundraisingChild[]
  wallet: Wallet
  refreshToken: number
  onCompleted: () => void
}) {
  const [activeDialog, setActiveDialog] = React.useState<ActiveDialog>(null)
  const [payPreselect, setPayPreselect] = React.useState<PayPreselect | undefined>(
    undefined
  )

  const canPay = summary.acceptsPayments
  const canPayForOthers =
    canPay && students.some((student) => !student.isMine && !student.isPaid)
  const canManage =
    summary.isOwner && summary.status === "ACTIVE" && !summary.isBlocked
  const canReplenish = canManage && summary.withdrawnAmount > 0
  const waitingStudents = students.filter((student) => !student.isPaid)

  function openPay(preselect?: PayPreselect) {
    setPayPreselect(preselect)
    setActiveDialog("pay")
  }

  function handleDialogChange(dialog: Exclude<ActiveDialog, null>) {
    return (open: boolean) => setActiveDialog(open ? dialog : null)
  }

  const actions =
    canPay || canManage ? (
      <>
        {canManage ? (
          <>
            <Button
              variant="outline"
              render={<Link to={`/dashboard/fundraisers/${summary.id}/edit`} />}
            >
              <Pencil />
              Edytuj
            </Button>
            <Button variant="outline" onClick={() => setActiveDialog("withdraw")}>
              Wypłać środki
            </Button>
            <Button variant="outline" onClick={() => setActiveDialog("close")}>
              Zamknij zbiórkę
            </Button>
          </>
        ) : null}
        {canPayForOthers ? (
          <Button variant="outline" onClick={() => openPay("others")}>
            <UsersRound />
            Zapłać za inne dziecko
          </Button>
        ) : null}
        {canPay ? <Button onClick={() => openPay()}>Zapłać</Button> : null}
      </>
    ) : undefined

  return (
    <div className="flex flex-col gap-6">
      <FundraisingHeader summary={summary} actions={actions} />
      {summary.isOwner ? <FundraisingStats summary={summary} /> : null}
      <div className="grid gap-4 lg:grid-cols-[2fr_1fr] lg:items-start">
        <div className="flex flex-col gap-4">
          <FundraisingMyChildrenCard
            students={students}
            amountPerChild={summary.amountPerChild}
            canPay={canPay}
            onPay={(childId) => openPay(childId)}
          />
          {summary.isOwner ? (
            <Card>
              <CardHeader>
                <CardTitle>Kto, za kogo, kiedy</CardTitle>
              </CardHeader>
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
                      fundraisingId={summary.id}
                      amountPerChild={summary.amountPerChild}
                      waitingStudents={waitingStudents}
                    />
                  </TabsContent>
                  <TabsContent value="withdrawals" className="pt-4">
                    <FundraisingWithdrawalsTab
                      key={refreshToken}
                      fundraisingId={summary.id}
                    />
                  </TabsContent>
                  <TabsContent value="invoices" className="pt-4">
                    <FundraisingInvoicesTab
                      key={refreshToken}
                      fundraisingId={summary.id}
                      onAdd={
                        summary.isBlocked
                          ? undefined
                          : () => setActiveDialog("invoice")
                      }
                    />
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>Kto, za kogo, kiedy · podgląd</CardTitle>
              </CardHeader>
              <CardContent>
                <FundraisingPaymentsTab
                  key={refreshToken}
                  fundraisingId={summary.id}
                  amountPerChild={summary.amountPerChild}
                  waitingStudents={waitingStudents}
                />
              </CardContent>
            </Card>
          )}
        </div>
        <div className="flex flex-col gap-4">
          <FundraisingProgressCard
            title={summary.isOwner ? "Postęp" : "Postęp klasy"}
            paidChildren={summary.paidChildren}
            totalChildren={summary.totalChildren}
            action={
              canReplenish ? (
                <Button
                  variant="outline"
                  onClick={() => setActiveDialog("replenish")}
                >
                  <Plus />
                  Wpłać z powrotem po wypłacie
                </Button>
              ) : undefined
            }
          />
          {summary.isOwner ? (
            <FundraisingAccountCard wallet={wallet} />
          ) : (
            <>
              <Card>
                <CardHeader>
                  <CardTitle>Wypłaty</CardTitle>
                </CardHeader>
                <CardContent>
                  <FundraisingWithdrawalsTab
                    key={refreshToken}
                    fundraisingId={summary.id}
                  />
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Faktury</CardTitle>
                </CardHeader>
                <CardContent>
                  <FundraisingInvoicesTab
                    key={refreshToken}
                    fundraisingId={summary.id}
                  />
                </CardContent>
              </Card>
            </>
          )}
        </div>
      </div>
      <PayDialog
        open={activeDialog === "pay"}
        onOpenChange={handleDialogChange("pay")}
        fundraisingId={summary.id}
        fundraisingName={summary.name}
        amountPerChild={summary.amountPerChild}
        preselect={payPreselect}
        onCompleted={onCompleted}
      />
      <FundraisingWithdrawDialog
        open={activeDialog === "withdraw"}
        onOpenChange={handleDialogChange("withdraw")}
        fundraisingId={summary.id}
        balance={summary.walletBalance}
        onCompleted={onCompleted}
      />
      <AddInvoiceDialog
        open={activeDialog === "invoice"}
        onOpenChange={handleDialogChange("invoice")}
        fundraisingId={summary.id}
        onCompleted={onCompleted}
      />
      <CloseFundraisingDialog
        open={activeDialog === "close"}
        onOpenChange={handleDialogChange("close")}
        fundraisingId={summary.id}
        walletBalance={summary.walletBalance}
        collectedAmount={summary.collectedAmount}
        onReplenish={() => setActiveDialog("replenish")}
        onCompleted={onCompleted}
      />
      <ReplenishDialog
        open={activeDialog === "replenish"}
        onOpenChange={handleDialogChange("replenish")}
        fundraisingId={summary.id}
        outstanding={summary.withdrawnAmount}
        onCompleted={onCompleted}
      />
    </div>
  )
}

function FundraisingDetailsPage() {
  const params = useParams()
  const fundraisingId = Number(params.fundraisingId)
  const [refreshToken, setRefreshToken] = React.useState(0)

  const load = React.useCallback(
    () =>
      Promise.all([
        getFundraisingSummary(fundraisingId),
        getFundraisingChildren(fundraisingId),
        getFundraisingWallet(fundraisingId),
      ]),
    [fundraisingId]
  )
  const { data, error, isLoading, reload } = useAsyncData(load)

  const isUnavailable =
    error instanceof ApiError && (error.status === 404 || error.status === 403)

  function handleCompleted() {
    reload()
    setRefreshToken((current) => current + 1)
  }

  return (
    <AppShell activeId="fundraisers">
      {Number.isInteger(fundraisingId) && !isUnavailable ? (
        <DataState
          isLoading={isLoading && data == null}
          hasError={error != null}
          isEmpty={data == null}
          onRetry={reload}
          emptyState={null}
        >
          {data != null ? (
            <FundraisingDetailsContent
              summary={data[0]}
              students={data[1]}
              wallet={data[2]}
              refreshToken={refreshToken}
              onCompleted={handleCompleted}
            />
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
      <Toaster />
    </AppShell>
  )
}

export { FundraisingDetailsPage }
