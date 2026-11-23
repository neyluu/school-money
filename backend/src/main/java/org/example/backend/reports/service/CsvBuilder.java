package org.example.backend.reports.service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.nio.charset.StandardCharsets;
import java.time.ZoneOffset;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import org.example.backend.reports.dto.ReportKind;
import org.example.backend.reports.dto.ReportRow;

public final class CsvBuilder {

    private static final char SEPARATOR = ',';
    private static final String NEWLINE = "\r\n";
    private static final DateTimeFormatter DATE = DateTimeFormatter.ofPattern(
        "yyyy-MM-dd'T'HH:mm:ss'Z'"
    ).withZone(ZoneOffset.UTC);

    private CsvBuilder() {}

    public static byte[] build(ReportKind kind, List<ReportRow> rows) {
        StringBuilder csv = new StringBuilder();
        writeLine(csv, headersFor(kind));
        for (ReportRow row : rows) {
            writeLine(csv, cellsFor(kind, row));
        }
        return csv.toString().getBytes(StandardCharsets.UTF_8);
    }

    private static List<String> headersFor(ReportKind kind) {
        return switch (kind) {
            case FUNDRAISING -> List.of(
                "data",
                "typ",
                "dziecko",
                "platnik",
                "kwota",
                "opis"
            );
            case CHILD -> List.of(
                "data",
                "typ",
                "zbiorka",
                "platnik",
                "kwota",
                "opis"
            );
            case CLASS -> List.of(
                "data",
                "typ",
                "zbiorka",
                "dziecko",
                "platnik",
                "kwota",
                "opis"
            );
        };
    }

    private static List<String> cellsFor(ReportKind kind, ReportRow row) {
        List<String> cells = new ArrayList<>();
        cells.add(DATE.format(row.date()));
        cells.add(nullToEmpty(row.type()));
        switch (kind) {
            case FUNDRAISING -> {
                cells.add(nullToEmpty(row.child()));
                cells.add(nullToEmpty(row.payer()));
            }
            case CHILD -> {
                cells.add(nullToEmpty(row.fundraisingName()));
                cells.add(nullToEmpty(row.payer()));
            }
            case CLASS -> {
                cells.add(nullToEmpty(row.fundraisingName()));
                cells.add(nullToEmpty(row.child()));
                cells.add(nullToEmpty(row.payer()));
            }
        }
        cells.add(amount(row.amount()));
        cells.add(nullToEmpty(row.description()));
        return cells;
    }

    private static void writeLine(StringBuilder csv, List<String> fields) {
        for (int i = 0; i < fields.size(); i++) {
            if (i > 0) {
                csv.append(SEPARATOR);
            }
            csv.append(escape(fields.get(i)));
        }
        csv.append(NEWLINE);
    }

    private static String escape(String value) {
        boolean needsQuotes =
            value.indexOf(SEPARATOR) >= 0 ||
            value.indexOf('"') >= 0 ||
            value.indexOf('\r') >= 0 ||
            value.indexOf('\n') >= 0;
        if (!needsQuotes) {
            return value;
        }
        return "\"" + value.replace("\"", "\"\"") + "\"";
    }

    private static String amount(BigDecimal value) {
        return value.setScale(2, RoundingMode.HALF_UP).toPlainString();
    }

    private static String nullToEmpty(String value) {
        return value == null ? "" : value;
    }
}
