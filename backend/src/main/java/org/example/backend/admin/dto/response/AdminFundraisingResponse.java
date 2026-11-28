package org.example.backend.admin.dto.response;

import org.example.backend.core.entity.Fundraising;
import org.example.backend.core.entity.types.FundraisingStatus;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;

public record AdminFundraisingResponse(
    Integer id,
    String name,
    FundraisingStatus status,
    boolean isBlocked,
    AdminClassRefResponse schoolClass,
    AdminUserRefResponse treasurer,
    BigDecimal amountPerChild,
    BigDecimal collected,
    BigDecimal balance,
    LocalDate endAt,
    Instant createdAt,

    String description,
    Instant cancelledAt,
    Instant closedAt,
    Instant updatedAt,
    Long childrenCount,
    Long paidChildrenCount
) {
    public static AdminFundraisingResponse from(Fundraising fundraising, BigDecimal collected, BigDecimal balance)
    {
        return new AdminFundraisingResponse(
            fundraising.getId(),
            fundraising.getName(),
            fundraising.getStatus(),
            fundraising.getIsBlocked(),
            AdminClassRefResponse.from(fundraising.getSchoolClass()),
            AdminUserRefResponse.from(fundraising.getSchoolClass().getOwner()),
            fundraising.getAmountPerChild(),
            collected,
            balance,
            fundraising.getEndAt(),
            fundraising.getCreatedAt(),
            null,
            null,
            null,
            null,
            null,
            null
        );
    }

    public static AdminFundraisingResponse details(
        Fundraising fundraising,
        BigDecimal collected,
        BigDecimal balance,
        long childrenCount,
        long paidChildrenCount
    )
    {
        return new AdminFundraisingResponse(
            fundraising.getId(),
            fundraising.getName(),
            fundraising.getStatus(),
            fundraising.getIsBlocked(),
            AdminClassRefResponse.from(fundraising.getSchoolClass()),
            AdminUserRefResponse.from(fundraising.getSchoolClass().getOwner()),
            fundraising.getAmountPerChild(),
            collected,
            balance,
            fundraising.getEndAt(),
            fundraising.getCreatedAt(),
            fundraising.getDescription(),
            fundraising.getCancelledAt(),
            fundraising.getClosedAt(),
            fundraising.getUpdatedAt(),
            childrenCount,
            paidChildrenCount
        );
    }
}