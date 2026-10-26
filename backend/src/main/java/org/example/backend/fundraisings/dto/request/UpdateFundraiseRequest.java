package org.example.backend.fundraisings.dto.request;

import java.math.BigDecimal;
import java.time.LocalDate;

public record UpdateFundraiseRequest(
    String name,
    String description,
    LocalDate endDate,
    BigDecimal perChildAmount
) {}
