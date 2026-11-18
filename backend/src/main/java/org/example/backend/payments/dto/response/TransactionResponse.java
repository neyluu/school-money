package org.example.backend.payments.dto.response;

import org.example.backend.core.entity.Transaction;
import org.example.backend.core.entity.types.TransactionStatus;
import org.example.backend.core.entity.types.TransactionType;

import java.math.BigDecimal;
import java.time.Instant;

public record TransactionResponse(
    Integer id,
    TransactionType type,
    BigDecimal amount,
    String title,
    TransactionStatus status,
    boolean incoming,
    Instant createdAt,
    Instant completedAt
)
{
    public static TransactionResponse from(Transaction transaction, Integer walletId)
    {
        boolean incoming = transaction.getToWallet() != null
            && transaction.getToWallet().getId().equals(walletId);

        return new TransactionResponse(
            transaction.getId(),
            transaction.getType(),
            transaction.getAmount(),
            transaction.getTitle(),
            transaction.getStatus(),
            incoming,
            transaction.getCreatedAt(),
            transaction.getCompletedAt()
        );
    }
}
