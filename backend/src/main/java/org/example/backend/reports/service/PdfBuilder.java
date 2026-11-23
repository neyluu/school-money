package org.example.backend.reports.service;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.ZoneOffset;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.pdmodel.PDPage;
import org.apache.pdfbox.pdmodel.PDPageContentStream;
import org.apache.pdfbox.pdmodel.common.PDRectangle;
import org.apache.pdfbox.pdmodel.font.PDType0Font;
import org.example.backend.reports.dto.ReportChartData;
import org.example.backend.reports.dto.ReportKind;
import org.example.backend.reports.dto.ReportRow;
import org.springframework.core.io.ClassPathResource;

public final class PdfBuilder {

    private static final String SANS_REGULAR =
        "fonts/HedvigLettersSans-Regular.ttf";
    private static final String SANS_MEDIUM = SANS_REGULAR;
    private static final String SERIF = "fonts/HedvigLettersSerif-Regular.ttf";

    private static final PDRectangle PAGE = new PDRectangle(842, 595);
    private static final float MARGIN = 48f;
    private static final float CONTENT_WIDTH = PAGE.getWidth() - 2 * MARGIN;
    private static final float FOOTER_RESERVE = 40f;
    private static final float ROW_HEIGHT = 20f;
    private static final float CHART_HEIGHT = 230f;
    private static final float DONUT_OUTER = 66f;
    private static final float DONUT_INNER = 40f;
    private static final DateTimeFormatter DATE = DateTimeFormatter.ofPattern(
        "dd.MM.yyyy HH:mm"
    ).withZone(ZoneOffset.UTC);

    private static final float[] INK = { 0.04f, 0.04f, 0.04f };
    private static final float[] MUTED = { 0.34f, 0.34f, 0.34f };
    private static final float[] LINE = { 0.88f, 0.88f, 0.88f };
    private static final float[] CARD = { 0.95f, 0.95f, 0.95f };
    private static final float[] SUCCESS = { 0.37f, 0.65f, 0.00f };
    private static final float[] WARNING = { 0.88f, 0.44f, 0.00f };
    private static final float[] DANGER = { 0.91f, 0.00f, 0.04f };
    private static final float[][] CHART = {
        { 0.85f, 0.85f, 0.85f },
        { 0.62f, 0.62f, 0.62f },
        { 0.44f, 0.44f, 0.44f },
        { 0.27f, 0.27f, 0.27f },
        { 0.13f, 0.13f, 0.13f },
    };

    private PdfBuilder() {}

    public static byte[] build(
        ReportKind kind,
        String title,
        String subject,
        String subtitle,
        List<ReportRow> rows,
        List<String> summary,
        ReportChartData chart
    ) throws IOException {
        try (PDDocument document = new PDDocument()) {
            PDType0Font serif = load(document, SERIF);
            PDType0Font sans = load(document, SANS_REGULAR);
            PDType0Font sansMedium = load(document, SANS_MEDIUM);

            if (kind == ReportKind.CLASS) {
                buildClassReport(
                    document,
                    serif,
                    sans,
                    sansMedium,
                    title,
                    subject,
                    subtitle,
                    summary,
                    chart
                );
            } else {
                buildTransactionReport(
                    document,
                    kind,
                    serif,
                    sans,
                    sansMedium,
                    title,
                    subject,
                    subtitle,
                    rows,
                    summary,
                    chart
                );
            }

            ByteArrayOutputStream out = new ByteArrayOutputStream();
            document.save(out);
            return out.toByteArray();
        }
    }

    private static void buildTransactionReport(
        PDDocument document,
        ReportKind kind,
        PDType0Font serif,
        PDType0Font sans,
        PDType0Font sansMedium,
        String title,
        String subject,
        String subtitle,
        List<ReportRow> rows,
        List<String> summary,
        ReportChartData chart
    ) throws IOException {
        PDPage page = newPage(document);
        PDPageContentStream c = new PDPageContentStream(document, page);

        float y = drawHeader(
            c,
            serif,
            sansMedium,
            sans,
            title,
            subject,
            subtitle,
            top()
        );
        y = drawKpiCards(c, sans, sansMedium, summary, y);
        y -= 20;

        float half = (CONTENT_WIDTH - 16) / 2;
        float chartY = y - CHART_HEIGHT;
        if (kind == ReportKind.CHILD) {
            drawBarChart(
                c,
                sans,
                sansMedium,
                chart,
                MARGIN,
                chartY,
                CONTENT_WIDTH,
                CHART_HEIGHT
            );
        } else {
            drawBarChart(
                c,
                sans,
                sansMedium,
                chart,
                MARGIN,
                chartY,
                half,
                CHART_HEIGHT
            );
            drawStatusDonut(
                c,
                sans,
                sansMedium,
                chart,
                MARGIN + half + 16,
                chartY,
                half,
                CHART_HEIGHT
            );
        }
        c.close();

        String[] headers = headersFor(kind);
        float[] widths = widthsFor(kind);

        page = newPage(document);
        c = new PDPageContentStream(document, page);
        y = drawHeader(
            c,
            serif,
            sansMedium,
            sans,
            title,
            subject + " - Lista transakcji",
            subtitle,
            top()
        );
        y = drawTableHeader(c, sansMedium, headers, widths, y);

        for (ReportRow row : rows) {
            if (y - ROW_HEIGHT < MARGIN + FOOTER_RESERVE) {
                c.close();
                page = newPage(document);
                c = new PDPageContentStream(document, page);
                y = drawHeader(
                    c,
                    serif,
                    sansMedium,
                    sans,
                    title,
                    subject + " - Lista transakcji (ciąg dalszy)",
                    subtitle,
                    top()
                );
                y = drawTableHeader(c, sansMedium, headers, widths, y);
            }
            y = drawRow(
                c,
                sans,
                cellsFor(kind, row),
                widths,
                ReportRow.REFUND.equals(row.type()),
                y
            );
        }
        c.close();
    }

    private static void buildClassReport(
        PDDocument document,
        PDType0Font serif,
        PDType0Font sans,
        PDType0Font sansMedium,
        String title,
        String subject,
        String subtitle,
        List<String> summary,
        ReportChartData chart
    ) throws IOException {
        PDPage page = newPage(document);
        PDPageContentStream c = new PDPageContentStream(document, page);

        float y = drawHeader(
            c,
            serif,
            sansMedium,
            sans,
            title,
            subject,
            subtitle,
            top()
        );

        y = sectionTitle(c, serif, "Dane klasy", y);
        y = drawKeyValues(c, sans, sansMedium, summary, y);
        y -= 16;

        y = sectionTitle(c, serif, "Zbiórki w klasie", y);
        y = drawFundraisingTable(c, sans, sansMedium, chart.fundraisings(), y);
        y -= 16;

        float halfWidth = (CONTENT_WIDTH - 16) / 2;
        y = sectionTitle(c, serif, "Dzieci w klasie", y);
        drawChildrenStatus(c, sans, sansMedium, chart, MARGIN, y, halfWidth);
        c.close();
    }

    private static float sectionTitle(
        PDPageContentStream c,
        PDType0Font serif,
        String label,
        float y
    ) throws IOException {
        text(c, serif, 16, MARGIN, y, label, INK);
        y -= 10;
        line(c, y);
        return y - 14;
    }

    private static float drawKeyValues(
        PDPageContentStream c,
        PDType0Font sans,
        PDType0Font sansMedium,
        List<String> summary,
        float y
    ) throws IOException {
        for (String item : summary) {
            int split = item.indexOf(": ");
            String label = split >= 0 ? item.substring(0, split) : item;
            String value = split >= 0 ? item.substring(split + 2) : "";
            text(c, sans, 10, MARGIN, y, label, MUTED);
            text(c, sansMedium, 10, MARGIN + 160, y, value, INK);
            y -= 16;
        }
        return y;
    }

    private static float drawFundraisingTable(
        PDPageContentStream c,
        PDType0Font sans,
        PDType0Font sansMedium,
        List<ReportChartData.FundraisingSummary> items,
        float y
    ) throws IOException {
        float[] widths = { 240, 140, 140, 0 };
        widths[3] = CONTENT_WIDTH - 240 - 140 - 140;
        String[] headers = {
            "Zbiórka",
            "Wpłacono",
            "Kwota od dziecka",
            "Status",
        };
        y = drawTableHeader(c, sansMedium, headers, widths, y);
        if (items.isEmpty()) {
            text(c, sans, 9, MARGIN, y, "Brak zbiórek w klasie", MUTED);
            return y - 20;
        }
        for (ReportChartData.FundraisingSummary f : items) {
            List<String> cells = List.of(
                f.name(),
                money(f.collected()),
                money(f.perChild()),
                statusLabel(f.status())
            );
            y = drawRow(c, sans, cells, widths, false, y);
        }
        return y;
    }

    private static String statusLabel(String status) {
        return switch (status) {
            case "ACTIVE" -> "Trwa";
            case "CLOSED" -> "Zamknięta";
            case "CANCELLED" -> "Zamknięta ze zwrotem";
            default -> status;
        };
    }

    private static void drawChildrenStatus(
        PDPageContentStream c,
        PDType0Font sans,
        PDType0Font sansMedium,
        ReportChartData chart,
        float x,
        float y,
        float w
    ) throws IOException {
        int total = chart.childrenTotal();
        int paid = Math.min(chart.childrenPaid(), total);
        int partial = Math.min(chart.childrenPartial(), total - paid);
        int pending = Math.max(0, total - paid - partial);

        text(c, sansMedium, 18, x, y - 14, total + " dzieci w klasie", INK);
        text(c, sans, 10, x, y - 36, "Zapłaciło: " + paid, INK);
        text(c, sans, 10, x, y - 54, "Częściowo: " + partial, INK);
        text(c, sans, 10, x, y - 72, "Nie zapłaciło: " + pending, INK);
    }

    private static PDPage newPage(PDDocument document) {
        PDPage page = new PDPage(PAGE);
        document.addPage(page);
        return page;
    }

    private static float top() {
        return PAGE.getHeight() - MARGIN;
    }

    private static PDType0Font load(
        PDDocument document,
        String path
    ) throws IOException {
        try (
            InputStream stream = new ClassPathResource(path).getInputStream()
        ) {
            return PDType0Font.load(document, stream);
        }
    }

    private static String[] headersFor(ReportKind kind) {
        return switch (kind) {
            case FUNDRAISING -> new String[] {
                "Data",
                "Typ",
                "Dziecko",
                "Płatnik",
                "Kwota",
                "Opis",
            };
            case CHILD -> new String[] {
                "Data",
                "Typ",
                "Zbiórka",
                "Płatnik",
                "Kwota",
                "Opis",
            };
            case CLASS -> new String[] {
                "Data",
                "Typ",
                "Zbiórka",
                "Dziecko",
                "Płatnik",
                "Kwota",
                "Opis",
            };
        };
    }

    private static float[] widthsFor(ReportKind kind) {
        float[] w = switch (kind) {
            case FUNDRAISING -> new float[] { 96, 72, 130, 130, 90, 0 };
            case CHILD -> new float[] { 96, 72, 150, 130, 90, 0 };
            case CLASS -> new float[] { 96, 72, 120, 110, 110, 80, 0 };
        };
        w[w.length - 1] = CONTENT_WIDTH - sum(w, w.length - 1);
        return w;
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
        cells.add(money(row.amount()));
        cells.add(nullToEmpty(row.description()));
        return cells;
    }

    private static float drawHeader(
        PDPageContentStream c,
        PDType0Font serif,
        PDType0Font sansMedium,
        PDType0Font sans,
        String title,
        String subject,
        String subtitle,
        float y
    ) throws IOException {
        fill(c, INK);
        c.addRect(MARGIN, y - 6, 28, 4);
        c.fill();

        y -= 30;
        text(c, serif, 26, MARGIN, y, title, INK);
        y -= 22;
        text(c, sansMedium, 12, MARGIN, y, subject, INK);
        y -= 16;
        text(c, sans, 10, MARGIN, y, subtitle, MUTED);
        y -= 14;
        line(c, y);
        return y - 16;
    }

    private static float drawKpiCards(
        PDPageContentStream c,
        PDType0Font sans,
        PDType0Font sansMedium,
        List<String> summary,
        float y
    ) throws IOException {
        int count = summary.size();
        float gap = 12f;
        float cardWidth = (CONTENT_WIDTH - gap * (count - 1)) / count;
        float cardHeight = 56f;

        for (int i = 0; i < count; i++) {
            String item = summary.get(i);
            int split = item.indexOf(": ");
            String label = split >= 0 ? item.substring(0, split) : item;
            String value = split >= 0 ? item.substring(split + 2) : "";
            float x = MARGIN + i * (cardWidth + gap);

            fill(c, CARD);
            c.addRect(x, y - cardHeight, cardWidth, cardHeight);
            c.fill();
            fill(c, INK);
            c.addRect(x, y - cardHeight, 3, cardHeight);
            c.fill();

            text(c, sans, 9, x + 14, y - 20, label, MUTED);
            text(
                c,
                sansMedium,
                15,
                x + 14,
                y - 42,
                value,
                value.startsWith("-") ? DANGER : INK
            );
        }
        return y - cardHeight;
    }

    private static void drawBarChart(
        PDPageContentStream c,
        PDType0Font sans,
        PDType0Font sansMedium,
        ReportChartData chart,
        float x,
        float y,
        float w,
        float h
    ) throws IOException {
        panel(c, x, y, w, h);
        text(c, sansMedium, 11, x + 14, y + h - 22, "Wpływy i wydatki", INK);
        text(c, sans, 8, x + 14, y + h - 36, "Miesięcznie", MUTED);

        if (chart.months().isEmpty()) {
            text(
                c,
                sans,
                9,
                x + 14,
                y + h / 2,
                "Brak transakcji w wybranym okresie",
                MUTED
            );
            return;
        }

        float top = y + h - 56;
        float bottom = y + 40;
        float plotHeight = top - bottom;
        BigDecimal max = maxOf(chart.income(), chart.expense());
        float scale = max.signum() == 0 ? 0 : plotHeight / max.floatValue();

        int n = chart.months().size();
        float slot = (w - 28) / Math.max(n, 1);
        float barWidth = Math.min(10f, slot / 3);

        for (int i = 0; i < n; i++) {
            float cx = x + 14 + i * slot + slot / 2;
            float ih = chart.income().get(i).floatValue() * scale;
            float eh = chart.expense().get(i).floatValue() * scale;
            fill(c, SUCCESS);
            c.addRect(cx - barWidth - 1, bottom, barWidth, ih);
            c.fill();
            fill(c, WARNING);
            c.addRect(cx + 1, bottom, barWidth, eh);
            c.fill();
            text(
                c,
                sans,
                7,
                cx - 12,
                bottom - 12,
                chart.months().get(i),
                MUTED
            );
        }
        float cursor = x + 14;
        cursor = legendItem(c, sans, cursor, y + 16, SUCCESS, "Wpływy");
        legendItem(c, sans, cursor, y + 16, WARNING, "Wydatki");
    }

    private static void drawStatusDonut(
        PDPageContentStream c,
        PDType0Font sans,
        PDType0Font sansMedium,
        ReportChartData chart,
        float x,
        float y,
        float w,
        float h
    ) throws IOException {
        panel(c, x, y, w, h);
        text(c, sansMedium, 11, x + 14, y + h - 22, "Dzieci w zbiórce", INK);
        text(c, sans, 8, x + 14, y + h - 36, "Stan wpłat", MUTED);

        int total = chart.childrenTotal();
        if (total == 0) {
            text(c, sans, 9, x + 14, y + h / 2, "Brak dzieci w zbiórce", MUTED);
            return;
        }

        int paid = Math.min(chart.childrenPaid(), total);
        int partial = Math.min(chart.childrenPartial(), total - paid);
        int pending = Math.max(0, total - paid - partial);

        float cx = x + 120;
        float cy = y + h / 2 - 8;
        double[] fractions = {
            (double) paid / total,
            (double) partial / total,
            (double) pending / total,
        };
        float[][] colors = { SUCCESS, WARNING, CHART[0] };
        drawDonut(c, cx, cy, fractions, colors);

        text(c, sansMedium, 18, cx - 14, cy - 6, paid + "/" + total, INK);

        float lx = x + 230;
        float ly = y + h / 2 + 30;
        legendRow(c, sans, lx, ly, SUCCESS, "Zapłaciło: " + paid);
        legendRow(c, sans, lx, ly - 20, WARNING, "Częściowo: " + partial);
        legendRow(c, sans, lx, ly - 40, CHART[0], "Nie zapłaciło: " + pending);
    }

    /**
     * Draws donut segments clockwise from 12 o'clock. Start angles are cumulative
     * and the last segment closes the circle exactly, so no gaps or overlaps appear.
     */
    private static void drawDonut(
        PDPageContentStream c,
        float cx,
        float cy,
        double[] fractions,
        float[][] colors
    ) throws IOException {
        double cumulative = 0;
        int lastNonZero = -1;
        for (int i = 0; i < fractions.length; i++) {
            if (fractions[i] > 0) {
                lastNonZero = i;
            }
        }
        for (int i = 0; i < fractions.length; i++) {
            if (fractions[i] <= 0) {
                continue;
            }
            double fraction =
                i == lastNonZero ? 1.0 - cumulative : fractions[i];
            float startDeg = (float) (90.0 - cumulative * 360.0);
            float sweepDeg = (float) (-fraction * 360.0);
            fill(c, colors[i]);
            ring(c, cx, cy, DONUT_OUTER, DONUT_INNER, startDeg, sweepDeg);
            cumulative += fractions[i];
        }
    }

    private static float drawTableHeader(
        PDPageContentStream c,
        PDType0Font font,
        String[] headers,
        float[] widths,
        float y
    ) throws IOException {
        float x = MARGIN;
        for (int i = 0; i < headers.length; i++) {
            text(c, font, 8, x, y, headers[i], MUTED);
            x += widths[i];
        }
        y -= 8;
        line(c, y);
        return y - 12;
    }

    private static float drawRow(
        PDPageContentStream c,
        PDType0Font font,
        List<String> cells,
        float[] widths,
        boolean refund,
        float y
    ) throws IOException {
        int amountIndex = cells.size() - 2;
        float x = MARGIN;
        for (int i = 0; i < cells.size(); i++) {
            String value = fit(font, cells.get(i), 9, widths[i] - 8);
            float drawX =
                i == amountIndex
                    ? x + widths[i] - 8 - width(font, value, 9)
                    : x;
            text(c, font, 9, drawX, y, value, refund && i == 1 ? DANGER : INK);
            x += widths[i];
        }
        y -= 6;
        line(c, y);
        return y - 14;
    }

    private static void ring(
        PDPageContentStream c,
        float cx,
        float cy,
        float outer,
        float inner,
        float startDeg,
        float sweepDeg
    ) throws IOException {
        int steps = Math.max(2, (int) Math.ceil(Math.abs(sweepDeg) / 3));
        float step = sweepDeg / steps;
        for (int i = 0; i < steps; i++) {
            float a0 = (float) Math.toRadians(startDeg + i * step);
            float a1 = (float) Math.toRadians(startDeg + (i + 1) * step);
            c.moveTo(
                cx + outer * (float) Math.cos(a0),
                cy + outer * (float) Math.sin(a0)
            );
            c.lineTo(
                cx + outer * (float) Math.cos(a1),
                cy + outer * (float) Math.sin(a1)
            );
            c.lineTo(
                cx + inner * (float) Math.cos(a1),
                cy + inner * (float) Math.sin(a1)
            );
            c.lineTo(
                cx + inner * (float) Math.cos(a0),
                cy + inner * (float) Math.sin(a0)
            );
            c.closePath();
        }
        c.fill();
    }

    private static void legendRow(
        PDPageContentStream c,
        PDType0Font sans,
        float x,
        float y,
        float[] color,
        String label
    ) throws IOException {
        fill(c, color);
        c.addRect(x, y - 2, 8, 8);
        c.fill();
        text(c, sans, 9, x + 14, y, label, INK);
    }

    private static float legendItem(
        PDPageContentStream c,
        PDType0Font sans,
        float x,
        float y,
        float[] color,
        String label
    ) throws IOException {
        fill(c, color);
        c.addRect(x, y, 8, 8);
        c.fill();
        text(c, sans, 8, x + 12, y, label, MUTED);
        return x + 12 + width(sans, label, 8) + 16;
    }

    private static void panel(
        PDPageContentStream c,
        float x,
        float y,
        float w,
        float h
    ) throws IOException {
        c.setStrokingColor(LINE[0], LINE[1], LINE[2]);
        c.setLineWidth(0.5f);
        c.addRect(x, y, w, h);
        c.stroke();
    }

    private static void line(
        PDPageContentStream c,
        float y
    ) throws IOException {
        c.setStrokingColor(LINE[0], LINE[1], LINE[2]);
        c.setLineWidth(0.5f);
        c.moveTo(MARGIN, y);
        c.lineTo(PAGE.getWidth() - MARGIN, y);
        c.stroke();
    }

    private static void fill(
        PDPageContentStream c,
        float[] rgb
    ) throws IOException {
        c.setNonStrokingColor(rgb[0], rgb[1], rgb[2]);
    }

    private static void text(
        PDPageContentStream c,
        PDType0Font font,
        float size,
        float x,
        float y,
        String value,
        float[] rgb
    ) throws IOException {
        c.setNonStrokingColor(rgb[0], rgb[1], rgb[2]);
        c.beginText();
        c.setFont(font, size);
        c.newLineAtOffset(x, y);
        c.showText(value);
        c.endText();
    }

    private static float width(
        PDType0Font font,
        String value,
        float size
    ) throws IOException {
        return (font.getStringWidth(value) / 1000f) * size;
    }

    private static String fit(
        PDType0Font font,
        String value,
        float size,
        float maxWidth
    ) throws IOException {
        if (
            value == null ||
            value.isEmpty() ||
            width(font, value, size) <= maxWidth
        ) {
            return value == null ? "" : value;
        }
        String result = value;
        while (
            !result.isEmpty() && width(font, result + "…", size) > maxWidth
        ) {
            result = result.substring(0, result.length() - 1);
        }
        return result + "…";
    }

    private static float sum(float[] values, int until) {
        float total = 0;
        for (int i = 0; i < until; i++) {
            total += values[i];
        }
        return total;
    }

    private static BigDecimal maxOf(
        List<BigDecimal> first,
        List<BigDecimal> second
    ) {
        BigDecimal max = BigDecimal.ZERO;
        for (BigDecimal v : first) {
            max = max.max(v);
        }
        for (BigDecimal v : second) {
            max = max.max(v);
        }
        return max;
    }

    private static String money(BigDecimal value) {
        return (
            value
                .setScale(2, RoundingMode.HALF_UP)
                .toPlainString()
                .replace('.', ',') + " zł"
        );
    }

    private static String nullToEmpty(String value) {
        return value == null ? "" : value;
    }
}
