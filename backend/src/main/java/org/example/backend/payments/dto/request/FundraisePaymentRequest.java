package org.example.backend.payments.dto.request;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Digits;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;

public record FundraisePaymentRequest(
    @NotNull(message = "ChildId is required")
    Integer childId,

    @NotNull(message = "Amount is required")
    @Digits(integer = 10, fraction = 2)
    @DecimalMin(value = "0.01", message = "Minimal amount is 0.01")
    BigDecimal amount
) {}
