import { useNavigate } from "react-router"
import { UsersRound } from "lucide-react"
import { DataState } from "@/components/data-state"
import { EmptyState } from "@/components/empty-state"
import { FundraisingForm } from "@/components/fundraising-form"
import type { FundraisingFormValues } from "@/components/fundraising-form"
import { AppShell } from "@/components/layout/app-shell"
import { toast, Toaster } from "@/components/ui/toast"
import { useAsyncData } from "@/hooks/use-async-data"
import { ApiError } from "@/lib/api-client"
import { getClasses } from "@/lib/classes"
import { describeError } from "@/lib/error-messages"
import {
  createFundraising,
  mapFundraisingErrors,
  uploadFundraisingLogo,
} from "@/lib/fundraising-management"
import type { FundraisingFieldErrors } from "@/lib/fundraising-management"

const LIST_PATH = "/dashboard/fundraisers"

function FundraisingNewPage() {
  const navigate = useNavigate()
  const { data, error, isLoading, reload } = useAsyncData(getClasses)
  const ownedClasses = (data ?? []).filter(
    (item) => item.isOwner && !item.isBlocked
  )
  const hasBlockedOwnedClass =
    (data ?? []).some((item) => item.isOwner && item.isBlocked)

  async function handleSubmit(
    values: FundraisingFormValues
  ): Promise<FundraisingFieldErrors | undefined> {
    const { logo, ...input } = values

    try {
      const created = await createFundraising(input)
      if (logo != null) {
        try {
          await uploadFundraisingLogo(created.id, logo)
        } catch {
          toast.add({
            title: "Zbiórka jest gotowa, ale logo się nie wysłało. Dodasz je w edycji.",
            type: "error",
          })
        }
      }
      toast.add({
        title: "Zbiórka została utworzona.",
        type: "success",
      })
      navigate(`${LIST_PATH}/${created.id}`)
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

  return (
    <AppShell activeId="fundraisers">
      <DataState
        isLoading={isLoading}
        hasError={error != null}
        isEmpty={data != null && ownedClasses.length === 0}
        onRetry={reload}
        emptyState={
          <EmptyState
            icon={<UsersRound />}
            title={
              hasBlockedOwnedClass
                ? "Twoja klasa jest zablokowana"
                : "Najpierw załóż klasę"
            }
            description={
              hasBlockedOwnedClass
                ? "Nie można utworzyć zbiórki w zablokowanej klasie. Skontaktuj się z administratorem."
                : "Zbiórkę może utworzyć tylko skarbnik, czyli osoba, która założyła klasę."
            }
          />
        }
      >
        {data != null ? (
          <FundraisingForm
            title="Nowa zbiórka"
            description="Rodzice zobaczą ją od razu po utworzeniu i będą mogli wpłacać."
            backTo={LIST_PATH}
            submitLabel="Utwórz zbiórkę"
            classes={ownedClasses}
            onSubmit={handleSubmit}
            onCancel={() => navigate(LIST_PATH)}
          />
        ) : null}
      </DataState>
      <Toaster />
    </AppShell>
  )
}

export { FundraisingNewPage }
