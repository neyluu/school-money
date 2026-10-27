package org.example.backend.payments.service;

import lombok.RequiredArgsConstructor;
import org.example.backend.core.entity.Fundraising;
import org.example.backend.core.entity.Transaction;
import org.example.backend.core.entity.types.TransactionType;
import org.example.backend.core.repository.TransactionRepository;
import org.example.backend.core.repository.WalletRepository;
import org.example.backend.payments.dto.request.FundraiseReplenishRequest;
import org.example.backend.payments.dto.request.FundraiseWithdrawRequest;
import org.example.backend.payments.dto.response.FundraisingTransferResponse;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.util.List;

@Service
@RequiredArgsConstructor
public class FundraisingFundsService
{
    private static final int MAX_PAGE_SIZE = 100;
    private static final String REPLENISHMENT_TITLE_PREFIX = "Replenishment of fundraising ";

    private final FundraisingAccessService accessService;
    private final WalletRepository walletRepository;
    private final TransactionRepository transactionRepository;
    private final LedgerService ledgerService;

    @Transactional
    public FundraisingTransferResponse withdraw(Integer fundraisingId, Integer userId, FundraiseWithdrawRequest request)
    {
        Fundraising fundraising = accessService.findForUpdate(fundraisingId);
        requireManageable(fundraising, userId);

        Integer fundraisingWalletId = findFundraisingWalletId(fundraisingId);
        Integer ownerWalletId = findUserWalletId(userId);

        Transaction transaction = ledgerService.transfer(
            fundraisingWalletId,
            ownerWalletId,
            request.amount(),
            TransactionType.PAYOUT,
            request.title().trim()
        );

        return FundraisingTransferResponse.from(transaction);
    }

    @Transactional
    public FundraisingTransferResponse replenish(Integer fundraisingId, Integer userId, FundraiseReplenishRequest request)
    {
        Fundraising fundraising = accessService.findForUpdate(fundraisingId);
        requireManageable(fundraising, userId);

        Integer fundraisingWalletId = findFundraisingWalletId(fundraisingId);
        Integer ownerWalletId = findUserWalletId(userId);

        BigDecimal outstanding = sumTransfers(fundraisingWalletId, TransactionType.PAYOUT)
                .subtract(sumTransfers(fundraisingWalletId, TransactionType.REPLENISHMENT));

        if(outstanding.signum() <= 0)
        {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Nothing to replenish, no funds were withdrawn from this fundraising");
        }
        if(request.amount().compareTo(outstanding) > 0)
        {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Amount exceeds withdrawn amount " + outstanding.toPlainString());
        }

        Transaction transaction = ledgerService.transfer(
            ownerWalletId,
            fundraisingWalletId,
            request.amount(),
            TransactionType.REPLENISHMENT,
            REPLENISHMENT_TITLE_PREFIX + fundraising.getName()
        );

        return FundraisingTransferResponse.from(transaction);
    }

    @Transactional(readOnly = true)
    public List<FundraisingTransferResponse> getWithdrawals(Integer fundraisingId, Integer userId, int page, int size)
    {
        return getTransfers(fundraisingId, userId, TransactionType.PAYOUT, page, size);
    }

    @Transactional(readOnly = true)
    public List<FundraisingTransferResponse> getReplenishments(Integer fundraisingId, Integer userId, int page, int size)
    {
        return getTransfers(fundraisingId, userId, TransactionType.REPLENISHMENT, page, size);
    }

    private List<FundraisingTransferResponse> getTransfers(
        Integer fundraisingId,
        Integer userId,
        TransactionType type,
        int page,
        int size
    )
    {
        Fundraising fundraising = accessService.find(fundraisingId);
        accessService.requireClassAccess(fundraising, userId);

        Integer fundraisingWalletId = findFundraisingWalletId(fundraisingId);
        PageRequest pageRequest = PageRequest.of(Math.max(page, 0), Math.clamp(size, 1, MAX_PAGE_SIZE));

        return transactionRepository.findAllByWalletIdAndType(fundraisingWalletId, type, pageRequest).stream()
                .map(FundraisingTransferResponse::from)
                .toList();
    }

    private void requireManageable(Fundraising fundraising, Integer userId)
    {
        accessService.requireOwner(fundraising, userId);
        accessService.requireNotBlocked(fundraising);
        accessService.requireActive(fundraising);
    }

    private BigDecimal sumTransfers(Integer walletId, TransactionType type)
    {
        return transactionRepository.sumByWalletIdAndType(walletId, type).orElse(BigDecimal.ZERO);
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
