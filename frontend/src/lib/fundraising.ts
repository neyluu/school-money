import { authorizedBlob, authorizedRequest } from "@/lib/authorized-client"

const DEFAULT_PAGE_SIZE = 100

export type FundraisingStatus = "ACTIVE" | "CANCELLED"

export type FundraisingSummary = {
  id: number
  name: string
  description: string
  startAt: string
  endAt: string
  amountPerChild: number
  status: FundraisingStatus
  isBlocked: boolean
  classId: number
  className: string
  isOwner: boolean
  walletBalance: number
  collectedAmount: number
  withdrawnAmount: number
  paidChildren: number
  totalChildren: number
}

export type FundraisingChild = {
  id: number
  firstName: string
  lastName: string
  avatarId: number | null
  isMine: boolean
  paidAmount: number
  remainingAmount: number
  isPaid: boolean
}

export type Person = {
  id: number
  firstName: string
  lastName: string
}

export type Contribution = {
  id: number
  fundraisingId: number
  payer: Person
  child: Person
  amount: number
  createdAt: string
  refunded: boolean
  refundedAt: string | null
}

export type FundraisingTransfer = {
  id: number
  type: "PAYOUT" | "REPLENISHMENT"
  amount: number
  title: string
  createdAt: string
  completedAt: string | null
}

export type InvoiceFile = {
  id: number
  filename: string
  contentType: string
  sizeBytes: number
}

export type FundraisingInvoice = {
  id: number
  title: string | null
  file: InvoiceFile
  createdAt: string
}

function getFundraisingSummary(fundraisingId: number): Promise<FundraisingSummary> {
  return authorizedRequest<FundraisingSummary>(
    `/payments/fundraisings/${fundraisingId}`
  )
}

function getFundraisingChildren(fundraisingId: number): Promise<FundraisingChild[]> {
  return authorizedRequest<FundraisingChild[]>(
    `/payments/fundraisings/${fundraisingId}/children`
  )
}

function getFundraisingContributions(
  fundraisingId: number,
  page = 0,
  size = DEFAULT_PAGE_SIZE
): Promise<Contribution[]> {
  return authorizedRequest<Contribution[]>(
    `/payments/fundraisings/${fundraisingId}/contributions?page=${page}&size=${size}`
  )
}

function getFundraisingWithdrawals(
  fundraisingId: number,
  page = 0,
  size = DEFAULT_PAGE_SIZE
): Promise<FundraisingTransfer[]> {
  return authorizedRequest<FundraisingTransfer[]>(
    `/payments/fundraisings/${fundraisingId}/withdrawals?page=${page}&size=${size}`
  )
}

function getFundraisingInvoices(fundraisingId: number): Promise<FundraisingInvoice[]> {
  return authorizedRequest<FundraisingInvoice[]>(
    `/payments/fundraisings/${fundraisingId}/invoices`
  )
}

function getInvoiceFile(fundraisingId: number, invoiceId: number): Promise<Blob> {
  return authorizedBlob(
    `/payments/fundraisings/${fundraisingId}/invoices/${invoiceId}/file`
  )
}

function payForFundraising(
  fundraisingId: number,
  childId: number,
  amount: number
): Promise<Contribution> {
  return authorizedRequest<Contribution>(
    `/payments/fundraisings/${fundraisingId}/contributions`,
    { method: "POST", body: { childId, amount } }
  )
}

function withdrawFromFundraising(
  fundraisingId: number,
  amount: number,
  title: string
): Promise<FundraisingTransfer> {
  return authorizedRequest<FundraisingTransfer>(
    `/payments/fundraisings/${fundraisingId}/withdrawals`,
    { method: "POST", body: { amount, title: title.trim() } }
  )
}

function addInvoice(
  fundraisingId: number,
  file: File,
  title?: string
): Promise<FundraisingInvoice> {
  const body = new FormData()
  body.append("file", file)
  if (title != null && title.trim() !== "") {
    body.append("title", title.trim())
  }

  return authorizedRequest<FundraisingInvoice>(
    `/payments/fundraisings/${fundraisingId}/invoices`,
    { method: "POST", body }
  )
}

export {
  addInvoice,
  getFundraisingChildren,
  getFundraisingContributions,
  getFundraisingInvoices,
  getFundraisingSummary,
  getFundraisingWithdrawals,
  getInvoiceFile,
  payForFundraising,
  withdrawFromFundraising,
}
