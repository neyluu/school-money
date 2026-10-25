package org.example.backend.fundraisings.dto.response;

import org.example.backend.core.entity.Fundraising;
import org.example.backend.core.entity.types.FundraisingStatus;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.Objects;

public record FundraiseResponse(
    Integer id,
    Integer classId,
    Boolean isOwner,
    String name,
    String description,
    LocalDate startDate,
    LocalDate endDate,
    BigDecimal amountPerChild,
    FundraisingStatus status,
    Instant cancelledAt,
    Instant closedAt
) {
    public static FundraiseResponse from(Fundraising fundraising, Integer userId)
    {
        return new FundraiseResponse(
            fundraising.getId(),
            fundraising.getSchoolClass().getId(),
            Objects.equals(fundraising.getSchoolClass().getOwner().getId(), userId),
            fundraising.getName(),
            fundraising.getDescription(),
            fundraising.getStartAt(),
            fundraising.getEndAt(),
            fundraising.getAmountPerChild(),
            fundraising.getStatus(),
            fundraising.getCancelledAt(),
            fundraising.getClosedAt()
        );
    }
}
