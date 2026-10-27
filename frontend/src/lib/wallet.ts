import { authorizedRequest } from "@/lib/authorized-client"
import { normalizeIban } from "@/lib/iban"

const DEFAULT_PAGE_SIZE = 20
const DEFAULT_SUMMARY_DAYS = 30

export type Wallet = {
  id: number
  iban: string
  balance: number
}

export type TransactionType =
  | "DEPOSIT"
  | "WITHDRAWAL"
  | "PAYMENT"
  | "REFUND"
  | "PAYOUT"
  | "REPLENISHMENT"

export type TransactionStatus = "PENDING" | "COMPLETED" | "FAILED"

export type Transaction = {
  id: number
  type: TransactionType
  amount: number
  title: string
  status: TransactionStatus
  incoming: boolean
  createdAt: string
  completedAt: string | null
}

export type DailyFlow = {
  date: string
  income: number
  expense: number
}

export type WalletSummary = {
  days: number
  income: number
  expense: number
  daily: DailyFlow[]
}

export type WalletContribution = {
  id: number
  fundraisingId: number
  fundraisingName: string
  child: {
    id: number
    firstName: string
    lastName: string
  }
  amount: number
  createdAt: string
  refunded: boolean
  refundedAt: string | null
}

export type WithdrawInput = {
  recipientName: string
  iban: string
  amount: number
}

function getWallet(): Promise<Wallet> {
  return authorizedRequest<Wallet>("/payments/wallet")
}

function getTransactions(
  page = 0,
  size = DEFAULT_PAGE_SIZE
): Promise<Transaction[]> {
  return authorizedRequest<Transaction[]>(
    `/payments/wallet/transactions?page=${page}&size=${size}`
  )
}

function getSummary(days = DEFAULT_SUMMARY_DAYS): Promise<WalletSummary> {
  return authorizedRequest<WalletSummary>(
    `/payments/wallet/summary?days=${days}`
  )
}

function getContributions(
  page = 0,
  size = DEFAULT_PAGE_SIZE
): Promise<WalletContribution[]> {
  return authorizedRequest<WalletContribution[]>(
    `/payments/wallet/contributions?page=${page}&size=${size}`
  )
}

function deposit(amount: number): Promise<Transaction> {
  return authorizedRequest<Transaction>("/payments/wallet/deposits", {
    method: "POST",
    body: { amount },
  })
}

function withdraw(input: WithdrawInput): Promise<Transaction> {
  return authorizedRequest<Transaction>("/payments/wallet/withdrawals", {
    method: "POST",
    body: {
      recipientName: input.recipientName.trim(),
      iban: normalizeIban(input.iban),
      amount: input.amount,
    },
  })
}

export {
  deposit,
  getContributions,
  getSummary,
  getTransactions,
  getWallet,
  withdraw,
}
