package org.example.backend.payments.service;

import lombok.RequiredArgsConstructor;
import org.example.backend.core.entity.Transaction;
import org.example.backend.core.entity.Wallet;
import org.example.backend.core.entity.types.TransactionStatus;
import org.example.backend.core.entity.types.TransactionType;
import org.example.backend.core.repository.TransactionRepository;
import org.example.backend.core.repository.WalletRepository;
import org.example.backend.payments.exception.InsufficientFundsException;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.time.Instant;

@Service
@RequiredArgsConstructor
public class LedgerService
{
    private final WalletRepository walletRepository;
    private final TransactionRepository transactionRepository;

    @Transactional(propagation = Propagation.MANDATORY)
    public Transaction deposit(Integer walletId, BigDecimal amount, String title)
    {
        Wallet wallet = lockWallet(walletId);
        credit(wallet, amount);

        return record(TransactionType.DEPOSIT, null, wallet, amount, title);
    }

    @Transactional(propagation = Propagation.MANDATORY)
    public Transaction withdraw(Integer walletId, BigDecimal amount, String title)
    {
        Wallet wallet = lockWallet(walletId);
        debit(wallet, amount);

        return record(TransactionType.WITHDRAWAL, wallet, null, amount, title);
    }

    @Transactional(propagation = Propagation.MANDATORY)
    public Transaction transfer(Integer fromWalletId, Integer toWalletId, BigDecimal amount, TransactionType type, String title)
    {
        if(type == TransactionType.DEPOSIT || type == TransactionType.WITHDRAWAL)
        {
            throw new IllegalArgumentException("Transfer cannot be of type DEPOSIT or WITHDRAWAL");
        }
        if(fromWalletId.equals(toWalletId))
        {
            throw new IllegalArgumentException("Wallets of transfer must differ");
        }

        Integer firstId = Math.min(fromWalletId, toWalletId);
        Integer secondId = Math.max(fromWalletId, toWalletId);
        Wallet first = lockWallet(firstId);
        Wallet second = lockWallet(secondId);

        Wallet from = fromWalletId.equals(firstId) ? first : second;
        Wallet to = fromWalletId.equals(firstId) ? second : first;

        debit(from, amount);
        credit(to, amount);

        return record(type, from, to, amount, title);
    }

    private Wallet lockWallet(Integer walletId)
    {
        return walletRepository.findByIdForUpdate(walletId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Wallet not found"));
    }

    private void credit(Wallet wallet, BigDecimal amount)
    {
        wallet.setBalance(wallet.getBalance().add(amount));
    }

    private void debit(Wallet wallet, BigDecimal amount)
    {
        if(wallet.getBalance().compareTo(amount) < 0)
        {
            throw new InsufficientFundsException();
        }

        wallet.setBalance(wallet.getBalance().subtract(amount));
    }

    private Transaction record(TransactionType type, Wallet from, Wallet to, BigDecimal amount, String title)
    {
        Transaction transaction = new Transaction();
        transaction.setType(type);
        transaction.setFromWallet(from);
        transaction.setToWallet(to);
        transaction.setAmount(amount);
        transaction.setTitle(title);
        transaction.setStatus(TransactionStatus.COMPLETED);
        transaction.setCompletedAt(Instant.now());

        return transactionRepository.save(transaction);
    }
}
