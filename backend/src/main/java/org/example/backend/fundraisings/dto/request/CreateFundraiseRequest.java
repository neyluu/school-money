package org.example.backend.fundraisings.dto.request;

import jakarta.validation.constraints.*;

import java.math.BigDecimal;
import java.time.LocalDate;

public record CreateFundraiseRequest(
    @NotNull(message = "ClassId is required")
    Integer classId,

    @NotBlank(message = "Name is required")
    @Size(max = 50, message = "Name cannot exceed 50 characters")
    String name,

    @Size(max = 500, message = "Description cannot exceed 500 characters")
    String description,

    @Future(message = "EndDate must be in the future")
    @NotNull(message = "EndDate is required")
    LocalDate endDate,

    @NotNull(message = "PerChildAmount is required")
    @Digits(integer = 8, fraction = 2, message = "Amount must have at most 2 decimal places")
    @DecimalMin(value = "0.01", message = "Minimal amount is 0.01")
    @DecimalMax(value = "10000.00", message = "Maximum amount is 10000.00")
    BigDecimal perChildAmount
) {}
