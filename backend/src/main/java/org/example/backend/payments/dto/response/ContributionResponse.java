package org.example.backend.payments.dto.response;

import org.example.backend.core.entity.FundraisingContribution;
import org.example.backend.core.entity.Transaction;

import java.math.BigDecimal;
import java.time.Instant;

public record ContributionResponse(
    Integer id,
    Integer fundraisingId,
    ContributionPersonResponse payer,
    ContributionPersonResponse child,
    BigDecimal amount,
    Instant createdAt,
    boolean refunded,
    Instant refundedAt
)
{
    public static ContributionResponse from(FundraisingContribution contribution)
    {
        Transaction refund = contribution.getRefundTransaction();

        return new ContributionResponse(
            contribution.getId(),
            contribution.getFundraising().getId(),
            ContributionPersonResponse.from(contribution.getPayer()),
            ContributionPersonResponse.from(contribution.getChild()),
            contribution.getTransaction().getAmount(),
            contribution.getCreatedAt(),
            refund != null,
            refund != null ? refund.getCompletedAt() : null
        );
    }
}
