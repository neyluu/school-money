package org.example.backend.reports.service;

import java.io.IOException;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.nio.charset.StandardCharsets;
import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import org.example.backend.auth.security.AuthenticatedUser;
import org.example.backend.core.entity.Child;
import org.example.backend.core.entity.Fundraising;
import org.example.backend.core.entity.SchoolClass;
import org.example.backend.core.entity.types.MembershipStatus;
import org.example.backend.core.repository.ClassMembershipRepository;
import org.example.backend.core.repository.FundraisingRepository;
import org.example.backend.reports.dto.ReportChartData;
import org.example.backend.reports.dto.ReportFormat;
import org.example.backend.reports.dto.ReportKind;
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
    private final ClassMembershipRepository membershipRepository;
    private final FundraisingRepository fundraisingRepository;

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

        int total = acceptedChildren(fundraising.getSchoolClass().getId());
        int[] counts = countPaidAndPartial(rows, perChildAmounts());

        return build(
            ReportKind.FUNDRAISING,
            format,
            "Raport zbiórki",
            fundraising.getName(),
            "Klasa " +
                fundraising.getSchoolClass().getName() +
                " · " +
                periodLabel(from, to),
            rows,
            List.of(),
            Math.min(counts[0], total),
            Math.min(counts[1], total),
            total
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

        int[] counts = countPaidAndPartial(rows, perChildAmounts());
        int partial = counts[1] > 0 ? 1 : 0;
        int paid = counts[0] > 0 && partial == 0 ? 1 : 0;

        return build(
            ReportKind.CHILD,
            format,
            "Raport dziecka",
            child.getFirstName() + " " + child.getLastName(),
            periodLabel(from, to),
            rows,
            List.of(),
            paid,
            partial,
            1
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

        int total = acceptedChildren(classId);
        int[] counts = countPaidAndPartial(rows, perChildAmounts());

        List<ReportChartData.FundraisingSummary> fundraisings =
            fundraisingRepository
                .findAll()
                .stream()
                .filter(f -> f.getSchoolClass().getId().equals(classId))
                .map(f ->
                    new ReportChartData.FundraisingSummary(
                        f.getName(),
                        rows
                            .stream()
                            .filter(
                                r ->
                                    ReportRow.PAYMENT.equals(r.type()) &&
                                    f.getName().equals(r.fundraisingName())
                            )
                            .map(ReportRow::amount)
                            .reduce(BigDecimal.ZERO, BigDecimal::add),
                        f.getAmountPerChild(),
                        String.valueOf(f.getStatus())
                    )
                )
                .toList();

        return build(
            ReportKind.CLASS,
            format,
            "Raport klasy",
            schoolClass.getName() + " · " + schoolClass.getSchool(),
            periodLabel(from, to),
            rows,
            fundraisings,
            Math.min(counts[0], total),
            Math.min(counts[1], total),
            total
        );
    }

    private ReportResult build(
        ReportKind kind,
        ReportFormat format,
        String title,
        String subject,
        String subtitle,
        List<ReportRow> rows,
        List<ReportChartData.FundraisingSummary> fundraisings,
        int childrenPaid,
        int childrenPartial,
        int childrenTotal
    ) {
        if (format == ReportFormat.CSV) {
            return new ReportResult(CsvBuilder.build(kind, rows), CSV, "csv");
        }

        List<String> summary = summary(kind, rows);
        ReportChartData chart = ReportChartBuilder.build(
            kind,
            rows,
            fundraisings,
            childrenPaid,
            childrenPartial,
            childrenTotal
        );
        try {
            byte[] pdf = PdfBuilder.build(
                kind,
                title,
                subject,
                subtitle,
                rows,
                summary,
                chart
            );
            return new ReportResult(pdf, MediaType.APPLICATION_PDF, "pdf");
        } catch (IOException e) {
            throw new IllegalStateException("Cannot generate PDF report", e);
        }
    }

    private int acceptedChildren(Integer classId) {
        return membershipRepository
            .countByClassIdsAndStatus(
                List.of(classId),
                MembershipStatus.ACCEPTED
            )
            .stream()
            .mapToInt(c -> c.getCount().intValue())
            .sum();
    }

    private Map<String, BigDecimal> perChildAmounts() {
        return fundraisingRepository
            .findAll()
            .stream()
            .collect(
                Collectors.toMap(
                    Fundraising::getName,
                    Fundraising::getAmountPerChild,
                    (a, b) -> a
                )
            );
    }

    /**
     * Returns {paid, partial}: child-fundraising pairs whose net payments reach the per-child amount,
     * and those with a positive but incomplete sum.
     */
    private static int[] countPaidAndPartial(
        List<ReportRow> rows,
        Map<String, BigDecimal> perChildByFundraising
    ) {
        Map<String, BigDecimal> paidByPair = new HashMap<>();
        Map<String, BigDecimal> perChildByPair = new HashMap<>();

        for (ReportRow row : rows) {
            if (row.child() == null || row.fundraisingName() == null) {
                continue;
            }
            BigDecimal signed = ReportRow.PAYMENT.equals(row.type())
                ? row.amount()
                : ReportRow.REFUND.equals(row.type())
                  ? row.amount().negate()
                  : BigDecimal.ZERO;
            String key = row.child() + "|" + row.fundraisingName();
            paidByPair.merge(key, signed, BigDecimal::add);
            perChildByPair.putIfAbsent(
                key,
                perChildByFundraising.getOrDefault(
                    row.fundraisingName(),
                    BigDecimal.ZERO
                )
            );
        }

        int paid = 0;
        int partial = 0;
        for (Map.Entry<String, BigDecimal> entry : paidByPair.entrySet()) {
            BigDecimal sum = entry.getValue();
            BigDecimal perChild = perChildByPair.get(entry.getKey());
            if (sum.compareTo(perChild) >= 0) {
                paid++;
            } else if (sum.signum() > 0) {
                partial++;
            }
        }
        return new int[] { paid, partial };
    }

    private static List<String> summary(ReportKind kind, List<ReportRow> rows) {
        BigDecimal paid = sum(rows, ReportRow.PAYMENT);
        BigDecimal refunded = sum(rows, ReportRow.REFUND);

        if (kind == ReportKind.CHILD) {
            return List.of(
                "Wpłacono: " + money(paid),
                "Zwrócono: " + money(refunded),
                "Wpłacono netto: " + money(paid.subtract(refunded))
            );
        }

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
