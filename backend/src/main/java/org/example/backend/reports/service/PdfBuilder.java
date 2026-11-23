package org.example.backend.reports.service;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.ZoneOffset;
import java.time.format.DateTimeFormatter;
import java.util.List;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.pdmodel.PDPage;
import org.apache.pdfbox.pdmodel.PDPageContentStream;
import org.apache.pdfbox.pdmodel.common.PDRectangle;
import org.apache.pdfbox.pdmodel.font.PDType0Font;
import org.example.backend.reports.dto.ReportRow;
import org.springframework.core.io.ClassPathResource;

public final class PdfBuilder {

    private static final String SANS_REGULAR =
        "fonts/InstrumentSans-Regular.ttf";
    private static final String SANS_MEDIUM = "fonts/InstrumentSans-Medium.ttf";
    private static final String SERIF = "fonts/InstrumentSerif-Regular.ttf";

    private static final PDRectangle PAGE = new PDRectangle(842, 595);
    private static final float MARGIN = 48f;
    private static final float CONTENT_WIDTH = PAGE.getWidth() - 2 * MARGIN;
    private static final DateTimeFormatter DATE = DateTimeFormatter.ofPattern(
        "dd.MM.yyyy HH:mm"
    ).withZone(ZoneOffset.UTC);

    private static final float ROW_HEIGHT = 20f;
    private static final float FOOTER_RESERVE = 110f;
    private static final float[] COLUMN_WIDTHS = {
        110f, 80f, 150f, 130f, 130f, 90f, 0f,
    };
    private static final String[] HEADERS = {
        "Data",
        "Typ",
        "Zbiórka",
        "Dziecko",
        "Płatnik",
        "Kwota",
        "Opis",
    };

    private static final float ACCENT_R = 0.20f;
    private static final float ACCENT_G = 0.35f;
    private static final float ACCENT_B = 0.90f;
    private static final float INK = 0.07f;
    private static final float MUTED = 0.45f;
    private static final float LINE = 0.88f;
    private static final float DANGER_R = 0.80f;
    private static final float DANGER_G = 0.20f;
    private static final float DANGER_B = 0.20f;

    private PdfBuilder() {}

    public static byte[] build(
        String title,
        String subject,
        String subtitle,
        List<ReportRow> rows,
        List<String> summary
    ) throws IOException {
        try (PDDocument document = new PDDocument()) {
            PDType0Font serif = load(document, SERIF);
            PDType0Font sans = load(document, SANS_REGULAR);
            PDType0Font sansMedium = load(document, SANS_MEDIUM);

            PDPage page = newPage(document);
            PDPageContentStream content = new PDPageContentStream(
                document,
                page
            );
            float y = drawHeader(
                content,
                serif,
                sansMedium,
                sans,
                title,
                subject,
                subtitle,
                PAGE.getHeight() - MARGIN
            );
            y = drawTableHeader(content, sansMedium, y);

            for (ReportRow row : rows) {
                if (y - ROW_HEIGHT < MARGIN + FOOTER_RESERVE) {
                    content.close();
                    page = newPage(document);
                    content = new PDPageContentStream(document, page);
                    y = drawTableHeader(
                        content,
                        sansMedium,
                        PAGE.getHeight() - MARGIN
                    );
                }
                y = drawRow(content, sans, row, y);
            }

            if (y - (summary.size() * 16f + 40f) < MARGIN) {
                content.close();
                page = newPage(document);
                content = new PDPageContentStream(document, page);
                y = PAGE.getHeight() - MARGIN;
            }
            drawSummary(content, serif, sans, summary, y);
            content.close();

            ByteArrayOutputStream out = new ByteArrayOutputStream();
            document.save(out);
            return out.toByteArray();
        }
    }

    private static PDPage newPage(PDDocument document) {
        PDPage page = new PDPage(PAGE);
        document.addPage(page);
        return page;
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
        c.setNonStrokingColor(ACCENT_R, ACCENT_G, ACCENT_B);
        c.addRect(MARGIN, y - 6, 28, 4);
        c.fill();

        y -= 30;
        text(c, serif, 26, MARGIN, y, title, INK, INK, INK);
        y -= 26;
        text(c, sansMedium, 12, MARGIN, y, subject, INK, INK, INK);
        y -= 16;
        text(c, sans, 10, MARGIN, y, subtitle, MUTED, MUTED, MUTED);
        y -= 14;
        line(c, y);
        return y - 16;
    }

    private static float drawTableHeader(
        PDPageContentStream c,
        PDType0Font font,
        float y
    ) throws IOException {
        float x = MARGIN;
        for (int i = 0; i < HEADERS.length; i++) {
            text(c, font, 8, x, y, HEADERS[i], MUTED, MUTED, MUTED);
            x += columnWidth(i);
        }
        y -= 8;
        line(c, y);
        return y - 12;
    }

    private static float drawRow(
        PDPageContentStream c,
        PDType0Font font,
        ReportRow row,
        float y
    ) throws IOException {
        String[] cells = {
            DATE.format(row.date()),
            nullToEmpty(row.type()),
            nullToEmpty(row.fundraisingName()),
            nullToEmpty(row.child()),
            nullToEmpty(row.payer()),
            money(row.amount()),
            nullToEmpty(row.description()),
        };

        boolean isRefund = ReportRow.REFUND.equals(row.type());
        float x = MARGIN;
        for (int i = 0; i < cells.length; i++) {
            float cellWidth = columnWidth(i) - 8;
            String value = fit(font, cells[i], 9, cellWidth);
            float drawX =
                i == 5 ? x + columnWidth(i) - 8 - width(font, value, 9) : x;
            boolean danger = isRefund && i == 1;
            if (danger) {
                text(c, font, 9, drawX, y, value, DANGER_R, DANGER_G, DANGER_B);
            } else {
                text(c, font, 9, drawX, y, value, INK, INK, INK);
            }
            x += columnWidth(i);
        }
        y -= 6;
        line(c, y);
        return y - 14;
    }

    private static void drawSummary(
        PDPageContentStream c,
        PDType0Font serif,
        PDType0Font sans,
        List<String> summary,
        float y
    ) throws IOException {
        y -= 10;
        text(c, serif, 16, MARGIN, y, "Podsumowanie", INK, INK, INK);
        y -= 20;
        for (String item : summary) {
            text(c, sans, 10, MARGIN, y, item, INK, INK, INK);
            y -= 16;
        }
    }

    private static void line(
        PDPageContentStream c,
        float y
    ) throws IOException {
        c.setStrokingColor(LINE, LINE, LINE);
        c.setLineWidth(0.5f);
        c.moveTo(MARGIN, y);
        c.lineTo(PAGE.getWidth() - MARGIN, y);
        c.stroke();
    }

    private static void text(
        PDPageContentStream c,
        PDType0Font font,
        float size,
        float x,
        float y,
        String value,
        float r,
        float g,
        float b
    ) throws IOException {
        c.setNonStrokingColor(r, g, b);
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

    private static float columnWidth(int index) {
        return index == COLUMN_WIDTHS.length - 1
            ? CONTENT_WIDTH - sumOf(COLUMN_WIDTHS, index)
            : COLUMN_WIDTHS[index];
    }

    private static float sumOf(float[] values, int until) {
        float total = 0;
        for (int i = 0; i < until; i++) {
            total += values[i];
        }
        return total;
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
