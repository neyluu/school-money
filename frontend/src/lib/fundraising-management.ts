import { ApiError } from "@/lib/api-client"
import { authorizedBlob, authorizedRequest } from "@/lib/authorized-client"
import type { FundraisingListItem } from "@/lib/fundraising"

export type FundraisingInput = {
  classId: number
  name: string
  description: string
  endDate: string
  amount: number
}

export type FundraisingFieldErrors = {
  classId?: string
  name?: string
  description?: string
  endDate?: string
  amount?: string
  logo?: string
}

function getFundraising(fundraisingId: number): Promise<FundraisingListItem> {
  return authorizedRequest<FundraisingListItem>(`/fundraisings/${fundraisingId}`)
}

function createFundraising(input: FundraisingInput): Promise<FundraisingListItem> {
  return authorizedRequest<FundraisingListItem>("/fundraisings", {
    method: "POST",
    body: {
      classId: input.classId,
      name: input.name.trim(),
      description: input.description.trim(),
      endDate: input.endDate,
      perChildAmount: input.amount,
    },
  })
}

function updateFundraising(
  fundraisingId: number,
  input: FundraisingInput
): Promise<FundraisingListItem> {
  return authorizedRequest<FundraisingListItem>(`/fundraisings/${fundraisingId}`, {
    method: "PATCH",
    body: {
      name: input.name.trim(),
      description: input.description.trim(),
      endDate: input.endDate,
      perChildAmount: input.amount,
    },
  })
}

function getFundraisingLogo(fundraisingId: number): Promise<Blob> {
  return authorizedBlob(`/fundraisings/${fundraisingId}/logo`)
}

function uploadFundraisingLogo(fundraisingId: number, file: File): Promise<void> {
  const body = new FormData()
  body.append("file", file)

  return authorizedRequest<void>(`/fundraisings/${fundraisingId}/logo`, {
    method: "PUT",
    body,
  })
}

function deleteFundraisingLogo(fundraisingId: number): Promise<void> {
  return authorizedRequest<void>(`/fundraisings/${fundraisingId}/logo`, {
    method: "DELETE",
  })
}

function mapFundraisingErrors(error: unknown): FundraisingFieldErrors | null {
  if (!(error instanceof ApiError) || error.status !== 400) {
    return null
  }

  const fieldErrors = error.fieldErrors
  if (fieldErrors == null) {
    return null
  }

  const mapped: FundraisingFieldErrors = {}
  if (fieldErrors.classId != null) {
    mapped.classId = "Wybierz klasę."
  }
  if (fieldErrors.name != null) {
    mapped.name = "Podaj cel zbiórki (maks. 50 znaków)."
  }
  if (fieldErrors.description != null) {
    mapped.description = "Podaj krótki opis (maks. 500 znaków)."
  }
  if (fieldErrors.endDate != null) {
    mapped.endDate = "Data końca musi być w przyszłości."
  }
  if (fieldErrors.perChildAmount != null) {
    mapped.amount = "Podaj kwotę od 0,01 do 10 000,00 zł."
  }

  return Object.keys(mapped).length > 0 ? mapped : null
}

export {
  createFundraising,
  deleteFundraisingLogo,
  getFundraising,
  getFundraisingLogo,
  mapFundraisingErrors,
  updateFundraising,
  uploadFundraisingLogo,
}
