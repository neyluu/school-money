import * as React from "react"
import { Link, useNavigate } from "react-router"
import { LayoutDashboard, Plus, UsersRound } from "lucide-react"
import { CashFlowChart } from "@/components/cash-flow-chart"
import { DashboardAccountsCard } from "@/components/dashboard-accounts-card"
import { DashboardDeadlinesCard } from "@/components/dashboard-deadlines-card"
import { DashboardDues } from "@/components/dashboard-dues"
import type { DashboardChild } from "@/components/dashboard-dues"
import { EmptyState } from "@/components/empty-state"
import { KpiCards } from "@/components/kpi-cards"
import { AppShell } from "@/components/layout/app-shell"
import { MyPaymentsCard } from "@/components/my-payments-card"
import { PageHeader } from "@/components/page-header"
import { PayDialog } from "@/components/pay-dialog"
import { RecentTransactions } from "@/components/recent-transactions"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Toaster } from "@/components/ui/toast"
import { ApiError } from "@/lib/api-client"
import { me } from "@/lib/auth"
import type { AuthUser } from "@/lib/auth"
import { getClasses } from "@/lib/classes"
import type { ClassSummary } from "@/lib/classes"
import { getDues, getOwnedFundraisings } from "@/lib/dashboard"
import type { Due, OwnedFundraising } from "@/lib/dashboard"
import { formatMoney } from "@/lib/money"
import {
  getContributions,
  getSummary,
  getTransactions,
  getWallet,
} from "@/lib/wallet"
import type {
  Transaction,
  Wallet,
  WalletContribution,
  WalletSummary,
} from "@/lib/wallet"

const SUMMARY_DAYS = 30
const RECENT_TRANSACTIONS_LIMIT = 50
const MY_PAYMENTS_LIMIT = 10

const dateFormatter = new Intl.DateTimeFormat("pl-PL", {
  weekday: "long",
  day: "numeric",
  month: "long",
  year: "numeric",
})

type DashboardData = {
  user: AuthUser
  wallet: Wallet
  summary: WalletSummary
  transactions: Transaction[]
  classes: ClassSummary[]
  dues: Due[]
  ownedFundraisings: OwnedFundraising[]
  contributions: WalletContribution[]
}

function collectChildren(classes: ClassSummary[]): DashboardChild[] {
  const children = new Map<number, DashboardChild>()

  for (const schoolClass of classes) {
    for (const membership of schoolClass.myChildren) {
      if (membership.status === "ACCEPTED") {
        children.set(membership.childId, {
          id: membership.childId,
          firstName: membership.childFirstName,
          lastName: membership.childLastName,
        })
      }
    }
  }

  return [...children.values()]
}

function calculateAwaitedAmount(fundraisings: OwnedFundraising[]): number {
  const cents = fundraisings
    .filter((fundraising) => fundraising.status === "ACTIVE" && !fundraising.isBlocked)
    .reduce((sum, fundraising) => {
      const expected = Math.round(fundraising.totalChildren * fundraising.amountPerChild * 100)
      const collected = Math.round(fundraising.collectedAmount * 100)
      return sum + Math.max(0, expected - collected)
    }, 0)

  return cents / 100
}

function capitalize(value: string): string {
  return value.charAt(0).toUpperCase() + value.slice(1)
}

function DashboardPage() {
  const navigate = useNavigate()
  const [data, setData] = React.useState<DashboardData | null>(null)
  const [isLoading, setIsLoading] = React.useState(true)
  const [loadFailed, setLoadFailed] = React.useState(false)
  const [reloadKey, setReloadKey] = React.useState(0)
  const [payTarget, setPayTarget] = React.useState<Due | null>(null)

  React.useEffect(() => {
    let ignored = false
    Promise.all([
      me(),
      getWallet(),
      getSummary(SUMMARY_DAYS),
      getTransactions(0, RECENT_TRANSACTIONS_LIMIT),
      getClasses(),
      getDues(),
      getOwnedFundraisings(),
      getContributions(0, MY_PAYMENTS_LIMIT),
    ])
      .then(
        ([
          user,
          wallet,
          summary,
          transactions,
          classes,
          dues,
          ownedFundraisings,
          contributions,
        ]) => {
          if (!ignored) {
            setData({
              user,
              wallet,
              summary,
              transactions,
              classes,
              dues,
              ownedFundraisings,
              contributions,
            })
            setLoadFailed(false)
            setIsLoading(false)
          }
        }
      )
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

  function reload() {
    setLoadFailed(false)
    setIsLoading(true)
    setReloadKey((current) => current + 1)
  }

  const isTreasurer = data?.classes.some((item) => item.isOwner) ?? false
  const children = data != null ? collectChildren(data.classes) : []

  function renderHeader(loaded: DashboardData) {
    if (isTreasurer) {
      return (
        <PageHeader
          eyebrow={capitalize(dateFormatter.format(new Date()))}
          title={`Dzień dobry, ${loaded.user.firstName}`}
          actions={
            <>
              <Button variant="outline" render={<Link to="/dashboard/payments" />}>
                Mój rachunek
              </Button>
              <Button render={<Link to="/dashboard/fundraisers/new" />}>
                <Plus />
                Nowa zbiórka
              </Button>
            </>
          }
        />
      )
    }

    return (
      <PageHeader
        title={`Cześć, ${loaded.user.firstName}`}
        description={`Na rachunku masz ${formatMoney(loaded.wallet.balance)}.`}
        actions={
          <Button variant="outline" render={<Link to="/dashboard/payments" />}>
            Doładuj rachunek
          </Button>
        }
      />
    )
  }

  return (
    <AppShell activeId="dashboard">
      <div className="flex flex-col gap-6">
        {data == null ? <PageHeader title="Pulpit" /> : renderHeader(data)}
        {isLoading ? (
          <DashboardSkeleton />
        ) : data != null ? (
          <>
            {isTreasurer ? (
              <>
                <KpiCards
                  balance={data.wallet.balance}
                  income={data.summary.income}
                  expense={data.summary.expense}
                  days={data.summary.days}
                  unpaid={calculateAwaitedAmount(data.ownedFundraisings)}
                />
                <div className="grid gap-6 lg:grid-cols-[2fr_1fr] lg:items-start">
                  <div className="flex min-w-0 flex-col gap-6">
                    {children.length > 0 ? (
                      <DashboardDues
                        students={children}
                        dues={data.dues}
                        onPay={setPayTarget}
                      />
                    ) : null}
                    <CashFlowChart daily={data.summary.daily} />
                    <RecentTransactions transactions={data.transactions} />
                  </div>
                  <div className="flex min-w-0 flex-col gap-6">
                    <DashboardAccountsCard
                      wallet={data.wallet}
                      fundraisings={data.ownedFundraisings}
                      canCreate
                    />
                    <DashboardDeadlinesCard fundraisings={data.ownedFundraisings} />
                  </div>
                </div>
              </>
            ) : children.length > 0 ? (
              <>
                <DashboardDues
                  students={children}
                  dues={data.dues}
                  onPay={setPayTarget}
                />
                <MyPaymentsCard contributions={data.contributions} />
              </>
            ) : (
              <Card>
                <CardContent>
                  <EmptyState
                    icon={<UsersRound />}
                    title="Twoje dziecko nie jest jeszcze w klasie"
                    description="Gdy skarbnik zatwierdzi zgłoszenie, opłaty pojawią się tutaj."
                  />
                </CardContent>
              </Card>
            )}
            {payTarget != null ? (
              <PayDialog
                open
                onOpenChange={(open) => {
                  if (!open) {
                    setPayTarget(null)
                  }
                }}
                fundraisingId={payTarget.fundraisingId}
                fundraisingName={payTarget.fundraisingName}
                amountPerChild={payTarget.amountPerChild}
                preselect={payTarget.child.id}
                onCompleted={reload}
              />
            ) : null}
          </>
        ) : loadFailed ? (
          <Card>
            <CardContent>
              <EmptyState
                icon={<LayoutDashboard />}
                title="Nie udało się wczytać pulpitu"
                description="Sprawdź połączenie i spróbuj jeszcze raz."
                action={<Button onClick={reload}>Spróbuj ponownie</Button>}
              />
            </CardContent>
          </Card>
        ) : null}
      </div>
      <Toaster />
    </AppShell>
  )
}

function DashboardSkeleton() {
  return (
    <div className="flex flex-col gap-6">
      <Skeleton className="h-24 rounded-xl" />
      <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
        <div className="flex flex-col gap-6">
          <Skeleton className="h-72 rounded-xl" />
          <Skeleton className="h-64 rounded-xl" />
        </div>
        <div className="flex flex-col gap-6">
          <Skeleton className="h-52 rounded-xl" />
          <Skeleton className="h-40 rounded-xl" />
        </div>
      </div>
    </div>
  )
}

export { DashboardPage }
