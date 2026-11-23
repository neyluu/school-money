package org.example.backend.payments.dto.request;

import io.swagger.v3.oas.annotations.Parameter;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Digits;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;
import java.time.Instant;

public record HistorySearchRequest(
    @Parameter(description = "Created at this moment or later")
    Instant from,

    @Parameter(description = "Created before this moment")
    Instant to,

    @Parameter(description = "Minimal amount, inclusive")
    @Digits(integer = 10, fraction = 2)
    @DecimalMin(value = "0.00", message = "Amount cannot be negative")
    BigDecimal minAmount,

    @Parameter(description = "Maximal amount, inclusive")
    @Digits(integer = 10, fraction = 2)
    @DecimalMin(value = "0.00", message = "Amount cannot be negative")
    BigDecimal maxAmount,

    @Parameter(description = "Part of transaction title, or of fundraising or child name for contributions")
    @Size(max = 100, message = "Search must contain at most 100 characters")
    String search
) {}
