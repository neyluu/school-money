import { authorizedRequest } from "@/lib/authorized-client"
import type { FundraisingStatus, Person } from "@/lib/fundraising"

export type Due = {
  fundraisingId: number
  fundraisingName: string
  endDate: string
  child: Person
  amountPerChild: number
  paidAmount: number
  remainingAmount: number
}

export type OwnedFundraising = {
  id: number
  name: string
  status: FundraisingStatus
  isBlocked: boolean
  endDate: string
  amountPerChild: number
  iban: string | null
  walletBalance: number
  collectedAmount: number
  paidChildren: number
  totalChildren: number
}

function getDues(): Promise<Due[]> {
  return authorizedRequest<Due[]>("/payments/dashboard/dues")
}

function getOwnedFundraisings(): Promise<OwnedFundraising[]> {
  return authorizedRequest<OwnedFundraising[]>("/payments/dashboard/fundraisings")
}

export { getDues, getOwnedFundraisings }
