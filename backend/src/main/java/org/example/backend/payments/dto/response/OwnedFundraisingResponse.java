package org.example.backend.payments.dto.response;

import org.example.backend.core.entity.types.FundraisingStatus;

import java.math.BigDecimal;
import java.time.LocalDate;

public record OwnedFundraisingResponse(
    Integer id,
    String name,
    FundraisingStatus status,
    boolean isBlocked,
    LocalDate endDate,
    BigDecimal amountPerChild,
    String iban,
    BigDecimal walletBalance,
    BigDecimal collectedAmount,
    int paidChildren,
    int totalChildren
) {}
