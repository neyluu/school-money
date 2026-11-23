package org.example.backend.reports.service;

import java.io.IOException;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.nio.charset.StandardCharsets;
import java.time.LocalDate;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.example.backend.auth.security.AuthenticatedUser;
import org.example.backend.core.entity.Child;
import org.example.backend.core.entity.Fundraising;
import org.example.backend.core.entity.SchoolClass;
import org.example.backend.reports.dto.ReportFormat;
import org.example.backend.reports.dto.ReportResult;
import org.example.backend.reports.dto.ReportRow;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
@RequiredArgsConstructor
public class ReportsService {

    private static final MediaType CSV = new MediaType(
        "text",
        "csv",
        StandardCharsets.UTF_8
    );

    private final ReportAccessService accessService;
    private final ReportDataService dataService;

    @Transactional(readOnly = true)
    public ReportResult fundraising(
        AuthenticatedUser user,
        Integer fundraisingId,
        ReportFormat format,
        LocalDate from,
        LocalDate to
    ) {
        validatePeriod(from, to);
        Fundraising fundraising = accessService.requireFundraisingAccess(
            user,
            fundraisingId
        );
        List<ReportRow> rows = dataService.fundraisingRows(
            fundraisingId,
            from,
            to
        );

        return build(
            format,
            "Raport zbiórki",
            fundraising.getName(),
            "Klasa " +
                fundraising.getSchoolClass().getName() +
                " · " +
                periodLabel(from, to),
            rows
        );
    }

    @Transactional(readOnly = true)
    public ReportResult child(
        AuthenticatedUser user,
        Integer childId,
        ReportFormat format,
        LocalDate from,
        LocalDate to
    ) {
        validatePeriod(from, to);
        Child child = accessService.requireChildAccess(user, childId);
        List<ReportRow> rows = dataService.childRows(childId, from, to);

        return build(
            format,
            "Raport dziecka",
            child.getFirstName() + " " + child.getLastName(),
            periodLabel(from, to),
            rows
        );
    }

    @Transactional(readOnly = true)
    public ReportResult schoolClass(
        AuthenticatedUser user,
        Integer classId,
        ReportFormat format,
        LocalDate from,
        LocalDate to
    ) {
        validatePeriod(from, to);
        SchoolClass schoolClass = accessService.requireClassOwner(
            user,
            classId
        );
        List<ReportRow> rows = dataService.classRows(classId, from, to);

        return build(
            format,
            "Raport klasy",
            schoolClass.getName() + " · " + schoolClass.getSchool(),
            periodLabel(from, to),
            rows
        );
    }

    private ReportResult build(
        ReportFormat format,
        String title,
        String subject,
        String subtitle,
        List<ReportRow> rows
    ) {
        if (format == ReportFormat.CSV) {
            return new ReportResult(CsvBuilder.build(rows), CSV, "csv");
        }
        try {
            byte[] pdf = PdfBuilder.build(
                title,
                subject,
                subtitle,
                rows,
                summary(rows)
            );
            return new ReportResult(pdf, MediaType.APPLICATION_PDF, "pdf");
        } catch (IOException e) {
            throw new IllegalStateException("Cannot generate PDF report", e);
        }
    }

    private static List<String> summary(List<ReportRow> rows) {
        BigDecimal paid = sum(rows, ReportRow.PAYMENT);
        BigDecimal refunded = sum(rows, ReportRow.REFUND);
        BigDecimal withdrawn = sum(rows, ReportRow.PAYOUT);
        BigDecimal replenished = sum(rows, ReportRow.REPLENISHMENT);
        BigDecimal balance = paid
            .add(replenished)
            .subtract(refunded)
            .subtract(withdrawn);

        return List.of(
            "Wpłacono: " + money(paid),
            "Zwrócono: " + money(refunded),
            "Wypłacono: " + money(withdrawn),
            "Uzupełniono: " + money(replenished),
            "Bilans: " + money(balance)
        );
    }

    private static BigDecimal sum(List<ReportRow> rows, String type) {
        return rows
            .stream()
            .filter(row -> row.type().equals(type))
            .map(ReportRow::amount)
            .reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    private static String money(BigDecimal value) {
        return (
            value
                .setScale(2, RoundingMode.HALF_UP)
                .toPlainString()
                .replace('.', ',') + " zł"
        );
    }

    private static String periodLabel(LocalDate from, LocalDate to) {
        if (from == null && to == null) {
            return "Wszystkie daty";
        }
        return (
            (from != null ? from.toString() : "początek") +
            " – " +
            (to != null ? to.toString() : "dziś")
        );
    }

    private static void validatePeriod(LocalDate from, LocalDate to) {
        if (from != null && to != null && from.isAfter(to)) {
            throw new ResponseStatusException(
                HttpStatus.BAD_REQUEST,
                "Start of period must not be after its end"
            );
        }
    }
}
