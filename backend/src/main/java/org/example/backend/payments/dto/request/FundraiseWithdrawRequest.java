package org.example.backend.payments.dto.request;

import jakarta.validation.constraints.*;
import org.example.backend.payments.utils.RegexConstants;

import java.math.BigDecimal;

public record FundraiseWithdrawRequest(
    @NotNull(message = "Amount is required")
    @Digits(integer = 10, fraction = 2)
    @DecimalMin(value = "0.01", message = "Minimal amount is 0.01")
    BigDecimal amount,

    @NotBlank(message = "Title is required")
    @Size(max = 100, message = "Title must contain at most 100 chars")
    String title
) {}
