import * as React from "react"
import { useNavigate } from "react-router"
import { AppShell } from "@/components/layout/app-shell"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { toast, Toaster } from "@/components/ui/toast"
import { ApiError } from "@/lib/api-client"
import { logout, me } from "@/lib/auth"
import type { AuthUser } from "@/lib/auth"

function DashboardPage() {
  const navigate = useNavigate()
  const [user, setUser] = React.useState<AuthUser | null>(null)
  const [isLoading, setIsLoading] = React.useState(true)

  React.useEffect(() => {
    let ignored = false
    me()
      .then((currentUser) => {
        if (!ignored) {
          setUser(currentUser)
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
        setIsLoading(false)
        toast.add({
          title: "Nie udało się wczytać profilu.",
          type: "error",
        })
      })
    return () => {
      ignored = true
    }
  }, [navigate])

  return (
    <AppShell activeId="dashboard">
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between gap-2">
          <h1 className="text-2xl font-bold">Pulpit</h1>
          <Button variant="outline" onClick={logout}>
            Wyloguj się
          </Button>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Mój profil</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex flex-col gap-2">
                <Skeleton className="h-4 w-48" />
                <Skeleton className="h-4 w-64" />
                <Skeleton className="h-4 w-32" />
              </div>
            ) : user != null ? (
              <dl className="flex flex-col gap-2 text-sm">
                <div className="flex gap-2">
                  <dt className="text-muted-foreground">Imię i nazwisko:</dt>
                  <dd className="font-medium">
                    {user.firstName} {user.lastName}
                  </dd>
                </div>
                <div className="flex gap-2">
                  <dt className="text-muted-foreground">E-mail:</dt>
                  <dd className="font-medium">{user.email}</dd>
                </div>
              </dl>
            ) : (
              <p className="text-sm text-muted-foreground">
                Brak danych profilu.
              </p>
            )}
          </CardContent>
        </Card>
      </div>
      <Toaster />
    </AppShell>
  )
}

export { DashboardPage }
