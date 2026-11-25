import * as React from "react"
import { useNavigate, useParams } from "react-router"
import { HandCoins, MoreHorizontal, Plus, UsersRound } from "lucide-react"
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
import { Section } from "@/components/section"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
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
  const navigate = useNavigate()
  const [activeDialog, setActiveDialog] = React.useState<ActiveDialog>(null)
  const [payPreselect, setPayPreselect] = React.useState<PayPreselect | undefined>(
    undefined
  )

  const isBlocked = summary.isBlocked || summary.isClassBlocked
  const canPay = summary.acceptsPayments
  const canPayForOthers =
    canPay && students.some((student) => !student.isMine && !student.isPaid)
  const canManage =
    summary.isOwner && summary.status === "ACTIVE" && !isBlocked
  const canReplenish = canManage && summary.withdrawnAmount > 0
  const canAddInvoice = summary.isOwner && !isBlocked
  const waitingStudents = students.filter((student) => !student.isPaid)

  function openPay(preselect?: PayPreselect) {
    setPayPreselect(preselect)
    setActiveDialog("pay")
  }

  function handleDialogChange(dialog: Exclude<ActiveDialog, null>) {
    return (open: boolean) => setActiveDialog(open ? dialog : null)
  }

  const menu =
    canManage || canAddInvoice ? (
      <DropdownMenu>
        <DropdownMenuTrigger render={<Button variant="outline" />}>
          <MoreHorizontal />
          Więcej
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="min-w-56">
          {canManage ? (
            <DropdownMenuItem
              onClick={() =>
                navigate(`/dashboard/fundraisers/${summary.id}/edit`)
              }
            >
              Edytuj zbiórkę
            </DropdownMenuItem>
          ) : null}
          {canAddInvoice ? (
            <DropdownMenuItem onClick={() => setActiveDialog("invoice")}>
              Dodaj fakturę
            </DropdownMenuItem>
          ) : null}
          {canReplenish ? (
            <DropdownMenuItem onClick={() => setActiveDialog("replenish")}>
              Wpłać z powrotem po wypłacie
            </DropdownMenuItem>
          ) : null}
          {canManage ? (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                variant="destructive"
                onClick={() => setActiveDialog("close")}
              >
                Zamknij zbiórkę
              </DropdownMenuItem>
            </>
          ) : null}
        </DropdownMenuContent>
      </DropdownMenu>
    ) : null

  const actions = (
    <>
      {menu}
      {canManage ? (
        <Button variant="outline" onClick={() => setActiveDialog("withdraw")}>
          Wypłać środki
        </Button>
      ) : null}
      {canPayForOthers ? (
        <Button variant="outline" onClick={() => openPay("others")}>
          <UsersRound />
          Zapłać za inne dziecko
        </Button>
      ) : null}
      {canPay ? <Button onClick={() => openPay()}>Zapłać</Button> : null}
    </>
  )

  return (
    <div className="flex flex-col gap-6">
      <FundraisingHeader summary={summary} actions={actions} />
      {isBlocked ? (
        <div className="rounded-lg border border-danger/30 bg-danger/10 px-4 py-3 text-sm text-danger">
          {summary.isBlocked
            ? "Ta zbiórka została zablokowana przez administratora. Wpłaty, wypłaty i zwroty są wstrzymane."
            : "Zbiórka jest zablokowana, ponieważ jej klasa została zablokowana przez administratora."}
        </div>
      ) : null}
      {summary.isOwner ? <FundraisingStats summary={summary} /> : null}
      <div className="grid gap-6 lg:grid-cols-[2fr_1fr] lg:items-start">
        <div className="flex min-w-0 flex-col gap-6">
          <FundraisingMyChildrenCard
            students={students}
            amountPerChild={summary.amountPerChild}
            canPay={canPay}
            onPay={(childId) => openPay(childId)}
          />
          <Section
            title="Historia zbiórki"
            description="Kto, za kogo i kiedy wpłacił, co zostało wypłacone i na co."
          >
            <Tabs defaultValue="payments">
              <TabsList>
                <TabsTrigger value="payments" className="cursor-pointer">Wpłaty</TabsTrigger>
                <TabsTrigger value="withdrawals" className="cursor-pointer">Wypłaty i zwroty</TabsTrigger>
                <TabsTrigger value="invoices" className="cursor-pointer">Faktury</TabsTrigger>
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
                    canAddInvoice ? () => setActiveDialog("invoice") : undefined
                  }
                />
              </TabsContent>
            </Tabs>
          </Section>
        </div>
        <div className="flex min-w-0 flex-col gap-6">
          <FundraisingProgressCard
            title="Postęp klasy"
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
          {summary.isOwner ? <FundraisingAccountCard wallet={wallet} /> : null}
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
              title="Nie ma takiej zbiórki"
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
