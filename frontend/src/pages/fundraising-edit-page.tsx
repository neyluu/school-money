import * as React from "react"
import { useNavigate, useParams } from "react-router"
import { HandCoins } from "lucide-react"
import { DataState } from "@/components/data-state"
import { EmptyState } from "@/components/empty-state"
import { FundraisingForm } from "@/components/fundraising-form"
import type { FundraisingFormValues } from "@/components/fundraising-form"
import { AppShell } from "@/components/layout/app-shell"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { toast, Toaster } from "@/components/ui/toast"
import { useAsyncData } from "@/hooks/use-async-data"
import { useFundraisingLogo } from "@/hooks/use-fundraising-logo"
import { ApiError } from "@/lib/api-client"
import { getClasses } from "@/lib/classes"
import type { ClassSummary } from "@/lib/classes"
import { describeError } from "@/lib/error-messages"
import type { FundraisingListItem } from "@/lib/fundraising"
import {
  deleteFundraisingLogo,
  getFundraising,
  mapFundraisingErrors,
  updateFundraising,
  uploadFundraisingLogo,
} from "@/lib/fundraising-management"
import type { FundraisingFieldErrors } from "@/lib/fundraising-management"

function FundraisingEditForm({
  fundraising,
  classes,
}: {
  fundraising: FundraisingListItem
  classes: ClassSummary[]
}) {
  const navigate = useNavigate()
  const [logoKey, setLogoKey] = React.useState(0)
  const logoUrl = useFundraisingLogo(fundraising.id, logoKey)
  const detailsPath = `/dashboard/fundraisers/${fundraising.id}`

  async function handleSubmit(
    values: FundraisingFormValues
  ): Promise<FundraisingFieldErrors | undefined> {
    const { logo, ...input } = values

    try {
      await updateFundraising(fundraising.id, input)
      if (logo != null) {
        try {
          await uploadFundraisingLogo(fundraising.id, logo)
        } catch {
          toast.add({
            title: "Nie udało się dodać logo. Spróbuj ponownie.",
            type: "error",
          })
        }
      }
      toast.add({
        title: "Zbiórka została zaktualizowana.",
        type: "success",
      })
      navigate(detailsPath)
      return undefined
    } catch (submitError) {
      if (submitError instanceof ApiError && submitError.status === 401) {
        navigate("/login", { replace: true })
        return undefined
      }
      const mapped = mapFundraisingErrors(submitError)
      if (mapped != null) {
        return mapped
      }
      toast.add({
        title: describeError(submitError),
        type: "error",
      })
      return undefined
    }
  }

  async function handleRemoveLogo() {
    try {
      await deleteFundraisingLogo(fundraising.id)
      setLogoKey((current) => current + 1)
      toast.add({
        title: "Logo zostało usunięte.",
        type: "success",
      })
    } catch (removeError) {
      toast.add({
        title: describeError(removeError),
        type: "error",
      })
    }
  }

  return (
    <FundraisingForm
      title="Edytuj zbiórkę"
      subtitleSuffix="edycja zbiórki"
      submitLabel="Zapisz zmiany"
      classes={classes.filter((item) => item.id === fundraising.classId)}
      lockClass
      initial={{
        classId: fundraising.classId,
        name: fundraising.name,
        description: fundraising.description,
        endDate: fundraising.endDate,
        amount: fundraising.amountPerChild,
      }}
      logoSlot={
        logoUrl != null ? (
          <div className="flex items-center gap-3">
            <img
              src={logoUrl}
              alt=""
              className="size-16 rounded-lg object-cover"
            />
            <Button type="button" variant="outline" onClick={handleRemoveLogo}>
              Usuń logo
            </Button>
          </div>
        ) : null
      }
      onSubmit={handleSubmit}
      onCancel={() => navigate(detailsPath)}
    />
  )
}

function FundraisingEditPage() {
  const params = useParams()
  const fundraisingId = Number(params.fundraisingId)

  const load = React.useCallback(
    () => Promise.all([getFundraising(fundraisingId), getClasses()]),
    [fundraisingId]
  )
  const { data, error, isLoading, reload } = useAsyncData(load)

  const isUnavailable =
    error instanceof ApiError && (error.status === 404 || error.status === 403)
  const canEdit =
    data != null && data[0].isOwner && data[0].status === "ACTIVE"

  return (
    <AppShell activeId="fundraisers">
      {Number.isInteger(fundraisingId) && !isUnavailable ? (
        <DataState
          isLoading={isLoading}
          hasError={error != null}
          isEmpty={data != null && !canEdit}
          onRetry={reload}
          emptyState={
            <Card>
              <CardContent>
                <EmptyState
                  icon={<HandCoins />}
                  title="Nie można edytować tej zbiórki"
                  description="Edytować może tylko właściciel klasy, dopóki zbiórka jest aktywna."
                />
              </CardContent>
            </Card>
          }
        >
          {data != null ? (
            <FundraisingEditForm fundraising={data[0]} classes={data[1]} />
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

export { FundraisingEditPage }
