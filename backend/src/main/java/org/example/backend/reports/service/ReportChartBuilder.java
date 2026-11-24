package org.example.backend.reports.service;

import java.math.BigDecimal;
import java.time.ZoneOffset;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.TreeMap;
import org.example.backend.reports.dto.ReportChartData;
import org.example.backend.reports.dto.ReportKind;
import org.example.backend.reports.dto.ReportRow;

public final class ReportChartBuilder {

    private static final DateTimeFormatter MONTH = DateTimeFormatter.ofPattern(
        "MMM yy"
    ).withZone(ZoneOffset.UTC);

    private ReportChartBuilder() {}

    public static ReportChartData build(
        ReportKind kind,
        List<ReportRow> rows,
        List<ReportChartData.FundraisingSummary> fundraisings,
        int childrenPaid,
        int childrenPartial,
        int childrenTotal
    ) {
        TreeMap<String, BigDecimal[]> byMonth = new TreeMap<>();
        Map<String, BigDecimal> expenseByLabel = new LinkedHashMap<>();
        Map<String, BigDecimal> paymentByFundraising = new LinkedHashMap<>();

        for (ReportRow row : rows) {
            String key = MONTH.format(row.date());
            BigDecimal[] bucket = byMonth.computeIfAbsent(
                key,
                k -> new BigDecimal[] { BigDecimal.ZERO, BigDecimal.ZERO }
            );
            String fundraising =
                row.fundraisingName() != null
                    ? row.fundraisingName()
                    : "Zbiórka";

            if (isIncoming(kind, row)) {
                bucket[0] = bucket[0].add(row.amount());
            } else {
                bucket[1] = bucket[1].add(row.amount());
                expenseByLabel.merge(
                    fundraising,
                    row.amount(),
                    BigDecimal::add
                );
            }
            if (ReportRow.PAYMENT.equals(row.type())) {
                paymentByFundraising.merge(
                    fundraising,
                    row.amount(),
                    BigDecimal::add
                );
            }
        }

        List<String> months = new ArrayList<>();
        List<BigDecimal> income = new ArrayList<>();
        List<BigDecimal> expense = new ArrayList<>();
        List<BigDecimal> net = new ArrayList<>();
        BigDecimal running = BigDecimal.ZERO;

        for (var entry : byMonth.entrySet()) {
            months.add(entry.getKey());
            income.add(entry.getValue()[0]);
            expense.add(entry.getValue()[1]);
            running = running
                .add(entry.getValue()[0])
                .subtract(entry.getValue()[1]);
            net.add(running);
        }

        return new ReportChartData(
            months,
            income,
            expense,
            net,
            toSlices(expenseByLabel),
            toSlices(paymentByFundraising),
            fundraisings,
            childrenPaid,
            childrenPartial,
            childrenTotal
        );
    }

    /**
     * Child report: income is a top-up of the account, expense is a payment to a fundraising.
     * Other reports: payments from parents and replenishments are income.
     */
    private static boolean isIncoming(ReportKind kind, ReportRow row) {
        if (kind == ReportKind.CHILD) {
            return (
                ReportRow.DEPOSIT.equals(row.type()) ||
                ReportRow.REPLENISHMENT.equals(row.type())
            );
        }
        return (
            ReportRow.PAYMENT.equals(row.type()) ||
            ReportRow.REPLENISHMENT.equals(row.type())
        );
    }

    private static List<ReportChartData.Slice> toSlices(
        Map<String, BigDecimal> amounts
    ) {
        return amounts
            .entrySet()
            .stream()
            .map(e -> new ReportChartData.Slice(e.getKey(), e.getValue()))
            .toList();
    }
}
