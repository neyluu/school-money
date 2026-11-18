package org.example.backend.payments.dto.response;

import org.example.backend.core.entity.types.FundraisingStatus;

import java.math.BigDecimal;
import java.time.Instant;

public record RefundSummaryResponse(
    Integer fundraisingId,
    FundraisingStatus status,
    int refundedContributions,
    BigDecimal refundedAmount,
    Instant cancelledAt
) {}
