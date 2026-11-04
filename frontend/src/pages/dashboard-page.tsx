import * as React from "react"
import { Link, useNavigate } from "react-router"
import { ArrowUpRight, CreditCard, LayoutDashboard, Plus, UsersRound } from "lucide-react"
import { CashFlowChart } from "@/components/cash-flow-chart"
import { DashboardAccountsCard } from "@/components/dashboard-accounts-card"
import { DashboardChildren } from "@/components/dashboard-children"
import type { DashboardChild } from "@/components/dashboard-children"
import { DashboardDeadlinesCard } from "@/components/dashboard-deadlines-card"
import { EmptyState } from "@/components/empty-state"
import { KpiCards } from "@/components/kpi-cards"
import { AppShell } from "@/components/layout/app-shell"
import { MyPaymentsCard } from "@/components/my-payments-card"
import { PayDialog } from "@/components/pay-dialog"
import { RecentTransactions } from "@/components/recent-transactions"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Toaster } from "@/components/ui/toast"
import { ApiError } from "@/lib/api-client"
import { logout, me } from "@/lib/auth"
import type { AuthUser } from "@/lib/auth"
import { getClasses } from "@/lib/classes"
import type { ClassSummary } from "@/lib/classes"
import { getDues, getOwnedFundraisings } from "@/lib/dashboard"
import type { Due, OwnedFundraising } from "@/lib/dashboard"
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

function describeParent(childrenCount: number): string {
  if (childrenCount === 0) return "Rodzic"
  return childrenCount === 1 ? "Rodzic · 1 dziecko" : `Rodzic · ${childrenCount} dzieci`
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

  return (
    <AppShell activeId="dashboard">
      <div className="flex flex-col gap-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex flex-col gap-1">
            {data != null ? (
              <>
                <p className="text-sm text-muted-foreground">
                  {isTreasurer
                    ? capitalize(dateFormatter.format(new Date()))
                    : describeParent(children.length)}
                </p>
                <h1 className="text-2xl font-bold">
                  {isTreasurer ? "Dzień dobry" : "Cześć"}, {data.user.firstName}
                </h1>
              </>
            ) : (
              <h1 className="text-2xl font-bold">Pulpit</h1>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            {isTreasurer ? (
              <Button render={<Link to="/dashboard/fundraisers/new" />}>
                <Plus />
                Nowa zbiórka
              </Button>
            ) : null}
            {data != null ? (
              <>
                <Button
                  variant="outline"
                  render={<Link to="/dashboard/payments" />}
                >
                  <CreditCard />
                  Wpłać
                </Button>
                {isTreasurer ? (
                  <Button
                    variant="outline"
                    render={<Link to="/dashboard/payments" />}
                  >
                    <ArrowUpRight />
                    Wypłać
                  </Button>
                ) : null}
              </>
            ) : null}
            <Button variant="outline" onClick={logout}>
              Wyloguj się
            </Button>
          </div>
        </div>
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
                <div className="grid gap-4 lg:grid-cols-[2fr_1fr] lg:items-start">
                  <CashFlowChart daily={data.summary.daily} />
                  <div className="flex flex-col gap-4">
                    <DashboardAccountsCard
                      wallet={data.wallet}
                      fundraisings={data.ownedFundraisings}
                      canCreate
                    />
                    <DashboardDeadlinesCard fundraisings={data.ownedFundraisings} />
                  </div>
                </div>
              </>
            ) : null}
            {children.length > 0 ? (
              <DashboardChildren
                students={children}
                dues={data.dues}
                onPay={setPayTarget}
              />
            ) : null}
            {!isTreasurer && children.length === 0 ? (
              <Card>
                <CardContent>
                  <EmptyState
                    icon={<UsersRound />}
                    title="Brak dzieci w klasie"
                    description="Gdy skarbnik zaakceptuje Twoje dziecko w klasie, zobaczysz tutaj jego opłaty."
                  />
                </CardContent>
              </Card>
            ) : null}
            {isTreasurer ? (
              <RecentTransactions transactions={data.transactions} />
            ) : (
              <MyPaymentsCard contributions={data.contributions} />
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
                description="Sprawdź połączenie i spróbuj ponownie."
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
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Skeleton className="h-28 rounded-xl" />
        <Skeleton className="h-28 rounded-xl" />
        <Skeleton className="h-28 rounded-xl" />
        <Skeleton className="h-28 rounded-xl" />
      </div>
      <Skeleton className="h-80 rounded-xl" />
      <Skeleton className="h-72 rounded-xl" />
    </div>
  )
}

export { DashboardPage }
