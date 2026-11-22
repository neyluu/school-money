package org.example.backend.payments.dto.request;

import jakarta.validation.constraints.*;
import org.example.backend.payments.utils.RegexConstants;

import java.math.BigDecimal;

public record WithdrawRequest(
    @NotNull(message = "Amount is required")
    @Digits(integer = 10, fraction = 2)
    @DecimalMin(value = "0.01", message = "Minimal amount is 0.01")
    BigDecimal amount,

    @NotBlank(message = "Recipient name is required")
    @Size(max = 100, message = "Recipient name must contain at most 100 characters")
    String recipientName,

    @NotBlank(message = "Iban cannot be blank")
    @Size(min = 28, max = 28, message = "Iban must have 28 characters")
    @Pattern(regexp = RegexConstants.IBAN_REGEX, message = "Iban must have form PL[26 digits]")
    String iban
) {}
