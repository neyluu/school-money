package org.example.backend.reports.dto;

import java.math.BigDecimal;
import java.util.List;

public record ReportChartData(
    List<String> months,
    List<BigDecimal> income,
    List<BigDecimal> expense,
    List<BigDecimal> netCumulative,
    List<Slice> expenseBreakdown,
    List<Slice> paymentBreakdown,
    List<FundraisingSummary> fundraisings,
    int childrenPaid,
    int childrenPartial,
    int childrenTotal
) {
    public record Slice(String label, BigDecimal amount) {}

    public record FundraisingSummary(
        String name,
        BigDecimal collected,
        BigDecimal perChild,
        String status
    ) {}
}
