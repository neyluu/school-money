package org.example.backend.payments.service;

import lombok.RequiredArgsConstructor;
import org.example.backend.core.entity.Transaction;
import org.example.backend.core.entity.Wallet;
import org.example.backend.core.entity.types.TransactionStatus;
import org.example.backend.core.repository.FundraisingContributionRepository;
import org.example.backend.core.repository.TransactionRepository;
import org.example.backend.core.repository.WalletRepository;
import org.example.backend.payments.dto.request.ContributionFilter;
import org.example.backend.payments.dto.request.DepositRequest;
import org.example.backend.payments.dto.request.HistorySearchRequest;
import org.example.backend.payments.dto.request.TransactionFilter;
import org.example.backend.payments.dto.request.WithdrawRequest;
import org.example.backend.payments.dto.response.DailyFlowResponse;
import org.example.backend.payments.dto.response.TransactionResponse;
import org.example.backend.payments.dto.response.WalletContributionResponse;
import org.example.backend.payments.dto.response.WalletResponse;
import org.example.backend.payments.dto.response.WalletSummaryResponse;
import org.example.backend.payments.utils.HistorySpecifications;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
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
    private static final String DEPOSIT_TITLE = "Wirtualny depozyt";
    private static final String WITHDRAWAL_TITLE_PREFIX = "Wypłata na ";

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
    public List<TransactionResponse> getTransactions(Integer userId, TransactionFilter filter, HistorySearchRequest search, int page, int size)
    {
        validateRanges(search);
        Integer walletId = findUserWalletId(userId);

        return transactionRepository.findAll(HistorySpecifications.transactions(walletId, filter, search), newestFirst(page, size)).stream()
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
    public List<WalletContributionResponse> getContributions(Integer userId, ContributionFilter filter, HistorySearchRequest search, int page, int size)
    {
        validateRanges(search);

        return contributionRepository.findAll(HistorySpecifications.contributions(userId, filter, search), newestFirst(page, size)).stream()
                .map(WalletContributionResponse::from)
                .toList();
    }

    private PageRequest newestFirst(int page, int size)
    {
        return PageRequest.of(Math.max(page, 0), Math.clamp(size, 1, MAX_PAGE_SIZE), Sort.by(Sort.Direction.DESC, "id"));
    }

    private void validateRanges(HistorySearchRequest search)
    {
        if(search.from() != null && search.to() != null && !search.from().isBefore(search.to()))
        {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Start of period must be before its end");
        }
        if(search.minAmount() != null && search.maxAmount() != null && search.minAmount().compareTo(search.maxAmount()) > 0)
        {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Minimal amount cannot be greater than maximal amount");
        }
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
