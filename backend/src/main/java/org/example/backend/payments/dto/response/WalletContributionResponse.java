package org.example.backend.payments.dto.response;

import org.example.backend.core.entity.FundraisingContribution;
import org.example.backend.core.entity.Transaction;

import java.math.BigDecimal;
import java.time.Instant;

public record WalletContributionResponse(
    Integer id,
    Integer fundraisingId,
    String fundraisingName,
    ContributionPersonResponse child,
    BigDecimal amount,
    Instant createdAt,
    boolean refunded,
    Instant refundedAt
)
{
    public static WalletContributionResponse from(FundraisingContribution contribution)
    {
        Transaction refund = contribution.getRefundTransaction();

        return new WalletContributionResponse(
            contribution.getId(),
            contribution.getFundraising().getId(),
            contribution.getFundraising().getName(),
            ContributionPersonResponse.from(contribution.getChild()),
            contribution.getTransaction().getAmount(),
            contribution.getCreatedAt(),
            refund != null,
            refund != null ? refund.getCompletedAt() : null
        );
    }
}
