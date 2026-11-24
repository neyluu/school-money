package org.example.backend.reports.dto;

import java.math.BigDecimal;
import java.time.Instant;

public record ReportRow(
    Instant date,
    String type,
    String fundraisingName,
    String child,
    String payer,
    BigDecimal amount,
    String description
) {
    public static final String PAYMENT = "Wpłata";
    public static final String REFUND = "Zwrot";
    public static final String PAYOUT = "Wypłata";
    public static final String REPLENISHMENT = "Uzupełnienie";
    public static final String DEPOSIT = "Doładowanie";
}
