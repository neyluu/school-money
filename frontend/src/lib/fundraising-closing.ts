import { authorizedRequest } from "@/lib/authorized-client"
import type {
  FundraisingListItem,
  FundraisingStatus,
  FundraisingTransfer,
} from "@/lib/fundraising"

export type RefundSummary = {
  fundraisingId: number
  status: FundraisingStatus
  refundedContributions: number
  refundedAmount: number
  cancelledAt: string
}

function closeFundraising(fundraisingId: number): Promise<FundraisingListItem> {
  return authorizedRequest<FundraisingListItem>(
    `/fundraisings/${fundraisingId}/close`,
    { method: "POST" }
  )
}

function refundFundraising(fundraisingId: number): Promise<RefundSummary> {
  return authorizedRequest<RefundSummary>(
    `/fundraisings/${fundraisingId}/refund`,
    { method: "POST" }
  )
}

function replenishFundraising(
  fundraisingId: number,
  amount: number
): Promise<FundraisingTransfer> {
  return authorizedRequest<FundraisingTransfer>(
    `/payments/fundraisings/${fundraisingId}/replenishments`,
    { method: "POST", body: { amount } }
  )
}

export { closeFundraising, refundFundraising, replenishFundraising }
