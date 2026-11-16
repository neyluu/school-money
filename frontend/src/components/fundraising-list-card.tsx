import { HandCoins } from "lucide-react"
import { FundraiserCard } from "@/components/fundraiser-card"
import type { FundraiserStatus } from "@/components/fundraiser-card"
import { useFundraisingLogo } from "@/hooks/use-fundraising-logo"
import type { FundraisingListItem } from "@/lib/fundraising"

function FundraisingListCard({
  fundraising,
  classLabel,
  status,
}: {
  fundraising: FundraisingListItem
  classLabel?: string
  status: FundraiserStatus
}) {
  const logoUrl = useFundraisingLogo(fundraising.id)

  return (
    <FundraiserCard
      icon={<HandCoins />}
      imageUrl={logoUrl ?? undefined}
      title={fundraising.name}
      classLabel={classLabel}
      isOwner={fundraising.isOwner}
      dueDate={fundraising.endDate}
      amountPerChild={fundraising.amountPerChild}
      status={status}
      href={`/dashboard/fundraisers/${fundraising.id}`}
      className="w-full"
    />
  )
}

export { FundraisingListCard }
