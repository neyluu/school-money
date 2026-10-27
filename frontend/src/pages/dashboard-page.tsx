import * as React from "react"
import { useNavigate } from "react-router"
import { LayoutDashboard } from "lucide-react"
import { CashFlowChart } from "@/components/cash-flow-chart"
import { EmptyState } from "@/components/empty-state"
import { KpiCards } from "@/components/kpi-cards"
import { AppShell } from "@/components/layout/app-shell"
import { RecentTransactions } from "@/components/recent-transactions"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Toaster } from "@/components/ui/toast"
import { ApiError } from "@/lib/api-client"
import { logout, me } from "@/lib/auth"
import type { AuthUser } from "@/lib/auth"
import { getSummary, getTransactions, getWallet } from "@/lib/wallet"
import type { Transaction, Wallet, WalletSummary } from "@/lib/wallet"

const SUMMARY_DAYS = 30
const RECENT_TRANSACTIONS_LIMIT = 50

type DashboardData = {
  user: AuthUser
  wallet: Wallet
  summary: WalletSummary
  transactions: Transaction[]
}

function DashboardPage() {
  const navigate = useNavigate()
  const [data, setData] = React.useState<DashboardData | null>(null)
  const [isLoading, setIsLoading] = React.useState(true)
  const [loadFailed, setLoadFailed] = React.useState(false)
  const [reloadKey, setReloadKey] = React.useState(0)

  React.useEffect(() => {
    let ignored = false
    Promise.all([
      me(),
      getWallet(),
      getSummary(SUMMARY_DAYS),
      getTransactions(0, RECENT_TRANSACTIONS_LIMIT),
    ])
      .then(([user, wallet, summary, transactions]) => {
        if (!ignored) {
          setData({ user, wallet, summary, transactions })
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

  function reload() {
    setLoadFailed(false)
    setIsLoading(true)
    setReloadKey((current) => current + 1)
  }

  return (
    <AppShell activeId="dashboard">
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between gap-2">
          <div className="flex flex-col gap-1">
            <h1 className="text-2xl font-bold">Pulpit</h1>
            {data != null ? (
              <p className="text-sm text-muted-foreground">
                Cześć, {data.user.firstName}!
              </p>
            ) : null}
          </div>
          <Button variant="outline" onClick={logout}>
            Wyloguj się
          </Button>
        </div>
        {isLoading ? (
          <DashboardSkeleton />
        ) : data != null ? (
          <>
            <KpiCards
              balance={data.wallet.balance}
              income={data.summary.income}
              expense={data.summary.expense}
              days={data.summary.days}
            />
            <CashFlowChart daily={data.summary.daily} />
            <RecentTransactions transactions={data.transactions} />
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
