package org.example.backend.payments.service;

import lombok.RequiredArgsConstructor;
import org.example.backend.core.entity.Fundraising;
import org.example.backend.core.entity.FundraisingContribution;
import org.example.backend.core.entity.Transaction;
import org.example.backend.core.entity.types.FundraisingStatus;
import org.example.backend.core.entity.types.TransactionType;
import org.example.backend.core.repository.FundraisingContributionRepository;
import org.example.backend.core.repository.WalletRepository;
import org.example.backend.payments.dto.response.RefundSummaryResponse;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class FundraisingRefundService
{
    private static final String REFUND_TITLE_PREFIX = "Refund from fundraising ";

    private final FundraisingAccessService accessService;
    private final FundraisingContributionRepository contributionRepository;
    private final WalletRepository walletRepository;
    private final LedgerService ledgerService;

    @Transactional
    public RefundSummaryResponse refund(Integer fundraisingId, Integer userId)
    {
        Fundraising fundraising = accessService.findForUpdate(fundraisingId);
        accessService.requireOwner(fundraising, userId);
        accessService.requireNotBlocked(fundraising);
        accessService.requireActive(fundraising);

        List<FundraisingContribution> contributions = contributionRepository.findAllActiveByFundraisingId(fundraisingId);
        BigDecimal total = contributions.stream()
                .map(contribution -> contribution.getTransaction().getAmount())
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        requireFullyFunded(fundraisingId, total);

        Integer fundraisingWalletId = findFundraisingWalletId(fundraisingId);
        Map<Integer, Integer> payerWalletIds = contributions.stream()
                .map(contribution -> contribution.getPayer().getId())
                .distinct()
                .collect(Collectors.toMap(Function.identity(), this::findUserWalletId));

        List<FundraisingContribution> ordered = contributions.stream()
                .sorted(Comparator
                    .comparing((FundraisingContribution contribution) -> payerWalletIds.get(contribution.getPayer().getId()))
                    .thenComparing(FundraisingContribution::getId))
                .toList();

        for(FundraisingContribution contribution : ordered)
        {
            Transaction refund = ledgerService.transfer(
                fundraisingWalletId,
                payerWalletIds.get(contribution.getPayer().getId()),
                contribution.getTransaction().getAmount(),
                TransactionType.REFUND,
                REFUND_TITLE_PREFIX + fundraising.getName()
            );
            contribution.setRefundTransaction(refund);
        }

        Instant now = Instant.now();
        fundraising.setStatus(FundraisingStatus.CANCELLED);
        fundraising.setCancelledAt(now);

        return new RefundSummaryResponse(fundraisingId, fundraising.getStatus(), ordered.size(), total, now);
    }

    private void requireFullyFunded(Integer fundraisingId, BigDecimal total)
    {
        BigDecimal balance = walletRepository.findBalanceByFundraisingId(fundraisingId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Fundraising wallet not found"));

        if(balance.compareTo(total) < 0)
        {
            throw new ResponseStatusException(
                HttpStatus.CONFLICT,
                "Fundraising wallet is short by " + total.subtract(balance).toPlainString() + ", replenish it before refunding"
            );
        }
    }

    private Integer findFundraisingWalletId(Integer fundraisingId)
    {
        return walletRepository.findIdByFundraisingId(fundraisingId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Fundraising wallet not found"));
    }

    private Integer findUserWalletId(Integer userId)
    {
        return walletRepository.findIdByUserId(userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Wallet not found"));
    }
}
