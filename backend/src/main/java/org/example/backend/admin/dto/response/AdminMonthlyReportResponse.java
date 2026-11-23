package org.example.backend.admin.dto.response;

import java.math.BigDecimal;
import java.time.YearMonth;

public record AdminMonthlyReportResponse(
    YearMonth month,
    long newUsers,
    long newFundraisings,
    BigDecimal turnover
) {}