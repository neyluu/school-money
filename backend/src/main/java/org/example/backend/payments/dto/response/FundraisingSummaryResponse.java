package org.example.backend.payments.dto.response;

import org.example.backend.core.entity.types.FundraisingStatus;

import java.math.BigDecimal;
import java.time.LocalDate;

public record FundraisingSummaryResponse(
    Integer id,
    String name,
    String description,
    LocalDate startDate,
    LocalDate endDate,
    BigDecimal amountPerChild,
    FundraisingStatus status,
    boolean isBlocked,
    boolean acceptsPayments,
    Integer classId,
    String className,
    boolean isOwner,
    BigDecimal walletBalance,
    BigDecimal collectedAmount,
    BigDecimal withdrawnAmount,
    int paidChildren,
    int totalChildren
) {}
