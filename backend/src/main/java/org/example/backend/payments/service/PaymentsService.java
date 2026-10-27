package org.example.backend.payments.service;

import lombok.RequiredArgsConstructor;
import org.example.backend.core.entity.Transaction;
import org.example.backend.core.entity.Wallet;
import org.example.backend.core.entity.types.TransactionStatus;
import org.example.backend.core.repository.FundraisingContributionRepository;
import org.example.backend.core.repository.TransactionRepository;
import org.example.backend.core.repository.WalletRepository;
import org.example.backend.payments.dto.request.DepositRequest;
import org.example.backend.payments.dto.request.WithdrawRequest;
import org.example.backend.payments.dto.response.DailyFlowResponse;
import org.example.backend.payments.dto.response.TransactionResponse;
import org.example.backend.payments.dto.response.WalletContributionResponse;
import org.example.backend.payments.dto.response.WalletResponse;
import org.example.backend.payments.dto.response.WalletSummaryResponse;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneOffset;
import java.util.HashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class PaymentsService
{
    private static final int MAX_PAGE_SIZE = 100;
    private static final int MAX_SUMMARY_DAYS = 90;
    private static final String DEPOSIT_TITLE = "Virtual deposit";
    private static final String WITHDRAWAL_TITLE_PREFIX = "Withdrawal to ";

    private final WalletRepository walletRepository;
    private final TransactionRepository transactionRepository;
    private final FundraisingContributionRepository contributionRepository;
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
        String title = WITHDRAWAL_TITLE_PREFIX + request.recipientName().trim() + ", " + iban;
        Transaction transaction = ledgerService.withdraw(walletId, request.amount(), title);

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

    @Transactional(readOnly = true)
    public WalletSummaryResponse getSummary(Integer userId, int days)
    {
        Integer walletId = findUserWalletId(userId);
        int period = Math.clamp(days, 1, MAX_SUMMARY_DAYS);
        LocalDate today = LocalDate.now(ZoneOffset.UTC);
        LocalDate firstDay = today.minusDays(period - 1L);
        Instant since = firstDay.atStartOfDay(ZoneOffset.UTC).toInstant();

        Map<LocalDate, BigDecimal> incomeByDay = new HashMap<>();
        Map<LocalDate, BigDecimal> expenseByDay = new HashMap<>();

        for(Transaction transaction : transactionRepository.findAllByWalletIdAndStatusSince(walletId, TransactionStatus.COMPLETED, since))
        {
            LocalDate day = transaction.getCompletedAt().atZone(ZoneOffset.UTC).toLocalDate();
            boolean incoming = transaction.getToWallet() != null && transaction.getToWallet().getId().equals(walletId);

            (incoming ? incomeByDay : expenseByDay).merge(day, transaction.getAmount(), BigDecimal::add);
        }

        List<DailyFlowResponse> daily = firstDay.datesUntil(today.plusDays(1))
                .map(day -> new DailyFlowResponse(
                    day,
                    incomeByDay.getOrDefault(day, BigDecimal.ZERO),
                    expenseByDay.getOrDefault(day, BigDecimal.ZERO)
                ))
                .toList();

        return new WalletSummaryResponse(
            period,
            sum(incomeByDay),
            sum(expenseByDay),
            daily
        );
    }

    @Transactional(readOnly = true)
    public List<WalletContributionResponse> getContributions(Integer userId, int page, int size)
    {
        PageRequest pageRequest = PageRequest.of(Math.max(page, 0), Math.clamp(size, 1, MAX_PAGE_SIZE));

        return contributionRepository.findAllByPayerId(userId, pageRequest).stream()
                .map(WalletContributionResponse::from)
                .toList();
    }

    private BigDecimal sum(Map<LocalDate, BigDecimal> amountsByDay)
    {
        return amountsByDay.values().stream().reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    private Integer findUserWalletId(Integer userId)
    {
        return walletRepository.findIdByUserId(userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Wallet not found"));
    }
}
