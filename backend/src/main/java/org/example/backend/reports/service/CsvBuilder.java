package org.example.backend.reports.service;

import java.nio.charset.StandardCharsets;
import java.time.ZoneOffset;
import java.time.format.DateTimeFormatter;
import java.util.List;
import org.example.backend.reports.dto.ReportRow;

public final class CsvBuilder {

    private static final DateTimeFormatter DATE = DateTimeFormatter.ofPattern(
        "yyyy-MM-dd HH:mm"
    ).withZone(ZoneOffset.UTC);
    private static final byte[] BOM = { (byte) 0xEF, (byte) 0xBB, (byte) 0xBF };

    private CsvBuilder() {}

    public static byte[] build(List<ReportRow> rows) {
        StringBuilder csv = new StringBuilder(
            "Data;Typ;Zbiórka;Dziecko;Płatnik;Kwota;Opis\r\n"
        );

        for (ReportRow row : rows) {
            csv.append(
                String.join(
                    ";",
                    DATE.format(row.date()),
                    cell(row.type()),
                    cell(row.fundraisingName()),
                    cell(row.child()),
                    cell(row.payer()),
                    row.amount().toPlainString().replace('.', ','),
                    cell(row.description())
                )
            ).append("\r\n");
        }

        byte[] body = csv.toString().getBytes(StandardCharsets.UTF_8);
        byte[] result = new byte[BOM.length + body.length];
        System.arraycopy(BOM, 0, result, 0, BOM.length);
        System.arraycopy(body, 0, result, BOM.length, body.length);
        return result;
    }

    private static String cell(String value) {
        if (value == null) {
            return "";
        }
        if (
            value.contains(";") ||
            value.contains("\"") ||
            value.contains("\n") ||
            value.contains("\r")
        ) {
            return "\"" + value.replace("\"", "\"\"") + "\"";
        }
        return value;
    }
}
