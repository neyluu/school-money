package org.example.backend.payments.dto.response;

import java.math.BigDecimal;
import java.time.LocalDate;

public record DueResponse(
    Integer fundraisingId,
    String fundraisingName,
    LocalDate endDate,
    ContributionPersonResponse child,
    BigDecimal amountPerChild,
    BigDecimal paidAmount,
    BigDecimal remainingAmount
) {}
