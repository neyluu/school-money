package org.example.backend.payments.dto.response;

import java.math.BigDecimal;
import java.time.LocalDate;

public record DailyFlowResponse(
    LocalDate date,
    BigDecimal income,
    BigDecimal expense
) {}
