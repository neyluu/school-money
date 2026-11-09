import { Link } from "react-router";
import { HandCoins, Plus } from "lucide-react";
import { FundraiserCard } from "@/components/fundraiser-card";
import type { FundraiserStatus } from "@/components/fundraiser-card";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { FundraisingListItem, FundraisingStatus } from "@/lib/fundraising";

const FUNDRAISERS_PATH = "/dashboard/fundraisers";

const CARD_STATUSES: Record<FundraisingStatus, FundraiserStatus> = {
  ACTIVE: "active",
  CLOSED: "closed",
  CANCELLED: "cancelled",
};

function ClassFundraisingsCard({
  fundraisings,
  isOwner,
}: {
  fundraisings: FundraisingListItem[];
  isOwner: boolean;
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between gap-2">
        <CardTitle>Zbiórki ({fundraisings.length})</CardTitle>
        {isOwner ? (
          <Button
            variant="outline"
            render={<Link to={`${FUNDRAISERS_PATH}/new`} />}
          >
            <Plus />
            Nowa zbiórka
          </Button>
        ) : null}
      </CardHeader>
      <CardContent>
        {fundraisings.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Ta klasa nie ma jeszcze żadnych zbiórek.
          </p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {fundraisings.map((fundraising) => (
              <FundraiserCard
                key={fundraising.id}
                icon={<HandCoins />}
                title={fundraising.name}
                dueDate={fundraising.endDate}
                amountPerChild={fundraising.amountPerChild}
                status={CARD_STATUSES[fundraising.status]}
                href={`${FUNDRAISERS_PATH}/${fundraising.id}`}
                className="w-full"
              />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export { ClassFundraisingsCard };
