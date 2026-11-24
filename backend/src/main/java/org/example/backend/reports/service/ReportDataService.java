package org.example.backend.reports.service;

import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneOffset;
import java.util.ArrayList;
import java.util.Collection;
import java.util.Comparator;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.example.backend.core.entity.FundraisingContribution;
import org.example.backend.core.entity.Transaction;
import org.example.backend.core.entity.Wallet;
import org.example.backend.core.entity.types.TransactionType;
import org.example.backend.core.repository.FundraisingContributionRepository;
import org.example.backend.core.repository.TransactionRepository;
import org.example.backend.core.repository.WalletRepository;
import org.example.backend.reports.dto.ReportRow;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class ReportDataService {

    private static final List<TransactionType> MOVEMENT_TYPES = List.of(
        TransactionType.PAYOUT,
        TransactionType.REPLENISHMENT
    );

    private final WalletRepository walletRepository;
    private final TransactionRepository transactionRepository;
    private final FundraisingContributionRepository contributionRepository;

    @Transactional(readOnly = true)
    public List<ReportRow> fundraisingRows(
        Integer fundraisingId,
        LocalDate from,
        LocalDate to
    ) {
        List<ReportRow> rows = contributionRows(
            contributionRepository.findAllForFundraisingReport(fundraisingId),
            from,
            to
        );
        walletRepository
            .findByFundraisingId(fundraisingId)
            .ifPresent(wallet ->
                rows.addAll(movementRows(List.of(wallet), from, to))
            );
        return sorted(rows);
    }

    @Transactional(readOnly = true)
    public List<ReportRow> childRows(
        Integer childId,
        LocalDate from,
        LocalDate to
    ) {
        return sorted(
            contributionRows(
                contributionRepository.findAllForChildReport(childId),
                from,
                to
            )
        );
    }

    @Transactional(readOnly = true)
    public List<ReportRow> classRows(
        Integer classId,
        LocalDate from,
        LocalDate to
    ) {
        List<ReportRow> rows = contributionRows(
            contributionRepository.findAllForClassReport(classId),
            from,
            to
        );
        rows.addAll(
            movementRows(
                walletRepository.findAllByFundraisingSchoolClassId(classId),
                from,
                to
            )
        );
        return sorted(rows);
    }

    private List<ReportRow> contributionRows(
        List<FundraisingContribution> contributions,
        LocalDate from,
        LocalDate to
    ) {
        List<ReportRow> rows = new ArrayList<>();

        for (FundraisingContribution contribution : contributions) {
            String fundraising = contribution.getFundraising().getName();
            String child = fullName(
                contribution.getChild().getFirstName(),
                contribution.getChild().getLastName()
            );
            String payer = fullName(
                contribution.getPayer().getFirstName(),
                contribution.getPayer().getLastName()
            );

            Transaction payment = contribution.getTransaction();
            Instant paidAt = completedOrCreated(payment);
            if (inPeriod(paidAt, from, to)) {
                rows.add(
                    new ReportRow(
                        paidAt,
                        ReportRow.PAYMENT,
                        fundraising,
                        child,
                        payer,
                        payment.getAmount(),
                        "Wpłata na zbiórkę"
                    )
                );
            }

            Transaction refund = contribution.getRefundTransaction();
            if (refund != null) {
                Instant refundedAt = completedOrCreated(refund);
                if (inPeriod(refundedAt, from, to)) {
                    rows.add(
                        new ReportRow(
                            refundedAt,
                            ReportRow.REFUND,
                            fundraising,
                            child,
                            payer,
                            refund.getAmount(),
                            "Zwrot wpłaty dla płatnika"
                        )
                    );
                }
            }
        }
        return rows;
    }

    private List<ReportRow> movementRows(
        Collection<Wallet> wallets,
        LocalDate from,
        LocalDate to
    ) {
        List<ReportRow> rows = new ArrayList<>();

        for (Wallet wallet : wallets) {
            String fundraising = wallet.getFundraising().getName();
            for (Transaction transaction : transactionRepository.findAllByWalletIdAndTypeIn(
                wallet.getId(),
                MOVEMENT_TYPES
            )) {
                Instant at = completedOrCreated(transaction);
                if (!inPeriod(at, from, to)) {
                    continue;
                }
                String type =
                    transaction.getType() == TransactionType.PAYOUT
                        ? ReportRow.PAYOUT
                        : ReportRow.REPLENISHMENT;
                rows.add(
                    new ReportRow(
                        at,
                        type,
                        fundraising,
                        null,
                        null,
                        transaction.getAmount(),
                        transaction.getTitle()
                    )
                );
            }
        }
        return rows;
    }

    private Instant completedOrCreated(Transaction transaction) {
        return transaction.getCompletedAt() != null
            ? transaction.getCompletedAt()
            : transaction.getCreatedAt();
    }

    private boolean inPeriod(Instant instant, LocalDate from, LocalDate to) {
        if (instant == null) {
            return false;
        }
        LocalDate day = instant.atZone(ZoneOffset.UTC).toLocalDate();
        return (
            (from == null || !day.isBefore(from)) &&
            (to == null || !day.isAfter(to))
        );
    }

    private String fullName(String firstName, String lastName) {
        return (firstName + " " + lastName).trim();
    }

    private List<ReportRow> sorted(List<ReportRow> rows) {
        return rows
            .stream()
            .sorted(Comparator.comparing(ReportRow::date))
            .toList();
    }
}
