package org.example.backend.payments.service;

import lombok.RequiredArgsConstructor;
import org.example.backend.core.entity.Transaction;
import org.example.backend.core.entity.Wallet;
import org.example.backend.core.repository.TransactionRepository;
import org.example.backend.core.repository.WalletRepository;
import org.example.backend.payments.dto.request.DepositRequest;
import org.example.backend.payments.dto.request.WithdrawRequest;
import org.example.backend.payments.dto.response.TransactionResponse;
import org.example.backend.payments.dto.response.WalletResponse;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Locale;

@Service
@RequiredArgsConstructor
public class PaymentsService
{
    private static final int MAX_PAGE_SIZE = 100;
    private static final String DEPOSIT_TITLE = "Virtual deposit";
    private static final String WITHDRAWAL_TITLE_PREFIX = "Withdrawal to external account ";

    private final WalletRepository walletRepository;
    private final TransactionRepository transactionRepository;
    private final LedgerService ledgerService;

    @Transactional(readOnly = true)
    public WalletResponse getWallet(Integer userId)
    {
        Wallet wallet = walletRepository.findByUserId(userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Wallet not found"));

        return WalletResponse.from(wallet);
    }

    @Transactional
    public TransactionResponse deposit(Integer userId, DepositRequest request)
    {
        Integer walletId = findUserWalletId(userId);
        Transaction transaction = ledgerService.deposit(walletId, request.amount(), DEPOSIT_TITLE);

        return TransactionResponse.from(transaction, walletId);
    }

    @Transactional
    public TransactionResponse withdraw(Integer userId, WithdrawRequest request)
    {
        String iban = request.iban().toUpperCase(Locale.ROOT);
        if(walletRepository.existsByIban(iban))
        {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Withdrawals are allowed only to external accounts");
        }

        Integer walletId = findUserWalletId(userId);
        Transaction transaction = ledgerService.withdraw(walletId, request.amount(), WITHDRAWAL_TITLE_PREFIX + iban);

        return TransactionResponse.from(transaction, walletId);
    }

    @Transactional(readOnly = true)
    public List<TransactionResponse> getTransactions(Integer userId, int page, int size)
    {
        Integer walletId = findUserWalletId(userId);
        PageRequest pageRequest = PageRequest.of(Math.max(page, 0), Math.clamp(size, 1, MAX_PAGE_SIZE));

        return transactionRepository.findAllByWalletId(walletId, pageRequest).stream()
                .map(transaction -> TransactionResponse.from(transaction, walletId))
                .toList();
    }

    private Integer findUserWalletId(Integer userId)
    {
        return walletRepository.findIdByUserId(userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Wallet not found"));
    }
}
